import { useMemo } from 'react';

/**
 * Returns the current account's numeric ID for studio API calls.
 *
 * HOW TO USE:
 * This hook reads from the Fuse user store. Your parent app must ensure
 * the logged-in user object is available via `useUser()` from @fuse/core/FuseAuthorization
 * or equivalent, and that the account id is stored at `user.data.account_id`.
 *
 * If your app stores the account id differently, update the path below.
 */
export function useCurrentAccountId(): number {
	return useMemo(() => {
		try {
			// Try Fuse / Next-auth session stored in window.__NEXT_DATA__
			if (typeof window !== 'undefined') {
				// 1. Check NEXT_DATA session (Next.js pages router)
				const nextData = (window as any).__NEXT_DATA__?.props?.pageProps?.session;
				if (nextData?.user?.account_id) return Number(nextData.user.account_id);

				// 2. Check Redux store if exposed on window (some Fuse setups)
				const store = (window as any).__REDUX_STORE__;
				if (store) {
					const state = store.getState();
					const accountId =
						state?.user?.data?.account_id ??
						state?.auth?.user?.account_id ??
						state?.user?.account_id;
					if (accountId) return Number(accountId);
				}

				// 3. localStorage — try all common patterns
				const keys = [
					'account_id', 'accountId', 'current_account_id',
					'access_token', 'token', 'authToken', 'jwt'
				];
				for (const key of keys) {
					const val = localStorage.getItem(key);
					if (!val) continue;

					// If it looks like a JWT, decode it
					if (val.includes('.') && val.split('.').length === 3) {
						try {
							const payload = JSON.parse(atob(val.split('.')[1]));
							const id =
								payload.account_id ?? payload.accountId ??
								payload.profile_id ?? payload.account ??
								payload.id;
							if (id && Number(id) > 0) return Number(id);
						} catch { /* not a valid JWT */ }
					}

					// If it looks like a plain number
					const n = Number(val);
					if (n > 0) return n;

					// If it looks like JSON (user object)
					if (val.startsWith('{')) {
						try {
							const obj = JSON.parse(val);
							const id =
								obj.account_id ?? obj.accountId ??
								obj.account?.id ?? obj.id;
							if (id && Number(id) > 0) return Number(id);
						} catch { /* not valid JSON */ }
					}
				}

				// 4. sessionStorage — same patterns
				for (const key of keys) {
					const val = sessionStorage.getItem(key);
					if (!val) continue;
					if (val.includes('.') && val.split('.').length === 3) {
						try {
							const payload = JSON.parse(atob(val.split('.')[1]));
							const id = payload.account_id ?? payload.accountId ?? payload.id;
							if (id && Number(id) > 0) return Number(id);
						} catch { /* not a valid JWT */ }
					}
					const n = Number(val);
					if (n > 0) return n;
				}
			}
		} catch { /* fall through */ }

		console.warn(
			'[useCurrentAccountId] Could not resolve account ID from session/localStorage/Redux. ' +
			'Returning 1 as fallback. Pass the correct accountId from your auth context to fix this.'
		);
		return 1;
	}, []);
}


