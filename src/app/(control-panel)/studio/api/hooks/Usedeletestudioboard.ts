import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { studioProjectsQueryKey } from './useGetStudioBoards';
import { useCurrentAccountId } from '../useCurrentAccountId';

export function useDeleteStudioBoard() {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (projectId: number) => studioApiService.deleteProject(accountId, projectId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: studioProjectsQueryKey(accountId) });
		}
	});
}