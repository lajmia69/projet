import { api } from '@/utils/api';
import { Token } from '@auth/user';
import { Account, AccountsResponse, Subscription } from '../types';

export const subscriptionsApi = {
	getAccountsList: async (token: Token): Promise<Account[]> => {
		const response = await api.get(`account/list/${token.id}`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${token.access}` }
		});
		const data: AccountsResponse = await response.json();
		return data.items;
	},

	getAccount: async (token: Token, accountId: number): Promise<Account> => {
		return api
			.get(`account/detail/${token.id}/${accountId}`, {
				method: 'GET',
				headers: { Authorization: `Bearer ${token.access}` }
			})
			.json();
	},

	toggleSubscription: async (
		token: Token,
		subscriptionId: number,
		is_active: boolean
	): Promise<Subscription> => {
		return api
			.patch(`account/subscription/update/${token.id}/${subscriptionId}/`, {
				headers: { Authorization: `Bearer ${token.access}` },
				json: { is_active }
			})
			.json();
	}
};