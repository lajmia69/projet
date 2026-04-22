/**
 * useLinkedStudioProject.ts
 *
 * Finds the Studio production project linked to a content item via the
 * `note` field convention `contentType:contentId`.
 */
import { useQuery } from '@tanstack/react-query';
import useUser from '@auth/useUser';
import {
	findLinkedStudioProject,
	createStudioProjectForContent,
	StudioContentType,
} from '../utils/autoCreateStudioProject';
import { studioApiService } from '../services/studioApiService';

// ─── Find linked project ──────────────────────────────────────────────────────

export function useLinkedStudioProject(contentType: StudioContentType, contentId: number) {
	const { data: user } = useUser();
	const accountId = Number(user?.id ?? 0);
	const token     = user?.token?.access ?? '';

	return useQuery({
		queryKey: ['studio', 'linked-project', contentType, contentId],
		queryFn:  () => findLinkedStudioProject(accountId, token, contentType, contentId),
		enabled:  !!accountId && !!token && contentId > 0,
		staleTime: 1000 * 60 * 2,
	});
}

// ─── Ensure linked project exists (create if missing) ─────────────────────────

export function useEnsureLinkedStudioProject(
	contentType: StudioContentType,
	contentId: number,
	contentName: string,
) {
	const { data: user } = useUser();
	const accountId = Number(user?.id ?? 0);
	const token     = user?.token?.access ?? '';

	/** Call this to guarantee a project exists, creating it if needed. */
	async function ensureProject() {
		if (!accountId || !token || !contentId || !contentName) return null;
		return createStudioProjectForContent(accountId, token, contentType, contentId, contentName);
	}

	return { ensureProject };
}

// ─── Load tasks for a linked studio project ───────────────────────────────────

export function useLinkedStudioProjectTasks(studioProjectId: number | null | undefined) {
	const { data: user } = useUser();
	const accountId = Number(user?.id ?? 0);
	const token     = user?.token?.access ?? '';

	return useQuery({
		queryKey: ['studio', 'tasks-for-linked-project', studioProjectId],
		queryFn:  async () => {
			if (token) studioApiService.setToken(token);
			const { items } = await studioApiService.getTasks(accountId);
			return items
				.filter(t => Number(t.production_project?.id) === Number(studioProjectId))
				.filter(t => t.id !== null)
				.map(t => ({ id: t.id as number, name: t.name }));
		},
		enabled:   !!accountId && !!token && !!studioProjectId && Number(studioProjectId) > 0,
		staleTime: 1000 * 30,
	});
}