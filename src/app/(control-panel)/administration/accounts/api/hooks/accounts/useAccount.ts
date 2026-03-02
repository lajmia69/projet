import { useQuery } from '@tanstack/react-query';
import { accountsApi } from '@/app/(control-panel)/administration/accounts/api/services/accountsApiService';
import { Token } from '@auth/user';
import { Account } from '@/app/(control-panel)/administration/accounts/api/types';

export const accountQueryKey = (token: Token, accountId: number) => ['account', 'item', token, accountId];

export const useAccount = (token: Token, accountId: number) => {
	return useQuery<Account>({
		queryFn: () => accountsApi.getAccount(token, accountId),
		queryKey: accountQueryKey(token, accountId),
		enabled: !!accountId
	});
};
