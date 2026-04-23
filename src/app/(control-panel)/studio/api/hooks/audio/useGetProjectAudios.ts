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
 * Filtering strategy:
 *   1. Fetch all audio files for the account.
 *   2. Filter to files whose linked task belongs to this project.
 *   3. If the backend doesn't populate the task→project relationship on ANY
 *      file, return an empty array — never fall back to all files, because
 *      that causes the wrong (oldest) audio to appear in the player.
 *   4. Results are sorted newest-first by id so studioAudios[0] is always
 *      the most recently uploaded file for this project.
 */
export function useGetProjectAudios(projectId?: number | string) {
	const accountId = useCurrentAccountId();
	const numericProjectId =
		projectId !== undefined && projectId !== null && projectId !== ''
			? Number(projectId)
			: undefined;

	return useQuery({
		// Include projectId in the cache key so each board gets its own slice.
		queryKey: [...projectAudiosQueryKey(accountId), numericProjectId ?? 'all'],
		queryFn: async () => {
			const { items } = await studioApiService.getAudioFiles(accountId);

			// No project scope requested — return everything (used by the Studio
			// audio panel which shows all account files).
			if (!numericProjectId) return items;

			// Filter to files whose linked task belongs to this project.
			// If the backend doesn't populate production_task.production_project.id
			// we return an empty array — showing nothing is safer than showing a
			// random old file from another project.
			const projectFiles = items.filter(
				(item) =>
					item.production_task?.production_project?.id !== undefined &&
					Number(item.production_task.production_project.id) === numericProjectId
			);

			// Sort newest-first so studioAudios[0] is always the latest upload.
			return projectFiles.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
		},
		enabled: !!accountId
	});
}