import { api } from '@/utils/api';
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
	EmissionEmotion, EmissionEmotionList, SetEmissionEmotionPayload,
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
} from '../types';

const auth = (token: Token) => ({
	headers: { Authorization: `Bearer ${token.access}` }
});

const id = (token: Token) => token.id;

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildSearchParams(params: Record<string, string | number | undefined>): string {
	const sp = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== '') {
			sp.set(key, String(value));
		}
	}
	return sp.toString();
}

// =============================================================================
// RADIO ADMIN API SERVICE
// =============================================================================

export const radioAdminApi = {

	// ──────────────────────────────────────────────────────────────────────────
	// LANGUAGES  (read-only reference, reuses setting endpoint)
	// ──────────────────────────────────────────────────────────────────────────

	getLanguages: (token: Token): Promise<RadioLanguageList> =>
		api.get(`setting/language/list/${id(token)}/`, auth(token)).json(),

	// ──────────────────────────────────────────────────────────────────────────
	// EMISSION TYPES
	// GET    radio/emission/type/list/{id}/
	// GET    radio/emission/type/detail/{id}/{typeId}/
	// POST   radio/emission/type/create/{id}/
	// PUT    radio/emission/type/update/{id}/
	// DELETE radio/emission/type/delete/{id}/{typeId}/
	// ──────────────────────────────────────────────────────────────────────────

	getEmissionTypes: (token: Token): Promise<EmissionTypeList> =>
		api.get(`radio/emission/type/list/${id(token)}/`, auth(token)).json(),

	getEmissionType: (token: Token, typeId: number): Promise<EmissionType> =>
		api.get(`radio/emission/type/detail/${id(token)}/${typeId}/`, auth(token)).json(),

	createEmissionType: (token: Token, data: CreateEmissionTypePayload): Promise<EmissionType> =>
		api.post(`radio/emission/type/create/${id(token)}/`, { json: data, ...auth(token) }).json(),

	updateEmissionType: (token: Token, data: UpdateEmissionTypePayload): Promise<EmissionType> =>
		api.put(`radio/emission/type/update/${id(token)}/`, { json: data, ...auth(token) }).json(),

	deleteEmissionType: async (token: Token, typeId: number): Promise<void> => {
		await api.delete(`radio/emission/type/delete/${id(token)}/${typeId}/`, auth(token));
	},

	// ──────────────────────────────────────────────────────────────────────────
	// SEASONS
	// GET    radio/season/list/{id}/
	// GET    radio/season/detail/{id}/{seasonId}/
	// POST   radio/season/create/{id}/
	// PUT    radio/season/update/{id}/
	// DELETE radio/season/delete/{id}/{seasonId}/
	// ──────────────────────────────────────────────────────────────────────────

	getSeasons: (token: Token): Promise<SeasonList> =>
		api.get(`radio/season/list/${id(token)}/`, auth(token)).json(),

	getSeason: (token: Token, seasonId: number): Promise<Season> =>
		api.get(`radio/season/detail/${id(token)}/${seasonId}/`, auth(token)).json(),

	createSeason: (token: Token, data: CreateSeasonPayload): Promise<Season> =>
		api.post(`radio/season/create/${id(token)}/`, { json: data, ...auth(token) }).json(),

	updateSeason: (token: Token, data: UpdateSeasonPayload): Promise<Season> =>
		api.put(`radio/season/update/${id(token)}/`, { json: data, ...auth(token) }).json(),

	deleteSeason: async (token: Token, seasonId: number): Promise<void> => {
		await api.delete(`radio/season/delete/${id(token)}/${seasonId}/`, auth(token));
	},

	// ──────────────────────────────────────────────────────────────────────────
	// GUEST TYPES
	// GET    radio/episode/guest/type/list/{id}/
	// GET    radio/episode/guest/type/detail/{id}/{typeId}/
	// POST   radio/episode/guest/type/create/{id}/
	// PUT    radio/episode/guest/type/update/{id}/
	// DELETE radio/episode/guest/type/delete/{id}/{typeId}/
	// ──────────────────────────────────────────────────────────────────────────

	getGuestTypes: (token: Token): Promise<GuestTypeList> =>
		api.get(`radio/episode/guest/type/list/${id(token)}/`, auth(token)).json(),

	getGuestType: (token: Token, typeId: number): Promise<GuestType> =>
		api.get(`radio/episode/guest/type/detail/${id(token)}/${typeId}/`, auth(token)).json(),

	createGuestType: (token: Token, data: CreateGuestTypePayload): Promise<GuestType> =>
		api.post(`radio/episode/guest/type/create/${id(token)}/`, { json: data, ...auth(token) }).json(),

	updateGuestType: (token: Token, data: UpdateGuestTypePayload): Promise<GuestType> =>
		api.put(`radio/episode/guest/type/update/${id(token)}/`, { json: data, ...auth(token) }).json(),

	deleteGuestType: async (token: Token, typeId: number): Promise<void> => {
		await api.delete(`radio/episode/guest/type/delete/${id(token)}/${typeId}/`, auth(token));
	},

	// ──────────────────────────────────────────────────────────────────────────
	// EPISODE GUESTS
	// GET    radio/episode/guest/list/{id}/
	// GET    radio/episode/guest/detail/{id}/{guestId}/
	// POST   radio/episode/guest/create/{id}/
	// PUT    radio/episode/guest/update/{id}/
	// DELETE radio/episode/guest/delete/{id}/{guestId}/
	// ──────────────────────────────────────────────────────────────────────────

	getEpisodeGuests: (token: Token): Promise<EpisodeGuestList> =>
		api.get(`radio/episode/guest/list/${id(token)}/`, auth(token)).json(),

	getEpisodeGuest: (token: Token, guestId: number): Promise<EpisodeGuest> =>
		api.get(`radio/episode/guest/detail/${id(token)}/${guestId}/`, auth(token)).json(),

	createEpisodeGuest: (token: Token, data: CreateEpisodeGuestPayload): Promise<EpisodeGuest> =>
		api.post(`radio/episode/guest/create/${id(token)}/`, { json: data, ...auth(token) }).json(),

	updateEpisodeGuest: (token: Token, data: UpdateEpisodeGuestPayload): Promise<EpisodeGuest> =>
		api.put(`radio/episode/guest/update/${id(token)}/`, { json: data, ...auth(token) }).json(),

	deleteEpisodeGuest: async (token: Token, guestId: number): Promise<void> => {
		await api.delete(`radio/episode/guest/delete/${id(token)}/${guestId}/`, auth(token));
	},

	// ──────────────────────────────────────────────────────────────────────────
	// EMISSIONS
	// GET    radio/emission/search/{id}/?limit&offset&language&emission_type&season
	// GET    radio/emission/list/{id}/
	// GET    radio/emission/detail/{id}/{emissionId}/
	// POST   radio/emission/create/{id}/
	// PUT    radio/emission/update/{id}/
	// POST   radio/emission/update/poster/{id}/   (multipart)
	// PATCH  radio/emission/validate/{id}/
	// PATCH  radio/emission/public/{id}/
	// PATCH  radio/emission/publish/{id}/
	// PATCH  radio/emission/publish/release/{id}/
	// PATCH  radio/emission/end/{id}/{emissionId}/
	// DELETE radio/emission/delete/{id}/{emissionId}/
	// ──────────────────────────────────────────────────────────────────────────

	searchEmissions: (token: Token, params: SearchEmissionsParams = {}): Promise<EmissionList> =>
		api.get(
			`radio/emission/search/${id(token)}/?${buildSearchParams({ limit: 100, offset: 0, ...params })}`,
			auth(token)
		).json(),

	getEmissions: (token: Token): Promise<EmissionList> =>
		api.get(`radio/emission/list/${id(token)}/`, auth(token)).json(),

	getEmission: (token: Token, emissionId: number): Promise<Emission> =>
		api.get(`radio/emission/detail/${id(token)}/${emissionId}/`, auth(token)).json(),

	createEmission: (token: Token, data: CreateEmissionPayload): Promise<Emission> =>
		api.post(`radio/emission/create/${id(token)}/`, { json: data, ...auth(token) }).json(),

	updateEmission: (token: Token, data: UpdateEmissionPayload): Promise<Emission> =>
		api.put(`radio/emission/update/${id(token)}/`, { json: data, ...auth(token) }).json(),

	updateEmissionPoster: (token: Token, formData: FormData): Promise<Emission> =>
		api.post(`radio/emission/update/poster/${id(token)}/`, { body: formData, ...auth(token) }).json(),

	validateEmission: (token: Token, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/validate/${id(token)}/`, { json: { id: emissionId }, ...auth(token) }).json(),

	makePublicEmission: (token: Token, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/public/${id(token)}/`, { json: { id: emissionId }, ...auth(token) }).json(),

	publishEmission: (token: Token, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/publish/${id(token)}/`, { json: { id: emissionId }, ...auth(token) }).json(),

	publishReleaseEmission: (token: Token, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/publish/release/${id(token)}/`, { json: { id: emissionId }, ...auth(token) }).json(),

	endEmission: (token: Token, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/end/${id(token)}/${emissionId}/`, auth(token)).json(),

	deleteEmission: async (token: Token, emissionId: number): Promise<void> => {
		await api.delete(`radio/emission/delete/${id(token)}/${emissionId}/`, auth(token));
	},

	// ── Emission Emotions ─────────────────────────────────────────────────────
	// GET   radio/emission/emotion/list/{id}/
	// GET   radio/emission/emotion/detail/{id}/{emissionId}/
	// POST  radio/emission/emotion/set/{id}/
	// DELETE radio/emission/emotion/delete/{id}/{emissionId}/

	getEmissionEmotions: (token: Token): Promise<EmissionEmotionList> =>
		api.get(`radio/emission/emotion/list/${id(token)}/`, auth(token)).json(),

	getEmissionEmotion: (token: Token, emissionId: number): Promise<EmissionEmotion> =>
		api.get(`radio/emission/emotion/detail/${id(token)}/${emissionId}/`, auth(token)).json(),

	setEmissionEmotion: (token: Token, data: SetEmissionEmotionPayload): Promise<EmissionEmotion> =>
		api.post(`radio/emission/emotion/set/${id(token)}/`, { json: data, ...auth(token) }).json(),

	deleteEmissionEmotion: async (token: Token, emissionId: number): Promise<void> => {
		await api.delete(`radio/emission/emotion/delete/${id(token)}/${emissionId}/`, auth(token));
	},

	// ──────────────────────────────────────────────────────────────────────────
	// EPISODES
	// GET    radio/episode/search/{id}/?limit&offset&language&emission&season
	// GET    radio/episode/list/{id}/
	// GET    radio/episode/detail/{id}/{episodeId}/
	// POST   radio/episode/create/{id}/
	// PUT    radio/episode/update/{id}/
	// PATCH  radio/episode/validate/{id}/
	// PATCH  radio/episode/public/{id}/
	// PATCH  radio/episode/publish/{id}/
	// PATCH  radio/episode/publish/release/{id}/
	// DELETE radio/episode/delete/{id}/{episodeId}/
	// ──────────────────────────────────────────────────────────────────────────

	searchEpisodes: (token: Token, params: SearchEpisodesParams = {}): Promise<EpisodeList> =>
		api.get(
			`radio/episode/search/${id(token)}/?${buildSearchParams({ limit: 100, offset: 0, ...params })}`,
			auth(token)
		).json(),

	getEpisodes: (token: Token): Promise<EpisodeList> =>
		api.get(`radio/episode/list/${id(token)}/`, auth(token)).json(),

	getEpisode: (token: Token, episodeId: number): Promise<Episode> =>
		api.get(`radio/episode/detail/${id(token)}/${episodeId}/`, auth(token)).json(),

	createEpisode: (token: Token, data: CreateEpisodePayload): Promise<Episode> =>
		api.post(`radio/episode/create/${id(token)}/`, { json: data, ...auth(token) }).json(),

	updateEpisode: (token: Token, data: UpdateEpisodePayload): Promise<Episode> =>
		api.put(`radio/episode/update/${id(token)}/`, { json: data, ...auth(token) }).json(),

	validateEpisode: (token: Token, episodeId: number): Promise<Episode> =>
		api.patch(`radio/episode/validate/${id(token)}/`, { json: { id: episodeId }, ...auth(token) }).json(),

	makePublicEpisode: (token: Token, episodeId: number): Promise<Episode> =>
		api.patch(`radio/episode/public/${id(token)}/`, { json: { id: episodeId }, ...auth(token) }).json(),

	publishEpisode: (token: Token, episodeId: number): Promise<Episode> =>
		api.patch(`radio/episode/publish/${id(token)}/`, { json: { id: episodeId }, ...auth(token) }).json(),

	publishReleaseEpisode: (token: Token, episodeId: number): Promise<Episode> =>
		api.patch(`radio/episode/publish/release/${id(token)}/`, { json: { id: episodeId }, ...auth(token) }).json(),

	deleteEpisode: async (token: Token, episodeId: number): Promise<void> => {
		await api.delete(`radio/episode/delete/${id(token)}/${episodeId}/`, auth(token));
	},

	// ── Episode Emotions ──────────────────────────────────────────────────────
	getEpisodeEmotions: (token: Token): Promise<EpisodeEmotionList> =>
		api.get(`radio/episode/emotion/list/${id(token)}/`, auth(token)).json(),

	getEpisodeEmotion: (token: Token, episodeId: number): Promise<EpisodeEmotion> =>
		api.get(`radio/episode/emotion/detail/${id(token)}/${episodeId}/`, auth(token)).json(),

	setEpisodeEmotion: (token: Token, data: SetEpisodeEmotionPayload): Promise<EpisodeEmotion> =>
		api.post(`radio/episode/emotion/set/${id(token)}/`, { json: data, ...auth(token) }).json(),

	deleteEpisodeEmotion: async (token: Token, episodeId: number): Promise<void> => {
		await api.delete(`radio/episode/emotion/delete/${id(token)}/${episodeId}/`, auth(token));
	},

	// ──────────────────────────────────────────────────────────────────────────
	// REPORTAGE TYPES
	// GET    radio/reportage/type/list/{id}/
	// GET    radio/reportage/type/detail/{id}/{typeId}/
	// POST   radio/reportage/type/create/{id}/
	// PUT    radio/reportage/type/update/{id}/
	// DELETE radio/reportage/type/delete/{id}/{typeId}/
	// ──────────────────────────────────────────────────────────────────────────

	getReportageTypes: (token: Token): Promise<ReportageTypeList> =>
		api.get(`radio/reportage/type/list/${id(token)}/`, auth(token)).json(),

	getReportageType: (token: Token, typeId: number): Promise<ReportageType> =>
		api.get(`radio/reportage/type/detail/${id(token)}/${typeId}/`, auth(token)).json(),

	createReportageType: (token: Token, data: CreateReportageTypePayload): Promise<ReportageType> =>
		api.post(`radio/reportage/type/create/${id(token)}/`, { json: data, ...auth(token) }).json(),

	updateReportageType: (token: Token, data: UpdateReportageTypePayload): Promise<ReportageType> =>
		api.put(`radio/reportage/type/update/${id(token)}/`, { json: data, ...auth(token) }).json(),

	deleteReportageType: async (token: Token, typeId: number): Promise<void> => {
		await api.delete(`radio/reportage/type/delete/${id(token)}/${typeId}/`, auth(token));
	},

	// ──────────────────────────────────────────────────────────────────────────
	// REPORTAGES
	// GET    radio/reportage/search/{id}/?limit&offset&language&reportage_type
	// GET    radio/reportage/list/{id}/
	// GET    radio/reportage/detail/{id}/{reportageId}/
	// POST   radio/reportage/create/{id}/
	// PUT    radio/reportage/update/{id}/
	// PATCH  radio/reportage/validate/{id}/
	// PATCH  radio/reportage/public/{id}/
	// PATCH  radio/reportage/publish/{id}/
	// PATCH  radio/reportage/publish/release/{id}/
	// DELETE radio/reportage/delete/{id}/{reportageId}/
	// ──────────────────────────────────────────────────────────────────────────

	searchReportages: (token: Token, params: SearchReportagesParams = {}): Promise<ReportageList> =>
		api.get(
			`radio/reportage/search/${id(token)}/?${buildSearchParams({ limit: 100, offset: 0, ...params })}`,
			auth(token)
		).json(),

	getReportages: (token: Token): Promise<ReportageList> =>
		api.get(`radio/reportage/list/${id(token)}/`, auth(token)).json(),

	getReportage: (token: Token, reportageId: number): Promise<Reportage> =>
		api.get(`radio/reportage/detail/${id(token)}/${reportageId}/`, auth(token)).json(),

	createReportage: (token: Token, data: CreateReportagePayload): Promise<Reportage> =>
		api.post(`radio/reportage/create/${id(token)}/`, { json: data, ...auth(token) }).json(),

	updateReportage: (token: Token, data: UpdateReportagePayload): Promise<Reportage> =>
		api.put(`radio/reportage/update/${id(token)}/`, { json: data, ...auth(token) }).json(),

	validateReportage: (token: Token, reportageId: number): Promise<Reportage> =>
		api.patch(`radio/reportage/validate/${id(token)}/`, { json: { id: reportageId }, ...auth(token) }).json(),

	makePublicReportage: (token: Token, reportageId: number): Promise<Reportage> =>
		api.patch(`radio/reportage/public/${id(token)}/`, { json: { id: reportageId }, ...auth(token) }).json(),

	publishReportage: (token: Token, reportageId: number): Promise<Reportage> =>
		api.patch(`radio/reportage/publish/${id(token)}/`, { json: { id: reportageId }, ...auth(token) }).json(),

	publishReleaseReportage: (token: Token, reportageId: number): Promise<Reportage> =>
		api.patch(`radio/reportage/publish/release/${id(token)}/`, { json: { id: reportageId }, ...auth(token) }).json(),

	deleteReportage: async (token: Token, reportageId: number): Promise<void> => {
		await api.delete(`radio/reportage/delete/${id(token)}/${reportageId}/`, auth(token));
	},

	// ── Reportage Emotions ────────────────────────────────────────────────────
	getReportageEmotions: (token: Token): Promise<ReportageEmotionList> =>
		api.get(`radio/reportage/emotion/list/${id(token)}/`, auth(token)).json(),

	getReportageEmotion: (token: Token, reportageId: number): Promise<ReportageEmotion> =>
		api.get(`radio/reportage/emotion/detail/${id(token)}/${reportageId}/`, auth(token)).json(),

	setReportageEmotion: (token: Token, data: SetReportageEmotionPayload): Promise<ReportageEmotion> =>
		api.post(`radio/reportage/emotion/set/${id(token)}/`, { json: data, ...auth(token) }).json(),

	deleteReportageEmotion: async (token: Token, reportageId: number): Promise<void> => {
		await api.delete(`radio/reportage/emotion/delete/${id(token)}/${reportageId}/`, auth(token));
	},
};