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

	updateEpisodeGuest: (token: Token | undefined, data: UpdateEpisodeGuestPayload): Promise<EpisodeGuest> =>
		radioApi
			.put(`radio/episode/guest/update/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

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

	updateEmission: (token: Token | undefined, data: UpdateEmissionPayload): Promise<Emission> =>
		radioApi
			.put(`radio/emission/update/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

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

	updateEpisode: (token: Token | undefined, data: UpdateEpisodePayload): Promise<Episode> =>
		radioApi
			.put(`radio/episode/update/${accountId(token)}/`, { json: data, headers: authHeaders(token) })
			.json(),

	validateEpisode: (token: Token | undefined, episodeId: number): Promise<Episode> =>
		radioApi
			.patch(`radio/episode/validate/${accountId(token)}/`, { json: { id: episodeId, is_approved_content: true }, headers: authHeaders(token) })
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