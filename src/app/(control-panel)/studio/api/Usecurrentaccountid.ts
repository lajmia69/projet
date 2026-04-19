import { useMemo } from 'react';
import axios from 'axios';

/**
 * Returns the current account's numeric ID for Studio API calls.
 *
 * Fuse React sets axios.defaults.headers.common.Authorization = 'Bearer <token>'
 * after login — it does NOT rely on localStorage or a Redux Provider being in
 * scope at the component level. We decode the JWT from the axios header,
 * which is always available once the user is logged in.
 */
export function useCurrentAccountId(): number {
	return useMemo(() => {
		// ── 1. Axios default Authorization header (Fuse primary auth pattern) ─
		const authHeader = axios.defaults.headers.common?.['Authorization'];
		if (authHeader && typeof authHeader === 'string') {
			const token = authHeader.replace(/^[Bb]earer\s+/, '');
			const id = decodeIdFromJwt(token);
			if (id > 0) return id;
		}

		// ── 2. localStorage / sessionStorage JWT fallback ─────────────────────
		const KEYS = [
			'jwt_access_token', 'access_token', 'accessToken',
			'authToken', 'token', 'jwt', 'auth_token'
		];
		for (const key of KEYS) {
			const val = localStorage.getItem(key) ?? sessionStorage.getItem(key);
			if (!val) continue;
			const id = decodeIdFromJwt(val);
			if (id > 0) return id;
		}

		// ── 3. Redux store (direct window access, no Provider needed) ─────────
		try {
			const store = (window as any).__REDUX_STORE__;
			if (store) {
				const s = store.getState();
				const d = s?.user?.data;
				const id =
					Number(d?.account_id ?? d?.id ?? s?.user?.account_id ?? 0);
				if (id > 0) return id;
			}
		} catch { /* store not exposed */ }

		console.warn('[useCurrentAccountId] Could not resolve account ID from axios/localStorage/Redux.');
		return 0;
	}, []);
}

/** Decode account/user id from a raw JWT string. */
function decodeIdFromJwt(token: string): number {
	const parts = token.split('.');
	if (parts.length !== 3) return 0;
	try {
		const payload = JSON.parse(atob(parts[1]));
		// Django Simple JWT uses 'user_id'; custom backends may add 'account_id'
		const raw =
			payload.account_id ??
			payload.user_id ??
			payload.accountId ??
			payload.sub ??
			payload.id;
		const id = Number(raw);
		return isNaN(id) ? 0 : id;
	} catch {
		return 0;
	}
}