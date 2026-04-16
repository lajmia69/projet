/**
 * podcastApiService.ts
 *
 * Single source of truth for all podcast API calls.
 * Types are imported from ../types — no duplicates here.
 *
 * Method names match exactly what every hook calls:
 *   searchPodcasts, getPodcast, getPodcasts,
 *   getPodcastCategories, getPodcastCategory,
 *   createPodcastCategory, updatePodcastCategory, deletePodcastCategory,
 *   getPodcastEmotions, getPodcastEmotion, setPodcastEmotion, deletePodcastEmotion,
 *   getLanguages, create, update, delete, validate, publish
 */

import ky from 'ky';
import type {
	Podcast,
	PodcastList,
	PodcastCategory,
	PodcastCategoryList,
	PodcastEmotion,
	PodcastEmotionList,
	LanguageList,
	SearchPodcasts,
	CreatePodcastPayload,
	UpdatePodcastPayload,
	CreatePodcastCategoryPayload,
	UpdatePodcastCategoryPayload,
	SetPodcastEmotionPayload,
} from '../types';

const BASE_URL = 'https://radio.backend.ecocloud.tn';

// ─── Payload types for status mutations (not in types/index.ts) ───────────────

export type ValidatePodcastPayload = {
	id: number;
	is_approved_content: boolean;
};

export type PublishPodcastPayload = {
	id: number;
	is_published: boolean;
};

// ─── Shared client factory ─────────────────────────────────────────────────────

function createClient(token: string) {
	return ky.create({
		prefixUrl: BASE_URL,
		retry: 0,
		timeout: 30_000,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const podcastApi = {

	// ── Languages ──────────────────────────────────────────────────────────────

	getLanguages: (accountId: string | number, token: string): Promise<LanguageList> =>
		createClient(token)
			.get(`setting/language/list/${accountId}/`)
			.json<LanguageList>(),

	// ── Podcast list / search / detail ─────────────────────────────────────────

	/** Used by usePodcasts — returns full list with no search filters */
	getPodcasts: (accountId: string | number, token: string): Promise<PodcastList> =>
		createClient(token)
			.get(`podcast/search/${accountId}/`)
			.json<PodcastList>(),

	/** Used by useSearchPodcasts — paginated + filtered */
	searchPodcasts: (
		accountId: string | number,
		token: string,
		params: SearchPodcasts
	): Promise<PodcastList> =>
		createClient(token)
			.get(`podcast/search/${accountId}/`, {
				searchParams: params as Record<string, string | number>,
			})
			.json<PodcastList>(),

	/** Used by usePodcast — single podcast by id */
	getPodcast: (
		accountId: string | number,
		podcastId: string | number,
		token: string
	): Promise<Podcast> =>
		createClient(token)
			.get(`podcast/detail/${accountId}/${podcastId}/`)
			.json<Podcast>(),

	// ── Podcast CRUD ───────────────────────────────────────────────────────────

	create: (
		accountId: string | number,
		token: string,
		payload: CreatePodcastPayload
	): Promise<Podcast> =>
		createClient(token)
			.post(`podcast/create/${accountId}/`, { json: payload })
			.json<Podcast>(),

	update: (
		accountId: string | number,
		token: string,
		payload: UpdatePodcastPayload
	): Promise<Podcast> =>
		createClient(token)
			.put(`podcast/update/${accountId}/`, { json: payload })
			.json<Podcast>(),

	delete: (
		accountId: string | number,
		token: string,
		podcastId: number
	): Promise<void> =>
		createClient(token)
			.delete(`podcast/delete/${accountId}/${podcastId}/`)
			.json<void>(),

	// ── Status / workflow ──────────────────────────────────────────────────────

	/**
	 * PATCH /podcast/validate/{accountId}/
	 * Body: { id: podcastId, is_approved_content: true }
	 * accountId goes in the URL path; podcastId goes in the body.
	 */
/**
 * PATCH /podcast/validate/{accountId}/
 * Body: { id: podcastId, is_approved_content: true }
 * accountId goes in the URL path; podcastId goes in the body.
 */
// ─── Status / workflow ──────────────────────────────────────────────────────

/**
 * FIXED: Using payload.id in the URL instead of accountId
 * Most backends require the resource ID in the path for permission checks.
 */
// ─── Status / workflow ──────────────────────────────────────────────────────

/**
 * Reverted to using accountId in the URL as per API specs.
 * Body: { id: podcastId, is_approved_content: true }
 */
// ── Status / workflow ──────────────────────────────────────────────────────

	/**
	 * Reverted to accountId in path to match the rest of the API patterns.
	 * URL: /podcast/validate/{accountId}/
	 * Body: { id: podcastId, is_approved_content: true }
	 */
	validate: (
		accountId: string | number,
		token: string,
		payload: ValidatePodcastPayload
	): Promise<Podcast> =>
		createClient(token)
			.patch(`podcast/validate/${accountId}/`, { json: payload })
			.json<Podcast>(),

	/**
	 * Reverted to accountId in path.
	 * URL: /podcast/publish/{accountId}/
	 * Body: { id: podcastId, is_published: true }
	 */
	publish: (
		accountId: string | number,
		token: string,
		payload: PublishPodcastPayload
	): Promise<Podcast> =>
		createClient(token)
			.patch(`podcast/publish/${accountId}/`, { json: payload })
			.json<Podcast>(),
	// ── Categories ─────────────────────────────────────────────────────────────

	getPodcastCategories: (
		accountId: string | number,
		token: string,
		params: { limit?: number; offset?: number } = {}
	): Promise<PodcastCategoryList> =>
		createClient(token)
			.get(`podcast/category/list/${accountId}/`, {
				searchParams: params as Record<string, string | number>,
			})
			.json<PodcastCategoryList>(),

	getPodcastCategory: (
		accountId: string | number,
		token: string,
		categoryId: number
	): Promise<PodcastCategory> =>
		createClient(token)
			.get(`podcast/category/detail/${accountId}/${categoryId}/`)
			.json<PodcastCategory>(),

	createPodcastCategory: (
		accountId: string | number,
		token: string,
		payload: CreatePodcastCategoryPayload
	): Promise<PodcastCategory> =>
		createClient(token)
			.post(`podcast/category/create/${accountId}/`, { json: payload })
			.json<PodcastCategory>(),

	updatePodcastCategory: (
		accountId: string | number,
		token: string,
		payload: UpdatePodcastCategoryPayload
	): Promise<PodcastCategory> =>
		createClient(token)
			.put(`podcast/category/update/${accountId}/`, { json: payload })
			.json<PodcastCategory>(),

	deletePodcastCategory: (
		accountId: string | number,
		token: string,
		categoryId: number
	): Promise<void> =>
		createClient(token)
			.delete(`podcast/category/delete/${accountId}/${categoryId}/`)
			.json<void>(),

	// ── Emotions ───────────────────────────────────────────────────────────────

	getPodcastEmotions: (
		accountId: string | number,
		token: string
	): Promise<PodcastEmotionList> =>
		createClient(token)
			.get(`podcast/emotion/list/${accountId}/`)
			.json<PodcastEmotionList>(),

	getPodcastEmotion: (
		accountId: string | number,
		token: string,
		podcastId: number
	): Promise<PodcastEmotion> =>
		createClient(token)
			.get(`podcast/emotion/detail/${accountId}/${podcastId}/`)
			.json<PodcastEmotion>(),

	setPodcastEmotion: (
		accountId: string | number,
		token: string,
		payload: SetPodcastEmotionPayload
	): Promise<PodcastEmotion> =>
		createClient(token)
			.post(`podcast/emotion/set/${accountId}/`, { json: payload })
			.json<PodcastEmotion>(),

	deletePodcastEmotion: (
		accountId: string | number,
		token: string,
		podcastId: number
	): Promise<void> =>
		createClient(token)
			.delete(`podcast/emotion/delete/${accountId}/${podcastId}/`)
			.json<void>(),
};