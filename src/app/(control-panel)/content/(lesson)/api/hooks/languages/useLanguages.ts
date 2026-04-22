import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

// Include current_account_id in the key so switching accounts doesn't serve
// stale data from the previous account's cache.
export const languagesQueryKey = (currentAccountId: string | number) => [
	'lesson', 'languages', String(currentAccountId)
];

export const useLanguages = (current_account_id: string | number) => {
	return useQuery({
		queryKey: languagesQueryKey(current_account_id),
		queryFn: () => lessonApi.getLanguages(current_account_id),
		enabled: !!current_account_id,
		retry: 0,
	});
};
