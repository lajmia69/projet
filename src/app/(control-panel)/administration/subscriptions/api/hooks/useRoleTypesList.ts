import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '@/app/(control-panel)/administration/subscriptions/api/services/subscriptionsApiService';
import { subscriptionType } from '@/app/(control-panel)/administration/subscriptions/api/types';
import { Token } from '@auth/user';

export const subscriptionTypesListQueryKey = (token: Token) => ['subscription_types', 'list', token];

export const usesubscriptionTypesList = (token: Token) => {
	return useQuery<subscriptionType[]>({
		queryFn: () => subscriptionsApi.getsubscriptionTypesList(token),
		queryKey: subscriptionTypesListQueryKey(token)
	});
};
