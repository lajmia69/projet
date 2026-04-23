import { useMutation, useQueryClient } from '@tanstack/react-query';
import { podcastApi } from '../services/podcastApiService';
import { CreatePodcastPayload, UpdatePodcastPayload } from '../types';
import { useSnackbar } from 'notistack';
import { podcastsQueryKey } from './usePodcasts';
import { podcastQueryKey } from './usePodcast';

// Invalidate both the list cache AND the search cache used by CoursesView
const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>, currentAccountId: string) => {
	queryClient.invalidateQueries({ queryKey: podcastsQueryKey(currentAccountId) });
	queryClient.invalidateQueries({ queryKey: ['podcast', 'search', currentAccountId] });
};

// ─── Create ──────────────────────────────────────────────────────────────────

export const useCreatePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: CreatePodcastPayload) =>
			podcastApi.createPodcast(currentAccountId, accessToken, data),
		onSuccess: () => {
			invalidateAll(queryClient, currentAccountId);
			enqueueSnackbar('Podcast created successfully', { variant: 'success' });
		},
		onError: (error: Error) => {
			console.error('[useCreatePodcast]', error);
			enqueueSnackbar('Error creating podcast', { variant: 'error' });
		}
	});
};

// ─── Update ──────────────────────────────────────────────────────────────────

export const useUpdatePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: UpdatePodcastPayload) =>
			podcastApi.updatePodcast(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			invalidateAll(queryClient, currentAccountId);
			if (data.id) {
				queryClient.invalidateQueries({
					queryKey: podcastQueryKey(currentAccountId, String(data.id))
				});
			}
			enqueueSnackbar('Podcast updated', { variant: 'success' });
		},
		onError: (error: Error) => {
			console.error('[useUpdatePodcast]', error);
			enqueueSnackbar(`Error updating podcast: ${error.message}`, { variant: 'error' });
		}
	});
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const useDeletePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi.deletePodcast(currentAccountId, accessToken, podcastId),
		onSuccess: () => {
			invalidateAll(queryClient, currentAccountId);
			enqueueSnackbar('Podcast deleted', { variant: 'success' });
		},
		onError: (error: Error) => {
			console.error('[useDeletePodcast]', error);
			enqueueSnackbar('Error deleting podcast', { variant: 'error' });
		}
	});
};

// ─── Validate ────────────────────────────────────────────────────────────────

export const useValidatePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi.validatePodcast(currentAccountId, accessToken, podcastId),
		onSuccess: (_, podcastId) => {
			invalidateAll(queryClient, currentAccountId);
			queryClient.invalidateQueries({
				queryKey: podcastQueryKey(currentAccountId, String(podcastId))
			});
			enqueueSnackbar('Podcast validated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error validating podcast', { variant: 'error' })
	});
};

// ─── Publish ─────────────────────────────────────────────────────────────────

export const usePublishPodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi.publishPodcast(currentAccountId, accessToken, podcastId),
		onSuccess: (_, podcastId) => {
			invalidateAll(queryClient, currentAccountId);
			queryClient.invalidateQueries({
				queryKey: podcastQueryKey(currentAccountId, String(podcastId))
			});
			enqueueSnackbar('Podcast published', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing podcast', { variant: 'error' })
	});
};

// ─── Publish & Release ────────────────────────────────────────────────────────

export const usePublishReleasePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi.publishReleasePodcast(currentAccountId, accessToken, podcastId),
		onSuccess: (_, podcastId) => {
			invalidateAll(queryClient, currentAccountId);
			queryClient.invalidateQueries({
				queryKey: podcastQueryKey(currentAccountId, String(podcastId))
			});
			enqueueSnackbar('Podcast published and released', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing podcast', { variant: 'error' })
	});
};
