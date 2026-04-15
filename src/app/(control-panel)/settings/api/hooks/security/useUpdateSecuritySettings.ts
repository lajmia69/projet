import { useMutation } from '@tanstack/react-query';
import { settingsApiService } from '../../services/settingsApiService';
import useUser from '@auth/useUser';
import type { SettingsSecurity } from '../../types';

export function useUpdateSecuritySettings() {
	const { data: user } = useUser();
	const currentAccountId = user?.account?.id as number;
	const accountId = user?.account?.id as number;

	return useMutation({
		mutationFn: (data: SettingsSecurity) =>
			settingsApiService.updateSecuritySettings({ currentAccountId, accountId, data })
	});
}
