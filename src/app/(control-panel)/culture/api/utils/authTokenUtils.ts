// src/app/(control-panel)/culture/api/utils/authTokenUtils.ts

const BASE_URL = 'https://radio.backend.ecocloud.tn';

export class AuthExpiredError extends Error {
  constructor() {
    super('Session expired. Please log in again.');
    this.name = 'AuthExpiredError';
  }
}

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

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		const refreshToken = getRefreshToken();
		if (!refreshToken) throw new Error('No refresh token available.');

		const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ refresh: refreshToken })
		});

		if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);

		const data = await res.json();
		const newToken: string = data.access ?? data.access_token ?? '';
		if (!newToken) throw new Error('Refresh response contained no token.');

		saveAccessToken(newToken);
		return newToken;
	})().finally(() => { refreshPromise = null; });

	return refreshPromise;
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const withBearer = (token: string): RequestInit => ({
    ...init,
    headers: {
      ...((init.headers as Record<string, string>) ?? {}),
      Authorization: `Bearer ${token}`
    }
  });

  let token = getAccessToken();
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