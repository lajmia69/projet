import { api } from '@/utils/api';
import {
	Podcast,
	PodcastList,
	PodcastCategory,
	PodcastCategoryList,
	PodcastEmotion,
	PodcastEmotionList,
	SearchPodcasts,
	CreatePodcastPayload,
	UpdatePodcastPayload,
	CreatePodcastCategoryPayload,
	UpdatePodcastCategoryPayload,
	SetPodcastEmotionPayload,
	LanguageList
} from '../types';

const authHeader = (accessToken: string) => ({
	headers: { Authorization: `Bearer ${accessToken}` }
});

export const podcastApi = {
	// ─── Podcast ─────────────────────────────────────────────────────────────

	searchPodcasts: async (
		currentAccountId: string,
		accessToken: string,
		search: SearchPodcasts
	): Promise<PodcastList> => {
		const params = new URLSearchParams();
		params.set('limit', String(search.limit ?? 10));
		params.set('offset', String(search.offset ?? 0));
		if (search.language) params.set('language', search.language);
		if (search.podcast_category) params.set('podcast_category', search.podcast_category);
		if (search.name) params.set('name', search.name);
		if (search.tags) params.set('tags', search.tags);
		return api
			.get(`podcast/search/${currentAccountId}/?${params.toString()}`, authHeader(accessToken))
			.json();
	},

	getPodcasts: async (currentAccountId: string, accessToken: string): Promise<PodcastList> => {
		return api.get(`podcast/list/${currentAccountId}/`, authHeader(accessToken)).json();
	},

	getPodcast: async (
		currentAccountId: string,
		podcastId: string,
		accessToken: string
	): Promise<Podcast> => {
		return api
			.get(`podcast/detail/${currentAccountId}/${podcastId}/`, authHeader(accessToken))
			.json();
	},

	createPodcast: async (
		currentAccountId: string,
		accessToken: string,
		data: CreatePodcastPayload
	): Promise<Podcast> => {
		return api
			.post(`podcast/create/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
			.json();
	},

	updatePodcast: async (
		currentAccountId: string,
		accessToken: string,
		data: UpdatePodcastPayload
	): Promise<Podcast> => {
		console.log('[updatePodcast] payload:', JSON.stringify(data, null, 2));
		const res = await fetch(
			`${process.env.NEXT_PUBLIC_BASE_URL}/podcast/update/${currentAccountId}/`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`
				},
				body: JSON.stringify(data)
			}
		);
		const text = await res.text();
		console.log(`[updatePodcast] status=${res.status} body:`, text);
		if (!res.ok) throw new Error(`${res.status}: ${text}`);
		return JSON.parse(text) as Podcast;
	},

	validatePodcast: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<Podcast> => {
		return api
			.patch(`podcast/validate/${currentAccountId}/`, {
				json: { id: podcastId },
				...authHeader(accessToken)
			})
			.json();
	},

	publishPodcast: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<Podcast> => {
		return api
			.patch(`podcast/publish/${currentAccountId}/`, {
				json: { id: podcastId, is_published: true },
				...authHeader(accessToken)
			})
			.json();
	},

	publishReleasePodcast: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<Podcast> => {
		return api
			.patch(`podcast/publish/release/${currentAccountId}/`, {
				json: { id: podcastId, is_published: true },
				...authHeader(accessToken)
			})
			.json();
	},

	deletePodcast: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<void> => {
		await api.delete(
			`podcast/delete/${currentAccountId}/${podcastId}/`,
			authHeader(accessToken)
		);
	},

	// ─── Language ─────────────────────────────────────────────────────────────

	getLanguages: async (currentAccountId: string, accessToken: string): Promise<LanguageList> => {
		return api
			.get(`setting/language/list/${currentAccountId}/`, authHeader(accessToken))
			.json();
	},

	// ─── Podcast Category ─────────────────────────────────────────────────────

	getPodcastCategories: async (
		currentAccountId: string,
		accessToken: string
	): Promise<PodcastCategoryList> => {
		return api
			.get(`podcast/category/list/${currentAccountId}/`, authHeader(accessToken))
			.json();
	},

	getPodcastCategory: async (
		currentAccountId: string,
		accessToken: string,
		categoryId: number
	): Promise<PodcastCategory> => {
		return api
			.get(`podcast/category/detail/${currentAccountId}/${categoryId}/`, authHeader(accessToken))
			.json();
	},

	createPodcastCategory: async (
		currentAccountId: string,
		accessToken: string,
		data: CreatePodcastCategoryPayload
	): Promise<PodcastCategory> => {
		return api
			.post(`podcast/category/create/${currentAccountId}/`, {
				json: data,
				...authHeader(accessToken)
			})
			.json();
	},

	updatePodcastCategory: async (
		currentAccountId: string,
		accessToken: string,
		data: UpdatePodcastCategoryPayload
	): Promise<PodcastCategory> => {
		return api
			.put(`podcast/category/update/${currentAccountId}/`, {
				json: data,
				...authHeader(accessToken)
			})
			.json();
	},

	deletePodcastCategory: async (
		currentAccountId: string,
		accessToken: string,
		categoryId: number
	): Promise<void> => {
		await api.delete(
			`podcast/category/delete/${currentAccountId}/${categoryId}/`,
			authHeader(accessToken)
		);
	},

	// ─── Podcast Emotion ──────────────────────────────────────────────────────

	getPodcastEmotions: async (
		currentAccountId: string,
		accessToken: string
	): Promise<PodcastEmotionList> => {
		return api.get(`podcast/emotion/list/${currentAccountId}/`, authHeader(accessToken)).json();
	},

	getPodcastEmotion: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<PodcastEmotion> => {
		return api
			.get(`podcast/emotion/detail/${currentAccountId}/${podcastId}/`, authHeader(accessToken))
			.json();
	},

	setPodcastEmotion: async (
		currentAccountId: string,
		accessToken: string,
		data: SetPodcastEmotionPayload
	): Promise<PodcastEmotion> => {
		return api
			.post(`podcast/emotion/set/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
			.json();
	},

	deletePodcastEmotion: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<void> => {
		await api.delete(
			`podcast/emotion/delete/${currentAccountId}/${podcastId}/`,
			authHeader(accessToken)
		);
	}
};
