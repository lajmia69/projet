/**
 * useCultureProjectsActivities.ts — with Studio auto-create on content creation
 *
 * Changes vs original:
 * - useCreateCulturalProject: creates a Studio project board after success
 * - useCreateCulturalActivity: creates a Studio project board after success
 * All other hooks are unchanged.
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as api from '../services/cultureApiService';
import { getNextAuthAccountId, getAccessTokenAsync } from '../utils/authTokenUtils';
import { createStudioProjectForContent } from '@/app/(control-panel)/studio/api/utils/autoCreateStudioProject';
import {
	CreateCulturalProjectPayload,
	UpdateCulturalProjectPayload,
	CreateCulturalActivityPayload,
	UpdateCulturalActivityPayload,
	CreateCulturalProjectTypePayload,
	UpdateCulturalProjectTypePayload,
	CreateCulturalActivityTypePayload,
	UpdateCulturalActivityTypePayload,
} from '../types/projectsAndActivities';

// ─── useAccountId ─────────────────────────────────────────────────────────────

export function useAccountId(): number {
	const [accountId, setAccountId] = useState<number>(0);

	useEffect(() => {
		let cancelled = false;
		getNextAuthAccountId().then((id) => {
			if (!cancelled && id > 0) setAccountId(id);
		});
		return () => { cancelled = true; };
	}, []);

	return accountId;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const projectTypesQueryKey  = ['culture', 'project-types'];
export const activityTypesQueryKey = ['culture', 'activity-types'];
export const projectsQueryKey      = ['culture', 'projects'];
export const projectQueryKey       = (id: number) => ['culture', 'project', id];
export const activitiesQueryKey    = ['culture', 'activities'];
export const activityQueryKey      = (id: number) => ['culture', 'activity', id];

// ════════════════════════════════════════════════════════════════════════════
// PROJECT TYPES
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalProjectTypes = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: projectTypesQueryKey,
		queryFn: () => api.getProjectTypes(accountId),
		enabled: accountId > 0,
		retry: false,
		refetchOnWindowFocus: false,
	});
};

export const useCreateCulturalProjectType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: CreateCulturalProjectTypePayload) =>
			api.createProjectType(accountId, payload),
		retry: false,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectTypesQueryKey });
			enqueueSnackbar('Project type created', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' }),
	});
};

export const useUpdateCulturalProjectType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: UpdateCulturalProjectTypePayload) =>
			api.updateProjectType(accountId, payload),
		retry: false,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectTypesQueryKey });
			enqueueSnackbar('Project type updated', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' }),
	});
};

export const useDeleteCulturalProjectType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.deleteProjectType(accountId, id),
		retry: false,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectTypesQueryKey });
			enqueueSnackbar('Project type deleted', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// ACTIVITY TYPES
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalActivityTypes = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: activityTypesQueryKey,
		queryFn: () => api.getActivityTypes(accountId),
		enabled: accountId > 0,
		retry: false,
		refetchOnWindowFocus: false,
	});
};

export const useCreateCulturalActivityType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: CreateCulturalActivityTypePayload) =>
			api.createActivityType(accountId, payload),
		retry: false,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activityTypesQueryKey });
			enqueueSnackbar('Activity type created', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' }),
	});
};

export const useUpdateCulturalActivityType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: UpdateCulturalActivityTypePayload) =>
			api.updateActivityType(accountId, payload),
		retry: false,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activityTypesQueryKey });
			enqueueSnackbar('Activity type updated', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' }),
	});
};

export const useDeleteCulturalActivityType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.deleteActivityType(accountId, id),
		retry: false,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activityTypesQueryKey });
			enqueueSnackbar('Activity type deleted', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// CULTURAL PROJECTS
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalProjects = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: projectsQueryKey,
		queryFn: () => api.getProjects(accountId),
		enabled: accountId > 0,
		retry: false,
		refetchOnWindowFocus: false,
	});
};

export const useCulturalProject = (id: number) => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: projectQueryKey(id),
		queryFn: () => api.getProject(accountId, id),
		enabled: id > 0 && accountId > 0,
		retry: false,
		refetchOnWindowFocus: false,
	});
};

export const useCreateCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();

	return useMutation({
		mutationFn: (payload: CreateCulturalProjectPayload) =>
			api.createProject(accountId, payload),
		retry: false,
		onSuccess: async (project) => {
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			enqueueSnackbar('Project created successfully', { variant: 'success' });

			// Auto-create Studio production project board
			if (project?.id && project?.name && accountId > 0) {
				const token = await getAccessTokenAsync();
				if (token) {
					createStudioProjectForContent(
						accountId, token, 'cultural_project', project.id, project.name,
					);
				}
			}
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error creating project: ${err.message}`, { variant: 'error' }),
	});
};

export const useUpdateCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: UpdateCulturalProjectPayload) =>
			api.updateProject(accountId, payload),
		retry: false,
		onSuccess: (_, payload) => {
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			qc.invalidateQueries({ queryKey: projectQueryKey(payload.id) });
			enqueueSnackbar('Project updated', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error updating project: ${err.message}`, { variant: 'error' }),
	});
};

export const useValidateCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.validateProject(accountId, id),
		retry: false,
		onSuccess: (_, id) => {
			qc.setQueryData(projectQueryKey(id), (old: any) =>
				old ? { ...old, is_approved_content: true } : old,
			);
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			enqueueSnackbar('Project validated successfully', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error validating project: ${err.message}`, { variant: 'error' }),
	});
};

export const usePublishCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.publishProject(accountId, id),
		retry: false,
		onSuccess: (_, id) => {
			qc.setQueryData(projectQueryKey(id), (old: any) =>
				old ? { ...old, is_published: true } : old,
			);
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			enqueueSnackbar('Project published successfully', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error publishing project: ${err.message}`, { variant: 'error' }),
	});
};

export const useDeleteCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.deleteProject(accountId, id),
		retry: false,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			enqueueSnackbar('Project deleted', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error deleting project: ${err.message}`, { variant: 'error' }),
	});
};

// ════════════════════════════════════════════════════════════════════════════
// CULTURAL ACTIVITIES
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalActivities = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: activitiesQueryKey,
		queryFn: () => api.getActivities(accountId),
		enabled: accountId > 0,
		retry: false,
		refetchOnWindowFocus: false,
	});
};

export const useCulturalActivity = (id: number) => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: activityQueryKey(id),
		queryFn: () => api.getActivity(accountId, id),
		enabled: id > 0 && accountId > 0,
		retry: false,
		refetchOnWindowFocus: false,
	});
};

export const useCreateCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();

	return useMutation({
		mutationFn: (payload: CreateCulturalActivityPayload) =>
			api.createActivity(accountId, payload),
		retry: false,
		onSuccess: async (activity) => {
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			enqueueSnackbar('Activity created successfully', { variant: 'success' });

			// Auto-create Studio production project board
			if (activity?.id && activity?.name && accountId > 0) {
				const token = await getAccessTokenAsync();
				if (token) {
					createStudioProjectForContent(
						accountId, token, 'cultural_activity', activity.id, activity.name,
					);
				}
			}
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error creating activity: ${err.message}`, { variant: 'error' }),
	});
};

export const useUpdateCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: UpdateCulturalActivityPayload) =>
			api.updateActivity(accountId, payload),
		retry: false,
		onSuccess: (_, payload) => {
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			qc.invalidateQueries({ queryKey: activityQueryKey(payload.id) });
			enqueueSnackbar('Activity updated', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error updating activity: ${err.message}`, { variant: 'error' }),
	});
};

export const useValidateCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.validateActivity(accountId, id),
		retry: false,
		onSuccess: (_, id) => {
			qc.setQueryData(activityQueryKey(id), (old: any) =>
				old ? { ...old, is_approved_content: true } : old,
			);
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			enqueueSnackbar('Activity validated successfully', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error validating activity: ${err.message}`, { variant: 'error' }),
	});
};

export const usePublishCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.publishActivity(accountId, id),
		retry: false,
		onSuccess: (_, id) => {
			qc.setQueryData(activityQueryKey(id), (old: any) =>
				old ? { ...old, is_published: true } : old,
			);
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			enqueueSnackbar('Activity published successfully', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error publishing activity: ${err.message}`, { variant: 'error' }),
	});
};

export const useDeleteCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.deleteActivity(accountId, id),
		retry: false,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			enqueueSnackbar('Activity deleted', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error deleting activity: ${err.message}`, { variant: 'error' }),
	});
};