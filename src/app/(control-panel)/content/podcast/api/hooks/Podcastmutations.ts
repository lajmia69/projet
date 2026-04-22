/**
 * Podcastmutations.ts — with Studio auto-create on podcast creation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { podcastApi } from '../services/podcastApiService';
import type { ValidatePodcastPayload, PublishPodcastPayload } from '../services/podcastApiService';
import type { CreatePodcastPayload, UpdatePodcastPayload } from '../types';
import { createStudioProjectForContent } from '@/app/(control-panel)/studio/api/utils/autoCreateStudioProject';

const PODCASTS_KEY = ['podcast'];

// ─── CREATE ───────────────────────────────────────────────────────────────────

export function useCreatePodcast(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreatePodcastPayload) => {
			console.log('[useCreatePodcast] payload:', JSON.stringify(payload, null, 2));
			return podcastApi.create(accountId, token, payload);
		},
		onSuccess: (podcast) => {
			qc.invalidateQueries({ queryKey: PODCASTS_KEY });
			console.log('[useCreatePodcast] success – cache invalidated');

			// Auto-create Studio production project board
			if (podcast?.id && podcast?.name) {
				createStudioProjectForContent(
					Number(accountId), token, 'podcast', podcast.id, podcast.name,
				);
			}
		},
		onError: (err: unknown) => {
			console.error('[useCreatePodcast] error:', (err as Error)?.message ?? err);
		},
	});
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

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

// ─── DELETE ───────────────────────────────────────────────────────────────────

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

// ─── VALIDATE ─────────────────────────────────────────────────────────────────

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

// ─── PUBLISH ──────────────────────────────────────────────────────────────────

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