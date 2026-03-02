import { api } from '@/utils/api';
import { Token } from '@auth/user';
import {
	Createsubscription,
	subscription,
	subscriptionsResponse,
	subscriptionType,
	subscriptionTypesResponse
} from '@/app/(control-panel)/administration/subscriptions/api/types';

export const subscriptionsApi = {
	getsubscriptionsList: async (token: Token): Promise<subscription[]> => {
		const response = await api.get(`account/subscription/list/${token.id}/`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token.access}`
			}
		});
		const data: subscriptionsResponse = await response.json();
		return data.items;
	},

	getsubscription: async (token: Token, subscriptionId: number): Promise<subscription> => {
		return api
			.get(`account/subscription/detail/${token.id}/${subscriptionId}/`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token.access}`
				}
			})
			.json();
	},

	createsubscription: async (token: Omit<Token, ''>, subscription: Omit<Createsubscription, ''>): Promise<Createsubscription> => {
		return api
			.post(`account/subscription/create/${token.id}/`, {
				headers: {
					Authorization: `Bearer ${token.access}`
				},
				json: subscription
			})
			.json();
	},

	updatesubscription: async (token: Omit<Token, ''>, subscription: Omit<subscription, 'avatar'>): Promise<subscription> => {
		return api
			.put(`account/subscription/update/${token.id}/`, {
				headers: {
					Authorization: `Bearer ${token.access}`
				},
				json: subscription
			})
			.json();
	},

	deletesubscription: async (token: Token, subscriptionId: number): Promise<void> => {
    await api.delete(`account/subscription/${subscriptionId}/delete/${token.id}/`, {
        headers: {
            Authorization: `Bearer ${token.access}`
        }
    });
},

	getsubscriptionTypesList: async (token: Token): Promise<subscriptionType[]> => {
		const response = await api.get(`account/subscription_type/list/${token.id}/`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token.access}`
			}
		});
		const data: subscriptionTypesResponse = await response.json();
		return data.items;
	}
};