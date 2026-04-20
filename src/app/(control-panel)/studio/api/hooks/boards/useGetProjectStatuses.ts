import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

export const projectStatusesQueryKey = (accountId: number) => ['studio', 'project-statuses', accountId];

export function useGetProjectStatuses() {
    const accountId = useCurrentAccountId();

    return useQuery({
        queryKey: projectStatusesQueryKey(accountId),
        queryFn: async () => {
            const { items } = await studioApiService.getProjectStatuses(accountId);
            return items;
        },
        enabled: !!accountId
    });
}