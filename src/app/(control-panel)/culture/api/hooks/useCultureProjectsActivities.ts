import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { cultureApi } from '../services/cultureApiService';
import { CulturalProject, CulturalActivity } from '../types/projectsAndActivities';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const projectsQueryKey = ['culture', 'projects'];
export const projectQueryKey = (id: string) => ['culture', 'project', id];

export const activitiesQueryKey = ['culture', 'activities'];
export const activityQueryKey = (id: string) => ['culture', 'activity', id];

// ════════════════════════════════════════════════════════════════════════════
// CULTURAL PROJECTS
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalProjects = () =>
	useQuery({
		queryKey: projectsQueryKey,
		queryFn: cultureApi.getProjects
	});

export const useCulturalProject = (id: string) =>
	useQuery({
		queryKey: projectQueryKey(id),
		queryFn: () => cultureApi.getProject(id),
		enabled: !!id
	});

export const useCreateCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Omit<CulturalProject, 'id' | 'createdAt' | 'updatedAt'>) =>
			cultureApi.createProject(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			enqueueSnackbar('Projet créé avec succès', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Erreur lors de la création du projet', { variant: 'error' })
	});
};

export const useUpdateCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<CulturalProject> }) =>
			cultureApi.updateProject(id, data),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			qc.invalidateQueries({ queryKey: projectQueryKey(id) });
			enqueueSnackbar('Projet mis à jour', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' })
	});
};

export const useDeleteCulturalProject = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: string) => cultureApi.deleteProject(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: projectsQueryKey });
			enqueueSnackbar('Projet supprimé', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' })
	});
};

// ════════════════════════════════════════════════════════════════════════════
// CULTURAL ACTIVITIES
// ════════════════════════════════════════════════════════════════════════════

export const useCulturalActivities = () =>
	useQuery({
		queryKey: activitiesQueryKey,
		queryFn: cultureApi.getActivities
	});

export const useCulturalActivity = (id: string) =>
	useQuery({
		queryKey: activityQueryKey(id),
		queryFn: () => cultureApi.getActivity(id),
		enabled: !!id
	});

export const useCreateCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Omit<CulturalActivity, 'id' | 'createdAt' | 'updatedAt'>) =>
			cultureApi.createActivity(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			enqueueSnackbar('Activité créée avec succès', { variant: 'success' });
		},
		onError: () => enqueueSnackbar("Erreur lors de la création de l'activité", { variant: 'error' })
	});
};

export const useUpdateCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<CulturalActivity> }) =>
			cultureApi.updateActivity(id, data),
		onSuccess: (_, { id }) => {
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			qc.invalidateQueries({ queryKey: activityQueryKey(id) });
			enqueueSnackbar('Activité mise à jour', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Erreur lors de la mise à jour', { variant: 'error' })
	});
};

export const useDeleteCulturalActivity = () => {
	const qc = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: string) => cultureApi.deleteActivity(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: activitiesQueryKey });
			enqueueSnackbar('Activité supprimée', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Erreur lors de la suppression', { variant: 'error' })
	});
};