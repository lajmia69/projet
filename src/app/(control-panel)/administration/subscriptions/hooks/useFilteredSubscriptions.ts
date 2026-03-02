import { useMemo } from 'react';
import FuseUtils from '@fuse/utils';
import { useSearch } from './useSearch';
import { Token } from '@auth/user';
import { Subscription } from '../api/types';
import { useSubscriptionsList } from '../api/hooks/subscriptions/useSubscriptionsList';

export function useFilteredSubscriptions(token: Token) {
	const { searchText } = useSearch();
	const { data: subscriptions, isLoading } = useSubscriptionsList(token);

	const filteredSubscriptions = useMemo(() => {
		if (!subscriptions || isLoading) {
			return [];
		}

		if (searchText.length === 0) {
			return subscriptions;
		}

		return FuseUtils.filterArrayByString<Subscription>(subscriptions, searchText);
	}, [subscriptions, searchText, isLoading]);

	return { data: filteredSubscriptions, isLoading };
}