import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

export const courseStepContentQueryKey = ['academy', 'course', 'step', 'content'];

export const useCourseStepContent = (stepId: string) => {
	return useQuery({
		queryFn: () => lessonApi.getCourseStepContent('0'), // demo
		// queryFn: () => academyApi.getCourseStepContent(stepId)
		queryKey: [...courseStepContentQueryKey, stepId]
	});
};
