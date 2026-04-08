// src/app/(control-panel)/culture/api/utils/queryClientConfig.ts
//
// Use this when creating your QueryClient (or merge into your existing one).
// It prevents React Query from retrying requests that failed due to an
// expired/missing session — those will never succeed without a new login.

import { QueryClient } from '@tanstack/react-query';
import { AuthExpiredError } from './authTokenUtils';

export function createCultureQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Don't retry auth failures – the user needs to log in again.
				retry: (failureCount, error) => {
					if (error instanceof AuthExpiredError) return false;
					return failureCount < 2; // keep normal 2-retry behaviour for other errors
				},
				staleTime: 30_000
			},
			mutations: {
				retry: (failureCount, error) => {
					if (error instanceof AuthExpiredError) return false;
					return failureCount < 1;
				}
			}
		}
	});
}