/**
 * Podcastmutations.ts
 *
 * Payload types come from ../types (the single source of truth).
 * ValidatePodcastPayload / PublishPodcastPayload are imported from the service
 * since they are mutation-only and not part of the shared type surface.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { podcastApi } from '../services/podcastApiService';
import type { ValidatePodcastPayload, PublishPodcastPayload } from '../services/podcastApiService';
import type { CreatePodcastPayload, UpdatePodcastPayload } from '../types';

// Matches the queryKey used by useSearchPodcasts and usePodcasts
const PODCASTS_KEY = ['podcast'];

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function useCreatePodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePodcastPayload) => {
			console.log('[useCreatePodcast] payload:', JSON.stringify(payload, null, 2));
			return podcastApi.create(accountId, token, payload);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			console.log('[useCreatePodcast] success – cache invalidated');
		},
		onError: (err: unknown) => {
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
			console.log('[useUpdatePodcast] success – cache invalidated');
		},
		onError: (err: unknown) => {
			console.error('[useUpdatePodcast] error:', (err as Error)?.message ?? err);
		},
	});
}

export function useDeletePodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (podcastId: number) => podcastApi.delete(accountId, token, podcastId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			console.log('[useDeletePodcast] success – cache invalidated');
		},
		onError: (err: unknown) => {
			console.error('[useDeletePodcast] error:', (err as Error)?.message ?? err);
		},
	});
}

// ─── Status / workflow ────────────────────────────────────────────────────────

/**
 * PATCH /podcast/validate/{accountId}/
 * Body: { id: podcastId, is_approved_content: true }
 */
export function useValidatePodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (podcastId: number) => {
			const payload: ValidatePodcastPayload = { id: podcastId, is_approved_content: true };
			console.log('[useValidatePodcast] payload:', JSON.stringify(payload, null, 2));
			return podcastApi.validate(accountId, token, payload);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			console.log('[useValidatePodcast] success – cache invalidated');
		},
		onError: (err: unknown) => {
			console.error('[useValidatePodcast] error:', (err as Error)?.message ?? err);
		},
	});
}

/**
 * PATCH /podcast/publish/{accountId}/
 * Body: { id: podcastId, is_published: true }
 */
export function usePublishPodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (podcastId: number) => {
			const payload: PublishPodcastPayload = { id: podcastId, is_published: true };
			console.log('[usePublishPodcast] payload:', JSON.stringify(payload, null, 2));
			return podcastApi.publish(accountId, token, payload);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			console.log('[usePublishPodcast] success – cache invalidated');
		},
		onError: (err: unknown) => {
			console.error('[usePublishPodcast] error:', (err as Error)?.message ?? err);
		},
	});
}