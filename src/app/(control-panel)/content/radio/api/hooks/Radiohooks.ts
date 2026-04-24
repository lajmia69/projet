import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { radioApi } from '../services/RadioApiService';
import { createStudioProjectForContent } from '@/app/(control-panel)/studio/api/utils/autoCreateStudioProject';
import {
	CreateEmissionTypePayload, UpdateEmissionTypePayload,
	CreateSeasonPayload, UpdateSeasonPayload,
	CreateGuestTypePayload, UpdateGuestTypePayload,
	CreateEpisodeGuestPayload, UpdateEpisodeGuestPayload,
	SearchEmissions, CreateEmissionPayload, UpdateEmissionPayload, SetEmissionEmotionPayload,
	SearchEpisodes, CreateEpisodePayload, UpdateEpisodePayload, SetEpisodeEmotionPayload,
	CreateReportageTypePayload, UpdateReportageTypePayload,
	SearchReportages, CreateReportagePayload, UpdateReportagePayload, SetReportageEmotionPayload,
} from '../types';

// ════════════════════════════════════════════════════════════════════════════
// EMISSION TYPE
// ════════════════════════════════════════════════════════════════════════════

export const emissionTypesQueryKey = (id: string) => ['radio', 'emission-types', id];
export const emissionTypeQueryKey = (id: string, typeId: number) => ['radio', 'emission-type', id, typeId];

export const useEmissionTypes = (id: string, token: string) =>
	useQuery({ queryKey: emissionTypesQueryKey(id), queryFn: () => radioApi.getEmissionTypes(id, token), enabled: !!id && !!token });

export const useEmissionType = (id: string, token: string, typeId: number) =>
	useQuery({ queryKey: emissionTypeQueryKey(id, typeId), queryFn: () => radioApi.getEmissionType(id, token, typeId), enabled: !!id && !!token && !!typeId });

export const useCreateEmissionType = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateEmissionTypePayload) => radioApi.createEmissionType(id, token, data),
		onSuccess: () => { qc.invalidateQueries({ queryKey: emissionTypesQueryKey(id) }); enqueueSnackbar('Emission type created', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error creating emission type', { variant: 'error' }),
	});
};

export const useUpdateEmissionType = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEmissionTypePayload) => radioApi.updateEmissionType(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: emissionTypesQueryKey(id) }); qc.invalidateQueries({ queryKey: emissionTypeQueryKey(id, d.id) }); enqueueSnackbar('Emission type updated', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error updating emission type', { variant: 'error' }),
	});
};

export const useDeleteEmissionType = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (typeId: number) => radioApi.deleteEmissionType(id, token, typeId),
		onSuccess: () => { qc.invalidateQueries({ queryKey: emissionTypesQueryKey(id) }); enqueueSnackbar('Emission type deleted', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error deleting emission type', { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// SEASON
// ════════════════════════════════════════════════════════════════════════════

export const seasonsQueryKey = (id: string) => ['radio', 'seasons', id];
export const seasonQueryKey = (id: string, seasonId: number) => ['radio', 'season', id, seasonId];

export const useSeasons = (id: string, token: string) =>
	useQuery({ queryKey: seasonsQueryKey(id), queryFn: () => radioApi.getSeasons(id, token), enabled: !!id && !!token });

export const useSeason = (id: string, token: string, seasonId: number) =>
	useQuery({ queryKey: seasonQueryKey(id, seasonId), queryFn: () => radioApi.getSeason(id, token, seasonId), enabled: !!id && !!token && !!seasonId });

export const useCreateSeason = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateSeasonPayload) => radioApi.createSeason(id, token, data),
		onSuccess: () => { qc.invalidateQueries({ queryKey: seasonsQueryKey(id) }); enqueueSnackbar('Season created', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error creating season', { variant: 'error' }),
	});
};

export const useUpdateSeason = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateSeasonPayload) => radioApi.updateSeason(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: seasonsQueryKey(id) }); qc.invalidateQueries({ queryKey: seasonQueryKey(id, d.id) }); enqueueSnackbar('Season updated', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error updating season', { variant: 'error' }),
	});
};

export const useDeleteSeason = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (seasonId: number) => radioApi.deleteSeason(id, token, seasonId),
		onSuccess: () => { qc.invalidateQueries({ queryKey: seasonsQueryKey(id) }); enqueueSnackbar('Season deleted', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error deleting season', { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// GUEST TYPE
// ════════════════════════════════════════════════════════════════════════════

export const guestTypesQueryKey = (id: string) => ['radio', 'guest-types', id];
export const guestTypeQueryKey = (id: string, typeId: number) => ['radio', 'guest-type', id, typeId];

export const useGuestTypes = (id: string, token: string) =>
	useQuery({ queryKey: guestTypesQueryKey(id), queryFn: () => radioApi.getGuestTypes(id, token), enabled: !!id && !!token });

export const useCreateGuestType = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateGuestTypePayload) => radioApi.createGuestType(id, token, data),
		onSuccess: () => { qc.invalidateQueries({ queryKey: guestTypesQueryKey(id) }); enqueueSnackbar('Guest type created', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error creating guest type', { variant: 'error' }),
	});
};

export const useUpdateGuestType = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateGuestTypePayload) => radioApi.updateGuestType(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: guestTypesQueryKey(id) }); qc.invalidateQueries({ queryKey: guestTypeQueryKey(id, d.id) }); enqueueSnackbar('Guest type updated', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error updating guest type', { variant: 'error' }),
	});
};

export const useDeleteGuestType = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (typeId: number) => radioApi.deleteGuestType(id, token, typeId),
		onSuccess: () => { qc.invalidateQueries({ queryKey: guestTypesQueryKey(id) }); enqueueSnackbar('Guest type deleted', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error deleting guest type', { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// EPISODE GUEST
// ════════════════════════════════════════════════════════════════════════════

export const episodeGuestsQueryKey = (id: string) => ['radio', 'episode-guests', id];
export const episodeGuestQueryKey = (id: string, guestId: number) => ['radio', 'episode-guest', id, guestId];

export const useEpisodeGuests = (id: string, token: string) =>
	useQuery({ queryKey: episodeGuestsQueryKey(id), queryFn: () => radioApi.getEpisodeGuests(id, token), enabled: !!id && !!token });

export const useCreateEpisodeGuest = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateEpisodeGuestPayload) => radioApi.createEpisodeGuest(id, token, data),
		onSuccess: () => { qc.invalidateQueries({ queryKey: episodeGuestsQueryKey(id) }); enqueueSnackbar('Guest created', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error creating guest', { variant: 'error' }),
	});
};

export const useUpdateEpisodeGuest = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEpisodeGuestPayload) => radioApi.updateEpisodeGuest(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: episodeGuestsQueryKey(id) }); qc.invalidateQueries({ queryKey: episodeGuestQueryKey(id, d.id) }); enqueueSnackbar('Guest updated', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error updating guest', { variant: 'error' }),
	});
};

export const useDeleteEpisodeGuest = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (guestId: number) => radioApi.deleteEpisodeGuest(id, token, guestId),
		onSuccess: () => { qc.invalidateQueries({ queryKey: episodeGuestsQueryKey(id) }); enqueueSnackbar('Guest deleted', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error deleting guest', { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// EMISSION
// ════════════════════════════════════════════════════════════════════════════

export const emissionsQueryKey = (id: string) => ['radio', 'emissions', id];
export const emissionQueryKey = (id: string, emissionId: string) => ['radio', 'emission', id, emissionId];
export const searchEmissionsQueryKey = (id: string, search: SearchEmissions) => ['radio', 'emissions-search', id, search];

export const useSearchEmissions = (id: string, token: string, search: SearchEmissions) =>
	useQuery({ queryKey: searchEmissionsQueryKey(id, search), queryFn: () => radioApi.searchEmissions(id, token, search), enabled: !!id && !!token });

export const useEmissions = (id: string, token: string) =>
	useQuery({ queryKey: emissionsQueryKey(id), queryFn: () => radioApi.getEmissions(id, token), enabled: !!id && !!token });

export const useEmission = (id: string, token: string, emissionId: string) => {
	const emissionAccountId = '1';
	return useQuery({ queryKey: emissionQueryKey(emissionAccountId, emissionId), queryFn: () => radioApi.getEmission(emissionAccountId, token, emissionId), enabled: !!token && !!emissionId });
};

export const useCreateEmission = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateEmissionPayload) => radioApi.createEmission(id, token, data),
		onSuccess: () => { qc.invalidateQueries({ queryKey: emissionsQueryKey('1') }); enqueueSnackbar('Emission created', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error creating emission', { variant: 'error' }),
	});
};

export const useUpdateEmission = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEmissionPayload) => radioApi.updateEmission(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: emissionsQueryKey('1') }); qc.invalidateQueries({ queryKey: emissionQueryKey('1', String(d.id)) }); enqueueSnackbar('Emission updated', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error updating emission', { variant: 'error' }),
	});
};

export const useDeleteEmission = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioApi.deleteEmission(id, token, emissionId),
		onSuccess: () => { qc.invalidateQueries({ queryKey: emissionsQueryKey('1') }); enqueueSnackbar('Emission deleted', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error deleting emission', { variant: 'error' }),
	});
};

export const useValidateEmission = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: ({ id: emissionId }: { id: number; name: string }) => radioApi.validateEmission(id, token, emissionId),
		onSuccess: async (_, { id: emissionId, name }) => {
			qc.invalidateQueries({ queryKey: emissionsQueryKey('1') });
			qc.invalidateQueries({ queryKey: emissionQueryKey('1', String(emissionId)) });
			enqueueSnackbar('Emission validated', { variant: 'success' });
			console.log('[DEBUG validateEmission] Calling createStudioProjectForContent with:', { contentType: 'radio_emission', emissionId, name });
			await createStudioProjectForContent(1, token, 'radio_emission', emissionId, name);
		},
		onError: () => enqueueSnackbar('Error validating emission', { variant: 'error' }),
	});
};

export const usePublishEmission = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioApi.publishEmission(id, token, emissionId),
		onSuccess: (_, emissionId) => { qc.invalidateQueries({ queryKey: emissionsQueryKey('1') }); qc.invalidateQueries({ queryKey: emissionQueryKey('1', String(emissionId)) }); enqueueSnackbar('Emission published', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error publishing emission', { variant: 'error' }),
	});
};

// ─── Emission Emotion ─────────────────────────────────────────────────────────

export const emissionEmotionsQueryKey = (id: string) => ['radio', 'emission-emotions', id];
export const emissionEmotionQueryKey = (id: string, emissionId: number) => ['radio', 'emission-emotion', id, emissionId];

export const useEmissionEmotions = (id: string, token: string) =>
	useQuery({ queryKey: emissionEmotionsQueryKey(id), queryFn: () => radioApi.getEmissionEmotions(id, token), enabled: !!id && !!token });

export const useSetEmissionEmotion = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: SetEmissionEmotionPayload) => radioApi.setEmissionEmotion(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: emissionEmotionsQueryKey(id) }); qc.invalidateQueries({ queryKey: emissionEmotionQueryKey(id, d.emission_id) }); },
		onError: () => enqueueSnackbar('Error setting emotion', { variant: 'error' }),
	});
};

export const useDeleteEmissionEmotion = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioApi.deleteEmissionEmotion(id, token, emissionId),
		onSuccess: (_, emissionId) => { qc.invalidateQueries({ queryKey: emissionEmotionsQueryKey(id) }); qc.invalidateQueries({ queryKey: emissionEmotionQueryKey(id, emissionId) }); },
		onError: () => enqueueSnackbar('Error removing emotion', { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// EPISODE
// ════════════════════════════════════════════════════════════════════════════

export const episodesQueryKey = (id: string) => ['radio', 'episodes', id];
export const episodeQueryKey = (id: string, episodeId: string) => ['radio', 'episode', id, episodeId];
export const searchEpisodesQueryKey = (id: string, search: SearchEpisodes) => ['radio', 'episodes-search', id, search];

export const useSearchEpisodes = (id: string, token: string, search: SearchEpisodes) =>
	useQuery({ queryKey: searchEpisodesQueryKey(id, search), queryFn: () => radioApi.searchEpisodes(id, token, search), enabled: !!id && !!token });

export const useEpisode = (id: string, token: string, episodeId: string) => {
	const episodeAccountId = '1';
	return useQuery({ queryKey: episodeQueryKey(episodeAccountId, episodeId), queryFn: () => radioApi.getEpisode(episodeAccountId, token, episodeId), enabled: !!token && !!episodeId });
};

export const useCreateEpisode = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateEpisodePayload) => radioApi.createEpisode(id, token, data),
		onSuccess: () => { qc.invalidateQueries({ queryKey: episodesQueryKey('1') }); enqueueSnackbar('Episode created', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error creating episode', { variant: 'error' }),
	});
};

export const useUpdateEpisode = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEpisodePayload) => radioApi.updateEpisode(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: episodesQueryKey('1') }); qc.invalidateQueries({ queryKey: episodeQueryKey('1', String(d.id)) }); enqueueSnackbar('Episode updated', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error updating episode', { variant: 'error' }),
	});
};

export const useDeleteEpisode = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioApi.deleteEpisode(id, token, episodeId),
		onSuccess: () => { qc.invalidateQueries({ queryKey: episodesQueryKey('1') }); enqueueSnackbar('Episode deleted', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error deleting episode', { variant: 'error' }),
	});
};

export const useValidateEpisode = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: ({ id: episodeId }: { id: number; name: string }) => radioApi.validateEpisode(id, token, episodeId),
		onSuccess: async (_, { id: episodeId, name }) => {
			qc.invalidateQueries({ queryKey: episodesQueryKey('1') });
			qc.invalidateQueries({ queryKey: episodeQueryKey('1', String(episodeId)) });
			enqueueSnackbar('Episode validated', { variant: 'success' });
			console.log('[DEBUG validateEpisode] Calling createStudioProjectForContent with:', { contentType: 'radio_episode', episodeId, name });
			await createStudioProjectForContent(1, token, 'radio_episode', episodeId, name);
		},
		onError: () => enqueueSnackbar('Error validating episode', { variant: 'error' }),
	});
};

export const usePublishEpisode = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioApi.publishEpisode(id, token, episodeId),
		onSuccess: (_, episodeId) => { qc.invalidateQueries({ queryKey: episodesQueryKey('1') }); qc.invalidateQueries({ queryKey: episodeQueryKey('1', String(episodeId)) }); enqueueSnackbar('Episode published', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error publishing episode', { variant: 'error' }),
	});
};

// ─── Episode Emotion ──────────────────────────────────────────────────────────

export const episodeEmotionsQueryKey = (id: string) => ['radio', 'episode-emotions', id];
export const episodeEmotionQueryKey = (id: string, episodeId: number) => ['radio', 'episode-emotion', id, episodeId];

export const useEpisodeEmotions = (id: string, token: string) =>
	useQuery({ queryKey: episodeEmotionsQueryKey(id), queryFn: () => radioApi.getEpisodeEmotions(id, token), enabled: !!id && !!token });

export const useSetEpisodeEmotion = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: SetEpisodeEmotionPayload) => radioApi.setEpisodeEmotion(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: episodeEmotionsQueryKey(id) }); qc.invalidateQueries({ queryKey: episodeEmotionQueryKey(id, d.episode_id) }); },
		onError: () => enqueueSnackbar('Error setting emotion', { variant: 'error' }),
	});
};

export const useDeleteEpisodeEmotion = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioApi.deleteEpisodeEmotion(id, token, episodeId),
		onSuccess: (_, episodeId) => { qc.invalidateQueries({ queryKey: episodeEmotionsQueryKey(id) }); qc.invalidateQueries({ queryKey: episodeEmotionQueryKey(id, episodeId) }); },
		onError: () => enqueueSnackbar('Error removing emotion', { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// REPORTAGE TYPE
// ════════════════════════════════════════════════════════════════════════════

export const reportageTypesQueryKey = (id: string) => ['radio', 'reportage-types', id];
export const reportageTypeQueryKey = (id: string, typeId: number) => ['radio', 'reportage-type', id, typeId];

export const useReportageTypes = (id: string, token: string) =>
	useQuery({ queryKey: reportageTypesQueryKey(id), queryFn: () => radioApi.getReportageTypes(id, token), enabled: !!id && !!token });

export const useCreateReportageType = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateReportageTypePayload) => radioApi.createReportageType(id, token, data),
		onSuccess: () => { qc.invalidateQueries({ queryKey: reportageTypesQueryKey(id) }); enqueueSnackbar('Reportage type created', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error creating reportage type', { variant: 'error' }),
	});
};

export const useUpdateReportageType = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateReportageTypePayload) => radioApi.updateReportageType(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: reportageTypesQueryKey(id) }); qc.invalidateQueries({ queryKey: reportageTypeQueryKey(id, d.id) }); enqueueSnackbar('Reportage type updated', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error updating reportage type', { variant: 'error' }),
	});
};

export const useDeleteReportageType = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (typeId: number) => radioApi.deleteReportageType(id, token, typeId),
		onSuccess: () => { qc.invalidateQueries({ queryKey: reportageTypesQueryKey(id) }); enqueueSnackbar('Reportage type deleted', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error deleting reportage type', { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// REPORTAGE
// ════════════════════════════════════════════════════════════════════════════

export const reportagesQueryKey = (id: string) => ['radio', 'reportages', id];
export const reportageQueryKey = (id: string, reportageId: string) => ['radio', 'reportage', id, reportageId];
export const searchReportagesQueryKey = (id: string, search: SearchReportages) => ['radio', 'reportages-search', id, search];

export const useSearchReportages = (id: string, token: string, search: SearchReportages) =>
	useQuery({ queryKey: searchReportagesQueryKey(id, search), queryFn: () => radioApi.searchReportages(id, token, search), enabled: !!id && !!token });

export const useReportage = (id: string, token: string, reportageId: string) => {
	const reportageAccountId = '1';
	return useQuery({ queryKey: reportageQueryKey(reportageAccountId, reportageId), queryFn: () => radioApi.getReportage(reportageAccountId, token, reportageId), enabled: !!token && !!reportageId });
};

export const useCreateReportage = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateReportagePayload) => radioApi.createReportage(id, token, data),
		onSuccess: () => { qc.invalidateQueries({ queryKey: reportagesQueryKey('1') }); enqueueSnackbar('Reportage created', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error creating reportage', { variant: 'error' }),
	});
};

export const useUpdateReportage = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateReportagePayload) => radioApi.updateReportage(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: reportagesQueryKey('1') }); qc.invalidateQueries({ queryKey: reportageQueryKey('1', String(d.id)) }); enqueueSnackbar('Reportage updated', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error updating reportage', { variant: 'error' }),
	});
};

export const useDeleteReportage = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioApi.deleteReportage(id, token, reportageId),
		onSuccess: () => { qc.invalidateQueries({ queryKey: reportagesQueryKey('1') }); enqueueSnackbar('Reportage deleted', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error deleting reportage', { variant: 'error' }),
	});
};

export const useValidateReportage = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioApi.validateReportage(id, token, reportageId),
		onSuccess: (_, reportageId) => { qc.invalidateQueries({ queryKey: reportagesQueryKey('1') }); qc.invalidateQueries({ queryKey: reportageQueryKey('1', String(reportageId)) }); enqueueSnackbar('Reportage validated', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error validating reportage', { variant: 'error' }),
	});
};

export const usePublishReportage = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioApi.publishReportage(id, token, reportageId),
		onSuccess: (_, reportageId) => { qc.invalidateQueries({ queryKey: reportagesQueryKey('1') }); qc.invalidateQueries({ queryKey: reportageQueryKey('1', String(reportageId)) }); enqueueSnackbar('Reportage published', { variant: 'success' }); },
		onError: () => enqueueSnackbar('Error publishing reportage', { variant: 'error' }),
	});
};

// ─── Reportage Emotion ────────────────────────────────────────────────────────

export const reportageEmotionsQueryKey = (id: string) => ['radio', 'reportage-emotions', id];
export const reportageEmotionQueryKey = (id: string, reportageId: number) => ['radio', 'reportage-emotion', id, reportageId];

export const useReportageEmotions = (id: string, token: string) =>
	useQuery({ queryKey: reportageEmotionsQueryKey(id), queryFn: () => radioApi.getReportageEmotions(id, token), enabled: !!id && !!token });

export const useSetReportageEmotion = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: SetReportageEmotionPayload) => radioApi.setReportageEmotion(id, token, data),
		onSuccess: (_, d) => { qc.invalidateQueries({ queryKey: reportageEmotionsQueryKey(id) }); qc.invalidateQueries({ queryKey: reportageEmotionQueryKey(id, d.reportage_id) }); },
		onError: () => enqueueSnackbar('Error setting emotion', { variant: 'error' }),
	});
};

export const useDeleteReportageEmotion = (id: string, token: string) => {
	const qc = useQueryClient(); const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioApi.deleteReportageEmotion(id, token, reportageId),
		onSuccess: (_, reportageId) => { qc.invalidateQueries({ queryKey: reportageEmotionsQueryKey(id) }); qc.invalidateQueries({ queryKey: reportageEmotionQueryKey(id, reportageId) }); },
		onError: () => enqueueSnackbar('Error removing emotion', { variant: 'error' }),
	});
};