// ─── Shared ───────────────────────────────────────────────────────────────────

export type LanguageSchema = {
	id: number;
	icon: string;
	name: string;
	short_name: string;
};

export type MetaTagSchema = {
	id: number;
	name: string;
};

export type SimplifyAccountSchema = {
	id: number;
	full_name: string;
	avatar: string;
};

// ─── Cultural Project Type ────────────────────────────────────────────────────

export type CulturalProjectType = {
	id: number;
	name: string;
	description: string;
};

export type CreateCulturalProjectTypePayload = {
	name: string;
	description: string;
};

export type UpdateCulturalProjectTypePayload = {
	id: number;
	name: string;
	description: string;
};

// ─── Cultural Project ─────────────────────────────────────────────────────────

export type CulturalProject = {
	id: number;
	name: string;
	slug: string;
	description: string;
	poster: string;
	poster_description: string;
	start_date: string;
	end_date: string;
	publishing_date: string;
	is_approved_content: boolean;
	is_pubic_content: boolean;
	is_published: boolean;
	view_number: number;
	language: LanguageSchema;
	cultural_project_type: CulturalProjectType;
	tags: MetaTagSchema[];
	created_by: SimplifyAccountSchema;
	approved_by: SimplifyAccountSchema | null;
	participation_list: unknown[] | null;
};

export type CreateCulturalProjectPayload = {
	name: string;
	slug: string;
	description: string;
	poster_description: string;
	start_date: string;
	end_date: string;
	publishing_date: string;
	language_id: number;
	cultural_project_type_id: number;
	tags: string[];
};

export type UpdateCulturalProjectPayload = {
	id: number;
	name: string;
	slug: string;
	description: string;
	poster_description: string;
	start_date: string;
	end_date: string;
	publishing_date: string;
	language_id: number;
	cultural_project_type_id: number;
	remove_tags: string[];
	add_tags: string[];
};

// ─── Cultural Activity Type ───────────────────────────────────────────────────

export type CulturalActivityType = {
	id: number;
	name: string;
	description: string;
};

export type CreateCulturalActivityTypePayload = {
	name: string;
	description: string;
};

export type UpdateCulturalActivityTypePayload = {
	id: number;
	name: string;
	description: string;
};

// ─── Cultural Activity ────────────────────────────────────────────────────────

export type CulturalActivity = {
	id: number;
	name: string;
	slug: string;
	description: string;
	poster: string;
	poster_description: string;
	date: string;
	publishing_date: string;
	is_approved_content: boolean;
	is_pubic_content: boolean;
	is_published: boolean;
	view_number: number;
	language: LanguageSchema;
	cultural_activity_type: CulturalActivityType;
	tags: MetaTagSchema[];
	created_by: SimplifyAccountSchema;
	approved_by: SimplifyAccountSchema | null;
	participation_list: unknown[] | null;
};

export type CreateCulturalActivityPayload = {
	name: string;
	slug: string;
	description: string;
	poster_description: string;
	date: string;
	language_id: number;
	cultural_activity_type_id: number;
	tags: string[];
};

export type UpdateCulturalActivityPayload = {
	id: number;
	name: string;
	slug: string;
	description: string;
	poster_description: string;
	date: string;
	publishing_date: string;
	language_id: number;
	cultural_activity_type_id: number;
	remove_tags: string[];
	add_tags: string[];
};

// ─── Paged response ───────────────────────────────────────────────────────────

export type Paged<T> = {
	items: T[];
	count: number;
};