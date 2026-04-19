'use client';

import { useEffect } from 'react';
import useUser from '@auth/useUser';
import { studioApiService } from '../services/studioApiService';

/**
 * Reads the JWT from the Next-Auth session and injects it into
 * studioApiService so every fetch() call gets the correct Bearer token.
 */
export function useStudioAuth() {
	const { data: user } = useUser();

	useEffect(() => {
		const token = user?.token?.access;
		if (token) {
			studioApiService.setToken(token);
		} else if (user !== undefined) {
			// user is loaded but has no token — log once, not on every render
			console.warn(
				'[useStudioAuth] Session loaded but token.access is missing.',
				user
			);
		}
		return () => {
			studioApiService.clearToken();
		};
	}, [user?.token?.access]);
}