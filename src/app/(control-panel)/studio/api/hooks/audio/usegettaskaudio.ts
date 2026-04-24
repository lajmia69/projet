import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';
import type { AudioFile } from '../../types';

/**
 * useGetTaskAudio
 *
 * Returns the single audio file linked to a specific studio task.
 *
 * @param projectId   - Studio project ID (used as fallback when taskId is missing)
 * @param taskId      - Studio task ID (primary lookup key)
 * @param accountIdOverride - Explicit account ID to query. Pass `1` for radio content
 *                            which is always stored under account 1, regardless of the
 *                            currently logged-in user's account.
 */
export function useGetTaskAudio(
	projectId?: number | null,
	taskId?: number | null,
	accountIdOverride?: number,
): { data: AudioFile | null | undefined; isLoading: boolean } {
	const currentAccountId = useCurrentAccountId();
	const accountId = accountIdOverride ?? currentAccountId;

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
					const byProject =
						items.find(
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