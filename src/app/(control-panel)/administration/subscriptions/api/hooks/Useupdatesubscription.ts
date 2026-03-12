import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptionsApiService';
import { subscriptionsListQueryKey } from './useSubscriptionsList';
import { subscriptionQueryKey } from './useSubscription';
import { Token } from '@auth/user';
import { CreateSubscription, Subscription } from '../types';

export const useUpdateSubscription = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation<Subscription, Error, { subscriptionId: number; data: CreateSubscription }>({
		mutationFn: ({ subscriptionId, data }) =>
			subscriptionsApi.updateSubscription(token, subscriptionId, data),
		onSuccess: (_, { subscriptionId }) => {
			queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
			queryClient.invalidateQueries({ queryKey: subscriptionQueryKey(token, subscriptionId) });
		}
	});
};