import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

export const taskStatusesQueryKey = (accountId: number) => ['studio', 'task-statuses', accountId];

export function useGetTaskStatuses() {
	const accountId = useCurrentAccountId();

	return useQuery({
		queryKey: taskStatusesQueryKey(accountId),
		queryFn: async () => {
			return studioApiService.seedDefaultStatuses(accountId);
		},
		enabled: !!accountId,
		staleTime: 1000 * 60 * 5
	});
}
