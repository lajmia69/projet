import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';
import type { AudioFile } from '../../types';

/**
 * useGetTaskAudio
 *
 * Returns the single audio file linked to a specific studio task.
 * This mirrors how Lesson resolves audio — scoped to the exact task
 * that was created for the content item, not the first item in a list.
 *
 * Usage:
 *   const { data: taskAudio } = useGetTaskAudio(linkedProject?.id, taskId);
 *   const audioSrc = taskAudio?.src ?? null;
 *
 * When `taskId` is undefined/null the query is disabled and returns undefined,
 * so callers safely fall through to their "no audio" state.
 */
export function useGetTaskAudio(
	projectId?: number | null,
	taskId?: number | null,
): { data: AudioFile | null | undefined; isLoading: boolean } {
	const accountId = useCurrentAccountId();

	return useQuery({
		queryKey: ['studio', 'task-audio', accountId, projectId ?? null, taskId ?? null],
		queryFn: async (): Promise<AudioFile | null> => {
			const { items } = await studioApiService.getAudioFiles(accountId);

			// No project/task context - can't determine audio
			if (!projectId && !taskId) return null;

			// Strategy 1 – backend exposes production_task.id directly
			if (taskId) {
				const byTaskId = items.find((a) => a.production_task?.id === taskId) ?? null;
				if (byTaskId) return byTaskId;
			}

			// Strategy 2 – filter by project when task relationship is missing
			if (projectId) {
				const hasTaskRef = items.some(
					(a) => a.production_task?.production_project?.id !== undefined,
				);
				if (hasTaskRef) {
					const byProject = items.find(
						(a) => a.production_task?.production_project?.id === projectId,
					) ?? null;
					if (byProject) return byProject;
				}
			}

			// No matching audio found
			return null;
		},
		enabled: !!accountId && (!!projectId || !!taskId),
		staleTime: 1000 * 60 * 2,
	});
}