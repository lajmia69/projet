import { api } from '@/utils/api';
import { Token } from '@auth/user';
import {
	Account,
	AccountsResponse,
	CreateSubscription,
	Subscription,
	SubscriptionsResponse
} from '../types';

export const subscriptionsApi = {
	getAccountsList: async (token: Token): Promise<Account[]> => {
		const response = await api.get(`account/list/${token.id}`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams: { page_size: 1000 }
		});
		const data: AccountsResponse = await response.json();
		return data.items;
	},

	getAllSubscriptionsList: async (token: Token): Promise<Subscription[]> => {
		const response = await api.get(`account/subscription/all/list/${token.id}/`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams: { page_size: 1000 }
		});
		const data: SubscriptionsResponse = await response.json();
		return data.items;
	},

	getSubscription: async (token: Token, subscriptionId: number): Promise<Subscription> => {
		return api
			.get(`account/subscription/detail/${token.id}/${subscriptionId}/`, {
				headers: { Authorization: `Bearer ${token.access}` }
			})
			.json();
	},

	createSubscription: async (
		token: Token,
		subscription: CreateSubscription
	): Promise<Subscription> => {
		return api
			.post(`account/subscription/create/${token.id}/`, {
				headers: { Authorization: `Bearer ${token.access}` },
				json: subscription
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