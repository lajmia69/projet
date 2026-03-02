import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptionsApiService';
import { Account } from '../types';
import { Token } from '@auth/user';

export const subscriptionAccountQueryKey = (token: Token, accountId: number) => [
	'subscriptions',
	'account',
	token,
	accountId
];

export const useAccount = (token: Token, accountId: number) => {
	return useQuery<Account>({
		queryFn: () => subscriptionsApi.getAccount(token, accountId),
		queryKey: subscriptionAccountQueryKey(token, accountId),
		enabled: !!accountId
	});
};