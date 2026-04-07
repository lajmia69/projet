import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import * as api from '../services/cultureApiService';
import {
	CreateCulturalProjectPayload,
	UpdateCulturalProjectPayload,
	CreateCulturalActivityPayload,
	UpdateCulturalActivityPayload
} from '../types/projectsAndActivities';

// ─── JWT helpers ─────────────────────────────────────────────────────────────

/**
 * Decodes the payload section of a JWT without verifying the signature.
 * Returns null if the token is missing or malformed.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const part = token.split('.')[1];
		if (!part) return null;
		// atob requires standard base64; JWT uses base64url
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

/**
 * Reads the current account's numeric ID from the JWT stored in localStorage.
 *
 * Common JWT payload field names tried in order:
 *   account_id → user_account_id → account → id → user_id → sub
 *
 * Falls back to 1 when none are found so queries still fire (they will
 * receive a 401 from the API if the token itself is missing/expired).
 *
 * This hook intentionally has NO react-redux dependency so it works
 * whether or not a <Provider> wraps the current route tree.
 */
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

	// Re-read whenever localStorage changes (e.g. after login in another tab)
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
// TYPES
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalProjectTypes = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: projectTypesQueryKey,
		queryFn: () => api.getProjectTypes(accountId),
		enabled: accountId > 0
	});
};

export const useCulturalActivityTypes = () => {
	const accountId = useAccountId();
	return useQuery({
		queryKey: activityTypesQueryKey,
		queryFn: () => api.getActivityTypes(accountId),
		enabled: accountId > 0
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