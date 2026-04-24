import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

/**
 * Base query key (no projectId) — used by mutations for broad invalidation.
 * TanStack Query v4 prefix-matches on invalidation, so invalidating this key
 * will also bust the per-project variants below.
 */
export const projectAudiosQueryKey = (accountId: number) => [
	'studio',
	'audio',
	accountId
];

/**
 * Returns audio files scoped to a specific project when `projectId` is supplied.
 *
 * Filtering strategy (in priority order):
 *   1. audio.production_task.production_project.id === projectId  (backend exposes full chain)
 *   2. audio.production_task.id is in the project's task id list  (cross-reference via task list)
 *   3. No projectId given — return everything (used by AudioPanel for display purposes)
 *
 * Unlike the previous version, this hook NEVER falls back to returning all account
 * audios when a projectId is supplied. That fallback was the root cause of the
 * wrong audio being played in Episode / Emission / Reportage detail views.
 */
export function useGetProjectAudios(projectId?: number | string) {
	const accountId = useCurrentAccountId();
	const numericProjectId =
		projectId !== undefined && projectId !== null && projectId !== ''
			? Number(projectId)
			: undefined;

	return useQuery({
		queryKey: [...projectAudiosQueryKey(accountId), numericProjectId ?? 'all'],
		queryFn: async () => {
			const { items: audioItems } = await studioApiService.getAudioFiles(accountId);

			// No project scope requested — return everything (AudioPanel use-case).
			if (!numericProjectId) return audioItems;

			// ── Strategy 1: backend returns production_task.production_project.id ──
			const hasFullChain = audioItems.some(
				(item) => item.production_task?.production_project?.id !== undefined,
			);
			if (hasFullChain) {
				return audioItems.filter(
					(item) => item.production_task?.production_project?.id === numericProjectId,
				);
			}

			// ── Strategy 2: cross-reference via task list ─────────────────────────
			// Fetch all tasks for the account, filter to those belonging to this project,
			// then keep only audios whose production_task.id is in that set.
			try {
				const { items: taskItems } = await studioApiService.getTasks(accountId);
				const projectTaskIds = new Set(
					taskItems
						.filter((t) => Number(t.production_project?.id) === numericProjectId)
						.map((t) => t.id)
						.filter((id): id is number => id !== null),
				);

				if (projectTaskIds.size > 0) {
					const matched = audioItems.filter(
						(item) =>
							item.production_task?.id !== undefined &&
							item.production_task.id !== null &&
							projectTaskIds.has(item.production_task.id as number),
					);
					// Return matched files; if none found yet the upload may not have
					// happened — return empty array so caller shows "no audio" state.
					return matched;
				}
			} catch {
				// Task list failed — fall through to empty result rather than
				// returning all account audios.
			}

			// No matching audio found for this project.
			return [];
		},
		enabled: !!accountId,
	});
}