
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