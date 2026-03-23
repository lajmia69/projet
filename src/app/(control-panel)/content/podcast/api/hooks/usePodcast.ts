import { useQuery } from '@tanstack/react-query';
import { podcastApi } from '../services/podcastApiService';

export const podcastQueryKey = (currentAccountId: string, podcastId: string) => [
	'podcast',
	'detail',
	currentAccountId,
	podcastId
];

export const usePodcast = (currentAccountId: string, podcastId: string, accessToken: string) => {
	return useQuery({
		queryKey: podcastQueryKey(currentAccountId, podcastId),
		queryFn: () => podcastApi.getPodcast(currentAccountId, podcastId, accessToken),
		enabled: !!currentAccountId && !!podcastId && !!accessToken
	});
};