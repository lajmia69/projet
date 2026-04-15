import { api } from '@/utils/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import {
    Lesson,
    LessonList,
    LessonType,
    Level,
    Subject,
    Module,
    Language,
    LanguageList,
    SearchLessons,
    LessonCreatePayload,
    LessonUpdatePayload,
} from '../../types';

const authHeader = (accessToken: string) => ({
    headers: { Authorization: `Bearer ${accessToken}` }
});
// ─────────────────────────────────────────────────────────────────────────────
// ADD THESE THREE HOOKS to your existing Lessonmutations.ts file.
// They follow the exact same pattern as your existing useCreateLesson etc.
// The endpoint shapes come from /lesson/openapi.json
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = 'https://radio.backend.ecocloud.tn';

// ── Validate (Approve) ───────────────────────────────────────────────────────
// PATCH /lesson/validate/{current_account_id}/
// Body: { id: number, is_approved_content: boolean }
export function useValidateLesson(accountId: string, token: string) {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    return useMutation({
        mutationFn: async (payload: { id: number; is_approved_content: boolean }) => {
            return lessonApi.validateLesson(accountId, token, payload.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            enqueueSnackbar('Lesson validated', { variant: 'success' });
        },
    });
}

// ── Make Public ──────────────────────────────────────────────────────────────
// PATCH /lesson/public/{current_account_id}/
// Body: { id: number, is_pubic_content: boolean }
export function usePublicLesson(accountId: string, token: string) {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    return useMutation({
        mutationFn: async (payload: { id: number; is_pubic_content: boolean }) => {
            return lessonApi.makePublicLesson(accountId, token, payload.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            enqueueSnackbar('Lesson status updated to public', { variant: 'success' });
        },
    });
}

// ── Publish ──────────────────────────────────────────────────────────────────
// PATCH /lesson/publish/{current_account_id}/
// Body: { id: number, is_published: boolean }
export function usePublishLesson(accountId: string, token: string) {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    return useMutation({
        mutationFn: async (payload: { id: number; is_published: boolean }) => {
            return lessonApi.publishLesson(accountId, token, payload.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            enqueueSnackbar('Lesson published', { variant: 'success' });
        },
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: If your existing hooks use a shared apiService/axios instance instead
// of raw fetch, replace the fetch calls above with the same pattern your
// existing useCreateLesson / useUpdateLesson use.
// ─────────────────────────────────────────────────────────────────────────────
export const lessonApi = {
    // ─── Lesson ─────────────────────────────────────────────────────────────────

    searchLessons: async (
        currentAccountId: string,
        accessToken: string,
        search: SearchLessons
    ): Promise<LessonList> => {
        const params = new URLSearchParams();
        params.set('limit', String(search.limit ?? 10));
        params.set('offset', String(search.offset ?? 0));
        if (search.language) params.set('language', search.language);

        return api
            .get(`lesson/search/${currentAccountId}/?${params.toString()}`, authHeader(accessToken))
            .json();
    },

    getLessons: async (currentAccountId: string, accessToken: string): Promise<LessonList> => {
        return api
            .get(`lesson/list/${currentAccountId}/`, authHeader(accessToken))
            .json();
    },

    getLesson: async (
        currentAccountId: string,
        lessonId: string,
        accessToken: string
    ): Promise<Lesson> => {
        return api
            .get(`lesson/detail/${currentAccountId}/${lessonId}/`, authHeader(accessToken))
            .json();
    },

    createLesson: async (
        currentAccountId: string,
        accessToken: string,
        data: LessonCreatePayload
    ): Promise<Lesson> => {
        console.log('[createLesson] payload being sent:', JSON.stringify(data, null, 2));

        const response = await api.post(`lesson/create/${currentAccountId}/`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            json: data
        });

        if (!response.ok) {
            let errorBody: unknown;
            try {
                errorBody = await response.json();
            } catch {
                errorBody = await response.text();
            }
            console.error('[createLesson] Django rejected with status', response.status);
            console.error('[createLesson] Error body:', JSON.stringify(errorBody, null, 2));
            throw new Error(`createLesson failed: ${JSON.stringify(errorBody)}`);
        }

        return response.json();
    },

    updateLesson: async (
        currentAccountId: string,
        accessToken: string,
        data: LessonUpdatePayload   // must include: id, language_id, lesson_type_id, module_id, transcription, add_tags, remove_tags
    ): Promise<Lesson> => {
        console.log('[updateLesson] payload being sent:', JSON.stringify(data, null, 2));

        const response = await api.put(`lesson/update/${currentAccountId}/`, {
            json: data,
            ...authHeader(accessToken)
        });

        if (!response.ok) {
            let errorBody: unknown;
            try {
                errorBody = await response.json();
            } catch {
                errorBody = await response.text();
            }
            console.error('[updateLesson] Django rejected with status', response.status);
            console.error('[updateLesson] Error body:', JSON.stringify(errorBody, null, 2));
            throw new Error(`updateLesson failed: ${JSON.stringify(errorBody)}`);
        }

        return response.json();
    },

    validateLesson: async (
        currentAccountId: string,
        accessToken: string,
        lessonId: number
    ): Promise<Lesson> => {
        return api
            .patch(`lesson/validate/${currentAccountId}/`, {
                json: { id: lessonId },
                ...authHeader(accessToken)
            })
            .json();
    },

    makePublicLesson: async (
        currentAccountId: string,
        accessToken: string,
        lessonId: number
    ): Promise<Lesson> => {
        return api
            .patch(`lesson/public/${currentAccountId}/`, {
                json: { id: lessonId },
                ...authHeader(accessToken)
            })
            .json();
    },

    publishLesson: async (
        currentAccountId: string,
        accessToken: string,
        lessonId: number
    ): Promise<Lesson> => {
        return api
            .patch(`lesson/publish/${currentAccountId}/`, {
                json: { id: lessonId },
                ...authHeader(accessToken)
            })
            .json();
    },

    publishReleaseLesson: async (
        currentAccountId: string,
        accessToken: string,
        lessonId: number
    ): Promise<Lesson> => {
        return api
            .patch(`lesson/publish/release/${currentAccountId}/`, {
                json: { id: lessonId },
                ...authHeader(accessToken)
            })
            .json();
    },

    deleteLesson: async (
        currentAccountId: string,
        accessToken: string,
        lessonId: number
    ): Promise<void> => {
        await api.delete(`lesson/delete/${currentAccountId}/${lessonId}/`, authHeader(accessToken));
    },

    // ─── Languages ───────────────────────────────────────────────────────────────

    getLanguages: async (currentAccountId: string, accessToken: string): Promise<LanguageList> => {
        return api
            .get(`setting/language/list/${currentAccountId}/`, authHeader(accessToken))
            .json();
    },

    // ─── Lesson Types ────────────────────────────────────────────────────────────

    getLessonTypes: async (
        currentAccountId: string,
        accessToken: string
    ): Promise<{ items: LessonType[]; count: number }> => {
        return api
            .get(`lesson/type/list/${currentAccountId}/`, authHeader(accessToken))
            .json();
    },

    getLessonType: async (
        currentAccountId: string,
        accessToken: string,
        lessonTypeId: number
    ): Promise<LessonType> => {
        return api
            .get(`lesson/type/detail/${currentAccountId}/${lessonTypeId}/`, authHeader(accessToken))
            .json();
    },

    createLessonType: async (
        currentAccountId: string,
        accessToken: string,
        data: Partial<LessonType>
    ): Promise<LessonType> => {
        return api
            .post(`lesson/type/create/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
            .json();
    },

    updateLessonType: async (
        currentAccountId: string,
        accessToken: string,
        data: Partial<LessonType> & { id: number }
    ): Promise<LessonType> => {
        return api
            .put(`lesson/type/update/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
            .json();
    },

    deleteLessonType: async (
        currentAccountId: string,
        accessToken: string,
        lessonTypeId: number
    ): Promise<void> => {
        await api.delete(
            `lesson/type/delete/${currentAccountId}/${lessonTypeId}/`,
            authHeader(accessToken)
        );
    },

    // ─── Levels ──────────────────────────────────────────────────────────────────

    getLevels: async (
        currentAccountId: string,
        accessToken: string
    ): Promise<{ items: Level[]; count: number }> => {
        return api
            .get(`lesson/level/list/${currentAccountId}/`, authHeader(accessToken))
            .json();
    },

    getLevel: async (
        currentAccountId: string,
        accessToken: string,
        levelId: number
    ): Promise<Level> => {
        return api
            .get(`lesson/level/detail/${currentAccountId}/${levelId}/`, authHeader(accessToken))
            .json();
    },

    createLevel: async (
        currentAccountId: string,
        accessToken: string,
        data: Partial<Level>
    ): Promise<Level> => {
        return api
            .post(`lesson/level/create/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
            .json();
    },

    updateLevel: async (
        currentAccountId: string,
        accessToken: string,
        data: Partial<Level> & { id: number }
    ): Promise<Level> => {
        return api
            .put(`lesson/level/update/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
            .json();
    },

    deleteLevel: async (
        currentAccountId: string,
        accessToken: string,
        levelId: number
    ): Promise<void> => {
        await api.delete(
            `lesson/level/delete/${currentAccountId}/${levelId}/`,
            authHeader(accessToken)
        );
    },

    // ─── Study Subjects ──────────────────────────────────────────────────────────

    getSubjects: async (
        currentAccountId: string,
        accessToken: string
    ): Promise<{ items: Subject[]; count: number }> => {
        return api
            .get(`lesson/subject/list/${currentAccountId}/`, authHeader(accessToken))
            .json();
    },

    getSubject: async (
        currentAccountId: string,
        accessToken: string,
        subjectId: number
    ): Promise<Subject> => {
        return api
            .get(`lesson/subject/detail/${currentAccountId}/${subjectId}/`, authHeader(accessToken))
            .json();
    },

    createSubject: async (
        currentAccountId: string,
        accessToken: string,
        data: Partial<Subject>
    ): Promise<Subject> => {
        return api
            .post(`lesson/subject/create/${currentAccountId}/`, {
                json: data,
                ...authHeader(accessToken)
            })
            .json();
    },

    updateSubject: async (
        currentAccountId: string,
        accessToken: string,
        data: Partial<Subject> & { id: number }
    ): Promise<Subject> => {
        return api
            .put(`lesson/subject/update/${currentAccountId}/`, {
                json: data,
                ...authHeader(accessToken)
            })
            .json();
    },

    deleteSubject: async (
        currentAccountId: string,
        accessToken: string,
        subjectId: number
    ): Promise<void> => {
        await api.delete(
            `lesson/subject/delete/${currentAccountId}/${subjectId}/`,
            authHeader(accessToken)
        );
    },

    // ─── Modules ─────────────────────────────────────────────────────────────────

    getModules: async (
        currentAccountId: string,
        accessToken: string
    ): Promise<{ items: Module[]; count: number }> => {
        return api
            .get(`lesson/module/list/${currentAccountId}/`, authHeader(accessToken))
            .json();
    },

    getModule: async (
        currentAccountId: string,
        accessToken: string,
        moduleId: number
    ): Promise<Module> => {
        return api
            .get(`lesson/module/detail/${currentAccountId}/${moduleId}/`, authHeader(accessToken))
            .json();
    },

    createModule: async (
        currentAccountId: string,
        accessToken: string,
        data: Partial<Module>
    ): Promise<Module> => {
        return api
            .post(`lesson/module/create/${currentAccountId}/`, {
                json: data,
                ...authHeader(accessToken)
            })
            .json();
    },

    updateModule: async (
        currentAccountId: string,
        accessToken: string,
        data: Partial<Module> & { id: number }
    ): Promise<Module> => {
        return api
            .put(`lesson/module/update/${currentAccountId}/`, {
                json: data,
                ...authHeader(accessToken)
            })
            .json();
    },

    deleteModule: async (
        currentAccountId: string,
        accessToken: string,
        moduleId: number
    ): Promise<void> => {
        await api.delete(
            `lesson/module/delete/${currentAccountId}/${moduleId}/`,
            authHeader(accessToken)
        );
    },

    // ─── Lesson Emotions ─────────────────────────────────────────────────────────

    getLessonEmotions: async (
        currentAccountId: string,
        accessToken: string
    ): Promise<{ items: LessonEmotion[]; count: number }> => {
        return api
            .get(`lesson/emotion/list/${currentAccountId}/`, authHeader(accessToken))
            .json();
    },

    getLessonEmotion: async (
        currentAccountId: string,
        accessToken: string,
        lessonId: number
    ): Promise<LessonEmotion> => {
        return api
            .get(`lesson/emotion/detail/${currentAccountId}/${lessonId}/`, authHeader(accessToken))
            .json();
    },

    setLessonEmotion: async (
        currentAccountId: string,
        accessToken: string,
        data: SetLessonEmotionPayload
    ): Promise<LessonEmotion> => {
        return api
            .post(`lesson/emotion/set/${currentAccountId}/`, { json: data, ...authHeader(accessToken) })
            .json();
    },

    deleteLessonEmotion: async (
        currentAccountId: string,
        accessToken: string,
        lessonId: number
    ): Promise<void> => {
        await api.delete(
            `lesson/emotion/delete/${currentAccountId}/${lessonId}/`,
            authHeader(accessToken)
        );
    }
};

// local types used only by this service (also exported from types/index.ts)
export type LessonEmotion = {
    id: number;
    lesson: number;
    emotion_type: string;
    emotion_label: string;
    count: number;
    user_emotion: string | null;
};

export type SetLessonEmotionPayload = {
    lesson_id: number;
    emotion_type: string;
};

// ─── React hooks ─────────────────────────────────────────────────────────────

const lessonsQueryKey = ['lesson', 'search'];

export const useCreateLesson = (currentAccountId: string, accessToken: string) => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: (data: LessonCreatePayload) =>
            lessonApi.createLesson(currentAccountId, accessToken, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lessonsQueryKey });
            enqueueSnackbar('Lesson created successfully', { variant: 'success' });
        },
        onError: (error: Error) => {
            console.error('[useCreateLesson] mutation error:', error.message);
            enqueueSnackbar(`Error creating lesson: ${error.message}`, { variant: 'error' });
        }
    });
};

export const useUpdateLesson = (currentAccountId: string, accessToken: string) => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: (data: LessonUpdatePayload) =>
            lessonApi.updateLesson(currentAccountId, accessToken, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lessonsQueryKey });
            enqueueSnackbar('Lesson updated', { variant: 'success' });
        },
        onError: (error: Error) => {
            console.error('[useUpdateLesson] mutation error:', error.message);
            enqueueSnackbar(`Error updating lesson: ${error.message}`, { variant: 'error' });
        }
    });
};

export const useDeleteLesson = (currentAccountId: string, accessToken: string) => {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: (lessonId: number) =>
            lessonApi.deleteLesson(currentAccountId, accessToken, lessonId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: lessonsQueryKey });
            enqueueSnackbar('Lesson deleted', { variant: 'success' });
        },
        onError: (error: Error) => {
            console.error('[useDeleteLesson] mutation error:', error.message);
            enqueueSnackbar('Error deleting lesson', { variant: 'error' });
        }
    });
};