import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

export const languagesQueryKey = (current_account_id: string) => [
	'lesson',
	'languages',
	current_account_id
];

export const useLanguages = (current_account_id: string, accessToken: string) => {
	// Hardcoded to account 1 so language list is always fetched from the base account
	const lessonAccountId = '1';

	return useQuery({
		queryKey: languagesQueryKey(lessonAccountId),
		queryFn: () => lessonApi.getLanguages(lessonAccountId, accessToken),
		enabled: !!current_account_id && !!accessToken,
		retry: false // Added to stop 401 error spam
	});
};