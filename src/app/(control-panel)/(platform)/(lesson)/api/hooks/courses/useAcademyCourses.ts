import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

export const coursesQueryKey = ['academy', 'courses'];

export const useAcademyCourses = () => {
	return useQuery({
		queryKey: coursesQueryKey,
		queryFn: lessonApi.getCourses
	});
};
