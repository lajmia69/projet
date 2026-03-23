// ─── Lesson CRUD Mutations ───────────────────────────────────────────────────
// File: src/app/(control-panel)/content/(lesson)/api/hooks/lessons/lessonMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';
import { Lesson } from '../../types';
import { useSnackbar } from 'notistack';
import { lessonQueryKey } from './useLesson';

const lessonsListKey = (currentAccountId: string) => ['lesson', 'list', currentAccountId];
const searchLessonsKey = ['lesson', 'search'];

// ─── Create ─────────────────────────────────────────────────────────────────

export const useCreateLesson = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: Partial<Lesson>) =>
			lessonApi.createLesson(currentAccountId, accessToken, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: searchLessonsKey });
			queryClient.invalidateQueries({ queryKey: lessonsListKey(currentAccountId) });
			enqueueSnackbar('Lesson created successfully', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error creating lesson', { variant: 'error' });
		}
	});
};

// ─── Update ─────────────────────────────────────────────────────────────────

export const useUpdateLesson = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: Partial<Lesson> & { id: number }) =>
			lessonApi.updateLesson(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: searchLessonsKey });
			queryClient.invalidateQueries({ queryKey: lessonsListKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: lessonQueryKey(currentAccountId, String(data.id), accessToken)
			});
			enqueueSnackbar('Lesson updated', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error updating lesson', { variant: 'error' });
		}
	});
};

// ─── Delete ─────────────────────────────────────────────────────────────────

export const useDeleteLesson = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (lessonId: number) =>
			lessonApi.deleteLesson(currentAccountId, accessToken, lessonId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: searchLessonsKey });
			queryClient.invalidateQueries({ queryKey: lessonsListKey(currentAccountId) });
			enqueueSnackbar('Lesson deleted', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error deleting lesson', { variant: 'error' });
		}
	});
};

// ─── Validate ───────────────────────────────────────────────────────────────

export const useValidateLesson = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (lessonId: number) =>
			lessonApi.validateLesson(currentAccountId, accessToken, lessonId),
		onSuccess: (_, lessonId) => {
			queryClient.invalidateQueries({ queryKey: searchLessonsKey });
			queryClient.invalidateQueries({
				queryKey: lessonQueryKey(currentAccountId, String(lessonId), accessToken)
			});
			enqueueSnackbar('Lesson validated', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error validating lesson', { variant: 'error' });
		}
	});
};

// ─── Make Public ─────────────────────────────────────────────────────────────

export const useMakePublicLesson = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (lessonId: number) =>
			lessonApi.makePublicLesson(currentAccountId, accessToken, lessonId),
		onSuccess: (_, lessonId) => {
			queryClient.invalidateQueries({ queryKey: searchLessonsKey });
			queryClient.invalidateQueries({
				queryKey: lessonQueryKey(currentAccountId, String(lessonId), accessToken)
			});
			enqueueSnackbar('Lesson made public', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error updating lesson visibility', { variant: 'error' });
		}
	});
};

// ─── Publish ────────────────────────────────────────────────────────────────

export const usePublishLesson = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (lessonId: number) =>
			lessonApi.publishLesson(currentAccountId, accessToken, lessonId),
		onSuccess: (_, lessonId) => {
			queryClient.invalidateQueries({ queryKey: searchLessonsKey });
			queryClient.invalidateQueries({
				queryKey: lessonQueryKey(currentAccountId, String(lessonId), accessToken)
			});
			enqueueSnackbar('Lesson published', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error publishing lesson', { variant: 'error' });
		}
	});
};

// ─── Publish & Release ──────────────────────────────────────────────────────

export const usePublishReleaseLesson = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (lessonId: number) =>
			lessonApi.publishReleaseLesson(currentAccountId, accessToken, lessonId),
		onSuccess: (_, lessonId) => {
			queryClient.invalidateQueries({ queryKey: searchLessonsKey });
			queryClient.invalidateQueries({
				queryKey: lessonQueryKey(currentAccountId, String(lessonId), accessToken)
			});
			enqueueSnackbar('Lesson published and released', { variant: 'success' });
		},
		onError: () => {
			enqueueSnackbar('Error publishing lesson', { variant: 'error' });
		}
	});
};