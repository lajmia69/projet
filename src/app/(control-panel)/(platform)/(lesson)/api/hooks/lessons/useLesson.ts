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
	return useQuery({
		queryKey: lessonQueryKey(currentAccountId, lessonId, accessToken),
		queryFn: () => lessonApi.getLesson(currentAccountId, lessonId, accessToken)
	});
};
