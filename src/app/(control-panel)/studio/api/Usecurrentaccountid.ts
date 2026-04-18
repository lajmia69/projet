import { useMemo } from 'react';

/**
 * Returns the current account's numeric ID for use in studio API calls.
 * Reads from the JWT payload stored in localStorage.
 */
export function useCurrentAccountId(): number {
	return useMemo(() => {
		try {
			const token =
				localStorage.getItem('access_token') ?? localStorage.getItem('token') ?? '';
			if (!token) return 1;

			const payloadB64 = token.split('.')[1];
			if (!payloadB64) return 1;

			const payload = JSON.parse(atob(payloadB64));
			return (
				payload.account_id ??
				payload.accountId ??
				payload.profile_id ??
				payload.sub ??
				1
			);
		} catch {
			return 1;
		}
	}, []);
}
