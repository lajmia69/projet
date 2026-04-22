/**
 * Lessonmutations.ts — with Studio auto-create on lesson creation
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky, { HTTPError } from 'ky';
import { createStudioProjectForContent } from '@/app/(control-panel)/studio/api/utils/autoCreateStudioProject';

export type LessonCreatePayload = {
	tags: string[] | null;
	name: string;
	description: string;
	transcription: Record<string, unknown>;
	language_id: number;
	lesson_type_id: number;
	module_id: number;
};

export type LessonUpdatePayload = {
	id?: number | null;
	remove_tags: string[] | null;
	add_tags: string[] | null;
	name: string;
	description: string;
	transcription: Record<string, unknown>;
	language_id: number;
	lesson_type_id: number;
	module_id: number;
};

export type ValidateLessonPayload = {
	id?: number | null;
	is_approved_content: boolean;
};

export type PublicLessonPayload = {
	id?: number | null;
	is_pubic_content: boolean;
};

export type PublishLessonPayload = {
	id?: number | null;
	is_published: boolean;
};

const BASE_URL = 'https://radio.backend.ecocloud.tn';

function createClient(token: string) {
	return ky.create({
		prefixUrl: BASE_URL,
		retry: 0,
		timeout: 30_000,
		headers: { Authorization: `Bearer ${token}` },
	});
}

async function readError(err: unknown): Promise<string> {
	if (err instanceof HTTPError) {
		try {
			const body = await err.response.clone().json();
			return `HTTP ${err.response.status}: ${JSON.stringify(body)}`;
		} catch {
			return `HTTP ${err.response.status}: ${err.message}`;
		}
	}
	return String(err);
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export function useCreateLesson(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (payload: LessonCreatePayload) => {
			console.log('[useCreateLesson] payload:', JSON.stringify(payload, null, 2));
			return createClient(token)
				.post(`lesson/create/${accountId}/`, { json: payload })
				.json<{ id: number; name: string }>();
		},
		onSuccess: (lesson) => {
			qc.invalidateQueries({ queryKey: ['lessons'] });
			qc.invalidateQueries({ queryKey: ['lesson'] });
			console.log('[useCreateLesson] success – cache invalidated');

			// Auto-create Studio production project board
			if (lesson?.id && lesson?.name) {
				createStudioProjectForContent(
					Number(accountId), token, 'lesson', lesson.id, lesson.name,
				);
			}
		},
		onError: async (err) => {
			console.error('[useCreateLesson] error:', await readError(err));
		},
	});
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export function useUpdateLesson(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (payload: LessonUpdatePayload) => {
			console.log('[updateLesson] payload being sent:', JSON.stringify(payload, null, 2));
			return createClient(token)
				.put(`lesson/update/${accountId}/`, { json: payload })
				.json();
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['lessons'] });
			qc.invalidateQueries({ queryKey: ['lesson'] });
			console.log('[useUpdateLesson] success – cache invalidated');
		},
		onError: async (err) => {
			console.error('[useUpdateLesson] mutation error:', await readError(err));
		},
	});
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export function useDeleteLesson(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (lessonId: number) => {
			await createClient(token).delete(`lesson/delete/${accountId}/${lessonId}/`);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['lessons'] });
			qc.invalidateQueries({ queryKey: ['lesson'] });
			console.log('[useDeleteLesson] success – cache invalidated');
		},
		onError: async (err) => {
			console.error('[useDeleteLesson] error:', await readError(err));
		},
	});
}

// ─── VALIDATE ─────────────────────────────────────────────────────────────────

export function useValidateLesson(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (payload: ValidateLessonPayload) => {
			console.log('[useValidateLesson] payload:', JSON.stringify(payload, null, 2));
			return createClient(token)
				.patch(`lesson/validate/${accountId}/`, { json: payload })
				.json();
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['lessons'] });
			qc.invalidateQueries({ queryKey: ['lesson'] });
			console.log('[useValidateLesson] success – lesson approved, cache invalidated');
		},
		onError: async (err) => {
			console.error('[useValidateLesson] error:', await readError(err));
		},
	});
}

// ─── MAKE PUBLIC ──────────────────────────────────────────────────────────────

export function usePublicLesson(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (payload: PublicLessonPayload) => {
			console.log('[usePublicLesson] payload:', JSON.stringify(payload, null, 2));
			return createClient(token)
				.patch(`lesson/public/${accountId}/`, { json: payload })
				.json();
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['lessons'] });
			qc.invalidateQueries({ queryKey: ['lesson'] });
			console.log('[usePublicLesson] success – cache invalidated');
		},
		onError: async (err) => {
			console.error('[usePublicLesson] error:', await readError(err));
		},
	});
}

// ─── PUBLISH ──────────────────────────────────────────────────────────────────

export function usePublishLesson(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (payload: PublishLessonPayload) => {
			console.log('[usePublishLesson] payload:', JSON.stringify(payload, null, 2));
			return createClient(token)
				.patch(`lesson/publish/${accountId}/`, { json: payload })
				.json();
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['lessons'] });
			qc.invalidateQueries({ queryKey: ['lesson'] });
			console.log('[usePublishLesson] success – cache invalidated');
		},
		onError: async (err) => {
			console.error('[usePublishLesson] error:', await readError(err));
		},
	});
}