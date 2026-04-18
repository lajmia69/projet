import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { studioProjectsQueryKey } from './useGetStudioBoards';
import { useCurrentAccountId } from '../../useCurrentAccountId';
import { CreateProductionProject } from '../../types';

export function useCreateStudioBoard() {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (data: CreateProductionProject) => studioApiService.createProject(accountId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: studioProjectsQueryKey(accountId) });
		}
	});
}
