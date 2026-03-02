import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptions/ApiService';
import { subscriptionsListQueryKey } from './useSubscriptionsList';
import { subscriptionQueryKey } from './useSubscription';
import { Token } from '@auth/user';

export const useDeleteSubscription = (token: Token) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (subscriptionId) => subscriptionsApi.deleteSubscription(token, subscriptionId),
    onSuccess: (_, subscriptionId) => {
      queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKey(token, subscriptionId) });
    }
  });
};