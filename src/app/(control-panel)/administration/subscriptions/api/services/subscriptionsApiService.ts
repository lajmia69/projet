import { api } from '@/utils/api';
import { Token } from '@auth/user';
import {
	Account,
	AccountsResponse,
	CreateSubscription,
	Level,
	Subscription,
	SubscriptionsResponse
} from '../types';

export type SubscriptionSearchParams = {
	username?: string;
	email?: string;
	phone?: string;
	mobile?: string;
};

export const subscriptionsApi = {
	// GET /account/list/{current_account_id}/
	getAccountsList: async (token: Token): Promise<Account[]> => {
		const response = await api.get(`account/list/${token.id}/`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams: { limit: 1000, offset: 0 }
		});
		const data: AccountsResponse = await response.json();
		return data.items;
	},

	// GET /account/subscription/all/list/{current_account_id}/
	getAllSubscriptionsList: async (token: Token): Promise<Subscription[]> => {
		const response = await api.get(`account/subscription/all/list/${token.id}/`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams: { limit: 1000, offset: 0 }
		});
		const data: SubscriptionsResponse = await response.json();
		return data.items;
	},

	// GET /account/subscription/list/{current_account_id}/{account_id}/
	getSubscriptionsByAccount: async (token: Token, accountId: number): Promise<Subscription[]> => {
		const response = await api.get(
			`account/subscription/list/${token.id}/${accountId}/`,
			{
				headers: { Authorization: `Bearer ${token.access}` },
				searchParams: { limit: 1000, offset: 0 }
			}
		);
		const data: SubscriptionsResponse = await response.json();
		return data.items;
	},

	// GET /account/subscription/detail/{current_account_id}/{subscription_id}/
	getSubscription: async (token: Token, subscriptionId: number): Promise<Subscription> => {
		return api
			.get(`account/subscription/detail/${token.id}/${subscriptionId}/`, {
				headers: { Authorization: `Bearer ${token.access}` }
			})
			.json();
	},

	// GET /account/subscription/search/{current_account_id}/
	// Returns SearchSubscriptionSchema: { user, subscriptions, id, avatar, phone, ... }
	searchSubscriptions: async (
		token: Token,
		params: SubscriptionSearchParams
	): Promise<Subscription[]> => {
		const searchParams: Record<string, string> = {};
		if (params.username) searchParams.username = params.username;
		if (params.email) searchParams.email = params.email;
		if (params.phone) searchParams.phone = params.phone;
		if (params.mobile) searchParams.mobile = params.mobile;

		const response = await api.get(`account/subscription/search/${token.id}/`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams
		});
		// Returns SearchSubscriptionSchema — extract the subscriptions array
		const data: { subscriptions: Subscription[] } = await response.json();
		return data.subscriptions;
	},

	// GET /lesson/level/list/{id}/  (lives on the lesson API, not account)
	getLevelsList: async (token: Token): Promise<Level[]> => {
		const response = await api.get(`lesson/level/list/${token.id}/`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams: { limit: 1000, offset: 0 }
		});
		const data: { items: Level[] } = await response.json();
		return data.items;
	},

	// POST /account/subscription/create/{current_account_id}/
	// Body: { account_id: number, level_id?: number | null }
	createSubscription: async (
		token: Token,
		subscription: CreateSubscription
	): Promise<Subscription> => {
		return api
			.post(`account/subscription/create/${token.id}/`, {
				headers: { Authorization: `Bearer ${token.access}` },
				json: {
					account_id: subscription.account_id,
					level_id: subscription.level_id ?? null
				}
			})
			.json();
	}
};