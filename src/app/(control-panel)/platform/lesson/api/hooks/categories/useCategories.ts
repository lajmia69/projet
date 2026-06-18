import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

export const categoriesQueryKey = ['academy', 'categories'];

export const useCategories = () => {
	return useQuery({
		queryKey: categoriesQueryKey,
		queryFn: lessonApi.getCategories
	});
};
