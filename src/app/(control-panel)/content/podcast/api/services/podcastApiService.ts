/**
 * podcastApiService.ts
 *
 * Fixes applied:
 * 1. ✅ validate() — URL changed from `/podcast/validate/${podcastId}/`
 *                    to  `/podcast/validate/${accountId}/` + id in body
 *                    → was causing 500 (backend received wrong path param)
 * 2. ✅ publish()  — Authorization header was missing → caused 401
 *                    Now uses createClient(token) like every other method.
 * 3. ✅ retry: 0   — prevents triple-500 floods in the console
 */

import ky, { HTTPError } from 'ky';

const BASE_URL = 'https://radio.backend.ecocloud.tn';

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

// ─── Types (mirroring what the podcast API returns) ───────────────────────────

export type PodcastLanguageItem = {
	id: number;
	name: string;
	icon: string;
	short_name: string;
};

export type PagedPodcastLanguages = {
	items: PodcastLanguageItem[];
	count: number;
};

export type CreatePodcastPayload = {
	name: string;
	slug: string;
	description: string;
	transcription: Record<string, unknown>;
	language_id: number;
	podcast_category_id: number;
	tags: string[];
};

export type UpdatePodcastPayload = {
	id?: number | null;
	name: string;
	slug: string;
	description: string;
	transcription: Record<string, unknown>;
	language_id: number;
	podcast_category_id: number;
	add_tags: string[] | null;
	remove_tags: string[] | null;
};

/** PATCH /podcast/validate/{accountId}/ */
export type ValidatePodcastPayload = {
	id?: number | null;
	is_approved_content: boolean;
};

/** PATCH /podcast/publish/{accountId}/ */
export type PublishPodcastPayload = {
	id?: number | null;
	is_published: boolean;
};

// ─── Service object ───────────────────────────────────────────────────────────

export const podcastApi = {
	// ── Language lookup (used in the admin view) ────────────────────────────
	getLanguages: (
		accountId: string | number,
		token: string
	): Promise<PagedPodcastLanguages> =>
		createClient(token)
			.get(`podcast/language/list/${accountId}/`)
			.json<PagedPodcastLanguages>(),

	// ── Podcast CRUD ────────────────────────────────────────────────────────

	search: (
		accountId: string | number,
		token: string,
		params: { limit?: number; offset?: number } = {}
	) =>
		createClient(token)
			.get(`podcast/search/${accountId}/`, { searchParams: params as Record<string, string | number> })
			.json(),

	create: (
		accountId: string | number,
		token: string,
		payload: CreatePodcastPayload
	) =>
		createClient(token)
			.post(`podcast/create/${accountId}/`, { json: payload })
			.json(),

	update: (
		accountId: string | number,
		token: string,
		payload: UpdatePodcastPayload
	) =>
		createClient(token)
			.put(`podcast/update/${accountId}/`, { json: payload })
			.json(),

	delete: (
		accountId: string | number,
		token: string,
		podcastId: number
	) =>
		createClient(token)
			.delete(`podcast/delete/${accountId}/${podcastId}/`)
			.json(),

	// ── Status / workflow ───────────────────────────────────────────────────

	/**
	 * PATCH /podcast/validate/{accountId}/
	 * Body: { id: podcastId, is_approved_content: true }
	 *
	 * ✅ FIX: previously used ${podcastId} in the URL path (server-side crash → 500).
	 *         The correct pattern matches the lesson API: account_id in path,
	 *         podcast_id in the request body.
	 */
	validate: (
		accountId: string | number,
		token: string,
		payload: ValidatePodcastPayload
	) =>
		createClient(token)
			.patch(`podcast/validate/${accountId}/`, { json: payload })
			.json(),

	/**
	 * PATCH /podcast/publish/{accountId}/
	 * Body: { id: podcastId, is_published: true }
	 *
	 * ✅ FIX: Authorization header was not being sent → caused 401.
	 *         Now uses createClient(token) which always attaches the Bearer token.
	 */
	publish: (
		accountId: string | number,
		token: string,
		payload: PublishPodcastPayload
	) =>
		createClient(token)
			.patch(`podcast/publish/${accountId}/`, { json: payload })
			.json(),

	// ── Categories ──────────────────────────────────────────────────────────

	getCategories: (
		accountId: string | number,
		token: string,
		params: { limit?: number; offset?: number } = {}
	) =>
		createClient(token)
			.get(`podcast/category/list/${accountId}/`, { searchParams: params as Record<string, string | number> })
			.json(),

	createCategory: (
		accountId: string | number,
		token: string,
		payload: { name: string; description: string }
	) =>
		createClient(token)
			.post(`podcast/category/create/${accountId}/`, { json: payload })
			.json(),

	updateCategory: (
		accountId: string | number,
		token: string,
		payload: { id: number; name: string; description: string }
	) =>
		createClient(token)
			.put(`podcast/category/update/${accountId}/`, { json: payload })
			.json(),

	deleteCategory: (
		accountId: string | number,
		token: string,
		categoryId: number
	) =>
		createClient(token)
			.delete(`podcast/category/delete/${accountId}/${categoryId}/`)
			.json(),
};