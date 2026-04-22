import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

export const lessonQueryKey = (currentAccountId: string, lessonId: string, accessToken: string) => [
	'lesson',
	'detail',
	currentAccountId,
	lessonId,
	accessToken
];

export const useLesson = (currentAccountId: string, lessonId: string, accessToken: string) => {
	// Hardcoded to account 1 so lesson detail is always fetched from the base account
	const lessonAccountId = '1';

	return useQuery({
		queryKey: lessonQueryKey(lessonAccountId, lessonId, accessToken),
		queryFn: () => lessonApi.getLesson(lessonAccountId, lessonId, accessToken)
	});
};
