import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';
import { SearchLessons } from '@/app/(control-panel)/(platform)/(lesson)/api/types';

export const searchLessonsQueryKey = ['lesson', 'search'];

export const useSearchLessons = (current_account_id: string, accessToken: string, search: SearchLessons) => {
	return useQuery({
		queryKey: searchLessonsQueryKey,
		queryFn: () => lessonApi.searchLessons(current_account_id, accessToken, search)
	});
};
