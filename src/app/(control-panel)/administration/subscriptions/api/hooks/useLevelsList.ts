import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptionsApiService';
import { Level } from '../types';
import { Token } from '@auth/user';

export const levelsListQueryKey = (token: Token) => ['subscriptions', 'levels', 'list', token];

export const useLevelsList = (token: Token) => {
	return useQuery<Level[]>({
		queryFn: () => subscriptionsApi.getLevelsList(token),
		queryKey: levelsListQueryKey(token),
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000 // levels rarely change, cache for 5 min
	});
};