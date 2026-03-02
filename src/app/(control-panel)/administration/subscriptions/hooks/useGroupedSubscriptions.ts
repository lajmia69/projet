import { useMemo } from 'react';
import { Token } from '@auth/user';
import { GroupedAccounts, AccumulatorAccountsType } from '../api/types';
import { useFilteredAccounts } from './useFilteredAccounts';

export function useGroupedAccounts(token: Token) {
	const { data: filteredAccounts, isLoading } = useFilteredAccounts(token);

	const grouped = useMemo(() => {
		if (!filteredAccounts || isLoading) return {};

		const sorted = [...filteredAccounts].sort((a, b) =>
			(a.full_name ?? '').localeCompare(b.full_name ?? '', 'es', { sensitivity: 'base' })
		);

		return sorted.reduce<Record<string, GroupedAccounts>>((r, e) => {
			const group = (e.full_name?.[0] ?? '#').toUpperCase();
			if (!r[group]) r[group] = { group, children: [e] };
			else r[group].children?.push(e);
			return r;
		}, {});
	}, [filteredAccounts, isLoading]);

	return { data: grouped, isLoading };
}