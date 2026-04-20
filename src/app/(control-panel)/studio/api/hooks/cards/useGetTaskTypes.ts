// src/app/(control-panel)/studio/api/hooks/cards/useGetTaskTypes.ts
import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

export const taskTypesQueryKey = (accountId: number) => ['studio', 'task-types', accountId];

export function useGetTaskTypes() {
    const accountId = useCurrentAccountId();
    return useQuery({
        queryKey: taskTypesQueryKey(accountId),
        queryFn: async () => {
            const { items } = await studioApiService.getTaskTypes(accountId);
            return items;
        },
        enabled: !!accountId
    });
}