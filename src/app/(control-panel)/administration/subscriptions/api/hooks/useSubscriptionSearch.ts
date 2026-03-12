import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi, SubscriptionSearchParams } from '../services/subscriptionsApiService';
import { Subscription } from '../types';
import { Token } from '@auth/user';

export const subscriptionSearchQueryKey = (token: Token, params: SubscriptionSearchParams) => [
	'subscriptions',
	'search',
	token,
	params
];

export const useSubscriptionSearch = (token: Token, params: SubscriptionSearchParams, enabled = true) => {
	return useQuery<Subscription[]>({
		queryFn: () => subscriptionsApi.searchSubscriptions(token, params),
		queryKey: subscriptionSearchQueryKey(token, params),
		enabled,
		refetchOnWindowFocus: true
	});
};