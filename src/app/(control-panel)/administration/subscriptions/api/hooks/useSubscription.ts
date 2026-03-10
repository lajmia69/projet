import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptionsApiService';
import { Subscription } from '../types';
import { Token } from '@auth/user';

export const subscriptionQueryKey = (token: Token, subscriptionId: number) => [
	'subscriptions',
	'item',
	token,
	subscriptionId
];

export const useSubscription = (token: Token, subscriptionId: number) => {
	return useQuery<Subscription>({
		queryFn: () => subscriptionsApi.getSubscription(token, subscriptionId),
		queryKey: subscriptionQueryKey(token, subscriptionId),
		enabled: !!subscriptionId,
		refetchOnWindowFocus: true
	});
};