import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import ky from 'ky';
import { radioAdminKeys } from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';

// ─── Podcast-specific ky instance ─────────────────────────────────────────────

const podcastApi = ky.create({
	prefixUrl: 'https://radio.backend.ecocloud.tn/',
	timeout: 30_000,
});

function authHeaders(token: string) {
	return { Authorization: `Bearer ${token}` };
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const podcastKeys = {
	list:   (accountId: string) => ['podcast', 'list',   accountId] as const,
	search: (accountId: string) => ['podcast', 'search', accountId] as const,
	item:   (accountId: string, id: number) => ['podcast', 'item', accountId, id] as const,
};

// ─── Validate ─────────────────────────────────────────────────────────────────

export const useValidatePodcast = (accountId: string, token: string) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi
				.patch(`podcast/validate/${accountId}/`, {
					json: { id: podcastId, is_approved_content: true },
					headers: authHeaders(token),
				})
				.json(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: podcastKeys.list(accountId) });
			qc.invalidateQueries({ queryKey: podcastKeys.search(accountId) });
			// Invalidate radio emissions so any auto-created emission appears immediately
			qc.invalidateQueries({ queryKey: ['radio-admin', 'emissions'] });
			enqueueSnackbar('Podcast validated', { variant: 'success' });
		},
		onError: (err) => {
			console.error('[useValidatePodcast] error:', err);
			enqueueSnackbar('Error validating podcast', { variant: 'error' });
		},
	});
};

// ─── Make public ──────────────────────────────────────────────────────────────

export const usePublicPodcast = (accountId: string, token: string) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi
				.patch(`podcast/public/${accountId}/`, {
					json: { id: podcastId, is_pubic_content: true },
					headers: authHeaders(token),
				})
				.json(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: podcastKeys.list(accountId) });
			qc.invalidateQueries({ queryKey: podcastKeys.search(accountId) });
			enqueueSnackbar('Podcast made public', { variant: 'success' });
		},
		onError: (err) => {
			console.error('[usePublicPodcast] error:', err);
			enqueueSnackbar('Error making podcast public', { variant: 'error' });
		},
	});
};

// ─── Publish ──────────────────────────────────────────────────────────────────

export const usePublishPodcast = (accountId: string, token: string) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi
				.patch(`podcast/publish/${accountId}/`, {
					json: { id: podcastId, is_published: true },
					headers: authHeaders(token),
				})
				.json(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: podcastKeys.list(accountId) });
			qc.invalidateQueries({ queryKey: podcastKeys.search(accountId) });
			enqueueSnackbar('Podcast published', { variant: 'success' });
		},
		onError: (err) => {
			console.error('[usePublishPodcast] error:', err);
			enqueueSnackbar('Error publishing podcast', { variant: 'error' });
		},
	});
};

// ─── Create ───────────────────────────────────────────────────────────────────

export type CreatePodcastPayload = {
	name: string;
	slug: string;
	description: string;
	transcription: Record<string, unknown>;
	language_id: number;
	podcast_category_id: number;
	tags: string[];
};

export const useCreatePodcast = (accountId: string, token: string) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (payload: CreatePodcastPayload) =>
			podcastApi
				.post(`podcast/create/${accountId}/`, {
					json: payload,
					headers: authHeaders(token),
				})
				.json(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: podcastKeys.list(accountId) });
			qc.invalidateQueries({ queryKey: podcastKeys.search(accountId) });
			enqueueSnackbar('Podcast created', { variant: 'success' });
		},
		onError: (err) => {
			console.error('[useCreatePodcast] error:', err);
			enqueueSnackbar('Error creating podcast', { variant: 'error' });
		},
	});
};

// ─── Update ───────────────────────────────────────────────────────────────────

export type UpdatePodcastPayload = {
	id: number;
	name: string;
	slug: string;
	description: string;
	transcription: Record<string, unknown>;
	language_id: number;
	podcast_category_id: number;
	add_tags: string[];
	remove_tags: string[];
};

export const useUpdatePodcast = (accountId: string, token: string) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (payload: UpdatePodcastPayload) =>
			podcastApi
				.put(`podcast/update/${accountId}/`, {
					json: payload,
					headers: authHeaders(token),
				})
				.json(),
		onSuccess: (_, payload) => {
			qc.invalidateQueries({ queryKey: podcastKeys.list(accountId) });
			qc.invalidateQueries({ queryKey: podcastKeys.search(accountId) });
			qc.invalidateQueries({ queryKey: podcastKeys.item(accountId, payload.id) });
			enqueueSnackbar('Podcast updated', { variant: 'success' });
		},
		onError: (err) => {
			console.error('[useUpdatePodcast] error:', err);
			enqueueSnackbar('Error updating podcast', { variant: 'error' });
		},
	});
};

// ─── Delete ───────────────────────────────────────────────────────────────────

export const useDeletePodcast = (accountId: string, token: string) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi
				.delete(`podcast/delete/${accountId}/${podcastId}/`, {
					headers: authHeaders(token),
				})
				.json(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: podcastKeys.list(accountId) });
			qc.invalidateQueries({ queryKey: podcastKeys.search(accountId) });
			enqueueSnackbar('Podcast deleted', { variant: 'success' });
		},
		onError: (err) => {
			console.error('[useDeletePodcast] error:', err);
			enqueueSnackbar('Error deleting podcast', { variant: 'error' });
		},
	});
};