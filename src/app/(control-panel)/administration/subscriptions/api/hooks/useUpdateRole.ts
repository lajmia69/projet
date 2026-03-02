import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/app/(control-panel)/administration/subscriptions/api/services/subscriptionsApiService';
import { subscriptionsListQueryKey } from '@/app/(control-panel)/administration/subscriptions/api/hooks/usesubscriptionsList';
import { subscriptionQueryKey } from '@/app/(control-panel)/administration/subscriptions/api/hooks/usesubscription';
import { Token } from '@auth/user';
import { subscription } from '@/app/(control-panel)/administration/subscriptions/api/types';

export const useUpdatesubscription = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation<subscription, Error, Omit<subscription, 'avatar'>>({
		mutationFn: (subscription) => subscriptionsApi.updatesubscription(token, subscription),
		onSuccess: (_, subscription) => {
			queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
			queryClient.invalidateQueries({ queryKey: subscriptionQueryKey(token, subscription.id) });
		}
	});
};