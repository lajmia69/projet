import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptionsApiService';
import { subscriptionsListQueryKey } from './useSubscriptionsList';
import { subscriptionQueryKey } from './useSubscription';
import { Token } from '@auth/user';
import { subscriptionAccountsListQueryKey } from './useAccountsList';

type TogglePayload = {
	subscriptionId: number;
	is_active: boolean;
};

export const useToggleSubscription = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ subscriptionId, is_active }: TogglePayload) =>
			subscriptionsApi.toggleSubscription(token, subscriptionId, is_active),
		onSuccess: (_, { subscriptionId }) => {
			queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
			queryClient.invalidateQueries({
				queryKey: subscriptionQueryKey(token, subscriptionId)
			});
			 queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
    queryClient.invalidateQueries({ queryKey: subscriptionQueryKey(token, subscriptionId) });
    queryClient.invalidateQueries({ queryKey: subscriptionAccountsListQueryKey(token) });
		}
	});
};