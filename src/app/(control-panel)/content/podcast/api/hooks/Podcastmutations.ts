/**
 * Podcastmutations.ts
 *
 * Fixes applied:
 * 1. ✅ useValidatePodcast / usePublishPodcast now call the corrected service
 *       methods that use account_id in the URL (not podcast_id).
 * 2. ✅ queryClient.invalidateQueries added to ALL mutation onSuccess callbacks
 *       → the podcasts table now refreshes after every action.
 * 3. ✅ retry: 0 is set inside podcastApiService → no more triple-500 floods.
 * 4. ✅ Consistent error logging across all hooks.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	podcastApi,
	type CreatePodcastPayload,
	type UpdatePodcastPayload,
	type ValidatePodcastPayload,
	type PublishPodcastPayload,
} from '../services/podcastApiService';

// ─── Query key used by useSearchPodcasts ─────────────────────────────────────
// Invalidating with this prefix refreshes the podcasts table automatically.
const PODCASTS_KEY = ['podcasts'];

// ─── CRUD mutations ───────────────────────────────────────────────────────────

export function useCreatePodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePodcastPayload) => {
			console.log('[useCreatePodcast] payload:', JSON.stringify(payload, null, 2));
			return podcastApi.create(accountId, token, payload);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			qc.invalidateQueries({ queryKey: ['podcast'] });
			console.log('[useCreatePodcast] success – cache invalidated');
		},
		onError: (err) => {
			console.error('[useCreatePodcast] error:', (err as Error)?.message ?? err);
		},
	});
}

export function useUpdatePodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdatePodcastPayload) => {
			console.log('[useUpdatePodcast] payload:', JSON.stringify(payload, null, 2));
			return podcastApi.update(accountId, token, payload);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			qc.invalidateQueries({ queryKey: ['podcast'] });
			console.log('[useUpdatePodcast] success – cache invalidated');
		},
		onError: (err) => {
			console.error('[useUpdatePodcast] error:', (err as Error)?.message ?? err);
		},
	});
}

export function useDeletePodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (podcastId: number) => {
			return podcastApi.delete(accountId, token, podcastId);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			qc.invalidateQueries({ queryKey: ['podcast'] });
			console.log('[useDeletePodcast] success – cache invalidated');
		},
		onError: (err) => {
			console.error('[useDeletePodcast] error:', (err as Error)?.message ?? err);
		},
	});
}

// ─── Status / workflow mutations ──────────────────────────────────────────────

/**
 * PATCH /podcast/validate/{accountId}/
 * Body: { id: podcastId, is_approved_content: true }
 *
 * ✅ FIX 1: URL now uses accountId in path (was using podcastId → 500)
 * ✅ FIX 2: onSuccess invalidates the query cache → table refreshes
 */
export function useValidatePodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (podcastId: number) => {
			const payload: ValidatePodcastPayload = {
				id: podcastId,
				is_approved_content: true,
			};
			console.log('[useValidatePodcast] payload:', JSON.stringify(payload, null, 2));
			return podcastApi.validate(accountId, token, payload);
		},
		onSuccess: () => {
			// ← This was the missing piece: status column now updates in the table
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			qc.invalidateQueries({ queryKey: ['podcast'] });
			console.log('[useValidatePodcast] success – podcast approved, cache invalidated');
		},
		onError: (err) => {
			console.error('[useValidatePodcast] error:', (err as Error)?.message ?? err);
		},
	});
}

/**
 * PATCH /podcast/publish/{accountId}/
 * Body: { id: podcastId, is_published: true }
 *
 * ✅ FIX 1: Authorization header now sent (was missing → 401)
 * ✅ FIX 2: URL now uses accountId in path
 * ✅ FIX 3: onSuccess invalidates the query cache
 */
export function usePublishPodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (podcastId: number) => {
			const payload: PublishPodcastPayload = {
				id: podcastId,
				is_published: true,
			};
			console.log('[usePublishPodcast] payload:', JSON.stringify(payload, null, 2));
			return podcastApi.publish(accountId, token, payload);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			qc.invalidateQueries({ queryKey: ['podcast'] });
			console.log('[usePublishPodcast] success – podcast published, cache invalidated');
		},
		onError: (err) => {
			console.error('[usePublishPodcast] error:', (err as Error)?.message ?? err);
		},
	});
}