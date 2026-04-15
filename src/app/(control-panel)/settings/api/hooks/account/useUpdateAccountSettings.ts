import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApiService } from '../../services/settingsApiService';
import { accountSettingsQueryKey } from './useAccountSettings';
import useUser from '@auth/useUser';
import type { UpdateAccountPayload } from '../../types';

export function useUpdateAccountSettings() {
	const queryClient = useQueryClient();
	const { data: user } = useUser();
	const currentAccountId = user?.account?.id as number;

	return useMutation({
		mutationFn: (data: UpdateAccountPayload) =>
			settingsApiService.updateAccountSettings({ currentAccountId, data }),
		onSuccess: (data) => {
			queryClient.setQueryData(accountSettingsQueryKey(currentAccountId), data);
		}
	});
}
