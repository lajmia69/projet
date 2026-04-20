'use client';

import { useEffect } from 'react';
import useUser from '@auth/useUser';
import { studioApiService } from '../services/studioApiService';

export function useStudioAuth() {
    const { data: user } = useUser();

    // ✅ Set synchronously during render so the token is available
    // before React Query fires its first requests (useEffect is too late).
    const token = user?.token?.access;
    if (token) {
        studioApiService.setToken(token);
    }

    useEffect(() => {
        if (!token && user !== undefined) {
            console.warn('[useStudioAuth] Session loaded but token.access is missing.', user);
        }
        // Clear only on unmount
        return () => {
            studioApiService.clearToken();
        };
    }, [token]);  // eslint-disable-line react-hooks/exhaustive-deps
}