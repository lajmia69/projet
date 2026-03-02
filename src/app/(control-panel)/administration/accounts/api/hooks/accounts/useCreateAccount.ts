import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/app/(control-panel)/administration/accounts/api/services/accountsApiService';
import { accountsListQueryKey } from '@/app/(control-panel)/administration/accounts/api/hooks/accounts/useAccountsList';
import { Token } from '@auth/user';
import { Account } from '@/app/(control-panel)/administration/accounts/api/types';

export const useCreateAccount = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation<Account, Error, Omit<Account, 'id'>>({
		mutationFn: (account) => accountsApi.createAccount(token, account),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: accountsListQueryKey(token) });
		}
	});
};
