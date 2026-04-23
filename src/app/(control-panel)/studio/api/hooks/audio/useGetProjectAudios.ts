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
 *   2. If any file carries `production_task.production_project.id` (i.e. the
 *      backend exposes the relationship), filter by project ID.
 *   3. If the backend doesn't return that relationship, fall back to showing
 *      all files (safe degradation — same behaviour as before this fix).
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

			// No project scope requested — return everything.
			if (!numericProjectId) return items;

			// Check whether the backend populates the task→project relationship.
			const hasTaskRef = items.some(
				(item) => item.production_task?.production_project?.id !== undefined
			);

			if (!hasTaskRef) {
				// Backend doesn't expose the relationship yet; return all files
				// so the panel isn't empty (safe fallback).
				return items;
			}

			// Filter to files whose linked task belongs to this project.
			return items.filter(
				(item) =>
					item.production_task?.production_project?.id === numericProjectId
			);
		},
		enabled: !!accountId
	});
}