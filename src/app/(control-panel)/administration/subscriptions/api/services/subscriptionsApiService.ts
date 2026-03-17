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
	account_id?: number;
	subscription_id?: number;
	plan?: string;
	status?: 'active' | 'inactive';
	start_date_from?: string;
	start_date_to?: string;
	end_date_from?: string;
	end_date_to?: string;
};

export const subscriptionsApi = {
	// GET /account/list/{id}/ — used to populate the Account dropdown
	getAccountsList: async (token: Token): Promise<Account[]> => {
		const response = await api.get(`account/list/${token.id}`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams: { page_size: 1000 }
		});
		const data: AccountsResponse = await response.json();
		return data.items;
	},

	// GET /account/subscription/all/list/{current_account_id}/
	getAllSubscriptionsList: async (token: Token): Promise<Subscription[]> => {
		const response = await api.get(`account/subscription/all/list/${token.id}/`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams: { page_size: 1000 }
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
				searchParams: { page_size: 1000 }
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
	searchSubscriptions: async (
		token: Token,
		params: SubscriptionSearchParams
	): Promise<Subscription[]> => {
		const searchParams: Record<string, string | number> = {};
		if (params.account_id) searchParams.account_id = params.account_id;
		if (params.subscription_id) searchParams.subscription_id = params.subscription_id;
		if (params.plan) searchParams.plan = params.plan;
		if (params.status) searchParams.status = params.status;
		if (params.start_date_from) searchParams.start_date_from = params.start_date_from;
		if (params.start_date_to) searchParams.start_date_to = params.start_date_to;
		if (params.end_date_from) searchParams.end_date_from = params.end_date_from;
		if (params.end_date_to) searchParams.end_date_to = params.end_date_to;

		const response = await api.get(`account/subscription/search/${token.id}/`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams: { ...searchParams, page_size: 1000 }
		});
		const data: SubscriptionsResponse = await response.json();
		return data.items;
	},

	// GET /account/level/list/{id}/ — used to populate the Plan dropdown
	getLevelsList: async (token: Token): Promise<Level[]> => {
		const response = await api.get(`lesson/level/list/${token.id}/`, {
			headers: { Authorization: `Bearer ${token.access}` },
			searchParams: { page_size: 1000 }
		});
		const data: { items: Level[] } = await response.json();
		return data.items;
	},

	// POST /account/subscription/create/{current_account_id}/
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
	}
};