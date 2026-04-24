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

			// If no linked project, log audio files to help diagnose
			if (!result) {
				const audioFiles = await studioApiService.getAudioFiles(accountId);
				console.log('[DEBUG] Audio files with project/task info:');
				audioFiles.items.slice(0, 8).forEach(a =>
					console.log(`  id:${a.id} name:${a.name} taskId:${a.production_task?.id} taskName:${a.production_task?.name} projId:${a.production_task?.production_project?.id}`)
				);
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
 *
 * The backend's task list may or may not include the nested `production_project`
 * object.  This hook uses two strategies:
 *
 *   1. Filter by `t.production_project?.id` (when the backend returns it).
 *   2. Fall back to returning ALL tasks in the account when strategy 1 yields
 *      nothing — the caller (`useGetTaskAudio`) will do its own cross-referencing
 *      via strategy 3, so returning a superset here is safe and keeps things
 *      unblocked.
 *
 * In both cases only tasks with a non-null id are returned.
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

			// Strategy 1 – backend returns production_project inside task
			const byProject = items
				.filter(t => Number(t.production_project?.id) === Number(studioProjectId))
				.filter(t => t.id !== null)
				.map(t => ({ id: t.id as number, name: t.name }));

			if (byProject.length > 0) return byProject;

			// Strategy 2 – production_project is absent from task list response.
			// Return ALL account tasks (non-null id only) so useGetTaskAudio can
			// still cross-reference audio → task → project via audio.production_task.id.
			console.warn(
				'[useLinkedStudioProjectTasksForRadio] No tasks matched by production_project.id — ' +
				'falling back to all account tasks. Audio lookup will cross-reference by project.',
			);

			return items
				.filter(t => t.id !== null)
				.map(t => ({ id: t.id as number, name: t.name }));
		},
		enabled: !!token && !!studioProjectId && Number(studioProjectId) > 0,
		staleTime: 1000 * 30,
	});
}