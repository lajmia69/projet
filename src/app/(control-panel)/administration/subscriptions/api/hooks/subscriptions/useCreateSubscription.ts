import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../../services/subscriptionsApiService';
import { subscriptionsListQueryKey } from './useSubscriptionsList';
import { Token } from '@auth/user';
import { Subscription, CreateSubscription } from '../../types';

export const useCreateSubscription = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation<Subscription, Error, CreateSubscription>({
		mutationFn: (subscription) => subscriptionsApi.createSubscription(token, subscription),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
		}
	});
};