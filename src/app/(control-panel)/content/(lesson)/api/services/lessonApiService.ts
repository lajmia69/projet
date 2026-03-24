import { api } from '@/utils/api';
import {
	Lesson,
	LessonList,
	LessonType,
	Level,
	Subject,
	Module,
	Language,
	LanguageList,
	SearchLessons
} from '../types';

const authHeader = (accessToken: string) => ({
	headers: { Authorization: `Bearer ${accessToken}` }
});

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
		data: Partial<Lesson>
	): Promise<Lesson> => {
		return  api
			.post(`lesson/create/${currentAccountId}/`,  {
				headers: {
					Authorization: `Bearer ${accessToken}`
				},
				json: data
			})
			.json();
		//console.log(result.text);
		//return result;
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