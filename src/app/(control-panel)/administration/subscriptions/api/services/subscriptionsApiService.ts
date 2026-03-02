import { api } from '@/utils/api';
import { Token } from '@auth/user';
import { Subscription, CreateSubscription, SubscriptionsResponse } from '../types';

export const subscriptionsApi = {
	getSubscriptionsList: async (token: Token): Promise<Subscription[]> => {
		const response = await api.get(`account/subscription/list/${token.id}/`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token.access}`
			}
		});
		const data: SubscriptionsResponse = await response.json();
		return data.items;
	},

	getSubscription: async (token: Token, subscriptionId: number): Promise<Subscription> => {
		return api
			.get(`account/subscription/detail/${token.id}/${subscriptionId}/`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token.access}`
				}
			})
			.json();
	},

	createSubscription: async (token: Token, subscription: CreateSubscription): Promise<Subscription> => {
		return api
			.post(`account/subscription/create/${token.id}/`, {
				headers: {
					Authorization: `Bearer ${token.access}`
				},
				json: subscription
			})
			.json();
	},

	updateSubscription: async (token: Token, subscription: Subscription): Promise<Subscription> => {
		return api
			.put(`account/subscription/update/${token.id}/${subscription.id}/`, {
				headers: {
					Authorization: `Bearer ${token.access}`
				},
				json: subscription
			})
			.json();
	},

	deleteSubscription: async (token: Token, subscriptionId: number): Promise<void> => {
		await api.delete(`account/subscription/delete/${token.id}/${subscriptionId}/`, {
			headers: {
				Authorization: `Bearer ${token.access}`
			}
		});
	}
};