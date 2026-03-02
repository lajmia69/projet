import { useMemo } from 'react';
import FuseUtils from '@fuse/utils';
import { useSearch } from './useSearch';
import { Token } from '@auth/user';
import { Account } from '@/app/(control-panel)/administration/accounts/api/types';
import { useAccountsList } from '../api/hooks/accounts/useAccountsList';

export function useFilteredAccounts(token: Token) {
	const { searchText } = useSearch();
	const { data: accounts, isLoading } = useAccountsList(token);
	const filteredAccounts = useMemo(() => {
		if (!accounts || isLoading) {
			return [];
		}

		if (searchText.length === 0) {
			return accounts;
		}

		if (searchText.length === 0) {
			return accounts;
		}

		return FuseUtils.filterArrayByString<Account>(accounts, searchText);
	}, [accounts, searchText, isLoading]);

	return { data: filteredAccounts, isLoading };
}
