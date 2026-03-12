import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptionsApiService';
import { Subscription } from '../types';
import { Token } from '@auth/user';

export const subscriptionsByAccountQueryKey = (token: Token, accountId: number) => [
	'subscriptions',
	'by-account',
	token,
	accountId
];

export const useSubscriptionsByAccount = (token: Token, accountId: number) => {
	return useQuery<Subscription[]>({
		queryFn: () => subscriptionsApi.getSubscriptionsByAccount(token, accountId),
		queryKey: subscriptionsByAccountQueryKey(token, accountId),
		enabled: !!accountId && accountId > 0,
		refetchOnWindowFocus: true
	});
};