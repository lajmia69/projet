import { useMutation, useQueryClient } from '@tanstack/react-query';
import { podcastApi } from '../services/podcastApiService';
import { Podcast } from '../types';
import { useSnackbar } from 'notistack';
import { podcastsQueryKey } from './usePodcasts';
import { podcastQueryKey } from './usePodcast';

// ─── Create ─────────────────────────────────────────────────────────────────

export const useCreatePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: Partial<Podcast>) =>
			podcastApi.createPodcast(currentAccountId, accessToken, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: podcastsQueryKey(currentAccountId) });
			enqueueSnackbar('Podcast created successfully', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error creating podcast', { variant: 'error' });
		}
	});
};

// ─── Update ─────────────────────────────────────────────────────────────────

export const useUpdatePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: Partial<Podcast> & { id: number }) =>
			podcastApi.updatePodcast(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: podcastsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: podcastQueryKey(currentAccountId, String(data.id))
			});
			enqueueSnackbar('Podcast updated', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error updating podcast', { variant: 'error' });
		}
	});
};

// ─── Delete ─────────────────────────────────────────────────────────────────

export const useDeletePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi.deletePodcast(currentAccountId, accessToken, podcastId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: podcastsQueryKey(currentAccountId) });
			enqueueSnackbar('Podcast deleted', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error deleting podcast', { variant: 'error' });
		}
	});
};

// ─── Validate ───────────────────────────────────────────────────────────────

export const useValidatePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi.validatePodcast(currentAccountId, accessToken, podcastId),
		onSuccess: (_, podcastId) => {
			queryClient.invalidateQueries({ queryKey: podcastsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: podcastQueryKey(currentAccountId, String(podcastId))
			});
			enqueueSnackbar('Podcast validated', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error validating podcast', { variant: 'error' });
		}
	});
};

// ─── Publish ────────────────────────────────────────────────────────────────

export const usePublishPodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi.publishPodcast(currentAccountId, accessToken, podcastId),
		onSuccess: (_, podcastId) => {
			queryClient.invalidateQueries({ queryKey: podcastsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: podcastQueryKey(currentAccountId, String(podcastId))
			});
			enqueueSnackbar('Podcast published', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error publishing podcast', { variant: 'error' });
		}
	});
};

// ─── Publish & Release ──────────────────────────────────────────────────────

export const usePublishReleasePodcast = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi.publishReleasePodcast(currentAccountId, accessToken, podcastId),
		onSuccess: (_, podcastId) => {
			queryClient.invalidateQueries({ queryKey: podcastsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: podcastQueryKey(currentAccountId, String(podcastId))
			});
			enqueueSnackbar('Podcast published and released', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error publishing podcast', { variant: 'error' });
		}
	});
};