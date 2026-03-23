import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { podcastApi } from '../../services/podcastApiService';
import { SetPodcastEmotionPayload } from '../../types';
import { useSnackbar } from 'notistack';

export const podcastEmotionsQueryKey = (currentAccountId: string) => [
	'podcast',
	'emotions',
	currentAccountId
];

export const podcastEmotionQueryKey = (currentAccountId: string, podcastId: number) => [
	'podcast',
	'emotion',
	currentAccountId,
	podcastId
];

// ─── List ────────────────────────────────────────────────────────────────────

export const usePodcastEmotions = (currentAccountId: string, accessToken: string) => {
	return useQuery({
		queryKey: podcastEmotionsQueryKey(currentAccountId),
		queryFn: () => podcastApi.getPodcastEmotions(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});
};

// ─── Detail ──────────────────────────────────────────────────────────────────

export const usePodcastEmotion = (
	currentAccountId: string,
	accessToken: string,
	podcastId: number
) => {
	return useQuery({
		queryKey: podcastEmotionQueryKey(currentAccountId, podcastId),
		queryFn: () => podcastApi.getPodcastEmotion(currentAccountId, accessToken, podcastId),
		enabled: !!currentAccountId && !!accessToken && !!podcastId
	});
};

// ─── Set (Create or Update) ───────────────────────────────────────────────────

export const useSetPodcastEmotion = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: SetPodcastEmotionPayload) =>
			podcastApi.setPodcastEmotion(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: podcastEmotionsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: podcastEmotionQueryKey(currentAccountId, data.podcast_id)
			});
		},
		onError: () => {
			enqueueSnackbar('Error setting emotion', { variant: 'error' });
		}
	});
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const useDeletePodcastEmotion = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (podcastId: number) =>
			podcastApi.deletePodcastEmotion(currentAccountId, accessToken, podcastId),
		onSuccess: (_, podcastId) => {
			queryClient.invalidateQueries({ queryKey: podcastEmotionsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: podcastEmotionQueryKey(currentAccountId, podcastId)
			});
		},
		onError: () => {
			enqueueSnackbar('Error removing emotion', { variant: 'error' });
		}
	});
};