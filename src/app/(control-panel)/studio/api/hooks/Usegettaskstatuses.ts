import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../useCurrentAccountId';

export const taskStatusesQueryKey = (accountId: number) => ['studio', 'task-statuses', accountId];

export function useGetTaskStatuses() {
	const accountId = useCurrentAccountId();

	return useQuery({
		queryKey: taskStatusesQueryKey(accountId),
		queryFn: async () => {
			// Seed default statuses (To Do / In Progress / Completed / Failed) on first load
			return studioApiService.seedDefaultStatuses(accountId);
		},
		enabled: !!accountId,
		staleTime: 1000 * 60 * 5 // 5 minutes
	});
}