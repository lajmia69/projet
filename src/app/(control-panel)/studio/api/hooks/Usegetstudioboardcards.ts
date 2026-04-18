import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../useCurrentAccountId';

export const studioTasksQueryKey = (accountId: number, projectId?: number | string) => [
	'studio',
	'tasks',
	accountId,
	projectId ? String(projectId) : 'all'
];

export function useGetStudioBoardCards(projectId: number | string) {
	const accountId = useCurrentAccountId();
	const numericProjectId = Number(projectId);

	return useQuery({
		queryKey: studioTasksQueryKey(accountId, projectId),
		queryFn: async () => {
			const { items } = await studioApiService.getTasks(accountId);
			// Filter client-side by project (the API doesn't support query filters yet)
			return items.filter((t) => t.production_project?.id === numericProjectId);
		},
		enabled: !!accountId && !!numericProjectId && !isNaN(numericProjectId),
		select: (tasks) => tasks.map(studioApiService.adaptTaskToCard)
	});
}