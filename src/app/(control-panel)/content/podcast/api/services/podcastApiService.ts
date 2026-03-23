import { api } from '@/utils/api';
import {
	Podcast,
	PodcastList,
	PodcastCategory,
	PodcastCategoryList,
	PodcastEmotion,
	PodcastEmotionList,
	SearchPodcasts,
	CreatePodcastCategoryPayload,
	UpdatePodcastCategoryPayload,
	SetPodcastEmotionPayload
} from '../types';

const authHeader = (accessToken: string) => ({
	headers: { Authorization: `Bearer ${accessToken}` }
});

export const podcastApi = {
	// ─── Podcast ────────────────────────────────────────────────────────────────

	searchPodcasts: async (
		currentAccountId: string,
		accessToken: string,
		search: SearchPodcasts
	): Promise<PodcastList> => {
		const params = new URLSearchParams();
		params.set('limit', String(search.limit ?? 10));
		params.set('offset', String(search.offset ?? 0));
		if (search.language) params.set('language', search.language);
		if (search.category != null) params.set('category', String(search.category));

		return api
			.get(`podcast/search/${currentAccountId}/?${params.toString()}`, authHeader(accessToken))
			.json();
	},

	getPodcasts: async (
		currentAccountId: string,
		accessToken: string
	): Promise<PodcastList> => {
		return api
			.get(`podcast/list/${currentAccountId}/`, authHeader(accessToken))
			.json();
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
		data: Partial<Podcast>
	): Promise<Podcast> => {
		return api
			.post(`podcast/create/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
			.json();
	},

	updatePodcast: async (
		currentAccountId: string,
		accessToken: string,
		data: Partial<Podcast> & { id: number }
	): Promise<Podcast> => {
		return api
			.put(`podcast/update/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
			.json();
	},

	validatePodcast: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<Podcast> => {
		return api
			.patch(`podcast/validate/${currentAccountId}/`, { json: { id: podcastId }, ...authHeader(accessToken) })
			.json();
	},

	publicPodcast: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<Podcast> => {
		return api
			.patch(`podcast/publish/${currentAccountId}/`, { json: { id: podcastId }, ...authHeader(accessToken) })
			.json();
	},

	publishPodcast: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<Podcast> => {
		return api
			.patch(`podcast/publish/${currentAccountId}/`, { json: { id: podcastId }, ...authHeader(accessToken) })
			.json();
	},

	publishReleasePodcast: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<Podcast> => {
		return api
			.patch(`podcast/publish/release/${currentAccountId}/`, { json: { id: podcastId }, ...authHeader(accessToken) })
			.json();
	},

	deletePodcast: async (
		currentAccountId: string,
		accessToken: string,
		podcastId: number
	): Promise<void> => {
		await api.delete(`podcast/delete/${currentAccountId}/${podcastId}/`, authHeader(accessToken));
	},

	// ─── Podcast Category ───────────────────────────────────────────────────────

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
			.post(`podcast/category/create/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
			.json();
	},

	updatePodcastCategory: async (
		currentAccountId: string,
		accessToken: string,
		data: UpdatePodcastCategoryPayload
	): Promise<PodcastCategory> => {
		return api
			.put(`podcast/category/update/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
			.json();
	},

	deletePodcastCategory: async (
		currentAccountId: string,
		accessToken: string,
		categoryId: number
	): Promise<void> => {
		await api.delete(`podcast/category/delete/${currentAccountId}/${categoryId}/`, authHeader(accessToken));
	},

	// ─── Podcast Emotion ────────────────────────────────────────────────────────

	getPodcastEmotions: async (
		currentAccountId: string,
		accessToken: string
	): Promise<PodcastEmotionList> => {
		return api
			.get(`podcast/emotion/list/${currentAccountId}/`, authHeader(accessToken))
			.json();
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
		await api.delete(`podcast/emotion/delete/${currentAccountId}/${podcastId}/`, authHeader(accessToken));
	}
};