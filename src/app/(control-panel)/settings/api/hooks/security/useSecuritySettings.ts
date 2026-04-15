// The backend has no GET endpoint for security settings (password is write-only).
// This hook is kept as a placeholder returning empty defaults so SecurityTabView
// can still call reset() without errors.
import { SettingsSecurity } from '../../types';

export const securitySettingsQueryKey = ['settings', 'security'] as const;

export const defaultSecuritySettings: SettingsSecurity = {
	password: '',
	new_password: '',
	new_password_verification: ''
};

export function useSecuritySettings() {
	return { data: defaultSecuritySettings };
}
