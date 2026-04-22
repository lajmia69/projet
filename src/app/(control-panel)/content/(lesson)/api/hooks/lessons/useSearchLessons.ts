import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';
import { SearchLessons } from '@/app/(control-panel)/(platform)/(lesson)/api/types';

export const searchLessonsQueryKey = (
	current_account_id: string,
	search: SearchLessons
) => ['lesson', 'search', current_account_id, search];

export const useSearchLessons = (
	current_account_id: string,
	accessToken: string,
	search: SearchLessons
) => {
	return useQuery({
		queryKey: searchLessonsQueryKey(current_account_id, search),
		queryFn: () => lessonApi.searchLessons(current_account_id, accessToken, search),
		enabled: !!current_account_id && !!accessToken,
		retry: false // Added to stop 500 error spam
	});
};