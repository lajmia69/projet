import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '../services/subscriptions/ApiService';
import { Subscription } from '@/app/(control-panel)/administration/accounts/api/types';
import { Token } from '@auth/user';

export const subscriptionsListQueryKey = (token: Token) => ['subscriptions', 'list', token];

export const useSubscriptionsList = (token: Token) => {
  return useQuery<Subscription[]>({
    queryFn: () => subscriptionsApi.getSubscriptionsList(token),
    queryKey: subscriptionsListQueryKey(token)
  });
};