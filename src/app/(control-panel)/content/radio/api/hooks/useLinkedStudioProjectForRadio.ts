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
		// token is in the key so the query re-runs once the session token loads
		queryKey: ['studio', 'linked-project-radio', contentType, contentId, token],
		queryFn: async () => {
			// Ensure the service has the current token before any request
			if (token) studioApiService.setToken(token);

			const result = await findLinkedStudioProject(accountId, token, contentType, contentId);

			// Debug: if still no linked project, dump audio files to console
			if (!result) {
				console.warn('[useLinkedStudioProjectForRadio] No linked project found for', contentType, contentId);
				try {
					const audioFiles = await studioApiService.getAudioFiles(accountId);
					console.log('[DEBUG] Audio files with project/task info:');
					audioFiles.items.slice(0, 8).forEach(a =>
						console.log(`  id:${a.id} name:${a.name} taskId:${a.production_task?.id} projId:${a.production_task?.production_project?.id}`)
					);
				} catch (e) {
					console.warn('[DEBUG] Could not fetch audio files for diagnosis:', e);
				}
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
		// token is in the key so the query re-runs once the session token loads
		queryKey: ['studio', 'tasks-for-linked-project-radio', studioProjectId, token],
		queryFn: async () => {
			if (token) studioApiService.setToken(token);
			const { items } = await studioApiService.getTasks(accountId);

			// Strategy 1 – backend returns production_project inside task
			const byProject = items
				.filter(t => Number(t.production_project?.id) === Number(studioProjectId))
				.filter(t => t.id !== null)
				.map(t => ({ id: t.id as number, name: t.name }));

			if (byProject.length > 0) return byProject;

			// Strategy 2 – production_project absent from task list response.
			// Return ALL account tasks so useGetTaskAudio can cross-reference
			// audio → task → project via audio.production_task.id.
			console.warn(
				'[useLinkedStudioProjectTasksForRadio] No tasks matched by production_project.id — ' +
				'falling back to all account tasks.',
			);

			return items
				.filter(t => t.id !== null)
				.map(t => ({ id: t.id as number, name: t.name }));
		},
		enabled: !!token && !!studioProjectId && Number(studioProjectId) > 0,
		staleTime: 1000 * 30,
	});
}