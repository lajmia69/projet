import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { radioApi } from '../../services/RadioApiService';
import { SetRadioEmotionPayload } from '../../types';
import { useSnackbar } from 'notistack';

export const radioEmotionsQueryKey = (currentAccountId: string) => [
	'radio',
	'emotions',
	currentAccountId
];

export const radioEmotionQueryKey = (currentAccountId: string, radioId: number) => [
	'radio',
	'emotion',
	currentAccountId,
	radioId
];

// ─── List ────────────────────────────────────────────────────────────────────

export const useRadioEmotions = (currentAccountId: string, accessToken: string) => {
	return useQuery({
		queryKey: radioEmotionsQueryKey(currentAccountId),
		queryFn: () => radioApi.getRadioEmotions(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});
};

// ─── Detail ──────────────────────────────────────────────────────────────────

export const useRadioEmotion = (
	currentAccountId: string,
	accessToken: string,
	radioId: number
) => {
	return useQuery({
		queryKey: radioEmotionQueryKey(currentAccountId, radioId),
		queryFn: () => radioApi.getRadioEmotion(currentAccountId, accessToken, radioId),
		enabled: !!currentAccountId && !!accessToken && !!radioId
	});
};

// ─── Set (Create or Update) ───────────────────────────────────────────────────

export const useSetRadioEmotion = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: SetRadioEmotionPayload) =>
			radioApi.setRadioEmotion(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: radioEmotionsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: radioEmotionQueryKey(currentAccountId, data.radio_id)
			});
		},
		onError: () => {
			enqueueSnackbar('Error setting emotion', { variant: 'error' });
		}
	});
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const useDeleteRadioEmotion = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (radioId: number) =>
			radioApi.deleteRadioEmotion(currentAccountId, accessToken, radioId),
		onSuccess: (_, radioId) => {
			queryClient.invalidateQueries({ queryKey: radioEmotionsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: radioEmotionQueryKey(currentAccountId, radioId)
			});
		},
		onError: () => {
			enqueueSnackbar('Error removing emotion', { variant: 'error' });
		}
	});
};