export type Format = {
	id: number;
	channel_label: string;
	name: string;
	extension: string;
	bit_rates: string;
	flow_rates: string;
	frequency: string;
	channel: number;
};

export type Audio = {
	src: string;
	id: number;
	file: string;
	name: string;
	description: string;
	duration: string;
	timestamp: number;
	type: number;
	type_label: string;
	format: Format;
	reference: string;
};

export type SearchLessons = {
	language?: string;
	limit: number;
	offset: number;
};

export type User = {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	date_joined: string;
};

export type Account = {
	id: number;
	user: User;
	full_name: string;
	avatar: string;
	is_active: boolean;
	phone: string;
	address: string;
	biography: string;
};

export type Level = {
	id: number;
	name: string;
	description: string;
};

export type Subject = {
	id: number;
	name: string;
	description: string;
	color: string;
};

export type Module = {
	id: number;
	name: string;
	description: string;
	trimester_name: string;
	trimester: number;
	color: string;
	level: Level;
	subject: Subject;
};
export type Language = {
	id: number;
	icon: string;
	name: string;
	short_name: string;
};

export type LanguageList = {
	items: Language[];
	count: number;
};

export type LessonType = {
	id: number;
	name: string;
	description: string;
};

export type LessonTranscriptionContent = {
	index: number;
	type: string;
	paragraph: number;
	is_new_paragraph: boolean;
	text: string;
	speaker: string;
	time: string;
	timestamp: number;
};

export type LessonTranscription = {
	title: string;
	author: string;
	source: string;
	language_orientation: string;
	is_original: boolean;
	type: string;
	content: LessonTranscriptionContent[];
};

export type Lesson = {
	id: number;
	name: string;
	description: string;
	transcription: LessonTranscription;
	is_approved_content: boolean;
	is_pubic_content: boolean;
	is_published: boolean;
	publishing_date: string;
	view_number: number;
	hd_version: Audio;
	streaming_version: Audio;
	teaser_version: Audio;
	module: Module;

	tags: string[]; // ou bien un type plus complexe si les tags sont des objets

	language: Language;

	lesson_type: LessonType;

	created_by: Account;

	// approved_by: Account;

	// production_project: {
	// 	id: number;
	// 	name: string;
	// 	description: string;
	// 	start_date: string;
	// 	end_date: string;
	// 	note: string;
	// 	status: {
	// 		id: number;
	// 		name: string;
	// 	};
	// 	project_type: {
	// 		id: number;
	// 		name: string;
	// 	};
	// 	studio_leader: Account;
	// 	created_by: Account;
	// };
};

export type LessonList = {
	items: Lesson[];
	count: number;
};

export type CourseStepContent = {
	id: string;
	stepId: string;
	html: string;
};

export type CourseStep = {
	id: string;
	courseId: string;
	order: number;
	title: string;
	subtitle: string;
	content: string;
};

export type Course = {
	id: string;
	title: string;
	slug: string;
	description: string;
	category: string;
	duration: number;
	totalSteps: number;
	updatedAt: string;
	featured: boolean;
	progress: {
		currentStep: number;
		completed: number;
	};
	activeStep?: number;
	steps?: CourseStep[];
};

export type Category = {
	id: string;
	title: string;
	slug: string;
	color: string;
};
