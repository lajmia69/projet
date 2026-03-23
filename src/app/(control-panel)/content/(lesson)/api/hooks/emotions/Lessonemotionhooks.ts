import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi, LessonEmotion, SetLessonEmotionPayload } from '../../services/lessonApiService';
import { useSnackbar } from 'notistack';

export const lessonEmotionsQueryKey = (currentAccountId: string) => [
	'lesson',
	'emotions',
	currentAccountId
];
export const lessonEmotionQueryKey = (currentAccountId: string, lessonId: number) => [
	'lesson',
	'emotion',
	currentAccountId,
	lessonId
];

// ─── List ────────────────────────────────────────────────────────────────────

export const useLessonEmotions = (currentAccountId: string, accessToken: string) =>
	useQuery({
		queryKey: lessonEmotionsQueryKey(currentAccountId),
		queryFn: () => lessonApi.getLessonEmotions(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});

// ─── Detail ──────────────────────────────────────────────────────────────────

export const useLessonEmotion = (
	currentAccountId: string,
	accessToken: string,
	lessonId: number
) =>
	useQuery({
		queryKey: lessonEmotionQueryKey(currentAccountId, lessonId),
		queryFn: () => lessonApi.getLessonEmotion(currentAccountId, accessToken, lessonId),
		enabled: !!currentAccountId && !!accessToken && !!lessonId
	});

// ─── Set (Create or Update) ───────────────────────────────────────────────────

export const useSetLessonEmotion = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: SetLessonEmotionPayload) =>
			lessonApi.setLessonEmotion(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: lessonEmotionsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: lessonEmotionQueryKey(currentAccountId, data.lesson_id)
			});
		},
		onError: () => {
			enqueueSnackbar('Error setting emotion', { variant: 'error' });
		}
	});
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const useDeleteLessonEmotion = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (lessonId: number) =>
			lessonApi.deleteLessonEmotion(currentAccountId, accessToken, lessonId),
		onSuccess: (_, lessonId) => {
			queryClient.invalidateQueries({ queryKey: lessonEmotionsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({
				queryKey: lessonEmotionQueryKey(currentAccountId, lessonId)
			});
		},
		onError: () => {
			enqueueSnackbar('Error removing emotion', { variant: 'error' });
		}
	});
};