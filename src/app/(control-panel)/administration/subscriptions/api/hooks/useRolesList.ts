import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '@/app/(control-panel)/administration/subscriptions/api/services/subscriptionsApiService';
import { subscription } from '@/app/(control-panel)/administration/subscriptions/api/types';
import { Token } from '@auth/user';

export const subscriptionsListQueryKey = (token: Token) => ['subscriptions', 'list', token];

export const usesubscriptionsList = (token: Token) => {
	return useQuery<subscription[]>({
		queryFn: () => subscriptionsApi.getsubscriptionsList(token),
		queryKey: subscriptionsListQueryKey(token)
	});
};
