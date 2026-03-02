import { useMemo } from 'react';
import { Token } from '@auth/user';
import { GroupedAccounts, AccumulatorAccountsType } from '../api/types';
import { useFilteredAccounts } from './useFilteredAccounts';

export function useGroupedAccounts(token: Token) {
	const { data: filteredAccounts, isLoading } = useFilteredAccounts(token);
	const groupedAccounts = useMemo(() => {
		if (!filteredAccounts || isLoading) {
			return [];
		}

		const sortedAccounts = [...filteredAccounts]?.sort((a, b) =>
			a?.full_name?.localeCompare(b.full_name, 'es', { sensitivity: 'base' })
		);

		const groupedObject: Record<string, GroupedAccounts> = sortedAccounts?.reduce<AccumulatorAccountsType>(
			(r, e) => {
				const group = e.full_name[0];

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
	}, [filteredAccounts, isLoading]);

	return { data: groupedAccounts, isLoading };
}
