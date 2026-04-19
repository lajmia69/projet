import { useMemo } from 'react';
import useUser from '@auth/useUser';

/**
 * Returns the current account's numeric ID.
 * Reads from the Next-Auth session (session.db.account.id).
 */
export function useCurrentAccountId(): number {
	const { data: user } = useUser();

	return useMemo(() => {
		const id = Number(user?.account?.id ?? 0);
		if (id > 0) return id;

		if (user !== undefined) {
			console.warn('[useCurrentAccountId] User is loaded but account.id is missing.', user);
		}
		return 0;
	}, [user]);
}