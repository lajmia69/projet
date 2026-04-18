import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { studioProjectsQueryKey } from './useGetStudioBoards';
import { studioProjectQueryKey } from './useGetStudioBoard';
import { useCurrentAccountId } from '../../useCurrentAccountId';
import { UpdateProductionProject } from '../../types';

export function useUpdateStudioBoard() {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (data: UpdateProductionProject) => studioApiService.updateProject(accountId, data),
		onSuccess: (_, variables) => {
			if (variables.id) {
				queryClient.invalidateQueries({
					queryKey: studioProjectQueryKey(accountId, variables.id)
				});
			}
			queryClient.invalidateQueries({ queryKey: studioProjectsQueryKey(accountId) });
		}
	});
}
