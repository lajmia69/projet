// src/app/(control-panel)/culture/api/utils/authTokenUtils.ts

const BASE_URL = 'https://radio.backend.ecocloud.tn';

export class AuthExpiredError extends Error {
	constructor() {
		super('Session expired. Please log in again.');
		this.name = 'AuthExpiredError';
	}
}

// ─── localStorage helpers (legacy / non-NextAuth fallback) ────────────────────

export function getAccessToken(): string {
	if (typeof window === 'undefined') return '';
	return (
		localStorage.getItem('jwt_access_token') ||
		localStorage.getItem('fusejs_access_token') ||
		localStorage.getItem('access_token') ||
		''
	);
}

function getRefreshToken(): string {
	if (typeof window === 'undefined') return '';
	return (
		localStorage.getItem('jwt_refresh_token') ||
		localStorage.getItem('fusejs_refresh_token') ||
		localStorage.getItem('refresh_token') ||
		''
	);
}

function saveAccessToken(token: string): void {
	if (localStorage.getItem('jwt_access_token') !== null) {
		localStorage.setItem('jwt_access_token', token);
	} else if (localStorage.getItem('fusejs_access_token') !== null) {
		localStorage.setItem('fusejs_access_token', token);
	} else {
		localStorage.setItem('access_token', token);
	}
}

// ─── NextAuth session ─────────────────────────────────────────────────────────

/**
 * Shape returned by your /auth/session endpoint:
 * {
 *   db: {
 *     id: number,           ← account id
 *     token: {
 *       access: string,     ← backend JWT access token
 *       refresh: string,    ← backend JWT refresh token
 *     }
 *   }
 * }
 */
type NextAuthSession = {
	db?: {
		id?: number;
		token?: {
			access?: string;
			refresh?: string;
		};
	};
};

let _cachedSession: NextAuthSession | null = null;
let _sessionFetchedAt = 0;
const SESSION_CACHE_MS = 30_000;

async function fetchNextAuthSession(): Promise<NextAuthSession> {
	const now = Date.now();
	if (_cachedSession && now - _sessionFetchedAt < SESSION_CACHE_MS) {
		return _cachedSession;
	}
	try {
		const res = await fetch('/auth/session', { credentials: 'include' });
		if (!res.ok) return {};
		const session: NextAuthSession = await res.json();
		_cachedSession = session;
		_sessionFetchedAt = now;
		return session;
	} catch {
		return {};
	}
}

export function invalidateSessionCache(): void {
	_cachedSession = null;
	_sessionFetchedAt = 0;
}

/** Returns the backend access token from the NextAuth session. */
async function getNextAuthAccessToken(): Promise<string> {
	const session = await fetchNextAuthSession();
	return session?.db?.token?.access ?? '';
}

/** Returns the backend refresh token from the NextAuth session. */
async function getNextAuthRefreshToken(): Promise<string> {
	const session = await fetchNextAuthSession();
	return session?.db?.token?.refresh ?? '';
}

/** Returns the account id from the NextAuth session. */
export async function getNextAuthAccountId(): Promise<number> {
	const session = await fetchNextAuthSession();
	const id = session?.db?.id;
	const num = Number(id);
	return Number.isFinite(num) && num > 0 ? num : 0;
}

// ─── Unified token getter ─────────────────────────────────────────────────────

/**
 * Returns the best available access token.
 * Priority: localStorage → NextAuth session (your app's real source).
 */
export async function getAccessTokenAsync(): Promise<string> {
	const local = getAccessToken();
	if (local) return local;
	return getNextAuthAccessToken();
}

// ─── Token refresh ────────────────────────────────────────────────────────────

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		// 1. Try localStorage refresh token first.
		const localRefresh = getRefreshToken();
		if (localRefresh) {
			const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refresh: localRefresh })
			});
			if (res.ok) {
				const data = await res.json();
				const newToken: string = data.access ?? data.access_token ?? '';
				if (newToken) {
					saveAccessToken(newToken);
					return newToken;
				}
			}
		}

		// 2. Try the refresh token stored in the NextAuth session.
		const nextAuthRefresh = await getNextAuthRefreshToken();
		if (nextAuthRefresh) {
			const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refresh: nextAuthRefresh })
			});
			if (res.ok) {
				const data = await res.json();
				const newToken: string = data.access ?? data.access_token ?? '';
				if (newToken) {
					// Invalidate cached session so next call re-fetches.
					invalidateSessionCache();
					return newToken;
				}
			}
		}

		throw new AuthExpiredError();
	})().finally(() => {
		refreshPromise = null;
	});

	return refreshPromise;
}

// ─── Authenticated fetch ──────────────────────────────────────────────────────

export async function fetchWithAuth(
	input: RequestInfo | URL,
	init: RequestInit = {}
): Promise<Response> {
	const withBearer = (token: string): RequestInit => ({
		...init,
		headers: {
			...((init.headers as Record<string, string>) ?? {}),
			...(token ? { Authorization: `Bearer ${token}` } : {})
		}
	});

	let token = await getAccessTokenAsync();
	let res = await fetch(input, withBearer(token));

	if (res.status !== 401) return res;

	try {
		token = await refreshAccessToken();
		if (!token) throw new AuthExpiredError();
		return await fetch(input, withBearer(token));
	} catch (e) {
		if (e instanceof AuthExpiredError) throw e;
		throw new AuthExpiredError();
	}
}