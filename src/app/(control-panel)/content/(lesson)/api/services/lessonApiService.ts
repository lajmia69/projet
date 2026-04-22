import ky from 'ky';
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
} from '../types';

const BASE_URL = 'https://radio.backend.ecocloud.tn';

function createClient(token: string) {
	return ky.create({
		prefixUrl: BASE_URL,
		retry: 0,
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
}

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

export const lessonApi = {
	// ─── Lesson ─────────────────────────────────────────────────────────────────

	searchLessons: (
		currentAccountId: string,
		accessToken: string,
		search: SearchLessons
	): Promise<LessonList> => {
		const params: Record<string, string | number> = {
			limit: search.limit ?? 10,
			offset: search.offset ?? 0,
		};
		if (search.language) params.language = search.language;

		return createClient(accessToken)
			.get(`lesson/search/${currentAccountId}/`, { searchParams: params })
			.json<LessonList>();
	},

	getLessons: (
		currentAccountId: string,
		accessToken: string
	): Promise<LessonList> =>
		createClient(accessToken)
			.get(`lesson/list/${currentAccountId}/`)
			.json<LessonList>(),

	getLesson: (
		currentAccountId: string,
		lessonId: string,
		accessToken: string
	): Promise<Lesson> =>
		createClient(accessToken)
			.get(`lesson/detail/${currentAccountId}/${lessonId}/`)
			.json<Lesson>(),

	createLesson: (
		currentAccountId: string,
		accessToken: string,
		data: LessonCreatePayload
	): Promise<Lesson> =>
		createClient(accessToken)
			.post(`lesson/create/${currentAccountId}/`, { json: data })
			.json<Lesson>(),

	updateLesson: (
		currentAccountId: string,
		accessToken: string,
		data: LessonUpdatePayload
	): Promise<Lesson> =>
		createClient(accessToken)
			.put(`lesson/update/${currentAccountId}/`, { json: data })
			.json<Lesson>(),

	validateLesson: (
		currentAccountId: string,
		accessToken: string,
		lessonId: number
	): Promise<Lesson> =>
		createClient(accessToken)
			.patch(`lesson/validate/${currentAccountId}/`, { json: { id: lessonId } })
			.json<Lesson>(),

	makePublicLesson: (
		currentAccountId: string,
		accessToken: string,
		lessonId: number
	): Promise<Lesson> =>
		createClient(accessToken)
			.patch(`lesson/public/${currentAccountId}/`, { json: { id: lessonId } })
			.json<Lesson>(),

	publishLesson: (
		currentAccountId: string,
		accessToken: string,
		lessonId: number
	): Promise<Lesson> =>
		createClient(accessToken)
			.patch(`lesson/publish/${currentAccountId}/`, { json: { id: lessonId } })
			.json<Lesson>(),

	publishReleaseLesson: (
		currentAccountId: string,
		accessToken: string,
		lessonId: number
	): Promise<Lesson> =>
		createClient(accessToken)
			.patch(`lesson/publish/release/${currentAccountId}/`, { json: { id: lessonId } })
			.json<Lesson>(),

	deleteLesson: (
		currentAccountId: string,
		accessToken: string,
		lessonId: number
	): Promise<void> =>
		createClient(accessToken)
			.delete(`lesson/delete/${currentAccountId}/${lessonId}/`)
			.json<void>(),

	// ─── Languages ───────────────────────────────────────────────────────────────

	getLanguages: (
		currentAccountId: string,
		accessToken: string
	): Promise<LanguageList> =>
		createClient(accessToken)
			.get(`setting/language/list/${currentAccountId}/`)
			.json<LanguageList>(),

	// ─── Lesson Types ────────────────────────────────────────────────────────────

	getLessonTypes: (
		currentAccountId: string,
		accessToken: string
	): Promise<{ items: LessonType[]; count: number }> =>
		createClient(accessToken)
			.get(`lesson/type/list/${currentAccountId}/`)
			.json<{ items: LessonType[]; count: number }>(),

	getLessonType: (
		currentAccountId: string,
		accessToken: string,
		lessonTypeId: number
	): Promise<LessonType> =>
		createClient(accessToken)
			.get(`lesson/type/detail/${currentAccountId}/${lessonTypeId}/`)
			.json<LessonType>(),

	createLessonType: (
		currentAccountId: string,
		accessToken: string,
		data: Partial<LessonType>
	): Promise<LessonType> =>
		createClient(accessToken)
			.post(`lesson/type/create/${currentAccountId}/`, { json: data })
			.json<LessonType>(),

	updateLessonType: (
		currentAccountId: string,
		accessToken: string,
		data: Partial<LessonType> & { id: number }
	): Promise<LessonType> =>
		createClient(accessToken)
			.put(`lesson/type/update/${currentAccountId}/`, { json: data })
			.json<LessonType>(),

	deleteLessonType: (
		currentAccountId: string,
		accessToken: string,
		lessonTypeId: number
	): Promise<void> =>
		createClient(accessToken)
			.delete(`lesson/type/delete/${currentAccountId}/${lessonTypeId}/`)
			.json<void>(),

	// ─── Levels ──────────────────────────────────────────────────────────────────

	getLevels: (
		currentAccountId: string,
		accessToken: string
	): Promise<{ items: Level[]; count: number }> =>
		createClient(accessToken)
			.get(`lesson/level/list/${currentAccountId}/`)
			.json<{ items: Level[]; count: number }>(),

	getLevel: (
		currentAccountId: string,
		accessToken: string,
		levelId: number
	): Promise<Level> =>
		createClient(accessToken)
			.get(`lesson/level/detail/${currentAccountId}/${levelId}/`)
			.json<Level>(),

	createLevel: (
		currentAccountId: string,
		accessToken: string,
		data: Partial<Level>
	): Promise<Level> =>
		createClient(accessToken)
			.post(`lesson/level/create/${currentAccountId}/`, { json: data })
			.json<Level>(),

	updateLevel: (
		currentAccountId: string,
		accessToken: string,
		data: Partial<Level> & { id: number }
	): Promise<Level> =>
		createClient(accessToken)
			.put(`lesson/level/update/${currentAccountId}/`, { json: data })
			.json<Level>(),

	deleteLevel: (
		currentAccountId: string,
		accessToken: string,
		levelId: number
	): Promise<void> =>
		createClient(accessToken)
			.delete(`lesson/level/delete/${currentAccountId}/${levelId}/`)
			.json<void>(),

	// ─── Study Subjects ──────────────────────────────────────────────────────────

	getSubjects: (
		currentAccountId: string,
		accessToken: string
	): Promise<{ items: Subject[]; count: number }> =>
		createClient(accessToken)
			.get(`lesson/subject/list/${currentAccountId}/`)
			.json<{ items: Subject[]; count: number }>(),

	getSubject: (
		currentAccountId: string,
		accessToken: string,
		subjectId: number
	): Promise<Subject> =>
		createClient(accessToken)
			.get(`lesson/subject/detail/${currentAccountId}/${subjectId}/`)
			.json<Subject>(),

	createSubject: (
		currentAccountId: string,
		accessToken: string,
		data: Partial<Subject>
	): Promise<Subject> =>
		createClient(accessToken)
			.post(`lesson/subject/create/${currentAccountId}/`, { json: data })
			.json<Subject>(),

	updateSubject: (
		currentAccountId: string,
		accessToken: string,
		data: Partial<Subject> & { id: number }
	): Promise<Subject> =>
		createClient(accessToken)
			.put(`lesson/subject/update/${currentAccountId}/`, { json: data })
			.json<Subject>(),

	deleteSubject: (
		currentAccountId: string,
		accessToken: string,
		subjectId: number
	): Promise<void> =>
		createClient(accessToken)
			.delete(`lesson/subject/delete/${currentAccountId}/${subjectId}/`)
			.json<void>(),

	// ─── Modules ─────────────────────────────────────────────────────────────────

	getModules: (
		currentAccountId: string,
		accessToken: string
	): Promise<{ items: Module[]; count: number }> =>
		createClient(accessToken)
			.get(`lesson/module/list/${currentAccountId}/`)
			.json<{ items: Module[]; count: number }>(),

	getModule: (
		currentAccountId: string,
		accessToken: string,
		moduleId: number
	): Promise<Module> =>
		createClient(accessToken)
			.get(`lesson/module/detail/${currentAccountId}/${moduleId}/`)
			.json<Module>(),

	createModule: (
		currentAccountId: string,
		accessToken: string,
		data: Partial<Module>
	): Promise<Module> =>
		createClient(accessToken)
			.post(`lesson/module/create/${currentAccountId}/`, { json: data })
			.json<Module>(),

	updateModule: (
		currentAccountId: string,
		accessToken: string,
		data: Partial<Module> & { id: number }
	): Promise<Module> =>
		createClient(accessToken)
			.put(`lesson/module/update/${currentAccountId}/`, { json: data })
			.json<Module>(),

	deleteModule: (
		currentAccountId: string,
		accessToken: string,
		moduleId: number
	): Promise<void> =>
		createClient(accessToken)
			.delete(`lesson/module/delete/${currentAccountId}/${moduleId}/`)
			.json<void>(),

	// ─── Lesson Emotions ─────────────────────────────────────────────────────────

	getLessonEmotions: (
		currentAccountId: string,
		accessToken: string
	): Promise<{ items: LessonEmotion[]; count: number }> =>
		createClient(accessToken)
			.get(`lesson/emotion/list/${currentAccountId}/`)
			.json<{ items: LessonEmotion[]; count: number }>(),

	getLessonEmotion: (
		currentAccountId: string,
		accessToken: string,
		lessonId: number
	): Promise<LessonEmotion> =>
		createClient(accessToken)
			.get(`lesson/emotion/detail/${currentAccountId}/${lessonId}/`)
			.json<LessonEmotion>(),

	setLessonEmotion: (
		currentAccountId: string,
		accessToken: string,
		data: SetLessonEmotionPayload
	): Promise<LessonEmotion> =>
		createClient(accessToken)
			.post(`lesson/emotion/set/${currentAccountId}/`, { json: data })
			.json<LessonEmotion>(),

	deleteLessonEmotion: (
		currentAccountId: string,
		accessToken: string,
		lessonId: number
	): Promise<void> =>
		createClient(accessToken)
			.delete(`lesson/emotion/delete/${currentAccountId}/${lessonId}/`)
			.json<void>(),

	// ─── Academy / Course stubs ───────────────────────────────────────────────────

	getCategories: (): Promise<unknown[]> => Promise.resolve([]),
	getCourses: (): Promise<unknown[]> => Promise.resolve([]),
	getCourse: (_id: string): Promise<null> => Promise.resolve(null),
	deleteCourse: (_id: string): Promise<void> => Promise.resolve(),
	updateCourse: (_id: string, _data: unknown): Promise<null> => Promise.resolve(null),
	getCourseSteps: (_id: string): Promise<unknown[]> => Promise.resolve([]),
	getCourseStepContent: (_id: string): Promise<null> => Promise.resolve(null),
};