import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Token } from '@auth/user';
import { radioAdminApi } from '../services/radioAdminApiService';
import { createStudioProjectForContent } from '@/app/(control-panel)/studio/api/utils/autoCreateStudioProject';
import {
	CreateEmissionTypePayload, UpdateEmissionTypePayload,
	CreateSeasonPayload, UpdateSeasonPayload,
	CreateGuestTypePayload, UpdateGuestTypePayload,
	CreateEpisodeGuestPayload, UpdateEpisodeGuestPayload,
	SearchEmissionsParams, CreateEmissionPayload, UpdateEmissionPayload,
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
	accounts:         (token: Token | undefined) => ['radio-admin', 'accounts',         token?.id] as const,
	languages:        (token: Token | undefined) => ['radio-admin', 'languages',        token?.id] as const,
	tags:             (token: Token | undefined) => ['radio-admin', 'tags',             token?.id] as const,

	emissionTypes:    (token: Token | undefined) => ['radio-admin', 'emission-types',   token?.id] as const,
	emissionType:     (token: Token | undefined, id: number) => ['radio-admin', 'emission-type',    token?.id, id] as const,

	seasons:          (token: Token | undefined) => ['radio-admin', 'seasons',          token?.id] as const,
	season:           (token: Token | undefined, id: number) => ['radio-admin', 'season',           token?.id, id] as const,

	guestTypes:       (token: Token | undefined) => ['radio-admin', 'guest-types',      token?.id] as const,
	guestType:        (token: Token | undefined, id: number) => ['radio-admin', 'guest-type',       token?.id, id] as const,

	episodeGuests:    (token: Token | undefined) => ['radio-admin', 'episode-guests',   token?.id] as const,
	episodeGuest:     (token: Token | undefined, id: number) => ['radio-admin', 'episode-guest',    token?.id, id] as const,

	emissions:        (token: Token | undefined) => ['radio-admin', 'emissions',        token?.id] as const,
	emission:         (token: Token | undefined, id: number) => ['radio-admin', 'emission',         token?.id, id] as const,
	emissionsSearch:  (token: Token | undefined, params: SearchEmissionsParams) =>
		['radio-admin', 'emissions-search', token?.id, params] as const,

	episodes:         (token: Token | undefined) => ['radio-admin', 'episodes',         token?.id] as const,
	episode:          (token: Token | undefined, id: number) => ['radio-admin', 'episode',          token?.id, id] as const,
	episodesSearch:   (token: Token | undefined, params: SearchEpisodesParams) =>
		['radio-admin', 'episodes-search',  token?.id, params] as const,

	episodeEmotions:  (token: Token | undefined) => ['radio-admin', 'episode-emotions', token?.id] as const,
	episodeEmotion:   (token: Token | undefined, id: number) => ['radio-admin', 'episode-emotion',  token?.id, id] as const,

	reportageTypes:   (token: Token | undefined) => ['radio-admin', 'reportage-types',  token?.id] as const,
	reportageType:    (token: Token | undefined, id: number) => ['radio-admin', 'reportage-type',   token?.id, id] as const,

	reportages:       (token: Token | undefined) => ['radio-admin', 'reportages',       token?.id] as const,
	reportage:        (token: Token | undefined, id: number) => ['radio-admin', 'reportage',        token?.id, id] as const,
	reportagesSearch: (token: Token | undefined, params: SearchReportagesParams) =>
		['radio-admin', 'reportages-search', token?.id, params] as const,

	reportageEmotions: (token: Token | undefined) => ['radio-admin', 'reportage-emotions', token?.id] as const,
	reportageEmotion:  (token: Token | undefined, id: number) => ['radio-admin', 'reportage-emotion', token?.id, id] as const,
} as const;

const enabled = (token: Token | undefined) => !!token?.access;

// =============================================================================
// ACCOUNTS
// =============================================================================

export const useRadioAdminAccounts = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.accounts(token),
		queryFn:  () => radioAdminApi.getAccounts(token),
		enabled:  enabled(token),
	});

// =============================================================================
// LANGUAGES
// =============================================================================

export const useRadioAdminLanguages = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.languages(token),
		queryFn:  () => radioAdminApi.getLanguages(token),
		enabled:  enabled(token),
	});

// =============================================================================
// TAGS
// =============================================================================

export const useRadioAdminTags = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.tags(token),
		queryFn:  () => radioAdminApi.getTags(token),
		enabled:  enabled(token),
	});

// =============================================================================
// EMISSION TYPES
// =============================================================================

export const useRadioAdminEmissionTypes = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.emissionTypes(token),
		queryFn:  () => radioAdminApi.getEmissionTypes(token),
		enabled:  enabled(token),
	});

export const useRadioAdminEmissionType = (token: Token | undefined, typeId: number) =>
	useQuery({
		queryKey: radioAdminKeys.emissionType(token, typeId),
		queryFn:  () => radioAdminApi.getEmissionType(token, typeId),
		enabled:  enabled(token) && !!typeId,
	});

export const useCreateEmissionType = (token: Token | undefined) => {
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

export const useUpdateEmissionType = (token: Token | undefined) => {
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

export const useDeleteEmissionType = (token: Token | undefined) => {
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

export const useRadioAdminSeasons = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.seasons(token),
		queryFn:  () => radioAdminApi.getSeasons(token),
		enabled:  enabled(token),
	});

export const useCreateSeason = (token: Token | undefined) => {
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

export const useUpdateSeason = (token: Token | undefined) => {
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

export const useDeleteSeason = (token: Token | undefined) => {
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

export const useRadioAdminGuestTypes = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.guestTypes(token),
		queryFn:  () => radioAdminApi.getGuestTypes(token),
		enabled:  enabled(token),
	});

export const useCreateGuestType = (token: Token | undefined) => {
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

export const useUpdateGuestType = (token: Token | undefined) => {
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

export const useDeleteGuestType = (token: Token | undefined) => {
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

export const useRadioAdminEpisodeGuests = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.episodeGuests(token),
		queryFn:  () => radioAdminApi.getEpisodeGuests(token),
		enabled:  enabled(token),
	});

export const useCreateEpisodeGuest = (token: Token | undefined) => {
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

export const useUpdateEpisodeGuest = (token: Token | undefined) => {
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

export const useDeleteEpisodeGuest = (token: Token | undefined) => {
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

export const useRadioAdminEmissions = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.emissions(token),
		queryFn:  () => radioAdminApi.getEmissions(token),
		enabled:  enabled(token),
	});

export const useSearchRadioAdminEmissions = (token: Token | undefined, params: SearchEmissionsParams) =>
	useQuery({
		queryKey: radioAdminKeys.emissionsSearch(token, params),
		queryFn:  () => radioAdminApi.searchEmissions(token, params),
		enabled:  enabled(token),
	});

export const useRadioAdminEmission = (token: Token | undefined, emissionId: number) =>
	useQuery({
		queryKey: radioAdminKeys.emission(token, emissionId),
		queryFn:  () => radioAdminApi.getEmission(token, emissionId),
		enabled:  enabled(token) && !!emissionId,
	});

export const useCreateEmission = (token: Token | undefined) => {
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

export const useUpdateEmission = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEmissionPayload) => radioAdminApi.updateEmission(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			if (d.id) qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, d.id) });
			enqueueSnackbar('Emission updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating emission', { variant: 'error' }),
	});
};

export const useDeleteEmission = (token: Token | undefined) => {
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

export const useValidateEmission = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: async (emissionId: number) => {
			const emission = await radioAdminApi.validateEmission(token, emissionId);
			// Create Studio project after validation (pass token.access for the JWT string)
			if (emission?.name && token?.access) {
				await createStudioProjectForContent(1, token.access, 'radio_emission', emissionId, emission.name);
			}
			return emission;
		},
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission validated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error validating emission', { variant: 'error' }),
	});
};

export const useMakePublicEmission = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.makePublicEmission(token, emissionId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission made public', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error making emission public', { variant: 'error' }),
	});
};

export const usePublishEmission = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.publishEmission(token, emissionId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission published', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing emission', { variant: 'error' }),
	});
};

export const usePublishReleaseEmission = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.publishReleaseEmission(token, emissionId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission published & released', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing emission', { variant: 'error' }),
	});
};

export const useEndEmission = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (emissionId: number) => radioAdminApi.endEmission(token, emissionId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.emissions(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.emission(token, res.id) });
			enqueueSnackbar('Emission ended', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error ending emission', { variant: 'error' }),
	});
};

// =============================================================================
// EPISODES
// =============================================================================

export const useRadioAdminEpisodes = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.episodes(token),
		queryFn:  () => radioAdminApi.getEpisodes(token),
		enabled:  enabled(token),
	});

export const useSearchRadioAdminEpisodes = (token: Token | undefined, params: SearchEpisodesParams) =>
	useQuery({
		queryKey: radioAdminKeys.episodesSearch(token, params),
		queryFn:  () => radioAdminApi.searchEpisodes(token, params),
		enabled:  enabled(token),
	});

export const useRadioAdminEpisode = (token: Token | undefined, episodeId: number) =>
	useQuery({
		queryKey: radioAdminKeys.episode(token, episodeId),
		queryFn:  () => radioAdminApi.getEpisode(token, episodeId),
		enabled:  enabled(token) && !!episodeId,
	});

export const useCreateEpisode = (token: Token | undefined) => {
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

export const useUpdateEpisode = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateEpisodePayload) => radioAdminApi.updateEpisode(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			if (d.id) qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, d.id) });
			enqueueSnackbar('Episode updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating episode', { variant: 'error' }),
	});
};

export const useDeleteEpisode = (token: Token | undefined) => {
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

export const useValidateEpisode = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: async (episodeId: number) => {
			const episode = await radioAdminApi.validateEpisode(token, episodeId);
			// Create Studio project after validation (pass token.access for the JWT string)
			if (episode?.name && token?.access) {
				await createStudioProjectForContent(1, token.access, 'radio_episode', episodeId, episode.name);
			}
			return episode;
		},
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, res.id) });
			enqueueSnackbar('Episode validated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error validating episode', { variant: 'error' }),
	});
};

export const useMakePublicEpisode = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioAdminApi.makePublicEpisode(token, episodeId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, res.id) });
			enqueueSnackbar('Episode made public', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error making episode public', { variant: 'error' }),
	});
};

export const usePublishEpisode = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioAdminApi.publishEpisode(token, episodeId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, res.id) });
			enqueueSnackbar('Episode published', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing episode', { variant: 'error' }),
	});
};

export const usePublishReleaseEpisode = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (episodeId: number) => radioAdminApi.publishReleaseEpisode(token, episodeId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.episodes(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.episode(token, res.id) });
			enqueueSnackbar('Episode published & released', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing episode', { variant: 'error' }),
	});
};

export const useRadioAdminEpisodeEmotions = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.episodeEmotions(token),
		queryFn:  () => radioAdminApi.getEpisodeEmotions(token),
		enabled:  enabled(token),
	});

export const useSetEpisodeEmotion = (token: Token | undefined) => {
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

export const useDeleteEpisodeEmotion = (token: Token | undefined) => {
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

export const useRadioAdminReportageTypes = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.reportageTypes(token),
		queryFn:  () => radioAdminApi.getReportageTypes(token),
		enabled:  enabled(token),
	});

export const useCreateReportageType = (token: Token | undefined) => {
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

export const useUpdateReportageType = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateReportageTypePayload) => radioAdminApi.updateReportageType(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportageTypes(token) });
			if (d.id) qc.invalidateQueries({ queryKey: radioAdminKeys.reportageType(token, d.id) });
			enqueueSnackbar('Reportage type updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating reportage type', { variant: 'error' }),
	});
};

export const useDeleteReportageType = (token: Token | undefined) => {
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

export const useRadioAdminReportages = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.reportages(token),
		queryFn:  () => radioAdminApi.getReportages(token),
		enabled:  enabled(token),
	});

export const useSearchRadioAdminReportages = (token: Token | undefined, params: SearchReportagesParams) =>
	useQuery({
		queryKey: radioAdminKeys.reportagesSearch(token, params),
		queryFn:  () => radioAdminApi.searchReportages(token, params),
		enabled:  enabled(token),
	});

export const useRadioAdminReportage = (token: Token | undefined, reportageId: number) =>
	useQuery({
		queryKey: radioAdminKeys.reportage(token, reportageId),
		queryFn:  () => radioAdminApi.getReportage(token, reportageId),
		enabled:  enabled(token) && !!reportageId,
	});

export const useCreateReportage = (token: Token | undefined) => {
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

export const useUpdateReportage = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: UpdateReportagePayload) => radioAdminApi.updateReportage(token, data),
		onSuccess: (_, d) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			if (d.id) qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, d.id) });
			enqueueSnackbar('Reportage updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating reportage', { variant: 'error' }),
	});
};

export const useDeleteReportage = (token: Token | undefined) => {
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

export const useValidateReportage = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.validateReportage(token, reportageId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, res.id) });
			enqueueSnackbar('Reportage validated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error validating reportage', { variant: 'error' }),
	});
};

export const useMakePublicReportage = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.makePublicReportage(token, reportageId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, res.id) });
			enqueueSnackbar('Reportage made public', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error making reportage public', { variant: 'error' }),
	});
};

export const usePublishReportage = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.publishReportage(token, reportageId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, res.id) });
			enqueueSnackbar('Reportage published', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing reportage', { variant: 'error' }),
	});
};

export const usePublishReleaseReportage = (token: Token | undefined) => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (reportageId: number) => radioAdminApi.publishReleaseReportage(token, reportageId),
		onSuccess: (res) => {
			qc.invalidateQueries({ queryKey: radioAdminKeys.reportages(token) });
			if (res.id) qc.invalidateQueries({ queryKey: radioAdminKeys.reportage(token, res.id) });
			enqueueSnackbar('Reportage published & released', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error publishing reportage', { variant: 'error' }),
	});
};

export const useRadioAdminReportageEmotions = (token: Token | undefined) =>
	useQuery({
		queryKey: radioAdminKeys.reportageEmotions(token),
		queryFn:  () => radioAdminApi.getReportageEmotions(token),
		enabled:  enabled(token),
	});

export const useSetReportageEmotion = (token: Token | undefined) => {
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

export const useDeleteReportageEmotion = (token: Token | undefined) => {
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