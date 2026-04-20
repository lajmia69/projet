import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

export const projectAudiosQueryKey = (accountId: number, projectId: number | string) => [
	'studio',
	'audio',
	accountId,
	String(projectId)
];

export function useGetProjectAudios(projectId: number | string) {
	const accountId = useCurrentAccountId();
	const numericProjectId = Number(projectId);

	return useQuery({
		queryKey: projectAudiosQueryKey(accountId, projectId),
		queryFn: async () => {
			const { items } = await studioApiService.getAudioFiles(accountId);
			// Filter by project — if the API supports a query param this filter is redundant
			// but it works as a safe fallback either way
			return items.filter((a) => a.production_project?.id === numericProjectId);
		},
		enabled: !!accountId && !!numericProjectId && !isNaN(numericProjectId)
	});
}