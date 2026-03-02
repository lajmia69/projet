import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '@/app/(control-panel)/administration/accounts/api/services/accountsApiService';
import { Account } from '@/app/(control-panel)/administration/accounts/api/types';
import { Token } from '@auth/user';

export const accountsListQueryKey = (token: Token) => ['accounts', 'list', token];

export const useAccountsList = (token: Token) => {
	return useQuery<Account[]>({
		queryFn: () => accountsApi.getAccountsList(token),
		queryKey: accountsListQueryKey(token)
	});
};
