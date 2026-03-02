import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptionsApiService';
import { Account } from '../types';
import { Token } from '@auth/user';

export const subscriptionAccountsListQueryKey = (token: Token) => ['subscriptions', 'accounts', 'list', token];

export const useAccountsList = (token: Token) => {
	return useQuery<Account[]>({
		queryFn: () => subscriptionsApi.getAccountsList(token),
		queryKey: subscriptionAccountsListQueryKey(token)
	});
};