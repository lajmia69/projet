import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/app/(control-panel)/administration/subscriptions/api/services/subscriptionsApiService';
import { subscriptionsListQueryKey } from '@/app/(control-panel)/administration/subscriptions/api/hooks/usesubscriptionsList';
import { Token } from '@auth/user';
import { Createsubscription } from '@/app/(control-panel)/administration/subscriptions/api/types';

export const useCreatesubscription = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation<Createsubscription, Error, Createsubscription>({
		mutationFn: (subscription) => subscriptionsApi.createsubscription(token, subscription),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
		}
	});
};