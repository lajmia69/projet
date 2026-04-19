import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

export const taskResourcesQueryKey = (accountId: number) => ['studio', 'task-resources', accountId];

export function useGetTaskResources() {
	const accountId = useCurrentAccountId();

	return useQuery({
		queryKey: taskResourcesQueryKey(accountId),
		queryFn: async () => {
			const { items } = await studioApiService.getTaskResources(accountId);
			return items;
		},
		enabled: !!accountId
	});
}
