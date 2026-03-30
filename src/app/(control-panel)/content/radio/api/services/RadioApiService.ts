import { api } from '@/utils/api';
import {
	// Emission Type
	EmissionType, EmissionTypeList, CreateEmissionTypePayload, UpdateEmissionTypePayload,
	// Season
	Season, SeasonList, CreateSeasonPayload, UpdateSeasonPayload,
	// Guest Type
	GuestType, GuestTypeList, CreateGuestTypePayload, UpdateGuestTypePayload,
	// Episode Guest
	EpisodeGuest, EpisodeGuestList, CreateEpisodeGuestPayload, UpdateEpisodeGuestPayload,
	// Emission
	Emission, EmissionList, SearchEmissions, CreateEmissionPayload, UpdateEmissionPayload,
	EmissionEmotion, EmissionEmotionList, SetEmissionEmotionPayload,
	// Episode
	Episode, EpisodeList, SearchEpisodes, CreateEpisodePayload, UpdateEpisodePayload,
	EpisodeEmotion, EpisodeEmotionList, SetEpisodeEmotionPayload,
	// Reportage Type
	ReportageType, ReportageTypeList, CreateReportageTypePayload, UpdateReportageTypePayload,
	// Reportage
	Reportage, ReportageList, SearchReportages, CreateReportagePayload, UpdateReportagePayload,
	ReportageEmotion, ReportageEmotionList, SetReportageEmotionPayload,
} from '../types';

const authHeader = (accessToken: string) => ({
	headers: { Authorization: `Bearer ${accessToken}` }
});

export const radioApi = {

	// ════════════════════════════════════════════════════════════════════════════
	// EMISSION TYPE
	// ════════════════════════════════════════════════════════════════════════════

	getEmissionTypes: (id: string, token: string): Promise<EmissionTypeList> =>
		api.get(`radio/emission/type/list/${id}/`, authHeader(token)).json(),

	getEmissionType: (id: string, token: string, typeId: number): Promise<EmissionType> =>
		api.get(`radio/emission/type/detail/${id}/${typeId}/`, authHeader(token)).json(),

	createEmissionType: (id: string, token: string, data: CreateEmissionTypePayload): Promise<EmissionType> =>
		api.post(`radio/emission/type/create/${id}/`, { json: data, ...authHeader(token) }).json(),

	updateEmissionType: (id: string, token: string, data: UpdateEmissionTypePayload): Promise<EmissionType> =>
		api.put(`radio/emission/type/update/${id}/`, { json: data, ...authHeader(token) }).json(),

	deleteEmissionType: async (id: string, token: string, typeId: number): Promise<void> => {
		await api.delete(`radio/emission/type/delete/${id}/${typeId}/`, authHeader(token));
	},

	// ════════════════════════════════════════════════════════════════════════════
	// SEASON
	// ════════════════════════════════════════════════════════════════════════════

	getSeasons: (id: string, token: string): Promise<SeasonList> =>
		api.get(`radio/season/list/${id}/`, authHeader(token)).json(),

	getSeason: (id: string, token: string, seasonId: number): Promise<Season> =>
		api.get(`radio/season/detail/${id}/${seasonId}/`, authHeader(token)).json(),

	createSeason: (id: string, token: string, data: CreateSeasonPayload): Promise<Season> =>
		api.post(`radio/season/create/${id}/`, { json: data, ...authHeader(token) }).json(),

	updateSeason: (id: string, token: string, data: UpdateSeasonPayload): Promise<Season> =>
		api.put(`radio/season/update/${id}/`, { json: data, ...authHeader(token) }).json(),

	deleteSeason: async (id: string, token: string, seasonId: number): Promise<void> => {
		await api.delete(`radio/season/delete/${id}/${seasonId}/`, authHeader(token));
	},

	// ════════════════════════════════════════════════════════════════════════════
	// GUEST TYPE
	// ════════════════════════════════════════════════════════════════════════════

	getGuestTypes: (id: string, token: string): Promise<GuestTypeList> =>
		api.get(`radio/episode/guest/type/list/${id}/`, authHeader(token)).json(),

	getGuestType: (id: string, token: string, typeId: number): Promise<GuestType> =>
		api.get(`radio/episode/guest/type/detail/${id}/${typeId}/`, authHeader(token)).json(),

	createGuestType: (id: string, token: string, data: CreateGuestTypePayload): Promise<GuestType> =>
		api.post(`radio/episode/guest/type/create/${id}/`, { json: data, ...authHeader(token) }).json(),

	updateGuestType: (id: string, token: string, data: UpdateGuestTypePayload): Promise<GuestType> =>
		api.put(`radio/episode/guest/type/update/${id}/`, { json: data, ...authHeader(token) }).json(),

	deleteGuestType: async (id: string, token: string, typeId: number): Promise<void> => {
		await api.delete(`radio/episode/guest/type/delete/${id}/${typeId}/`, authHeader(token));
	},

	// ════════════════════════════════════════════════════════════════════════════
	// EPISODE GUEST
	// ════════════════════════════════════════════════════════════════════════════

	getEpisodeGuests: (id: string, token: string): Promise<EpisodeGuestList> =>
		api.get(`radio/episode/guest/list/${id}/`, authHeader(token)).json(),

	getEpisodeGuest: (id: string, token: string, guestId: number): Promise<EpisodeGuest> =>
		api.get(`radio/episode/guest/detail/${id}/${guestId}/`, authHeader(token)).json(),

	createEpisodeGuest: (id: string, token: string, data: CreateEpisodeGuestPayload): Promise<EpisodeGuest> =>
		api.post(`radio/episode/guest/create/${id}/`, { json: data, ...authHeader(token) }).json(),

	updateEpisodeGuest: (id: string, token: string, data: UpdateEpisodeGuestPayload): Promise<EpisodeGuest> =>
		api.put(`radio/episode/guest/update/${id}/`, { json: data, ...authHeader(token) }).json(),

	deleteEpisodeGuest: async (id: string, token: string, guestId: number): Promise<void> => {
		await api.delete(`radio/episode/guest/delete/${id}/${guestId}/`, authHeader(token));
	},

	// ════════════════════════════════════════════════════════════════════════════
	// EMISSION
	// ════════════════════════════════════════════════════════════════════════════

	searchEmissions: (id: string, token: string, search: SearchEmissions): Promise<EmissionList> => {
		const params = new URLSearchParams();
		params.set('limit', String(search.limit ?? 10));
		params.set('offset', String(search.offset ?? 0));
		if (search.language) params.set('language', search.language);
		if (search.emission_type != null) params.set('emission_type', String(search.emission_type));
		if (search.season != null) params.set('season', String(search.season));
		return api.get(`radio/emission/search/${id}/?${params.toString()}`, authHeader(token)).json();
	},

	getEmissions: (id: string, token: string): Promise<EmissionList> =>
		api.get(`radio/emission/list/${id}/`, authHeader(token)).json(),

	getEmission: (id: string, token: string, emissionId: string): Promise<Emission> =>
		api.get(`radio/emission/detail/${id}/${emissionId}/`, authHeader(token)).json(),

	createEmission: (id: string, token: string, data: CreateEmissionPayload): Promise<Emission> =>
		api.post(`radio/emission/create/${id}/`, { json: data, ...authHeader(token) }).json(),

	updateEmission: (id: string, token: string, data: UpdateEmissionPayload): Promise<Emission> =>
		api.put(`radio/emission/update/${id}/`, { json: data, ...authHeader(token) }).json(),

	updateEmissionPoster: (id: string, token: string, data: FormData): Promise<Emission> =>
		api.post(`radio/emission/update/poster/${id}/`, { body: data, ...authHeader(token) }).json(),

	endEmission: (id: string, token: string, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/end/${id}/${emissionId}/`, authHeader(token)).json(),

	validateEmission: (id: string, token: string, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/validate/${id}/`, { json: { id: emissionId }, ...authHeader(token) }).json(),

	publicEmission: (id: string, token: string, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/public/${id}/`, { json: { id: emissionId }, ...authHeader(token) }).json(),

	publishEmission: (id: string, token: string, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/publish/${id}/`, { json: { id: emissionId }, ...authHeader(token) }).json(),

	publishReleaseEmission: (id: string, token: string, emissionId: number): Promise<Emission> =>
		api.patch(`radio/emission/publish/release/${id}/`, { json: { id: emissionId }, ...authHeader(token) }).json(),

	deleteEmission: async (id: string, token: string, emissionId: number): Promise<void> => {
		await api.delete(`radio/emission/delete/${id}/${emissionId}/`, authHeader(token));
	},

	// ─── Emission Emotion ─────────────────────────────────────────────────────

	getEmissionEmotions: (id: string, token: string): Promise<EmissionEmotionList> =>
		api.get(`radio/emission/emotion/list/${id}/`, authHeader(token)).json(),

	getEmissionEmotion: (id: string, token: string, emissionId: number): Promise<EmissionEmotion> =>
		api.get(`radio/emission/emotion/detail/${id}/${emissionId}/`, authHeader(token)).json(),

	setEmissionEmotion: (id: string, token: string, data: SetEmissionEmotionPayload): Promise<EmissionEmotion> =>
		api.post(`radio/emission/emotion/set/${id}/`, { json: data, ...authHeader(token) }).json(),

	deleteEmissionEmotion: async (id: string, token: string, emissionId: number): Promise<void> => {
		await api.delete(`radio/emission/emotion/delete/${id}/${emissionId}/`, authHeader(token));
	},

	// ════════════════════════════════════════════════════════════════════════════
	// EPISODE
	// ════════════════════════════════════════════════════════════════════════════

	searchEpisodes: (id: string, token: string, search: SearchEpisodes): Promise<EpisodeList> => {
		const params = new URLSearchParams();
		params.set('limit', String(search.limit ?? 10));
		params.set('offset', String(search.offset ?? 0));
		if (search.language) params.set('language', search.language);
		if (search.emission != null) params.set('emission', String(search.emission));
		if (search.season != null) params.set('season', String(search.season));
		return api.get(`radio/episode/search/${id}/?${params.toString()}`, authHeader(token)).json();
	},

	getEpisodes: (id: string, token: string): Promise<EpisodeList> =>
		api.get(`radio/episode/list/${id}/`, authHeader(token)).json(),

	getEpisode: (id: string, token: string, episodeId: string): Promise<Episode> =>
		api.get(`radio/episode/detail/${id}/${episodeId}/`, authHeader(token)).json(),

	createEpisode: (id: string, token: string, data: CreateEpisodePayload): Promise<Episode> =>
		api.post(`radio/episode/create/${id}/`, { json: data, ...authHeader(token) }).json(),

	updateEpisode: (id: string, token: string, data: UpdateEpisodePayload): Promise<Episode> =>
		api.put(`radio/episode/update/${id}/`, { json: data, ...authHeader(token) }).json(),

	validateEpisode: (id: string, token: string, episodeId: number): Promise<Episode> =>
		api.patch(`radio/episode/validate/${id}/`, { json: { id: episodeId }, ...authHeader(token) }).json(),

	publicEpisode: (id: string, token: string, episodeId: number): Promise<Episode> =>
		api.patch(`radio/episode/public/${id}/`, { json: { id: episodeId }, ...authHeader(token) }).json(),

	publishEpisode: (id: string, token: string, episodeId: number): Promise<Episode> =>
		api.patch(`radio/episode/publish/${id}/`, { json: { id: episodeId }, ...authHeader(token) }).json(),

	publishReleaseEpisode: (id: string, token: string, episodeId: number): Promise<Episode> =>
		api.patch(`radio/episode/publish/release/${id}/`, { json: { id: episodeId }, ...authHeader(token) }).json(),

	deleteEpisode: async (id: string, token: string, episodeId: number): Promise<void> => {
		await api.delete(`radio/episode/delete/${id}/${episodeId}/`, authHeader(token));
	},

	// ─── Episode Emotion ──────────────────────────────────────────────────────

	getEpisodeEmotions: (id: string, token: string): Promise<EpisodeEmotionList> =>
		api.get(`radio/episode/emotion/list/${id}/`, authHeader(token)).json(),

	getEpisodeEmotion: (id: string, token: string, episodeId: number): Promise<EpisodeEmotion> =>
		api.get(`radio/episode/emotion/detail/${id}/${episodeId}/`, authHeader(token)).json(),

	setEpisodeEmotion: (id: string, token: string, data: SetEpisodeEmotionPayload): Promise<EpisodeEmotion> =>
		api.post(`radio/episode/emotion/set/${id}/`, { json: data, ...authHeader(token) }).json(),

	deleteEpisodeEmotion: async (id: string, token: string, episodeId: number): Promise<void> => {
		await api.delete(`radio/episode/emotion/delete/${id}/${episodeId}/`, authHeader(token));
	},

	// ════════════════════════════════════════════════════════════════════════════
	// REPORTAGE TYPE
	// ════════════════════════════════════════════════════════════════════════════

	getReportageTypes: (id: string, token: string): Promise<ReportageTypeList> =>
		api.get(`radio/reportage/type/list/${id}/`, authHeader(token)).json(),

	getReportageType: (id: string, token: string, typeId: number): Promise<ReportageType> =>
		api.get(`radio/reportage/type/detail/${id}/${typeId}/`, authHeader(token)).json(),

	createReportageType: (id: string, token: string, data: CreateReportageTypePayload): Promise<ReportageType> =>
		api.post(`radio/reportage/type/create/${id}/`, { json: data, ...authHeader(token) }).json(),

	updateReportageType: (id: string, token: string, data: UpdateReportageTypePayload): Promise<ReportageType> =>
		api.put(`radio/reportage/type/update/${id}/`, { json: data, ...authHeader(token) }).json(),

	deleteReportageType: async (id: string, token: string, typeId: number): Promise<void> => {
		await api.delete(`radio/reportage/type/delete/${id}/${typeId}/`, authHeader(token));
	},

	// ════════════════════════════════════════════════════════════════════════════
	// REPORTAGE
	// ════════════════════════════════════════════════════════════════════════════

	searchReportages: (id: string, token: string, search: SearchReportages): Promise<ReportageList> => {
		const params = new URLSearchParams();
		params.set('limit', String(search.limit ?? 10));
		params.set('offset', String(search.offset ?? 0));
		if (search.language) params.set('language', search.language);
		if (search.reportage_type != null) params.set('reportage_type', String(search.reportage_type));
		return api.get(`radio/reportage/search/${id}/?${params.toString()}`, authHeader(token)).json();
	},

	getReportages: (id: string, token: string): Promise<ReportageList> =>
		api.get(`radio/reportage/list/${id}/`, authHeader(token)).json(),

	getReportage: (id: string, token: string, reportageId: string): Promise<Reportage> =>
		api.get(`radio/reportage/detail/${id}/${reportageId}/`, authHeader(token)).json(),

	createReportage: (id: string, token: string, data: CreateReportagePayload): Promise<Reportage> =>
		api.post(`radio/reportage/create/${id}/`, { json: data, ...authHeader(token) }).json(),

	updateReportage: (id: string, token: string, data: UpdateReportagePayload): Promise<Reportage> =>
		api.put(`radio/reportage/update/${id}/`, { json: data, ...authHeader(token) }).json(),

	validateReportage: (id: string, token: string, reportageId: number): Promise<Reportage> =>
		api.patch(`radio/reportage/validate/${id}/`, { json: { id: reportageId }, ...authHeader(token) }).json(),

	publicReportage: (id: string, token: string, reportageId: number): Promise<Reportage> =>
		api.patch(`radio/reportage/public/${id}/`, { json: { id: reportageId }, ...authHeader(token) }).json(),

	publishReportage: (id: string, token: string, reportageId: number): Promise<Reportage> =>
		api.patch(`radio/reportage/publish/${id}/`, { json: { id: reportageId }, ...authHeader(token) }).json(),

	publishReleaseReportage: (id: string, token: string, reportageId: number): Promise<Reportage> =>
		api.patch(`radio/reportage/publish/release/${id}/`, { json: { id: reportageId }, ...authHeader(token) }).json(),

	deleteReportage: async (id: string, token: string, reportageId: number): Promise<void> => {
		await api.delete(`radio/reportage/delete/${id}/${reportageId}/`, authHeader(token));
	},

	// ─── Reportage Emotion ────────────────────────────────────────────────────

	getReportageEmotions: (id: string, token: string): Promise<ReportageEmotionList> =>
		api.get(`radio/reportage/emotion/list/${id}/`, authHeader(token)).json(),

	getReportageEmotion: (id: string, token: string, reportageId: number): Promise<ReportageEmotion> =>
		api.get(`radio/reportage/emotion/detail/${id}/${reportageId}/`, authHeader(token)).json(),

	setReportageEmotion: (id: string, token: string, data: SetReportageEmotionPayload): Promise<ReportageEmotion> =>
		api.post(`radio/reportage/emotion/set/${id}/`, { json: data, ...authHeader(token) }).json(),

	deleteReportageEmotion: async (id: string, token: string, reportageId: number): Promise<void> => {
		await api.delete(`radio/reportage/emotion/delete/${id}/${reportageId}/`, authHeader(token));
	},
};