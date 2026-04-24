import { useQuery } from '@tanstack/react-query';
import useUser from '@auth/useUser';
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
	const { data: user } = useUser();
	const token = user?.token?.access ?? '';
	const currentAccountId = useCurrentAccountId();
	const accountId = accountIdOverride ?? currentAccountId;

	return useQuery({
		queryKey: ['studio', 'task-audio', accountId, projectId ?? null, taskId ?? null],
		queryFn: async (): Promise<AudioFile | null> => {
			// Inject the session token so studioFetch uses it instead of
			// falling back to localStorage (which may be stale or missing).
			if (token) studioApiService.setToken(token);

			const { items } = await studioApiService.getAudioFiles(accountId);

			// No project/task context – can't determine audio
			if (!projectId && !taskId) return null;

			// ── Strategy 1 ─ backend exposes production_task.id directly ──────────
			if (taskId) {
				const byTaskId = items.find((a) => a.production_task?.id === taskId) ?? null;
				if (byTaskId) return byTaskId;
			}

			// ── Strategy 2 ─ filter by project when task→project chain is present ─
			if (projectId) {
				const hasProjectChain = items.some(
					(a) => a.production_task?.production_project?.id !== undefined,
				);
				if (hasProjectChain) {
					const byProject =
						items.find(
							(a) => a.production_task?.production_project?.id === projectId,
						) ?? null;
					if (byProject) return byProject;
				}
			}

			// ── Strategy 3 ─ cross-reference via task list ────────────────────────
			//
			// The backend's audio list may return production_task.id but omit the
			// nested production_project (or vice-versa).  Fetch the task list for
			// this account, collect every task that belongs to the target project,
			// then find an audio file whose production_task.id is in that set.
			//
			// This mirrors the fallback already used in useGetProjectAudios.
			if (projectId) {
				try {
					const { items: taskItems } = await studioApiService.getTasks(accountId);

					const projectTaskIds = new Set(
						taskItems
							.filter((t) => Number(t.production_project?.id) === Number(projectId))
							.map((t) => t.id)
							.filter((id): id is number => id !== null),
					);

					if (projectTaskIds.size > 0) {
						// Prefer the task we already know about; otherwise take any match.
						const preferred =
							taskId != null
								? items.find(
										(a) =>
											a.production_task?.id != null &&
											projectTaskIds.has(Number(a.production_task.id)) &&
											Number(a.production_task.id) === taskId,
								  )
								: undefined;

						const fallback = items.find(
							(a) =>
								a.production_task?.id != null &&
								projectTaskIds.has(Number(a.production_task.id)),
						);

						return preferred ?? fallback ?? null;
					}
				} catch {
					// Task list request failed – fall through to null rather than crashing.
				}
			}

			// No matching audio found
			return null;
		},
		enabled: !!accountId && (!!projectId || !!taskId),
		staleTime: 1000 * 60 * 2,
	});
}