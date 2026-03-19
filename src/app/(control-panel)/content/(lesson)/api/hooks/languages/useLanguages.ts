import { useQuery } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';

export const languagesQueryKey = ['lesson', 'languages'];

export const useLanguages = (current_account_id: string, accessToken: string) => {
	return useQuery({
		queryKey: languagesQueryKey,
		queryFn: () => lessonApi.getLanguages(current_account_id, accessToken)
	});
};
