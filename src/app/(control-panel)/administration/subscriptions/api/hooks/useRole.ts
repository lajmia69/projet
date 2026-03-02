import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '@/app/(control-panel)/administration/subscriptions/api/services/subscriptionsApiService';
import { Token } from '@auth/user';
import { subscription } from '@/app/(control-panel)/administration/subscriptions/api/types';

export const subscriptionQueryKey = (token: Token, subscriptionId: number) => ['subscription', 'item', token, subscriptionId];

export const usesubscription = (token: Token, subscriptionId: number) => {
	return useQuery<subscription>({
		queryFn: () => subscriptionsApi.getsubscription(token, subscriptionId),
		queryKey: subscriptionQueryKey(token, subscriptionId),
		enabled: !!subscriptionId
	});
};
