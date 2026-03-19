import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

export const courseQueryKey = (courseId: string) => ['academy', 'course', courseId];

export const useAcademyCourse = (courseId: string) => {
	return useQuery({
		queryKey: courseQueryKey(courseId),
		queryFn: () => lessonApi.getCourse(courseId)
	});
};
