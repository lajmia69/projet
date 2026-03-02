import { useMemo } from 'react';
import { Token } from '@auth/user';
import { GroupedSubscriptions, AccumulatorSubscriptionsType } from '../api/types';
import { useFilteredSubscriptions } from './useFilteredSubscriptions';

export function useGroupedSubscriptions(token: Token) {
	const { data: filteredSubscriptions, isLoading } = useFilteredSubscriptions(token);

	const groupedSubscriptions = useMemo(() => {
		if (!filteredSubscriptions || isLoading) {
			return {};
		}

		const sorted = [...filteredSubscriptions].sort((a, b) =>
			a.reference.localeCompare(b.reference, 'es', { sensitivity: 'base' })
		);

		const groupedObject: Record<string, GroupedSubscriptions> = sorted.reduce<AccumulatorSubscriptionsType>(
			(r, e) => {
				const group = e.reference?.[0]?.toUpperCase() || '#';

				if (!r[group]) {
					r[group] = { group, children: [e] };
				} else {
					r[group]?.children?.push(e);
				}

				return r;
			},
			{}
		);

		return groupedObject;
	}, [filteredSubscriptions, isLoading]);

	return { data: groupedSubscriptions, isLoading };
}