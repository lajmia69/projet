import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/app/(control-panel)/administration/subscriptions/api/services/subscriptionsApiService';
import { subscriptionsListQueryKey } from '@/app/(control-panel)/administration/subscriptions/api/hooks/usesubscriptionsList';
import { subscriptionQueryKey } from '@/app/(control-panel)/administration/subscriptions/api/hooks/usesubscription';
import { Token } from '@auth/user';

export const useDeletesubscription = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (subscriptionId: number) => subscriptionsApi.deletesubscription(token, subscriptionId),
		onSuccess: (_, subscriptionId) => {
			queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
			queryClient.invalidateQueries({ queryKey: subscriptionQueryKey(token, subscriptionId) });
		}
	});
};