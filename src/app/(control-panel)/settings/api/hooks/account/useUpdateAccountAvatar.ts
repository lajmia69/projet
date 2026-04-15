import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApiService } from '../../services/settingsApiService';
import { accountSettingsQueryKey } from './useAccountSettings';
import useUser from '@auth/useUser';

export function useUpdateAccountAvatar() {
	const queryClient = useQueryClient();
	const { data: user } = useUser();
	const currentAccountId = user?.account?.id as number;
	const accountId = user?.account?.id as number;

	return useMutation({
		mutationFn: (file: File) =>
			settingsApiService.updateAccountAvatar({ currentAccountId, accountId, file }),
		onSuccess: (data) => {
			// Update the cached account settings with the new avatar
			queryClient.setQueryData(
				accountSettingsQueryKey(currentAccountId),
				(old: any) => old ? { ...old, avatar: data.avatar } : old
			);
		}
	});
}
