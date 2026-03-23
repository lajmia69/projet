import { useQuery } from '@tanstack/react-query';
import { podcastApi } from '../services/podcastApiService';
import { SearchPodcasts } from '../types';

export const searchPodcastsQueryKey = (currentAccountId: string, search: SearchPodcasts) => [
	'podcast',
	'search',
	currentAccountId,
	search
];

export const useSearchPodcasts = (
	currentAccountId: string,
	accessToken: string,
	search: SearchPodcasts
) => {
	return useQuery({
		queryKey: searchPodcastsQueryKey(currentAccountId, search),
		queryFn: () => podcastApi.searchPodcasts(currentAccountId, accessToken, search),
		enabled: !!currentAccountId && !!accessToken
	});
};