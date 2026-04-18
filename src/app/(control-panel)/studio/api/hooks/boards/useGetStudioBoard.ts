import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

export const studioProjectQueryKey = (accountId: number, projectId: number) => [
	'studio',
	'project',
	accountId,
	projectId
];

export function useGetStudioBoard(projectId: number | string) {
	const accountId = useCurrentAccountId();
	const id = Number(projectId);

	return useQuery({
		queryKey: studioProjectQueryKey(accountId, id),
		queryFn: () => studioApiService.getProject(accountId, id),
		enabled: !!accountId && !!id && !isNaN(id)
	});
}
