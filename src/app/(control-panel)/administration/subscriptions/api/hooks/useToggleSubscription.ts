import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptionsApiService';
import { subscriptionAccountsListQueryKey } from './useAccountsList';
import { subscriptionAccountQueryKey } from './useAccount';
import { Token } from '@auth/user';

type TogglePayload = {
	subscriptionId: number;
	accountId: number;
	is_active: boolean;
};

export const useToggleSubscription = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ subscriptionId, is_active }: TogglePayload) =>
			subscriptionsApi.toggleSubscription(token, subscriptionId, is_active),
		onSuccess: (_, { accountId }) => {
			queryClient.invalidateQueries({ queryKey: subscriptionAccountsListQueryKey(token) });
			queryClient.invalidateQueries({ queryKey: subscriptionAccountQueryKey(token, accountId) });
		}
	});
};