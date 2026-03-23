import { api } from '@/utils/api';
import {
	Radio,
	RadioList,
	RadioCategory,
	RadioCategoryList,
	RadioEmotion,
	RadioEmotionList,
	SearchRadios,
	CreateRadioCategoryPayload,
	UpdateRadioCategoryPayload,
	SetRadioEmotionPayload
} from '../types';

const authHeader = (accessToken: string) => ({
	headers: { Authorization: `Bearer ${accessToken}` }
});

export const radioApi = {
	// ─── Radio ──────────────────────────────────────────────────────────────────

	searchRadios: async (
		currentAccountId: string,
		accessToken: string,
		search: SearchRadios
	): Promise<RadioList> => {
		const params = new URLSearchParams();
		params.set('limit', String(search.limit ?? 10));
		params.set('offset', String(search.offset ?? 0));
		if (search.language) params.set('language', search.language);
		if (search.category != null) params.set('category', String(search.category));

		return api
			.get(`radio/search/${currentAccountId}/?${params.toString()}`, authHeader(accessToken))
			.json();
	},

	getRadios: async (currentAccountId: string, accessToken: string): Promise<RadioList> => {
		return api.get(`radio/list/${currentAccountId}/`, authHeader(accessToken)).json();
	},

	getRadio: async (
		currentAccountId: string,
		radioId: string,
		accessToken: string
	): Promise<Radio> => {
		return api
			.get(`radio/detail/${currentAccountId}/${radioId}/`, authHeader(accessToken))
			.json();
	},

	createRadio: async (
		currentAccountId: string,
		accessToken: string,
		data: Partial<Radio>
	): Promise<Radio> => {
		return api
			.post(`radio/create/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
			.json();
	},

	updateRadio: async (
		currentAccountId: string,
		accessToken: string,
		data: Partial<Radio> & { id: number }
	): Promise<Radio> => {
		return api
			.put(`radio/update/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
			.json();
	},

	validateRadio: async (
		currentAccountId: string,
		accessToken: string,
		radioId: number
	): Promise<Radio> => {
		return api
			.patch(`radio/validate/${currentAccountId}/`, {
				json: { id: radioId },
				...authHeader(accessToken)
			})
			.json();
	},

	publicRadio: async (
		currentAccountId: string,
		accessToken: string,
		radioId: number
	): Promise<Radio> => {
		return api
			.patch(`radio/public/${currentAccountId}/`, {
				json: { id: radioId },
				...authHeader(accessToken)
			})
			.json();
	},

	publishRadio: async (
		currentAccountId: string,
		accessToken: string,
		radioId: number
	): Promise<Radio> => {
		return api
			.patch(`radio/publish/${currentAccountId}/`, {
				json: { id: radioId },
				...authHeader(accessToken)
			})
			.json();
	},

	publishReleaseRadio: async (
		currentAccountId: string,
		accessToken: string,
		radioId: number
	): Promise<Radio> => {
		return api
			.patch(`radio/publish/release/${currentAccountId}/`, {
				json: { id: radioId },
				...authHeader(accessToken)
			})
			.json();
	},

	deleteRadio: async (
		currentAccountId: string,
		accessToken: string,
		radioId: number
	): Promise<void> => {
		await api.delete(`radio/delete/${currentAccountId}/${radioId}/`, authHeader(accessToken));
	},

	// ─── Radio Category ─────────────────────────────────────────────────────────

	getRadioCategories: async (
		currentAccountId: string,
		accessToken: string
	): Promise<RadioCategoryList> => {
		return api
			.get(`radio/category/list/${currentAccountId}/`, authHeader(accessToken))
			.json();
	},

	getRadioCategory: async (
		currentAccountId: string,
		accessToken: string,
		categoryId: number
	): Promise<RadioCategory> => {
		return api
			.get(`radio/category/detail/${currentAccountId}/${categoryId}/`, authHeader(accessToken))
			.json();
	},

	createRadioCategory: async (
		currentAccountId: string,
		accessToken: string,
		data: CreateRadioCategoryPayload
	): Promise<RadioCategory> => {
		return api
			.post(`radio/category/create/${currentAccountId}/`, {
				json: data,
				...authHeader(accessToken)
			})
			.json();
	},

	updateRadioCategory: async (
		currentAccountId: string,
		accessToken: string,
		data: UpdateRadioCategoryPayload
	): Promise<RadioCategory> => {
		return api
			.put(`radio/category/update/${currentAccountId}/`, {
				json: data,
				...authHeader(accessToken)
			})
			.json();
	},

	deleteRadioCategory: async (
		currentAccountId: string,
		accessToken: string,
		categoryId: number
	): Promise<void> => {
		await api.delete(
			`radio/category/delete/${currentAccountId}/${categoryId}/`,
			authHeader(accessToken)
		);
	},

	// ─── Radio Emotion ───────────────────────────────────────────────────────────

	getRadioEmotions: async (
		currentAccountId: string,
		accessToken: string
	): Promise<RadioEmotionList> => {
		return api.get(`radio/emotion/list/${currentAccountId}/`, authHeader(accessToken)).json();
	},

	getRadioEmotion: async (
		currentAccountId: string,
		accessToken: string,
		radioId: number
	): Promise<RadioEmotion> => {
		return api
			.get(`radio/emotion/detail/${currentAccountId}/${radioId}/`, authHeader(accessToken))
			.json();
	},

	setRadioEmotion: async (
		currentAccountId: string,
		accessToken: string,
		data: SetRadioEmotionPayload
	): Promise<RadioEmotion> => {
		return api
			.post(`radio/emotion/set/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
			.json();
	},

	deleteRadioEmotion: async (
		currentAccountId: string,
		accessToken: string,
		radioId: number
	): Promise<void> => {
		await api.delete(
			`radio/emotion/delete/${currentAccountId}/${radioId}/`,
			authHeader(accessToken)
		);
	}
};