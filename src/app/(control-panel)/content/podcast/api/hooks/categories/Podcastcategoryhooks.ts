import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { podcastApi } from '../../services/podcastApiService';
import { CreatePodcastCategoryPayload, UpdatePodcastCategoryPayload } from '../../types';
import { useSnackbar } from 'notistack';

export const podcastCategoriesQueryKey = (currentAccountId: string) => [
	'podcast',
	'categories',
	currentAccountId
];

export const podcastCategoryQueryKey = (currentAccountId: string, categoryId: number) => [
	'podcast',
	'category',
	currentAccountId,
	categoryId
];

// ─── List ────────────────────────────────────────────────────────────────────

export const usePodcastCategories = (currentAccountId: string, accessToken: string) => {
	return useQuery({
		queryKey: podcastCategoriesQueryKey(currentAccountId),
		queryFn: () => podcastApi.getPodcastCategories(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});
};

// ─── Detail ──────────────────────────────────────────────────────────────────

export const usePodcastCategory = (
	currentAccountId: string,
	accessToken: string,
	categoryId: number
) => {
	return useQuery({
		queryKey: podcastCategoryQueryKey(currentAccountId, categoryId),
		queryFn: () => podcastApi.getPodcastCategory(currentAccountId, accessToken, categoryId),
		enabled: !!currentAccountId && !!accessToken && !!categoryId
	});
};

// ─── Create ──────────────────────────────────────────────────────────────────

export const useCreatePodcastCategory = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: CreatePodcastCategoryPayload) =>
			podcastApi.createPodcastCategory(currentAccountId, accessToken, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: podcastCategoriesQueryKey(currentAccountId) });
			enqueueSnackbar('Category created', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error creating category', { variant: 'error' });
		}
	});
};

// ─── Update ──────────────────────────────────────────────────────────────────

export const useUpdatePodcastCategory = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: UpdatePodcastCategoryPayload) =>
			podcastApi.updatePodcastCategory(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: podcastCategoriesQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: podcastCategoryQueryKey(currentAccountId, data.id)
			});
			enqueueSnackbar('Category updated', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error updating category', { variant: 'error' });
		}
	});
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const useDeletePodcastCategory = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (categoryId: number) =>
			podcastApi.deletePodcastCategory(currentAccountId, accessToken, categoryId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: podcastCategoriesQueryKey(currentAccountId) });
			enqueueSnackbar('Category deleted', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error deleting category', { variant: 'error' });
		}
	});
};