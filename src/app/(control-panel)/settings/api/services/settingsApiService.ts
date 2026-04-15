import { fetchWithAuth } from '@/app/(control-panel)/culture/api/utils/authTokenUtils';
import type {
	SettingsAccount,
	UpdateAccountPayload,
	SettingsSecurity
} from '../types';

const BASE_URL = 'https://radio.backend.ecocloud.tn';

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(`API error ${res.status}: ${text}`);
	}
	const text = await res.text();
	return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

export const settingsApiService = {
	// GET /account/signin/{account_id}/
	getAccountSettings: async (accountId: number): Promise<SettingsAccount> => {
		const res = await fetchWithAuth(`${BASE_URL}/account/signin/${accountId}/`);
		return handleResponse<SettingsAccount>(res);
	},

	// PUT /account/update/{current_account_id}/
	updateAccountSettings: async ({
		currentAccountId,
		data
	}: {
		currentAccountId: number;
		data: UpdateAccountPayload;
	}): Promise<SettingsAccount> => {
		const res = await fetchWithAuth(`${BASE_URL}/account/update/${currentAccountId}/`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		return handleResponse<SettingsAccount>(res);
	},

	// POST /account/update/avatar/{current_account_id}/{account_id}/
	updateAccountAvatar: async ({
		currentAccountId,
		accountId,
		file
	}: {
		currentAccountId: number;
		accountId: number;
		file: File;
	}): Promise<{ avatar: string }> => {
		const formData = new FormData();
		formData.append('avatar', file);
		// Do NOT set Content-Type manually — the browser sets it with the correct
		// multipart boundary when body is a FormData instance
		const res = await fetchWithAuth(
			`${BASE_URL}/account/update/avatar/${currentAccountId}/${accountId}/`,
			{ method: 'POST', body: formData }
		);
		return handleResponse<{ avatar: string }>(res);
	},

	// PATCH /account/update/password/{current_account_id}/{account_id}/
	updateSecuritySettings: async ({
		currentAccountId,
		accountId,
		data
	}: {
		currentAccountId: number;
		accountId: number;
		data: SettingsSecurity;
	}): Promise<void> => {
		const res = await fetchWithAuth(
			`${BASE_URL}/account/update/password/${currentAccountId}/${accountId}/`,
			{
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data)
			}
		);
		return handleResponse<void>(res);
	}
};
