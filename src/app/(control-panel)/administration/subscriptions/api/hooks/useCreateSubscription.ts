import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptions/ApiService';
import { subscriptionsListQueryKey } from './useSubscriptionsList';
import { Subscription } from '@/app/(control-panel)/administration/accounts/api/types';
import { Token } from '@auth/user';

export const useCreateSubscription = (token: Token) => {
  const queryClient = useQueryClient();

  return useMutation<Subscription, Error, Omit<Subscription, 'id'>>({
    mutationFn: (subscription) => subscriptionsApi.createSubscription(token, subscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionsListQueryKey(token) });
    }
  });
};