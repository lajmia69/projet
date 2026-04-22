import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';
import { LessonType, Level, Subject, Module } from '../../types';
import { useSnackbar } from 'notistack';

// ════════════════════════════════════════════════════════════════════════════
// LESSON TYPES
// ════════════════════════════════════════════════════════════════════════════

export const lessonTypesQueryKey = (currentAccountId: string) => [
	'lesson',
	'types',
	currentAccountId
];
export const lessonTypeQueryKey = (currentAccountId: string, lessonTypeId: number) => [
	'lesson',
	'type',
	currentAccountId,
	lessonTypeId
];

export const useLessonTypes = (currentAccountId: string, accessToken: string) =>
	useQuery({
		queryKey: lessonTypesQueryKey(currentAccountId),
		queryFn: () => lessonApi.getLessonTypes(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});

export const useLessonType = (currentAccountId: string, accessToken: string, id: number) =>
	useQuery({
		queryKey: lessonTypeQueryKey(currentAccountId, id),
		queryFn: () => lessonApi.getLessonType(currentAccountId, accessToken, id),
		enabled: !!currentAccountId && !!accessToken && !!id
	});

export const useCreateLessonType = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<LessonType>) =>
			lessonApi.createLessonType(currentAccountId, accessToken, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: lessonTypesQueryKey(currentAccountId) });
			enqueueSnackbar('Lesson type created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating lesson type', { variant: 'error' })
	});
};

export const useUpdateLessonType = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<LessonType> & { id: number }) =>
			lessonApi.updateLessonType(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: lessonTypesQueryKey(currentAccountId) });
			queryClient.invalidateQueries({ queryKey: lessonTypeQueryKey(currentAccountId, data.id) });
			enqueueSnackbar('Lesson type updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating lesson type', { variant: 'error' })
	});
};

export const useDeleteLessonType = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: number) => lessonApi.deleteLessonType(currentAccountId, accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: lessonTypesQueryKey(currentAccountId) });
			enqueueSnackbar('Lesson type deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting lesson type', { variant: 'error' })
	});
};

// ════════════════════════════════════════════════════════════════════════════
// LEVELS
// ════════════════════════════════════════════════════════════════════════════

export const levelsQueryKey = (currentAccountId: string) => ['lesson', 'levels', currentAccountId];
export const levelQueryKey = (currentAccountId: string, levelId: number) => [
	'lesson',
	'level',
	currentAccountId,
	levelId
];

export const useLevels = (currentAccountId: string, accessToken: string) =>
	useQuery({
		queryKey: levelsQueryKey(currentAccountId),
		queryFn: () => lessonApi.getLevels(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});

export const useLevel = (currentAccountId: string, accessToken: string, id: number) =>
	useQuery({
		queryKey: levelQueryKey(currentAccountId, id),
		queryFn: () => lessonApi.getLevel(currentAccountId, accessToken, id),
		enabled: !!currentAccountId && !!accessToken && !!id
	});

export const useCreateLevel = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Level>) =>
			lessonApi.createLevel(currentAccountId, accessToken, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: levelsQueryKey(currentAccountId) });
			enqueueSnackbar('Level created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating level', { variant: 'error' })
	});
};

export const useUpdateLevel = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Level> & { id: number }) =>
			lessonApi.updateLevel(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: levelsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({ queryKey: levelQueryKey(currentAccountId, data.id) });
			enqueueSnackbar('Level updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating level', { variant: 'error' })
	});
};

export const useDeleteLevel = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: number) => lessonApi.deleteLevel(currentAccountId, accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: levelsQueryKey(currentAccountId) });
			enqueueSnackbar('Level deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting level', { variant: 'error' })
	});
};

// ════════════════════════════════════════════════════════════════════════════
// STUDY SUBJECTS
// ════════════════════════════════════════════════════════════════════════════

export const subjectsQueryKey = (currentAccountId: string) => [
	'lesson',
	'subjects',
	currentAccountId
];
export const subjectQueryKey = (currentAccountId: string, subjectId: number) => [
	'lesson',
	'subject',
	currentAccountId,
	subjectId
];

export const useSubjects = (currentAccountId: string, accessToken: string) =>
	useQuery({
		queryKey: subjectsQueryKey(currentAccountId),
		queryFn: () => lessonApi.getSubjects(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});

export const useSubject = (currentAccountId: string, accessToken: string, id: number) =>
	useQuery({
		queryKey: subjectQueryKey(currentAccountId, id),
		queryFn: () => lessonApi.getSubject(currentAccountId, accessToken, id),
		enabled: !!currentAccountId && !!accessToken && !!id
	});

export const useCreateSubject = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Subject>) =>
			lessonApi.createSubject(currentAccountId, accessToken, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subjectsQueryKey(currentAccountId) });
			enqueueSnackbar('Subject created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating subject', { variant: 'error' })
	});
};

export const useUpdateSubject = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Subject> & { id: number }) =>
			lessonApi.updateSubject(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: subjectsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({ queryKey: subjectQueryKey(currentAccountId, data.id) });
			enqueueSnackbar('Subject updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating subject', { variant: 'error' })
	});
};

export const useDeleteSubject = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: number) => lessonApi.deleteSubject(currentAccountId, accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subjectsQueryKey(currentAccountId) });
			enqueueSnackbar('Subject deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting subject', { variant: 'error' })
	});
};

// ════════════════════════════════════════════════════════════════════════════
// MODULES
// ════════════════════════════════════════════════════════════════════════════

export const modulesQueryKey = (currentAccountId: string) => [
	'lesson',
	'modules',
	currentAccountId
];
export const moduleQueryKey = (currentAccountId: string, moduleId: number) => [
	'lesson',
	'module',
	currentAccountId,
	moduleId
];

export const useModules = (currentAccountId: string, accessToken: string) =>
	useQuery({
		queryKey: modulesQueryKey(currentAccountId),
		queryFn: () => lessonApi.getModules(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken,
		retry: 0,          // ← add this
	});

export const useModule = (currentAccountId: string, accessToken: string, id: number) =>
	useQuery({
		queryKey: moduleQueryKey(currentAccountId, id),
		queryFn: () => lessonApi.getModule(currentAccountId, accessToken, id),
		enabled: !!currentAccountId && !!accessToken && !!id
	});

export const useCreateModule = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Module>) =>
			lessonApi.createModule(currentAccountId, accessToken, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: modulesQueryKey(currentAccountId) });
			enqueueSnackbar('Module created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating module', { variant: 'error' })
	});
};

export const useUpdateModule = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Module> & { id: number }) =>
			lessonApi.updateModule(currentAccountId, accessToken, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: modulesQueryKey(currentAccountId) });
			queryClient.invalidateQueries({ queryKey: moduleQueryKey(currentAccountId, data.id) });
			enqueueSnackbar('Module updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating module', { variant: 'error' })
	});
};

export const useDeleteModule = (currentAccountId: string, accessToken: string) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: number) => lessonApi.deleteModule(currentAccountId, accessToken, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: modulesQueryKey(currentAccountId) });
			enqueueSnackbar('Module deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting module', { variant: 'error' })
	});
};