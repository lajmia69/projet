import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { taskStatusesQueryKey } from './useGetTaskStatuses';
import { useCurrentAccountId } from '../../useCurrentAccountId';
import { TaskStatus } from '../../types';

export function useUpdateTaskStatus() {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (status: TaskStatus) => studioApiService.updateTaskStatus(accountId, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskStatusesQueryKey(accountId) });
		}
	});
}

export function useDeleteTaskStatus() {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (statusId: number) => studioApiService.deleteTaskStatus(accountId, statusId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskStatusesQueryKey(accountId) });
		}
	});
}
