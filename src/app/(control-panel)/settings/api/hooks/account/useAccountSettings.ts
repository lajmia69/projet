import { useQuery } from '@tanstack/react-query';
import { settingsApiService } from '../../services/settingsApiService';
import useUser from '@auth/useUser';

export const accountSettingsQueryKey = (accountId: number) =>
	['settings', 'account', accountId] as const;

export function useAccountSettings() {
	const { data: user } = useUser();
	const accountId = user?.account?.id as number;

	return useQuery({
		queryKey: accountSettingsQueryKey(accountId),
		queryFn: () => settingsApiService.getAccountSettings(accountId),
		enabled: !!accountId
	});
}
