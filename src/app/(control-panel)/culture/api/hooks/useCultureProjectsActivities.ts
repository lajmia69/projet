import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import * as api from '../services/cultureApiService';
import {
	CreateCulturalProjectPayload,
	UpdateCulturalProjectPayload,
	CreateCulturalActivityPayload,
	UpdateCulturalActivityPayload
} from '../types/projectsAndActivities';

// ─── Account ID helper ────────────────────────────────────────────────────────

/**
 * Reads the current account's numeric ID from the Redux store.
 * Tries several common locations used by Fuse-based backends.
 */
export function useAccountId(): number {
	return useSelector(
		(state: any) =>
			state?.user?.data?.account_id ??
			state?.user?.data?.id ??
			state?.auth?.user?.data?.id ??
			1
	) as number;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const projectTypesQueryKey = ['culture', 'project-types'];
export const activityTypesQueryKey = ['culture', 'activity-types'];

export const projectsQueryKey = ['culture', 'projects'];
export const projectQueryKey = (id: number) => ['culture', 'project', id];

export const activitiesQueryKey = ['culture', 'activities'];
export const activityQueryKey = (id: number) => ['culture', 'activity', id];

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalProjectTypes = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: projectTypesQueryKey,
		queryFn: () => api.getProjectTypes(accountId),
		enabled: !!accountId
	});
};

export const useCulturalActivityTypes = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: activityTypesQueryKey,
		queryFn: () => api.getActivityTypes(accountId),
		enabled: !!accountId
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
		enabled: !!accountId
	});
};

export const useCulturalProject = (id: number) => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: projectQueryKey(id),
		queryFn: () => api.getProject(accountId, id),
		enabled: !!id && !!accountId
	});
};

export const useCreateCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: CreateCulturalProjectPayload) =>
			api.createProject(accountId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			enqueueSnackbar('Project created successfully', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error creating project: ${err.message}`, { variant: 'error' })
	});
};

export const useUpdateCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: UpdateCulturalProjectPayload) =>
			api.updateProject(accountId, payload),
		onSuccess: (_, payload) => {
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			qc.invalidateQueries({ queryKey: projectQueryKey(payload.id) });
			enqueueSnackbar('Project updated', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error updating project: ${err.message}`, { variant: 'error' })
	});
};

export const useDeleteCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.deleteProject(accountId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			enqueueSnackbar('Project deleted', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error deleting project: ${err.message}`, { variant: 'error' })
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
		enabled: !!accountId
	});
};

export const useCulturalActivity = (id: number) => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: activityQueryKey(id),
		queryFn: () => api.getActivity(accountId, id),
		enabled: !!id && !!accountId
	});
};

export const useCreateCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: CreateCulturalActivityPayload) =>
			api.createActivity(accountId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			enqueueSnackbar('Activity created successfully', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error creating activity: ${err.message}`, { variant: 'error' })
	});
};

export const useUpdateCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: UpdateCulturalActivityPayload) =>
			api.updateActivity(accountId, payload),
		onSuccess: (_, payload) => {
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			qc.invalidateQueries({ queryKey: activityQueryKey(payload.id) });
			enqueueSnackbar('Activity updated', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error updating activity: ${err.message}`, { variant: 'error' })
	});
};

export const useDeleteCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.deleteActivity(accountId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			enqueueSnackbar('Activity deleted', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error deleting activity: ${err.message}`, { variant: 'error' })
	});
};