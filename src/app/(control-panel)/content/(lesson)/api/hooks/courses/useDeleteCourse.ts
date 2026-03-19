import { useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';
import { coursesQueryKey } from './useAcademyCourses';

export const useDeleteCourse = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (courseId: string) => lessonApi.deleteCourse(courseId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: coursesQueryKey });
		}
	});
};
