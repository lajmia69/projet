import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

export const courseStepsQueryKey = ['academy', 'course', 'steps'];

export const useCourseSteps = (courseId: string) => {
	return useQuery({
		queryKey: [...courseStepsQueryKey, courseId],
		// queryFn: () => academyApi.getCourseSteps(courseId)
		queryFn: () => lessonApi.getCourseSteps('0') // demo
	});
};
