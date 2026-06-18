import { api } from '@/utils/api';
import {
	Course,
	CourseStep,
	CourseStepContent,
	Category,
	LanguageList,
	LessonList,
	SearchLessons,
	Lesson
} from '../types';

export const lessonApi = {
	searchLessons: async (
		current_account_id: string,
		accessToken: string,
		search: SearchLessons
	): Promise<LessonList> => {
		let search_str = ``;
		// console.log(search);

		if (search.limit == null || search.limit < 10) {
			search_str += `limit=${10}`;
		}

		if (search.offset == null || search.offset < 0) {
			search_str += `&offset=${0}`;
		}

		if (search.language && search.language != '') {
			search_str += `&language=${search.language}`;
		}

		// console.log(`lesson/search/${current_account_id}/?${search_str}`);
		return api
			.get(`lesson/search/${current_account_id}/?${search_str}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			})
			.json();
	},
	getLesson: async (currentAccountId: string, lessonId: string, accessToken: string): Promise<Lesson> => {
		return api
			.get(`lesson/detail/${currentAccountId}/${lessonId}`, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			})
			.json();
	},
	getLanguages: async (current_account_id: string, accessToken: string): Promise<LanguageList> => {
		return api
			.get(`setting/language/list/${current_account_id}/`, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			})
			.json();
	},
	getCourses: async (): Promise<Course[]> => {
		return api.get('mock/academy/courses').json();
	},

	getCourse: async (courseId: string): Promise<Course> => {
		return api.get(`mock/academy/courses/${courseId}`).json();
	},

	updateCourse: async (courseId: string, data: Partial<Course>): Promise<void> => {
		await api.put(`mock/academy/courses/${courseId}`, {
			json: data
		});
	},

	deleteCourse: async (courseId: string): Promise<void> => {
		await api.delete(`mock/academy/courses/${courseId}`);
	},

	getCourseSteps: async (courseId: string): Promise<CourseStep[]> => {
		return api.get(`mock/academy/course-steps?courseId=${courseId}`).json();
	},

	getCourseStepContent: async (stepId: string): Promise<CourseStepContent> => {
		return api.get(`mock/academy/course-step-contents/${stepId}`).json();
	},

	getCategories: async (): Promise<Category[]> => {
		return api.get('mock/academy/categories').json();
	}
};
