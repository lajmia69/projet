import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../../services/subscriptionsApiService';
import { subscriptionsListQueryKey } from './useSubscriptionsList';
import { subscriptionQueryKey } from './useSubscription';
import { Token } from '@auth/user';
import { Subscription } from '../../types';

export const useUpdateSubscription = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation<Subscription, Error, Subscription>({
		mutationFn: (subscription) => subscriptionsApi.updateSubscription(token, subscription),
		onSuccess: (_, subscription) => {
			queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
			queryClient.invalidateQueries({ queryKey: subscriptionQueryKey(token, subscription.id) });
		}
	});
};