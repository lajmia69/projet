import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';
import { SearchLessons } from '../../types';

export const searchLessonsQueryKey = (accountId: string | number, search: SearchLessons) => [
	'lesson', 'search', String(accountId), search
];

export const useSearchLessons = (
	current_account_id: string | number,
	search: SearchLessons
) => {
	return useQuery({
		queryKey: searchLessonsQueryKey(current_account_id, search),
		queryFn: () => lessonApi.searchLessons(current_account_id, search),
		enabled: !!current_account_id,
		retry: 0,
	});
};
