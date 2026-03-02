import { api } from '@/utils/api';
import { Account } from '../types';
import { Token } from '@auth/user';
import { AccountsResponse } from '@/app/(control-panel)/administration/accounts/api/types';

export const accountsApi = {
	getAccountsList: async (token: Token): Promise<Account[]> => {
		const response = await api.get(`account/list/${token.id}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token.access}`
			}
		});
		const data: AccountsResponse = await response.json();
		return data.items;
	},

	getAccount: async (token: Token, accountId: number): Promise<Account> => {
		return api
			.get(`account/detail/${token.id}/${accountId}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token.access}`
				}
			})
			.json();
	},

	createAccount: async (token: Omit<Token, ''>, account: Omit<Account, 'id'>): Promise<Account> => {
		return api
			.post(`account/create/${token.id}}`, {
				headers: {
					Authorization: `Bearer ${token.access}`
				},
				json: account
			})
			.json();
	},

	updateAccount: async (token: Omit<Token, ''>, account: Omit<Account, 'avatar'>): Promise<Account> => {
		return api
			.put(`account/update/${token.id}`, {
				json: account
			})
			.json();
	},

	deleteAccount: async (token: Token, accountId: number): Promise<void> => {
		await api.delete(`account/delete/${token.id}/${accountId}`, {
			headers: {
				Authorization: `Bearer ${token.access}`
			},
		});
	}

	// getTags: async (): Promise<Tag[]> => {
	// 	return api.get('mock/contacts/tags').json();
	// },
	//
	// getTag: async (tagId: string): Promise<Tag> => {
	// 	return api.get(`mock/contacts/tags/${tagId}`).json();
	// },
	//
	// createTag: async (tag: Omit<Tag, 'id'>): Promise<Tag> => {
	// 	return api
	// 		.post('mock/contacts/tags', {
	// 			json: tag
	// 		})
	// 		.json();
	// },
	//
	// updateTag: async (tag: Tag): Promise<Tag> => {
	// 	return api
	// 		.put(`mock/contacts/tags/${tag.id}`, {
	// 			json: tag
	// 		})
	// 		.json();
	// },
	//
	// deleteTag: async (tagId: string): Promise<void> => {
	// 	await api.delete(`mock/contacts/tags/${tagId}`);
	// },
	//
	// getCountries: async (): Promise<Country[]> => {
	// 	return api.get('mock/countries').json();
	// }
};
