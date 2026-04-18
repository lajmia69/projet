import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { studioTasksQueryKey } from './useGetStudioBoardCards';
import { useCurrentAccountId } from '../useCurrentAccountId';
import { CreateProductionTask, UpdateProductionTask } from '../../types';

// ── Create ────────────────────────────────────────────────────────────────────
export function useCreateStudioBoardCard() {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (data: CreateProductionTask) => studioApiService.createTask(accountId, data),
		onSuccess: (task) => {
			queryClient.invalidateQueries({
				queryKey: studioTasksQueryKey(accountId, task.production_project?.id)
			});
		}
	});
}

// ── Update ────────────────────────────────────────────────────────────────────
export function useUpdateStudioBoardCard() {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (data: UpdateProductionTask) => studioApiService.updateTask(accountId, data),
		onSuccess: (task) => {
			queryClient.invalidateQueries({
				queryKey: studioTasksQueryKey(accountId, task.production_project?.id)
			});
		}
	});
}

// ── Delete ────────────────────────────────────────────────────────────────────
export function useDeleteStudioBoardCard(projectId?: number | string) {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (taskId: number) => studioApiService.deleteTask(accountId, taskId),
		onSuccess: () => {
			if (projectId) {
				queryClient.invalidateQueries({
					queryKey: studioTasksQueryKey(accountId, projectId)
				});
			}
		}
	});
}