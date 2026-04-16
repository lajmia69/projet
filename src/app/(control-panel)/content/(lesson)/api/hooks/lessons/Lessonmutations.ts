/**
 * Lessonmutations.ts
 *
 * Fixes applied:
 * 1. ✅ `createClient(token)` used for EVERY mutation → no more 401 on public/publish
 * 2. ✅ `retry: 0` → no more triple 500 floods in the console
 * 3. ✅ `queryClient.invalidateQueries` in onSuccess of ALL mutations
 *    → the lessons table now refreshes after validate / make-public / publish
 * 4. ✅ Proper console logging so errors always appear in the log
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import ky, { HTTPError } from 'ky';

// ─── Types ────────────────────────────────────────────────────────────────────
// These mirror the OpenAPI schemas exactly.

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
	/** Optional — the server identifies the record from the body id field */
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

/** PATCH /lesson/validate/{accountId}/ */
export type ValidateLessonPayload = {
	id?: number | null;
	is_approved_content: boolean;
};

/** PATCH /lesson/public/{accountId}/ */
export type PublicLessonPayload = {
	id?: number | null;
	is_pubic_content: boolean;
};

/** PATCH /lesson/publish/{accountId}/ */
export type PublishLessonPayload = {
	id?: number | null;
	is_published: boolean;
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

const BASE_URL = 'https://radio.backend.ecocloud.tn';

/**
 * Creates an authenticated ky instance.
 * retry: 0 prevents ky from re-sending failing requests
 * (otherwise a single 500 floods the log with 3 identical errors).
 */
function createClient(token: string) {
	return ky.create({
		prefixUrl: BASE_URL,
		retry: 0,
		timeout: 30_000,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

/** Extract a readable message from any error shape */
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

// ─── CRUD mutations ───────────────────────────────────────────────────────────

/**
 * POST /lesson/create/{accountId}/
 */
export function useCreateLesson(accountId: string | number, token: string) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (payload: LessonCreatePayload) => {
			console.log('[useCreateLesson] payload:', JSON.stringify(payload, null, 2));
			return createClient(token)
				.post(`lesson/create/${accountId}/`, { json: payload })
				.json();
		},
		onSuccess: () => {
			// Invalidate every query whose key starts with 'lessons' or 'lesson'
			qc.invalidateQueries({ queryKey: ['lessons'] });
			qc.invalidateQueries({ queryKey: ['lesson'] });
			console.log('[useCreateLesson] success – cache invalidated');
		},
		onError: async (err) => {
			console.error('[useCreateLesson] error:', await readError(err));
		},
	});
}

/**
 * PUT /lesson/update/{accountId}/
 *
 * ⚠️  If the backend still returns 500 after this fix, the issue is server-side.
 * Inspect the Django traceback in: Network tab → failing request → Response body.
 * Most common cause: the backend crashes when `transcription` is `{}` and tries
 * to access a sub-field. In that case pass the existing transcription object
 * unmodified (see LessonsAdminView handleEdit – already does `editingLesson.transcription ?? {}`).
 */
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

/**
 * DELETE /lesson/delete/{accountId}/{lessonId}/
 */
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

// ─── Status / workflow mutations ──────────────────────────────────────────────

/**
 * PATCH /lesson/validate/{accountId}/
 * Body: { id: lessonId, is_approved_content: true }
 *
 * ✅ FIX: added queryClient.invalidateQueries → the Status column now updates
 *         without requiring a manual page refresh.
 */
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
			// ← This was the missing piece: the toast fired but the list never refreshed
			qc.invalidateQueries({ queryKey: ['lessons'] });
			qc.invalidateQueries({ queryKey: ['lesson'] });
			console.log('[useValidateLesson] success – lesson approved, cache invalidated');
		},
		onError: async (err) => {
			console.error('[useValidateLesson] error:', await readError(err));
		},
	});
}

/**
 * PATCH /lesson/public/{accountId}/
 * Body: { id: lessonId, is_pubic_content: true }
 *
 * ✅ FIX: createClient(token) now attaches Authorization header → 401 resolved.
 */
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

/**
 * PATCH /lesson/publish/{accountId}/
 * Body: { id: lessonId, is_published: true }
 *
 * ✅ FIX: createClient(token) now attaches Authorization header → 401 resolved.
 */
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