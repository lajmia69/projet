import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as api from '../services/cultureApiService';
import {
	CreateCulturalProjectPayload,
	UpdateCulturalProjectPayload,
	CreateCulturalActivityPayload,
	UpdateCulturalActivityPayload,
	CreateCulturalProjectTypePayload,
	UpdateCulturalProjectTypePayload,
	CreateCulturalActivityTypePayload,
	UpdateCulturalActivityTypePayload
} from '../types/projectsAndActivities';

// ─── JWT helpers ─────────────────────────────────────────────────────────────

function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const part = token.split('.')[1];
		if (!part) return null;
		const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
		return JSON.parse(atob(base64));
	} catch {
		return null;
	}
}

function readTokenFromStorage(): string {
	if (typeof window === 'undefined') return '';
	return (
		localStorage.getItem('jwt_access_token') ||
		localStorage.getItem('fusejs_access_token') ||
		localStorage.getItem('access_token') ||
		''
	);
}

export function useAccountId(): number {
	const [accountId, setAccountId] = useState<number>(() => {
		const token = readTokenFromStorage();
		const payload = decodeJwtPayload(token);
		if (!payload) return 1;
		const value =
			payload['account_id'] ??
			payload['user_account_id'] ??
			payload['account'] ??
			payload['id'] ??
			payload['user_id'] ??
			payload['sub'];
		const num = Number(value);
		return Number.isFinite(num) && num > 0 ? num : 1;
	});

	useEffect(() => {
		const sync = () => {
			const token = readTokenFromStorage();
			const payload = decodeJwtPayload(token);
			if (!payload) return;
			const value =
				payload['account_id'] ??
				payload['user_account_id'] ??
				payload['account'] ??
				payload['id'] ??
				payload['user_id'] ??
				payload['sub'];
			const num = Number(value);
			if (Number.isFinite(num) && num > 0) setAccountId(num);
		};
		window.addEventListener('storage', sync);
		return () => window.removeEventListener('storage', sync);
	}, []);

	return accountId;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const projectTypesQueryKey = ['culture', 'project-types'];
export const activityTypesQueryKey = ['culture', 'activity-types'];
export const projectsQueryKey = ['culture', 'projects'];
export const projectQueryKey = (id: number) => ['culture', 'project', id];
export const activitiesQueryKey = ['culture', 'activities'];
export const activityQueryKey = (id: number) => ['culture', 'activity', id];

// ════════════════════════════════════════════════════════════════════════════
// PROJECT TYPES — full CRUD
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalProjectTypes = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: projectTypesQueryKey,
		queryFn: () => api.getProjectTypes(accountId),
		enabled: accountId > 0
	});
};

export const useCreateCulturalProjectType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: CreateCulturalProjectTypePayload) =>
			api.createProjectType(accountId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectTypesQueryKey });
			enqueueSnackbar('Project type created', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
	});
};

export const useUpdateCulturalProjectType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: UpdateCulturalProjectTypePayload) =>
			api.updateProjectType(accountId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectTypesQueryKey });
			enqueueSnackbar('Project type updated', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
	});
};

export const useDeleteCulturalProjectType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.deleteProjectType(accountId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectTypesQueryKey });
			enqueueSnackbar('Project type deleted', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
	});
};

// ════════════════════════════════════════════════════════════════════════════
// ACTIVITY TYPES — full CRUD
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalActivityTypes = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: activityTypesQueryKey,
		queryFn: () => api.getActivityTypes(accountId),
		enabled: accountId > 0
	});
};

export const useCreateCulturalActivityType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: CreateCulturalActivityTypePayload) =>
			api.createActivityType(accountId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activityTypesQueryKey });
			enqueueSnackbar('Activity type created', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
	});
};

export const useUpdateCulturalActivityType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (payload: UpdateCulturalActivityTypePayload) =>
			api.updateActivityType(accountId, payload),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activityTypesQueryKey });
			enqueueSnackbar('Activity type updated', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
	});
};

export const useDeleteCulturalActivityType = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	const accountId = useAccountId();
	return useMutation({
		mutationFn: (id: number) => api.deleteActivityType(accountId, id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activityTypesQueryKey });
			enqueueSnackbar('Activity type deleted', { variant: 'success' });
		},
		onError: (err: Error) =>
			enqueueSnackbar(`Error: ${err.message}`, { variant: 'error' })
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
		enabled: accountId > 0
	});
};

export const useCulturalProject = (id: number) => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: projectQueryKey(id),
		queryFn: () => api.getProject(accountId, id),
		enabled: id > 0 && accountId > 0
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
		enabled: accountId > 0
	});
};

export const useCulturalActivity = (id: number) => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: activityQueryKey(id),
		queryFn: () => api.getActivity(accountId, id),
		enabled: id > 0 && accountId > 0
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