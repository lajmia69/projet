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
	// Hardcoded to account 1 so lessons list is always fetched from the base account
	const lessonAccountId = '1';

	return useQuery({
		queryKey: searchLessonsQueryKey(lessonAccountId, search),
		queryFn: () => lessonApi.searchLessons(lessonAccountId, accessToken, search),
		enabled: !!current_account_id && !!accessToken,
		retry: false // Added to stop 500 error spam
	});
};