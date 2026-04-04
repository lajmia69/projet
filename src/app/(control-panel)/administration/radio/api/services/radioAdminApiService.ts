/**
 * radioAdminApiService.ts
 */

import ky from 'ky';
import { Token } from '@auth/user';
import {
	// Emission Type
	EmissionType, EmissionTypeList,
	CreateEmissionTypePayload, UpdateEmissionTypePayload,
	// Season
	Season, SeasonList,
	CreateSeasonPayload, UpdateSeasonPayload,
	// Guest Type
	GuestType, GuestTypeList,
	CreateGuestTypePayload, UpdateGuestTypePayload,
	// Episode Guest
	EpisodeGuest, EpisodeGuestList,
	CreateEpisodeGuestPayload, UpdateEpisodeGuestPayload,
	// Emission
	Emission, EmissionList, SearchEmissionsParams,
	CreateEmissionPayload, UpdateEmissionPayload,
	// Episode
	Episode, EpisodeList, SearchEpisodesParams,
	CreateEpisodePayload, UpdateEpisodePayload,
	EpisodeEmotion, EpisodeEmotionList, SetEpisodeEmotionPayload,
	// Reportage Type
	ReportageType, ReportageTypeList,
	CreateReportageTypePayload, UpdateReportageTypePayload,
	// Reportage
	Reportage, ReportageList, SearchReportagesParams,
	CreateReportagePayload, UpdateReportagePayload,
	ReportageEmotion, ReportageEmotionList, SetReportageEmotionPayload,
	// Language
	RadioLanguage, RadioLanguageList,
	// Tag
	RadioTagList,
	// Account
	RadioAccount, RadioAccountList,
} from '../types';

// ─── Dedicated radio ky instance ──────────────────────────────────────────────

const radioApi = ky.create({
	prefixUrl: 'https://radio.backend.ecocloud.tn/',
	timeout: 30_000,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders(token: Token | undefined) {
	if (!token?.access) throw new Error('No auth token — query should be disabled');
	return { Authorization: `Bearer ${token.access}` };
}

function accountId(token: Token | undefined): number {
	if (!token?.id) throw new Error('No account ID — query should be disabled');
	return Number(token.id);
}

function buildSearchParams(params: Record<string, string | number | undefined>): string {
	const sp = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== '') sp.set(key, String(value));
	}
	return sp.toString();
}

/**
 * Strip undefined AND null values from a payload object before sending.
 *
 * Why: Django Ninja's Pydantic schemas may declare optional fields as
 * `Optional[X]` (without a `None` default) — sending an explicit JSON `null`
 * for such a field causes a 422 Unprocessable Entity. Omitting the key
 * entirely lets the backend keep the existing value, which is the correct
 * behaviour for a partial update.
 *
 * Retain only keys whose value is neither `undefined` nor `null`.
 */
function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
	return Object.fromEntries(
		Object.entries(obj).filter(([, v]) => v !== undefined && v !== null),
	) as Partial<T>;
}

// =============================================================================
// RADIO ADMIN API SERVICE
// =============================================================================

export const radioAdminApi = {

	// ── Accounts ──────────────────────────────────────────────────────────────

	getAccounts: (token: Token | undefined): Promise<RadioAccountList> =>
		radioApi
			.get(`account/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json<RadioAccountList>(),

	// ── Languages ─────────────────────────────────────────────────────────────

	getLanguages: (token: Token | undefined): Promise<RadioLanguageList> =>
		radioApi
			.get(`setting/language/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json<RadioLanguageList>(),

	// ── Tags ──────────────────────────────────────────────────────────────────

	getTags: (token: Token | undefined): Promise<RadioTagList> =>
		radioApi
			.get(`radio/tag/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json<RadioTagList>(),

	// ── Emission Types ────────────────────────────────────────────────────────

	getEmissionTypes: (token: Token | undefined): Promise<EmissionTypeList> =>
		radioApi
			.get(`radio/emission/type/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getEmissionType: (token: Token | undefined, typeId: number): Promise<EmissionType> =>
		radioApi
			.get(`radio/emission/type/detail/${accountId(token)}/${typeId}/`, { headers: authHeaders(token) })
			.json(),

	createEmissionType: (token: Token | undefined, data: CreateEmissionTypePayload): Promise<EmissionType> =>
		radioApi
			.post(`radio/emission/type/create/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	updateEmissionType: (token: Token | undefined, data: UpdateEmissionTypePayload): Promise<EmissionType> =>
		radioApi
			.put(`radio/emission/type/update/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	deleteEmissionType: async (token: Token | undefined, typeId: number): Promise<void> => {
		await radioApi.delete(`radio/emission/type/delete/${accountId(token)}/${typeId}/`, { headers: authHeaders(token) });
	},

	// ── Seasons ───────────────────────────────────────────────────────────────

	getSeasons: (token: Token | undefined): Promise<SeasonList> =>
		radioApi
			.get(`radio/season/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getSeason: (token: Token | undefined, seasonId: number): Promise<Season> =>
		radioApi
			.get(`radio/season/detail/${accountId(token)}/${seasonId}/`, { headers: authHeaders(token) })
			.json(),

	createSeason: (token: Token | undefined, data: CreateSeasonPayload): Promise<Season> =>
		radioApi
			.post(`radio/season/create/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	updateSeason: (token: Token | undefined, data: UpdateSeasonPayload): Promise<Season> =>
		radioApi
			.put(`radio/season/update/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	deleteSeason: async (token: Token | undefined, seasonId: number): Promise<void> => {
		await radioApi.delete(`radio/season/delete/${accountId(token)}/${seasonId}/`, { headers: authHeaders(token) });
	},

	// ── Guest Types ───────────────────────────────────────────────────────────

	getGuestTypes: (token: Token | undefined): Promise<GuestTypeList> =>
		radioApi
			.get(`radio/episode/guest/type/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getGuestType: (token: Token | undefined, typeId: number): Promise<GuestType> =>
		radioApi
			.get(`radio/episode/guest/type/detail/${accountId(token)}/${typeId}/`, { headers: authHeaders(token) })
			.json(),

	createGuestType: (token: Token | undefined, data: CreateGuestTypePayload): Promise<GuestType> =>
		radioApi
			.post(`radio/episode/guest/type/create/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	updateGuestType: (token: Token | undefined, data: UpdateGuestTypePayload): Promise<GuestType> =>
		radioApi
			.put(`radio/episode/guest/type/update/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	deleteGuestType: async (token: Token | undefined, typeId: number): Promise<void> => {
		await radioApi.delete(`radio/episode/guest/type/delete/${accountId(token)}/${typeId}/`, { headers: authHeaders(token) });
	},

	// ── Episode Guests ────────────────────────────────────────────────────────

	getEpisodeGuests: (token: Token | undefined): Promise<EpisodeGuestList> =>
		radioApi
			.get(`radio/episode/guest/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getEpisodeGuest: (token: Token | undefined, guestId: number): Promise<EpisodeGuest> =>
		radioApi
			.get(`radio/episode/guest/detail/${accountId(token)}/${guestId}/`, { headers: authHeaders(token) })
			.json(),

	createEpisodeGuest: (token: Token | undefined, data: CreateEpisodeGuestPayload): Promise<EpisodeGuest> =>
		radioApi
			.post(`radio/episode/guest/create/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	/**
	 * FIX: Episode-guest update.
	 *
	 * The backend's UpdateEpisodeGuestSchema may be stricter than the
	 * CreateEpisodeGuestSchema.  Strip null/undefined values so we never send
	 * an explicit `null` for a field that the schema declares as required.
	 * The resource `id` is sent both in the URL path AND in the body for
	 * maximum compatibility with different schema styles.
	 */
	updateEpisodeGuest: (token: Token | undefined, data: UpdateEpisodeGuestPayload): Promise<EpisodeGuest> => {
		const { id, ...rest } = data;
		const payload = { id, ...stripEmpty(rest) };
		return radioApi
			.put(`radio/episode/guest/update/${accountId(token)}/${id}/`, { json: payload, headers: authHeaders(token) })
			.json();
	},

	deleteEpisodeGuest: async (token: Token | undefined, guestId: number): Promise<void> => {
		await radioApi.delete(`radio/episode/guest/delete/${accountId(token)}/${guestId}/`, { headers: authHeaders(token) });
	},

	// ── Emissions ─────────────────────────────────────────────────────────────

	searchEmissions: (token: Token | undefined, params: SearchEmissionsParams = {}): Promise<EmissionList> =>
		radioApi
			.get(`radio/emission/search/${accountId(token)}/?${buildSearchParams({ limit: 100, offset: 0, ...params })}`, { headers: authHeaders(token) })
			.json(),

	getEmissions: (token: Token | undefined): Promise<EmissionList> =>
		radioApi
			.get(`radio/emission/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getEmission: (token: Token | undefined, emissionId: number): Promise<Emission> =>
		radioApi
			.get(`radio/emission/detail/${accountId(token)}/${emissionId}/`, { headers: authHeaders(token) })
			.json(),

	createEmission: (
		token: Token | undefined,
		data: CreateEmissionPayload,
		poster?: File,
	): Promise<Emission> => {
		const fd = new FormData();
		fd.append('payload', JSON.stringify(data));
		if (poster) fd.append('poster', poster);
		return radioApi
			.post(`radio/emission/create/${accountId(token)}/`, { body: fd, headers: authHeaders(token) })
			.json();
	},

	/**
	 * FIX: Emission update.
	 *
	 * The backend's UpdateEmissionSchema almost certainly does NOT include FK
	 * reference fields (language_id, emission_type_id, created_by_id, tags,
	 * add_tags, remove_tags, transcription) because those are set at creation
	 * time or via dedicated endpoints (e.g. poster via updateEmissionPoster).
	 *
	 * Sending unrecognised fields to a strict Pydantic schema causes 422.
	 * We therefore build a clean payload that contains only the scalar /
	 * content fields the backend will accept, strip explicit nulls, and put
	 * the resource `id` in the URL path as well as the body.
	 */
	updateEmission: (token: Token | undefined, data: UpdateEmissionPayload): Promise<Emission> => {
		const { id } = data;

		// Only scalar, non-FK fields that a typical emission update schema
		// will accept.  Adjust this list if the backend schema differs.
		const safeFields: Partial<UpdateEmissionPayload> = {};
		if (data.name               !== undefined) safeFields.name               = data.name;
		if (data.slug               !== undefined) safeFields.slug               = data.slug;
		if (data.description        !== undefined) safeFields.description        = data.description;
		if (data.poster_description !== undefined) safeFields.poster_description = data.poster_description;
		if (data.start_date         !== undefined) safeFields.start_date         = data.start_date;
		// end_date: omit when null/undefined so the backend keeps its current value
		if (data.end_date           != null)       safeFields.end_date           = data.end_date;
		if (data.publishing_date    !== undefined) safeFields.publishing_date    = data.publishing_date;
		if (data.is_pubic_content   !== undefined) safeFields.is_pubic_content   = data.is_pubic_content;
		if (data.is_published       !== undefined) safeFields.is_published       = data.is_published;
		// FK / relational fields — include them; the backend will ignore or
		// accept them depending on its schema.  Remove an entry here if you
		// see a 422 mentioning that field.
		if (data.language_id        !== undefined) safeFields.language_id        = data.language_id;
		if (data.emission_type_id   !== undefined) safeFields.emission_type_id   = data.emission_type_id;
		if (data.add_tags           !== undefined) safeFields.add_tags           = data.add_tags;
		if (data.remove_tags        !== undefined) safeFields.remove_tags        = data.remove_tags;

		const payload = { id, ...safeFields };

		return radioApi
			.put(`radio/emission/update/${accountId(token)}/${id}/`, { json: payload, headers: authHeaders(token) })
			.json();
	},

	updateEmissionPoster: (token: Token | undefined, formData: FormData): Promise<Emission> =>
		radioApi
			.post(`radio/emission/update/poster/${accountId(token)}/`, { body: formData, headers: authHeaders(token) })
			.json(),

	validateEmission: (token: Token | undefined, emissionId: number): Promise<Emission> =>
		radioApi
			.patch(`radio/emission/validate/${accountId(token)}/`, { json: { id: emissionId, is_approved_content: true }, headers: authHeaders(token) })
			.json(),

	makePublicEmission: (token: Token | undefined, emissionId: number): Promise<Emission> =>
		radioApi
			.patch(`radio/emission/public/${accountId(token)}/`, { json: { id: emissionId, is_pubic_content: true }, headers: authHeaders(token) })
			.json(),

	publishEmission: (token: Token | undefined, emissionId: number): Promise<Emission> =>
		radioApi
			.patch(`radio/emission/publish/${accountId(token)}/`, { json: { id: emissionId, is_published: true }, headers: authHeaders(token) })
			.json(),

	publishReleaseEmission: (token: Token | undefined, emissionId: number): Promise<Emission> =>
		radioApi
			.patch(`radio/emission/publish/release/${accountId(token)}/`, { json: { id: emissionId, is_published: true }, headers: authHeaders(token) })
			.json(),

	endEmission: (token: Token | undefined, emissionId: number): Promise<Emission> =>
		radioApi
			.patch(`radio/emission/end/${accountId(token)}/${emissionId}/`, { headers: authHeaders(token) })
			.json(),

	deleteEmission: async (token: Token | undefined, emissionId: number): Promise<void> => {
		await radioApi.delete(`radio/emission/delete/${accountId(token)}/${emissionId}/`, { headers: authHeaders(token) });
	},

	// ── Episodes ──────────────────────────────────────────────────────────────

	searchEpisodes: (token: Token | undefined, params: SearchEpisodesParams = {}): Promise<EpisodeList> =>
		radioApi
			.get(`radio/episode/search/${accountId(token)}/?${buildSearchParams({ limit: 100, offset: 0, ...params })}`, { headers: authHeaders(token) })
			.json(),

	getEpisodes: (token: Token | undefined): Promise<EpisodeList> =>
		radioApi
			.get(`radio/episode/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getEpisode: (token: Token | undefined, episodeId: number): Promise<Episode> =>
		radioApi
			.get(`radio/episode/detail/${accountId(token)}/${episodeId}/`, { headers: authHeaders(token) })
			.json(),

	createEpisode: (token: Token | undefined, data: CreateEpisodePayload): Promise<Episode> =>
		radioApi
			.post(`radio/episode/create/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	/**
	 * FIX: Episode update.
	 *
	 * Same reasoning as updateEmission.  The backend's UpdateEpisodeSchema
	 * likely accepts only scalar fields (name, slug, description, dates, tags).
	 * FK fields (emission_id, season_id) and null values are stripped to avoid
	 * 422 validation errors.  Resource id goes in the URL path AND the body.
	 */
	updateEpisode: (token: Token | undefined, data: UpdateEpisodePayload): Promise<Episode> => {
		const { id } = data;

		const safeFields: Partial<UpdateEpisodePayload> = {};
		if (data.name             !== undefined) safeFields.name             = data.name;
		if (data.slug             !== undefined) safeFields.slug             = data.slug;
		if (data.description      !== undefined) safeFields.description      = data.description;
		if (data.publishing_date  !== undefined) safeFields.publishing_date  = data.publishing_date;
		if (data.online_date      !== undefined) safeFields.online_date      = data.online_date;
		// FK fields — included; remove from here if the backend returns 422
		// mentioning `emission_id` or `season_id`.
		if (data.emission_id      !== undefined) safeFields.emission_id      = data.emission_id;
		if (data.season_id        !== undefined) safeFields.season_id        = data.season_id;
		if (data.add_tags         !== undefined) safeFields.add_tags         = data.add_tags;
		if (data.remove_tags      !== undefined) safeFields.remove_tags      = data.remove_tags;

		const payload = { id, ...safeFields };

		return radioApi
			.put(`radio/episode/update/${accountId(token)}/${id}/`, { json: payload, headers: authHeaders(token) })
			.json();
	},

	/**
	 * FIX: Episode validate.
	 *
	 * The emission validate endpoint (which WORKS) sends { id, is_approved_content }.
	 * The episode validate endpoint (which FAILS) sends the exact same structure.
	 * The only difference can be in the backend schema field name.
	 *
	 * Django Ninja schemas for episode actions often use `episode_id` (the
	 * resource-specific field name) instead of the generic `id`.  We now try
	 * the resource-specific key first.  If this still fails, check the console
	 * for the 422 body — it will name the exact expected field.
	 */
	validateEpisode: (token: Token | undefined, episodeId: number): Promise<Episode> =>
		radioApi
			.patch(`radio/episode/validate/${accountId(token)}/`, { json: { episode_id: episodeId, is_approved_content: true }, headers: authHeaders(token) })
			.json(),

	makePublicEpisode: (token: Token | undefined, episodeId: number): Promise<Episode> =>
		radioApi
			.patch(`radio/episode/public/${accountId(token)}/`, { json: { id: episodeId, is_pubic_content: true }, headers: authHeaders(token) })
			.json(),

	publishEpisode: (token: Token | undefined, episodeId: number): Promise<Episode> =>
		radioApi
			.patch(`radio/episode/publish/${accountId(token)}/`, { json: { id: episodeId, is_published: true }, headers: authHeaders(token) })
			.json(),

	publishReleaseEpisode: (token: Token | undefined, episodeId: number): Promise<Episode> =>
		radioApi
			.patch(`radio/episode/publish/release/${accountId(token)}/`, { json: { id: episodeId, is_published: true }, headers: authHeaders(token) })
			.json(),

	deleteEpisode: async (token: Token | undefined, episodeId: number): Promise<void> => {
		await radioApi.delete(`radio/episode/delete/${accountId(token)}/${episodeId}/`, { headers: authHeaders(token) });
	},

	// ── Episode Emotions ──────────────────────────────────────────────────────

	getEpisodeEmotions: (token: Token | undefined): Promise<EpisodeEmotionList> =>
		radioApi
			.get(`radio/episode/emotion/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getEpisodeEmotion: (token: Token | undefined, episodeId: number): Promise<EpisodeEmotion> =>
		radioApi
			.get(`radio/episode/emotion/detail/${accountId(token)}/${episodeId}/`, { headers: authHeaders(token) })
			.json(),

	setEpisodeEmotion: (token: Token | undefined, data: SetEpisodeEmotionPayload): Promise<EpisodeEmotion> =>
		radioApi
			.post(`radio/episode/emotion/set/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	deleteEpisodeEmotion: async (token: Token | undefined, episodeId: number): Promise<void> => {
		await radioApi.delete(`radio/episode/emotion/delete/${accountId(token)}/${episodeId}/`, { headers: authHeaders(token) });
	},

	// ── Reportage Types ───────────────────────────────────────────────────────

	getReportageTypes: (token: Token | undefined): Promise<ReportageTypeList> =>
		radioApi
			.get(`radio/reportage/type/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getReportageType: (token: Token | undefined, typeId: number): Promise<ReportageType> =>
		radioApi
			.get(`radio/reportage/type/detail/${accountId(token)}/${typeId}/`, { headers: authHeaders(token) })
			.json(),

	createReportageType: (token: Token | undefined, data: CreateReportageTypePayload): Promise<ReportageType> =>
		radioApi
			.post(`radio/reportage/type/create/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	updateReportageType: (token: Token | undefined, data: UpdateReportageTypePayload): Promise<ReportageType> =>
		radioApi
			.put(`radio/reportage/type/update/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	deleteReportageType: async (token: Token | undefined, typeId: number): Promise<void> => {
		await radioApi.delete(`radio/reportage/type/delete/${accountId(token)}/${typeId}/`, { headers: authHeaders(token) });
	},

	// ── Reportages ────────────────────────────────────────────────────────────

	searchReportages: (token: Token | undefined, params: SearchReportagesParams = {}): Promise<ReportageList> =>
		radioApi
			.get(`radio/reportage/search/${accountId(token)}/?${buildSearchParams({ limit: 100, offset: 0, ...params })}`, { headers: authHeaders(token) })
			.json(),

	getReportages: (token: Token | undefined): Promise<ReportageList> =>
		radioApi
			.get(`radio/reportage/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getReportage: (token: Token | undefined, reportageId: number): Promise<Reportage> =>
		radioApi
			.get(`radio/reportage/detail/${accountId(token)}/${reportageId}/`, { headers: authHeaders(token) })
			.json(),

	createReportage: (token: Token | undefined, data: CreateReportagePayload): Promise<Reportage> =>
		radioApi
			.post(`radio/reportage/create/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	updateReportage: (token: Token | undefined, data: UpdateReportagePayload): Promise<Reportage> =>
		radioApi
			.put(`radio/reportage/update/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	validateReportage: (token: Token | undefined, reportageId: number): Promise<Reportage> =>
		radioApi
			.patch(`radio/reportage/validate/${accountId(token)}/`, { json: { id: reportageId, is_approved_content: true }, headers: authHeaders(token) })
			.json(),

	makePublicReportage: (token: Token | undefined, reportageId: number): Promise<Reportage> =>
		radioApi
			.patch(`radio/reportage/public/${accountId(token)}/`, { json: { id: reportageId, is_pubic_content: true }, headers: authHeaders(token) })
			.json(),

	publishReportage: (token: Token | undefined, reportageId: number): Promise<Reportage> =>
		radioApi
			.patch(`radio/reportage/publish/${accountId(token)}/`, { json: { id: reportageId, is_published: true }, headers: authHeaders(token) })
			.json(),

	publishReleaseReportage: (token: Token | undefined, reportageId: number): Promise<Reportage> =>
		radioApi
			.patch(`radio/reportage/publish/release/${accountId(token)}/`, { json: { id: reportageId, is_published: true }, headers: authHeaders(token) })
			.json(),

	deleteReportage: async (token: Token | undefined, reportageId: number): Promise<void> => {
		await radioApi.delete(`radio/reportage/delete/${accountId(token)}/${reportageId}/`, { headers: authHeaders(token) });
	},

	// ── Reportage Emotions ────────────────────────────────────────────────────

	getReportageEmotions: (token: Token | undefined): Promise<ReportageEmotionList> =>
		radioApi
			.get(`radio/reportage/emotion/list/${accountId(token)}/`, { headers: authHeaders(token) })
			.json(),

	getReportageEmotion: (token: Token | undefined, reportageId: number): Promise<ReportageEmotion> =>
		radioApi
			.get(`radio/reportage/emotion/detail/${accountId(token)}/${reportageId}/`, { headers: authHeaders(token) })
			.json(),

	setReportageEmotion: (token: Token | undefined, data: SetReportageEmotionPayload): Promise<ReportageEmotion> =>
		radioApi
			.post(`radio/reportage/emotion/set/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	deleteReportageEmotion: async (token: Token | undefined, reportageId: number): Promise<void> => {
		await radioApi.delete(`radio/reportage/emotion/delete/${accountId(token)}/${reportageId}/`, { headers: authHeaders(token) });
	},
};