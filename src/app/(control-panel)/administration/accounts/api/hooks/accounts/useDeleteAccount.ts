import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/app/(control-panel)/administration/accounts/api/services/accountsApiService';
import { accountsListQueryKey } from '@/app/(control-panel)/administration/accounts/api/hooks/accounts/useAccountsList';
import { accountQueryKey } from '@/app/(control-panel)/administration/accounts/api/hooks/accounts/useAccount';
import { Token } from '@auth/user';

export const useDeleteAccount = (token: Token, accountId: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => accountsApi.deleteAccount(token, accountId),
		onSuccess: (_, accountId: number) => {
			queryClient.invalidateQueries({ queryKey: accountsListQueryKey(token) });
			queryClient.invalidateQueries({ queryKey: accountQueryKey(token, accountId) });
		}
	});
};
