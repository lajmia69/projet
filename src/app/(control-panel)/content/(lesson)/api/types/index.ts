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

// ─── Read model (what the API returns) ───────────────────────────────────────

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
	tags: string[];
	language: Language;
	lesson_type: LessonType;
	created_by: Account;
};

// ─── Write payloads (what the API expects on POST / PUT) ─────────────────────

/**
 * Payload for lesson/create/<account_id>/
 * Uses flat integer IDs, not nested objects.
 */
export type LessonCreatePayload = {
	name: string;
	description?: string;
	language_id: number;
	lesson_type_id: number;
	module_id: number;
	/** Required by the backend even when empty */
	transcription: Record<string, unknown>;
	/** Required by the backend even when empty */
	tags: string[];
};

/**
 * Payload for lesson/update/<account_id>/
 * The lesson id goes in the body, not the URL.
 */
export type LessonUpdatePayload = {
	id: number;
	name: string;
	description?: string;
	language_id: number;
	lesson_type_id: number;
	module_id: number;
	/** Required by the backend even when empty */
	transcription: Record<string, unknown>;
	/** Required by the backend even when empty */
	add_tags: string[];
	/** Required by the backend even when empty */
	remove_tags: string[];
};

// ─────────────────────────────────────────────────────────────────────────────

export type LessonList = {
	items: Lesson[];
	count: number;
};

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

// ─── Legacy types kept for backward compatibility ────────────────────────────

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