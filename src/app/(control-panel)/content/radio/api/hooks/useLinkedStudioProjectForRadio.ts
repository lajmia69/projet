import { useQuery } from '@tanstack/react-query';
import useUser from '@auth/useUser';
import { findLinkedStudioProject, StudioContentType } from '@/app/(control-panel)/studio/api/utils/autoCreateStudioProject';
import { studioApiService } from '@/app/(control-panel)/studio/api/services/studioApiService';

/**
 * useLinkedStudioProjectForRadio
 * 
 * Radio content stores audio in Studio projects under account 1.
 * This hook searches in account 1 instead of current user account.
 */
export function useLinkedStudioProjectForRadio(contentType: StudioContentType, contentId: number) {
	const { data: user } = useUser();
	const token = user?.token?.access ?? '';
	const accountId = 1;

	return useQuery({
		queryKey: ['studio', 'linked-project-radio', contentType, contentId],
		queryFn: async () => {
			const result = await findLinkedStudioProject(accountId, token, contentType, contentId);
			console.log('[DEBUG findLinkedStudioProject] result:', result, 'contentType:', contentType, 'contentId:', contentId);
			
			// If no linked project, just list all audio files in account 1 with their project.task info
			if (!result) {
				const audioFiles = await studioApiService.getAudioFiles(accountId);
				console.log('[DEBUG] Audio files with project/task info:');
				audioFiles.items.slice(0, 8).forEach(a => console.log(`  id:${a.id} name:${a.name} taskId:${a.production_task?.id} taskName:${a.production_task?.name} projId:${a.production_task?.production_project?.id}`));
			}
			
			return result;
		},
		enabled: !!token && contentId > 0,
		staleTime: 1000 * 60 * 2,
	});
}

/**
 * useLinkedStudioProjectTasksForRadio
 * 
 * Fetches tasks from Studio project in account 1.
 */
export function useLinkedStudioProjectTasksForRadio(studioProjectId: number | null | undefined) {
	const { data: user } = useUser();
	const token = user?.token?.access ?? '';
	const accountId = 1;

	return useQuery({
		queryKey: ['studio', 'tasks-for-linked-project-radio', studioProjectId],
		queryFn: async () => {
			if (token) studioApiService.setToken(token);
			const { items } = await studioApiService.getTasks(accountId);
			return items
				.filter(t => Number(t.production_project?.id) === Number(studioProjectId))
				.filter(t => t.id !== null)
				.map(t => ({ id: t.id as number, name: t.name }));
		},
		enabled: !!token && !!studioProjectId && Number(studioProjectId) > 0,
		staleTime: 1000 * 30,
	});
}