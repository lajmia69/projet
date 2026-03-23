import { useMutation, useQueryClient } from '@tanstack/react-query';
import { radioApi } from '../../services/RadioApiService';
import { Radio } from '../../types';
import { useSnackbar } from 'notistack';
import { radiosQueryKey, radioQueryKey } from './useRadios';

// ─── Create ─────────────────────────────────────────────────────────────────

export const useCreateRadio = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: Partial<Radio>) =>
			radioApi.createRadio(currentAccountId, accessToken, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: radiosQueryKey(currentAccountId) });
			enqueueSnackbar('Program created successfully', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error creating program', { variant: 'error' });
		}
	});
};

// ─── Update ─────────────────────────────────────────────────────────────────

export const useUpdateRadio = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: Partial<Radio> & { id: number }) =>
			radioApi.updateRadio(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: radiosQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: radioQueryKey(currentAccountId, String(data.id))
			});
			enqueueSnackbar('Program updated', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error updating program', { variant: 'error' });
		}
	});
};

// ─── Delete ─────────────────────────────────────────────────────────────────

export const useDeleteRadio = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (radioId: number) => radioApi.deleteRadio(currentAccountId, accessToken, radioId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: radiosQueryKey(currentAccountId) });
			enqueueSnackbar('Program deleted', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error deleting program', { variant: 'error' });
		}
	});
};

// ─── Validate ────────────────────────────────────────────────────────────────

export const useValidateRadio = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (radioId: number) =>
			radioApi.validateRadio(currentAccountId, accessToken, radioId),
		onSuccess: (_, radioId) => {
			queryClient.invalidateQueries({ queryKey: radiosQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: radioQueryKey(currentAccountId, String(radioId))
			});
			enqueueSnackbar('Program validated', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error validating program', { variant: 'error' });
		}
	});
};

// ─── Publish ────────────────────────────────────────────────────────────────

export const usePublishRadio = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (radioId: number) =>
			radioApi.publishRadio(currentAccountId, accessToken, radioId),
		onSuccess: (_, radioId) => {
			queryClient.invalidateQueries({ queryKey: radiosQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: radioQueryKey(currentAccountId, String(radioId))
			});
			enqueueSnackbar('Program published', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error publishing program', { variant: 'error' });
		}
	});
};

// ─── Publish & Release ──────────────────────────────────────────────────────

export const usePublishReleaseRadio = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (radioId: number) =>
			radioApi.publishReleaseRadio(currentAccountId, accessToken, radioId),
		onSuccess: (_, radioId) => {
			queryClient.invalidateQueries({ queryKey: radiosQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: radioQueryKey(currentAccountId, String(radioId))
			});
			enqueueSnackbar('Program published and released', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error publishing program', { variant: 'error' });
		}
	});
};