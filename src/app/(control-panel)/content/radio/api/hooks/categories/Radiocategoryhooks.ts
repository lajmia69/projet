import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { radioApi } from '../../services/RadioApiService';
import { CreateRadioCategoryPayload, UpdateRadioCategoryPayload } from '../../types';
import { useSnackbar } from 'notistack';

export const radioCategoriesQueryKey = (currentAccountId: string) => [
	'radio',
	'categories',
	currentAccountId
];

export const radioCategoryQueryKey = (currentAccountId: string, categoryId: number) => [
	'radio',
	'category',
	currentAccountId,
	categoryId
];

// ─── List ────────────────────────────────────────────────────────────────────

export const useRadioCategories = (currentAccountId: string, accessToken: string) => {
	return useQuery({
		queryKey: radioCategoriesQueryKey(currentAccountId),
		queryFn: () => radioApi.getRadioCategories(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});
};

// ─── Detail ──────────────────────────────────────────────────────────────────

export const useRadioCategory = (
	currentAccountId: string,
	accessToken: string,
	categoryId: number
) => {
	return useQuery({
		queryKey: radioCategoryQueryKey(currentAccountId, categoryId),
		queryFn: () => radioApi.getRadioCategory(currentAccountId, accessToken, categoryId),
		enabled: !!currentAccountId && !!accessToken && !!categoryId
	});
};

// ─── Create ──────────────────────────────────────────────────────────────────

export const useCreateRadioCategory = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: CreateRadioCategoryPayload) =>
			radioApi.createRadioCategory(currentAccountId, accessToken, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: radioCategoriesQueryKey(currentAccountId) });
			enqueueSnackbar('Category created', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error creating category', { variant: 'error' });
		}
	});
};

// ─── Update ──────────────────────────────────────────────────────────────────

export const useUpdateRadioCategory = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: UpdateRadioCategoryPayload) =>
			radioApi.updateRadioCategory(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: radioCategoriesQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: radioCategoryQueryKey(currentAccountId, data.id)
			});
			enqueueSnackbar('Category updated', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error updating category', { variant: 'error' });
		}
	});
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const useDeleteRadioCategory = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (categoryId: number) =>
			radioApi.deleteRadioCategory(currentAccountId, accessToken, categoryId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: radioCategoriesQueryKey(currentAccountId) });
			enqueueSnackbar('Category deleted', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error deleting category', { variant: 'error' });
		}
	});
};