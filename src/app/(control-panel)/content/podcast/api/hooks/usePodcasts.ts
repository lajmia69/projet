import { useQuery } from '@tanstack/react-query';
import { podcastApi } from '../services/podcastApiService';
 
export const podcastsQueryKey = (currentAccountId: string) => ['podcast', 'list', currentAccountId];
 
export const usePodcasts = (currentAccountId: string, accessToken: string) => {
	return useQuery({
		queryKey: podcastsQueryKey(currentAccountId),
		queryFn: () => podcastApi.getPodcasts(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});
};