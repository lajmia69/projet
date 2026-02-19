import { useMemo } from 'react';
import { GroupedContacts, AccumulatorType, contactFullName } from '../api/types';
import { useFilteredContacts } from './useFilteredContacts';

export function useGroupedContacts() {
	const { data: filteredContacts, isLoading } = useFilteredContacts();
	const groupedContacts = useMemo(() => {
		if (!filteredContacts || isLoading) {
			return [];
		}

		const sortedContacts = [...filteredContacts]?.sort((a, b) => {
			const nameA = contactFullName(a);
			const nameB = contactFullName(b);
			return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
		});

		const groupedObject: Record<string, GroupedContacts> = sortedContacts?.reduce<AccumulatorType>((r, e) => {
			const fullName = contactFullName(e);
			const group = fullName[0];

			if (!r[group]) {
				r[group] = { group, children: [e] };
			} else {
				r[group]?.children?.push(e);
			}

			return r;
		}, {});

		return groupedObject;
	}, [filteredContacts, isLoading]);

	return { data: groupedContacts, isLoading };
}
