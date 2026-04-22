import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

export const languagesQueryKey = (current_account_id: string) => [
	'lesson',
	'languages',
	current_account_id
];

export const useLanguages = (current_account_id: string, accessToken: string) => {
	return useQuery({
		queryKey: languagesQueryKey(current_account_id),
		queryFn: () => lessonApi.getLanguages(current_account_id, accessToken),
		enabled: !!current_account_id && !!accessToken
	});
};