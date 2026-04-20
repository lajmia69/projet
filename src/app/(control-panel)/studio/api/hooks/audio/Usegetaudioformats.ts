import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

export const audioFormatsQueryKey = (accountId: number) => ['studio', 'audio-formats', accountId];

export function useGetAudioFormats() {
	const accountId = useCurrentAccountId();

	return useQuery({
		queryKey: audioFormatsQueryKey(accountId),
		queryFn: async () => {
			const { items } = await studioApiService.getAudioFormats(accountId);
			return items;
		},
		enabled: !!accountId,
		staleTime: 1000 * 60 * 10
	});
}