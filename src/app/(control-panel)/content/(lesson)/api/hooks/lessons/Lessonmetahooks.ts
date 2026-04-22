import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi } from '../../services/lessonApiService';
import { LessonType, Level, Subject, Module } from '../../types';
import { useSnackbar } from 'notistack';

// ════════════════════════════════════════════════════════════════════════════
// LESSON TYPES
// ════════════════════════════════════════════════════════════════════════════

export const lessonTypesQueryKey = (currentAccountId: string | number) => [
	'lesson', 'types', String(currentAccountId)
];
export const lessonTypeQueryKey = (currentAccountId: string | number, lessonTypeId: number) => [
	'lesson', 'type', String(currentAccountId), lessonTypeId
];

export const useLessonTypes = (currentAccountId: string | number) =>
	useQuery({
		queryKey: lessonTypesQueryKey(currentAccountId),
		queryFn: () => lessonApi.getLessonTypes(currentAccountId),
		enabled: !!currentAccountId,
		retry: 0,
	});

export const useLessonType = (currentAccountId: string | number, id: number) =>
	useQuery({
		queryKey: lessonTypeQueryKey(currentAccountId, id),
		queryFn: () => lessonApi.getLessonType(currentAccountId, id),
		enabled: !!currentAccountId && !!id,
		retry: 0,
	});

export const useCreateLessonType = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<LessonType>) =>
			lessonApi.createLessonType(currentAccountId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: lessonTypesQueryKey(currentAccountId) });
			enqueueSnackbar('Lesson type created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating lesson type', { variant: 'error' })
	});
};

export const useUpdateLessonType = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<LessonType> & { id: number }) =>
			lessonApi.updateLessonType(currentAccountId, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: lessonTypesQueryKey(currentAccountId) });
			queryClient.invalidateQueries({ queryKey: lessonTypeQueryKey(currentAccountId, data.id) });
			enqueueSnackbar('Lesson type updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating lesson type', { variant: 'error' })
	});
};

export const useDeleteLessonType = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: number) => lessonApi.deleteLessonType(currentAccountId, id),
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

export const levelsQueryKey = (currentAccountId: string | number) => [
	'lesson', 'levels', String(currentAccountId)
];
export const levelQueryKey = (currentAccountId: string | number, levelId: number) => [
	'lesson', 'level', String(currentAccountId), levelId
];

export const useLevels = (currentAccountId: string | number) =>
	useQuery({
		queryKey: levelsQueryKey(currentAccountId),
		queryFn: () => lessonApi.getLevels(currentAccountId),
		enabled: !!currentAccountId,
		retry: 0,
	});

export const useLevel = (currentAccountId: string | number, id: number) =>
	useQuery({
		queryKey: levelQueryKey(currentAccountId, id),
		queryFn: () => lessonApi.getLevel(currentAccountId, id),
		enabled: !!currentAccountId && !!id,
		retry: 0,
	});

export const useCreateLevel = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Level>) => lessonApi.createLevel(currentAccountId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: levelsQueryKey(currentAccountId) });
			enqueueSnackbar('Level created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating level', { variant: 'error' })
	});
};

export const useUpdateLevel = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Level> & { id: number }) =>
			lessonApi.updateLevel(currentAccountId, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: levelsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({ queryKey: levelQueryKey(currentAccountId, data.id) });
			enqueueSnackbar('Level updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating level', { variant: 'error' })
	});
};

export const useDeleteLevel = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: number) => lessonApi.deleteLevel(currentAccountId, id),
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

export const subjectsQueryKey = (currentAccountId: string | number) => [
	'lesson', 'subjects', String(currentAccountId)
];
export const subjectQueryKey = (currentAccountId: string | number, subjectId: number) => [
	'lesson', 'subject', String(currentAccountId), subjectId
];

export const useSubjects = (currentAccountId: string | number) =>
	useQuery({
		queryKey: subjectsQueryKey(currentAccountId),
		queryFn: () => lessonApi.getSubjects(currentAccountId),
		enabled: !!currentAccountId,
		retry: 0,
	});

export const useSubject = (currentAccountId: string | number, id: number) =>
	useQuery({
		queryKey: subjectQueryKey(currentAccountId, id),
		queryFn: () => lessonApi.getSubject(currentAccountId, id),
		enabled: !!currentAccountId && !!id,
		retry: 0,
	});

export const useCreateSubject = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Subject>) => lessonApi.createSubject(currentAccountId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: subjectsQueryKey(currentAccountId) });
			enqueueSnackbar('Subject created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating subject', { variant: 'error' })
	});
};

export const useUpdateSubject = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Subject> & { id: number }) =>
			lessonApi.updateSubject(currentAccountId, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: subjectsQueryKey(currentAccountId) });
			queryClient.invalidateQueries({ queryKey: subjectQueryKey(currentAccountId, data.id) });
			enqueueSnackbar('Subject updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating subject', { variant: 'error' })
	});
};

export const useDeleteSubject = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: number) => lessonApi.deleteSubject(currentAccountId, id),
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

export const modulesQueryKey = (currentAccountId: string | number) => [
	'lesson', 'modules', String(currentAccountId)
];
export const moduleQueryKey = (currentAccountId: string | number, moduleId: number) => [
	'lesson', 'module', String(currentAccountId), moduleId
];

export const useModules = (currentAccountId: string | number) =>
	useQuery({
		queryKey: modulesQueryKey(currentAccountId),
		queryFn: () => lessonApi.getModules(currentAccountId),
		enabled: !!currentAccountId,
		retry: 0,
	});

export const useModule = (currentAccountId: string | number, id: number) =>
	useQuery({
		queryKey: moduleQueryKey(currentAccountId, id),
		queryFn: () => lessonApi.getModule(currentAccountId, id),
		enabled: !!currentAccountId && !!id,
		retry: 0,
	});

export const useCreateModule = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Module>) => lessonApi.createModule(currentAccountId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: modulesQueryKey(currentAccountId) });
			enqueueSnackbar('Module created', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error creating module', { variant: 'error' })
	});
};

export const useUpdateModule = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (data: Partial<Module> & { id: number }) =>
			lessonApi.updateModule(currentAccountId, data),
		onSuccess: (_, data) => {
			queryClient.invalidateQueries({ queryKey: modulesQueryKey(currentAccountId) });
			queryClient.invalidateQueries({ queryKey: moduleQueryKey(currentAccountId, data.id) });
			enqueueSnackbar('Module updated', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error updating module', { variant: 'error' })
	});
};

export const useDeleteModule = (currentAccountId: string | number) => {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();
	return useMutation({
		mutationFn: (id: number) => lessonApi.deleteModule(currentAccountId, id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: modulesQueryKey(currentAccountId) });
			enqueueSnackbar('Module deleted', { variant: 'success' });
		},
		onError: () => enqueueSnackbar('Error deleting module', { variant: 'error' })
	});
};
