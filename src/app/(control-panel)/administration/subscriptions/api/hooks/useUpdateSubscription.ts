import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptions/ApiService';
import { subscriptionsListQueryKey } from './useSubscriptionsList';
import { subscriptionQueryKey } from './useSubscription';
import { Subscription } from '@/app/(control-panel)/administration/accounts/api/types';
import { Token } from '@auth/user';

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