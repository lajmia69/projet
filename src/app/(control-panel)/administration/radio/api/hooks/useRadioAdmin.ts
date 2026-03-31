import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Token } from '@auth/user';
import { radioAdminApi } from '../services/radioAdminApiService';
import {
	CreateEmissionTypePayload, UpdateEmissionTypePayload,
	CreateSeasonPayload, UpdateSeasonPayload,
	CreateGuestTypePayload, UpdateGuestTypePayload,
	CreateEpisodeGuestPayload, UpdateEpisodeGuestPayload,
	SearchEmissionsParams, CreateEmissionPayload, UpdateEmissionPayload,
	SetEmissionEmotionPayload,
	SearchEpisodesParams, CreateEpisodePayload, UpdateEpisodePayload,
	SetEpisodeEmotionPayload,
	CreateReportageTypePayload, UpdateReportageTypePayload,
	SearchReportagesParams, CreateReportagePayload, UpdateReportagePayload,
	SetReportageEmotionPayload,
} from '../types';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const radioAdminKeys = {
	// languages
	languages: (token: Token) => ['radio-admin', 'languages', token.id],

	// emission types
	emissionTypes: (token: Token) => ['radio-admin', 'emission-types', token.id],
	emissionType: (token: Token, id: number) => ['radio-admin', 'emission-type', token.id, id],

	// seasons
	seasons: (token: Token) => ['radio-admin', 'seasons', token.id],
	season: (token: Token, id: number) => ['radio-admin', 'season', token.id, id],

	// guest types
	guestTypes: (token: Token) => ['radio-admin', 'guest-types', token.id],
	guestType: (token: Token, id: number) => ['radio-admin', 'guest-type', token.id, id],

	// episode guests
	episodeGuests: (token: Token) => ['radio-admin', 'episode-guests', token.id],
	episodeGuest: (token: Token, id: number) => ['radio-admin', 'episode-guest', token.id, id],

	// emissions
	emissions: (token: Token) => ['radio-admin', 'emissions', token.id],
	emission: (token: Token, id: number) => ['radio-admin', 'emission', token.id, id],
	emissionsSearch: (token: Token, params: SearchEmissionsParams) =>
		['radio-admin', 'emissions-search', token.id, params],

	// emission emotions
	emissionEmotions: (token: Token) => ['radio-admin', 'emission-emotions', token.id],
	emissionEmotion: (token: Token, id: number) => ['radio-admin', 'emission-emotion', token.id, id],

	// episodes
	episodes: (token: Token) => ['radio-admin', 'episodes', token.id],
	episode: (token: Token, id: number) => ['radio-admin', 'episode', token.id, id],
	episodesSearch: (token: Token, params: SearchEpisodesParams) =>
		['radio-admin', 'episodes-search', token.id, params],

	// episode emotions
	episodeEmotions: (token: Token) => ['radio-admin', 'episode-emotions', token.id],
	episodeEmotion: (token: Token, id: number) => ['radio-admin', 'episode-emotion', token.id, id],

	// reportage types
	reportageTypes: (token: Token) => ['radio-admin', 'reportage-types', token.id],
	reportageType: (token: Token, id: number) => ['radio-admin', 'reportage-type', token.id, id],

	// reportages
	reportages: (token: Token) => ['radio-admin', 'reportages', token.id],
	reportage: (token: Token, id: number) => ['radio-admin', 'reportage', token.id, id],
	reportagesSearch: (token: Token, params: SearchReportagesParams) =>
		['radio-admin', 'reportages-search', token.id, params],

	// reportage emotions
	reportageEmotions: (token: Token) => ['radio-admin', 'reportage-emotions', token.id],
	reportageEmotion: (token: Token, id: number) => ['radio-admin', 'reportage-emotion', token.id, id],
} as const;

// =============================================================================
// LANGUAGES
// =============================================================================

export const useRadioAdminLanguages = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.languages(token),
		queryFn: () => radioAdminApi.getLanguages(token),
		enabled: !!token?.access,
	});

// =============================================================================
// EMISSION TYPES
// =============================================================================

export const useRadioAdminEmissionTypes = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.emissionTypes(token),
		queryFn: () => radioAdminApi.getEmissionTypes(token),
		enabled: !!token?.access,
	});

export const useRadioAdminEmissionType = (token: Token, typeId: number) =>
	useQuery({
		queryKey: radioAdminKeys.emissionType(token, typeId),
		queryFn: () => radioAdminApi.getEmissionType(token, typeId),
		enabled: !!token?.access && !!typeId,
	});

export const useCreateEmissionType = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateEmissionTypePayload) => radioAdminApi.createEmissionType(token, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissionTypes(token) });
			enqueueSnackbar('Emission type created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating emission type', { variant: 'error' }),
	});
};

export const useUpdateEmissionType = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEmissionTypePayload) => radioAdminApi.updateEmissionType(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissionTypes(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissionType(token, d.id) });
			enqueueSnackbar('Emission type updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating emission type', { variant: 'error' }),
	});
};

export const useDeleteEmissionType = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (typeId: number) => radioAdminApi.deleteEmissionType(token, typeId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissionTypes(token) });
			enqueueSnackbar('Emission type deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting emission type', { variant: 'error' }),
	});
};

// =============================================================================
// SEASONS
// =============================================================================

export const useRadioAdminSeasons = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.seasons(token),
		queryFn: () => radioAdminApi.getSeasons(token),
		enabled: !!token?.access,
	});

export const useCreateSeason = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateSeasonPayload) => radioAdminApi.createSeason(token, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.seasons(token) });
			enqueueSnackbar('Season created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating season', { variant: 'error' }),
	});
};

export const useUpdateSeason = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateSeasonPayload) => radioAdminApi.updateSeason(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.seasons(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.season(token, d.id) });
			enqueueSnackbar('Season updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating season', { variant: 'error' }),
	});
};

export const useDeleteSeason = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (seasonId: number) => radioAdminApi.deleteSeason(token, seasonId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.seasons(token) });
			enqueueSnackbar('Season deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting season', { variant: 'error' }),
	});
};

// =============================================================================
// GUEST TYPES
// =============================================================================

export const useRadioAdminGuestTypes = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.guestTypes(token),
		queryFn: () => radioAdminApi.getGuestTypes(token),
		enabled: !!token?.access,
	});

export const useCreateGuestType = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateGuestTypePayload) => radioAdminApi.createGuestType(token, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.guestTypes(token) });
			enqueueSnackbar('Guest type created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating guest type', { variant: 'error' }),
	});
};

export const useUpdateGuestType = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateGuestTypePayload) => radioAdminApi.updateGuestType(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.guestTypes(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.guestType(token, d.id) });
			enqueueSnackbar('Guest type updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating guest type', { variant: 'error' }),
	});
};

export const useDeleteGuestType = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (typeId: number) => radioAdminApi.deleteGuestType(token, typeId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.guestTypes(token) });
			enqueueSnackbar('Guest type deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting guest type', { variant: 'error' }),
	});
};

// =============================================================================
// EPISODE GUESTS
// =============================================================================

export const useRadioAdminEpisodeGuests = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.episodeGuests(token),
		queryFn: () => radioAdminApi.getEpisodeGuests(token),
		enabled: !!token?.access,
	});

export const useCreateEpisodeGuest = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateEpisodeGuestPayload) => radioAdminApi.createEpisodeGuest(token, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodeGuests(token) });
			enqueueSnackbar('Guest created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating guest', { variant: 'error' }),
	});
};

export const useUpdateEpisodeGuest = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEpisodeGuestPayload) => radioAdminApi.updateEpisodeGuest(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodeGuests(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodeGuest(token, d.id) });
			enqueueSnackbar('Guest updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating guest', { variant: 'error' }),
	});
};

export const useDeleteEpisodeGuest = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (guestId: number) => radioAdminApi.deleteEpisodeGuest(token, guestId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodeGuests(token) });
			enqueueSnackbar('Guest deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting guest', { variant: 'error' }),
	});
};

// =============================================================================
// EMISSIONS
// =============================================================================

export const useRadioAdminEmissions = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.emissions(token),
		queryFn: () => radioAdminApi.getEmissions(token),
		enabled: !!token?.access,
	});

export const useSearchRadioAdminEmissions = (token: Token, params: SearchEmissionsParams) =>
	useQuery({
		queryKey: radioAdminKeys.emissionsSearch(token, params),
		queryFn: () => radioAdminApi.searchEmissions(token, params),
		enabled: !!token?.access,
	});

export const useRadioAdminEmission = (token: Token, emissionId: number) =>
	useQuery({
		queryKey: radioAdminKeys.emission(token, emissionId),
		queryFn: () => radioAdminApi.getEmission(token, emissionId),
		enabled: !!token?.access && !!emissionId,
	});

export const useCreateEmission = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateEmissionPayload) => radioAdminApi.createEmission(token, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			enqueueSnackbar('Emission created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating emission', { variant: 'error' }),
	});
};

export const useUpdateEmission = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEmissionPayload) => radioAdminApi.updateEmission(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, d.id) });
			enqueueSnackbar('Emission updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating emission', { variant: 'error' }),
	});
};

export const useDeleteEmission = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.deleteEmission(token, emissionId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			enqueueSnackbar('Emission deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting emission', { variant: 'error' }),
	});
};

export const useValidateEmission = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.validateEmission(token, emissionId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission validated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error validating emission', { variant: 'error' }),
	});
};

export const useMakePublicEmission = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.makePublicEmission(token, emissionId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission made public', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error making emission public', { variant: 'error' }),
	});
};

export const usePublishEmission = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.publishEmission(token, emissionId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission published', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing emission', { variant: 'error' }),
	});
};

export const usePublishReleaseEmission = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.publishReleaseEmission(token, emissionId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission published & released', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing emission', { variant: 'error' }),
	});
};

export const useEndEmission = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.endEmission(token, emissionId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission ended', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error ending emission', { variant: 'error' }),
	});
};

// ── Emission Emotions ─────────────────────────────────────────────────────────

export const useRadioAdminEmissionEmotions = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.emissionEmotions(token),
		queryFn: () => radioAdminApi.getEmissionEmotions(token),
		enabled: !!token?.access,
	});

export const useSetEmissionEmotion = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: SetEmissionEmotionPayload) => radioAdminApi.setEmissionEmotion(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissionEmotions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissionEmotion(token, d.emission_id) });
		},
		onError: () => enqueueSnackbar('Error setting emotion', { variant: 'error' }),
	});
};

export const useDeleteEmissionEmotion = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.deleteEmissionEmotion(token, emissionId),
		onSuccess: (_, emissionId) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissionEmotions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissionEmotion(token, emissionId) });
		},
		onError: () => enqueueSnackbar('Error removing emotion', { variant: 'error' }),
	});
};

// =============================================================================
// EPISODES
// =============================================================================

export const useRadioAdminEpisodes = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.episodes(token),
		queryFn: () => radioAdminApi.getEpisodes(token),
		enabled: !!token?.access,
	});

export const useSearchRadioAdminEpisodes = (token: Token, params: SearchEpisodesParams) =>
	useQuery({
		queryKey: radioAdminKeys.episodesSearch(token, params),
		queryFn: () => radioAdminApi.searchEpisodes(token, params),
		enabled: !!token?.access,
	});

export const useRadioAdminEpisode = (token: Token, episodeId: number) =>
	useQuery({
		queryKey: radioAdminKeys.episode(token, episodeId),
		queryFn: () => radioAdminApi.getEpisode(token, episodeId),
		enabled: !!token?.access && !!episodeId,
	});

export const useCreateEpisode = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateEpisodePayload) => radioAdminApi.createEpisode(token, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			enqueueSnackbar('Episode created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating episode', { variant: 'error' }),
	});
};

export const useUpdateEpisode = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEpisodePayload) => radioAdminApi.updateEpisode(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, d.id) });
			enqueueSnackbar('Episode updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating episode', { variant: 'error' }),
	});
};

export const useDeleteEpisode = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioAdminApi.deleteEpisode(token, episodeId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			enqueueSnackbar('Episode deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting episode', { variant: 'error' }),
	});
};

export const useValidateEpisode = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioAdminApi.validateEpisode(token, episodeId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, res.id) });
			enqueueSnackbar('Episode validated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error validating episode', { variant: 'error' }),
	});
};

export const useMakePublicEpisode = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioAdminApi.makePublicEpisode(token, episodeId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, res.id) });
			enqueueSnackbar('Episode made public', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error making episode public', { variant: 'error' }),
	});
};

export const usePublishEpisode = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioAdminApi.publishEpisode(token, episodeId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, res.id) });
			enqueueSnackbar('Episode published', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing episode', { variant: 'error' }),
	});
};

export const usePublishReleaseEpisode = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioAdminApi.publishReleaseEpisode(token, episodeId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, res.id) });
			enqueueSnackbar('Episode published & released', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing episode', { variant: 'error' }),
	});
};

// ── Episode Emotions ──────────────────────────────────────────────────────────

export const useSetEpisodeEmotion = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: SetEpisodeEmotionPayload) => radioAdminApi.setEpisodeEmotion(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodeEmotions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodeEmotion(token, d.episode_id) });
		},
		onError: () => enqueueSnackbar('Error setting emotion', { variant: 'error' }),
	});
};

export const useDeleteEpisodeEmotion = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioAdminApi.deleteEpisodeEmotion(token, episodeId),
		onSuccess: (_, episodeId) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodeEmotions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodeEmotion(token, episodeId) });
		},
		onError: () => enqueueSnackbar('Error removing emotion', { variant: 'error' }),
	});
};

// =============================================================================
// REPORTAGE TYPES
// =============================================================================

export const useRadioAdminReportageTypes = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.reportageTypes(token),
		queryFn: () => radioAdminApi.getReportageTypes(token),
		enabled: !!token?.access,
	});

export const useCreateReportageType = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateReportageTypePayload) => radioAdminApi.createReportageType(token, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportageTypes(token) });
			enqueueSnackbar('Reportage type created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating reportage type', { variant: 'error' }),
	});
};

export const useUpdateReportageType = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateReportageTypePayload) => radioAdminApi.updateReportageType(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportageTypes(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportageType(token, d.id) });
			enqueueSnackbar('Reportage type updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating reportage type', { variant: 'error' }),
	});
};

export const useDeleteReportageType = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (typeId: number) => radioAdminApi.deleteReportageType(token, typeId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportageTypes(token) });
			enqueueSnackbar('Reportage type deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting reportage type', { variant: 'error' }),
	});
};

// =============================================================================
// REPORTAGES
// =============================================================================

export const useRadioAdminReportages = (token: Token) =>
	useQuery({
		queryKey: radioAdminKeys.reportages(token),
		queryFn: () => radioAdminApi.getReportages(token),
		enabled: !!token?.access,
	});

export const useSearchRadioAdminReportages = (token: Token, params: SearchReportagesParams) =>
	useQuery({
		queryKey: radioAdminKeys.reportagesSearch(token, params),
		queryFn: () => radioAdminApi.searchReportages(token, params),
		enabled: !!token?.access,
	});

export const useRadioAdminReportage = (token: Token, reportageId: number) =>
	useQuery({
		queryKey: radioAdminKeys.reportage(token, reportageId),
		queryFn: () => radioAdminApi.getReportage(token, reportageId),
		enabled: !!token?.access && !!reportageId,
	});

export const useCreateReportage = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: CreateReportagePayload) => radioAdminApi.createReportage(token, data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			enqueueSnackbar('Reportage created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating reportage', { variant: 'error' }),
	});
};

export const useUpdateReportage = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateReportagePayload) => radioAdminApi.updateReportage(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, d.id) });
			enqueueSnackbar('Reportage updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating reportage', { variant: 'error' }),
	});
};

export const useDeleteReportage = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.deleteReportage(token, reportageId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			enqueueSnackbar('Reportage deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting reportage', { variant: 'error' }),
	});
};

export const useValidateReportage = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.validateReportage(token, reportageId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, res.id) });
			enqueueSnackbar('Reportage validated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error validating reportage', { variant: 'error' }),
	});
};

export const useMakePublicReportage = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.makePublicReportage(token, reportageId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, res.id) });
			enqueueSnackbar('Reportage made public', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error making reportage public', { variant: 'error' }),
	});
};

export const usePublishReportage = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.publishReportage(token, reportageId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, res.id) });
			enqueueSnackbar('Reportage published', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing reportage', { variant: 'error' }),
	});
};

export const usePublishReleaseReportage = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.publishReleaseReportage(token, reportageId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, res.id) });
			enqueueSnackbar('Reportage published & released', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing reportage', { variant: 'error' }),
	});
};

// ── Reportage Emotions ────────────────────────────────────────────────────────

export const useSetReportageEmotion = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: SetReportageEmotionPayload) => radioAdminApi.setReportageEmotion(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportageEmotions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportageEmotion(token, d.reportage_id) });
		},
		onError: () => enqueueSnackbar('Error setting emotion', { variant: 'error' }),
	});
};

export const useDeleteReportageEmotion = (token: Token) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.deleteReportageEmotion(token, reportageId),
		onSuccess: (_, reportageId) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportageEmotions(token) });
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportageEmotion(token, reportageId) });
		},
		onError: () => enqueueSnackbar('Error removing emotion', { variant: 'error' }),
	});
};