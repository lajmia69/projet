import { apiClient } from '@/utils/apiClient';
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
	LessonEmotion,
	SetLessonEmotionPayload,
} from '../types';

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Always send the account ID as a plain number, matching the OpenAPI schema. */
const id = (v: string | number) => Number(v);

/** Build clean search params — omit any key whose value is falsy. */
const cleanParams = (raw: Record<string, string | number | null | undefined>) => {
	const p = new URLSearchParams();
	for (const [k, v] of Object.entries(raw)) {
		if (v !== null && v !== undefined && v !== '') {
			p.set(k, String(v));
		}
	}
	return p;
};

// ─── service ─────────────────────────────────────────────────────────────────

export const lessonApi = {
	// ─── Lesson ─────────────────────────────────────────────────────────────────

	searchLessons: (currentAccountId: string | number, search: SearchLessons): Promise<LessonList> =>
		apiClient
			.get(`lesson/search/${id(currentAccountId)}/`, {
				// Use ky's searchParams option instead of manual URL building.
				// This avoids the ?-in-path issue that can crash stricter Django views.
				searchParams: cleanParams({
					limit: search.limit ?? 50,
					offset: search.offset ?? 0,
					language: search.language,
					module: search.module,
					level: search.level,
					subject: search.subject,
					lesson_type: search.lesson_type,
					tags: search.tags,
					name: search.name,
				}),
			})
			.json(),

	getLessons: (currentAccountId: string | number): Promise<LessonList> =>
		apiClient.get(`lesson/list/${id(currentAccountId)}/`).json(),

	getLesson: (currentAccountId: string | number, lessonId: string | number): Promise<Lesson> =>
		apiClient.get(`lesson/detail/${id(currentAccountId)}/${id(lessonId)}/`).json(),

	createLesson: (
		currentAccountId: string | number,
		data: LessonCreatePayload
	): Promise<Lesson> =>
		apiClient.post(`lesson/create/${id(currentAccountId)}/`, { json: data }).json(),

	updateLesson: (
		currentAccountId: string | number,
		data: LessonUpdatePayload
	): Promise<Lesson> =>
		apiClient.put(`lesson/update/${id(currentAccountId)}/`, { json: data }).json(),

	validateLesson: (currentAccountId: string | number, lessonId: number): Promise<Lesson> =>
		apiClient
			.patch(`lesson/validate/${id(currentAccountId)}/`, { json: { id: lessonId } })
			.json(),

	makePublicLesson: (currentAccountId: string | number, lessonId: number): Promise<Lesson> =>
		apiClient
			.patch(`lesson/public/${id(currentAccountId)}/`, { json: { id: lessonId } })
			.json(),

	publishLesson: (currentAccountId: string | number, lessonId: number): Promise<Lesson> =>
		apiClient
			.patch(`lesson/publish/${id(currentAccountId)}/`, { json: { id: lessonId } })
			.json(),

	publishReleaseLesson: (currentAccountId: string | number, lessonId: number): Promise<Lesson> =>
		apiClient
			.patch(`lesson/publish/release/${id(currentAccountId)}/`, { json: { id: lessonId } })
			.json(),

	deleteLesson: (currentAccountId: string | number, lessonId: number): Promise<void> =>
		apiClient.delete(`lesson/delete/${id(currentAccountId)}/${lessonId}/`).json(),

	// ─── Languages ───────────────────────────────────────────────────────────────

	getLanguages: (currentAccountId: string | number): Promise<LanguageList> =>
		apiClient.get(`setting/language/list/${id(currentAccountId)}/`).json(),

	// ─── Lesson Types ────────────────────────────────────────────────────────────

	getLessonTypes: (
		currentAccountId: string | number
	): Promise<{ items: LessonType[]; count: number }> =>
		apiClient.get(`lesson/type/list/${id(currentAccountId)}/`).json(),

	getLessonType: (currentAccountId: string | number, lessonTypeId: number): Promise<LessonType> =>
		apiClient.get(`lesson/type/detail/${id(currentAccountId)}/${lessonTypeId}/`).json(),

	createLessonType: (
		currentAccountId: string | number,
		data: Partial<LessonType>
	): Promise<LessonType> =>
		apiClient.post(`lesson/type/create/${id(currentAccountId)}/`, { json: data }).json(),

	updateLessonType: (
		currentAccountId: string | number,
		data: Partial<LessonType> & { id: number }
	): Promise<LessonType> =>
		apiClient.put(`lesson/type/update/${id(currentAccountId)}/`, { json: data }).json(),

	deleteLessonType: (currentAccountId: string | number, lessonTypeId: number): Promise<void> =>
		apiClient.delete(`lesson/type/delete/${id(currentAccountId)}/${lessonTypeId}/`).json(),

	// ─── Levels ──────────────────────────────────────────────────────────────────

	getLevels: (
		currentAccountId: string | number
	): Promise<{ items: Level[]; count: number }> =>
		apiClient.get(`lesson/level/list/${id(currentAccountId)}/`).json(),

	getLevel: (currentAccountId: string | number, levelId: number): Promise<Level> =>
		apiClient.get(`lesson/level/detail/${id(currentAccountId)}/${levelId}/`).json(),

	createLevel: (currentAccountId: string | number, data: Partial<Level>): Promise<Level> =>
		apiClient.post(`lesson/level/create/${id(currentAccountId)}/`, { json: data }).json(),

	updateLevel: (
		currentAccountId: string | number,
		data: Partial<Level> & { id: number }
	): Promise<Level> =>
		apiClient.put(`lesson/level/update/${id(currentAccountId)}/`, { json: data }).json(),

	deleteLevel: (currentAccountId: string | number, levelId: number): Promise<void> =>
		apiClient.delete(`lesson/level/delete/${id(currentAccountId)}/${levelId}/`).json(),

	// ─── Study Subjects ──────────────────────────────────────────────────────────

	getSubjects: (
		currentAccountId: string | number
	): Promise<{ items: Subject[]; count: number }> =>
		apiClient.get(`lesson/subject/list/${id(currentAccountId)}/`).json(),

	getSubject: (currentAccountId: string | number, subjectId: number): Promise<Subject> =>
		apiClient.get(`lesson/subject/detail/${id(currentAccountId)}/${subjectId}/`).json(),

	createSubject: (currentAccountId: string | number, data: Partial<Subject>): Promise<Subject> =>
		apiClient.post(`lesson/subject/create/${id(currentAccountId)}/`, { json: data }).json(),

	updateSubject: (
		currentAccountId: string | number,
		data: Partial<Subject> & { id: number }
	): Promise<Subject> =>
		apiClient.put(`lesson/subject/update/${id(currentAccountId)}/`, { json: data }).json(),

	deleteSubject: (currentAccountId: string | number, subjectId: number): Promise<void> =>
		apiClient.delete(`lesson/subject/delete/${id(currentAccountId)}/${subjectId}/`).json(),

	// ─── Modules ─────────────────────────────────────────────────────────────────

	getModules: (
		currentAccountId: string | number
	): Promise<{ items: Module[]; count: number }> =>
		apiClient.get(`lesson/module/list/${id(currentAccountId)}/`).json(),

	getModule: (currentAccountId: string | number, moduleId: number): Promise<Module> =>
		apiClient.get(`lesson/module/detail/${id(currentAccountId)}/${moduleId}/`).json(),

	createModule: (currentAccountId: string | number, data: Partial<Module>): Promise<Module> =>
		apiClient.post(`lesson/module/create/${id(currentAccountId)}/`, { json: data }).json(),

	updateModule: (
		currentAccountId: string | number,
		data: Partial<Module> & { id: number }
	): Promise<Module> =>
		apiClient.put(`lesson/module/update/${id(currentAccountId)}/`, { json: data }).json(),

	deleteModule: (currentAccountId: string | number, moduleId: number): Promise<void> =>
		apiClient.delete(`lesson/module/delete/${id(currentAccountId)}/${moduleId}/`).json(),

	// ─── Lesson Emotions ─────────────────────────────────────────────────────────

	getLessonEmotions: (
		currentAccountId: string | number
	): Promise<{ items: LessonEmotion[]; count: number }> =>
		apiClient.get(`lesson/emotion/list/${id(currentAccountId)}/`).json(),

	getLessonEmotion: (currentAccountId: string | number, lessonId: number): Promise<LessonEmotion> =>
		apiClient.get(`lesson/emotion/detail/${id(currentAccountId)}/${lessonId}/`).json(),

	setLessonEmotion: (
		currentAccountId: string | number,
		data: SetLessonEmotionPayload
	): Promise<LessonEmotion> =>
		apiClient.post(`lesson/emotion/set/${id(currentAccountId)}/`, { json: data }).json(),

	deleteLessonEmotion: (currentAccountId: string | number, lessonId: number): Promise<void> =>
		apiClient.delete(`lesson/emotion/delete/${id(currentAccountId)}/${lessonId}/`).json(),
};
