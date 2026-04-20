import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

/**
 * Query key for the full account audio list.
 * NOTE: The backend AudioSchema does not include a project or task reference
 * in the response, so we cannot filter by project on the client side.
 * This hook returns ALL audio files for the account.
 */
export const projectAudiosQueryKey = (accountId: number) => [
	'studio',
	'audio',
	accountId
];

/**
 * @deprecated projectId parameter is kept for API compatibility but is no longer
 * used for filtering because the backend does not expose a project/task reference
 * on the audio list response.
 */
export function useGetProjectAudios(_projectId?: number | string) {
	const accountId = useCurrentAccountId();

	return useQuery({
		queryKey: projectAudiosQueryKey(accountId),
		queryFn: async () => {
			const { items } = await studioApiService.getAudioFiles(accountId);
			return items;
		},
		enabled: !!accountId
	});
}