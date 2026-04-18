import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { taskStatusesQueryKey } from './useGetTaskStatuses';
import { useCurrentAccountId } from '../useCurrentAccountId';

export function useCreateTaskStatus() {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (name: string) => studioApiService.createTaskStatus(accountId, name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskStatusesQueryKey(accountId) });
		}
	});
}