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

export type PodcastCategory = {
	id: number;
	name: string;
	description: string;
};

export type PodcastCategoryList = {
	items: PodcastCategory[];
	count: number;
};

export type MetaTag = {
	id: number;
	name: string;
};

// Flexible transcription — the API sends a free-form object
export type PodcastTranscription = {
	title?: string;
	author?: string;
	source?: string;
	language_orientation?: string;
	is_original?: boolean;
	type?: string;
	[key: string]: unknown;
};

// Matches the actual PodcastSchema response from the API
export type Podcast = {
	id: number;
	name: string;
	slug: string;
	description: string;
	transcription: PodcastTranscription;
	is_approved_content: boolean;
	is_pubic_content: boolean;   // note: API typo — "pubic" not "public"
	is_published: boolean;
	publishing_date: string;
	view_number: number;
	hd_version: Audio | null;
	streaming_version: Audio | null;
	teaser_version: Audio | null;
	podcast_category: PodcastCategory;   // was wrongly "category" before
	language: Language;
	tags: MetaTag[];
	created_by: Account;
};

export type PodcastList = {
	items: Podcast[];
	count: number;
};

// ── Exact shape for POST /podcast/create/{id}/ ────────────────────────────
export type CreatePodcastPayload = {
	name: string;
	slug: string;
	description: string;
	transcription: object;
	language_id: number;
	podcast_category_id: number;
	tags: string[];
};

// ── Exact shape for PUT /podcast/update/{id}/ ────────────────────────────
// slug is required by the API — send the EXISTING podcast.slug (never re-derive it)
export type UpdatePodcastPayload = {
	id?: number | null;
	name: string;
	slug: string;
	description: string;
	transcription: object;
	language_id: number;
	podcast_category_id: number;
	add_tags: string[];     // required — empty array means no changes
	remove_tags: string[];  // required — empty array means no removals
};

// Search query params — "podcast_category" matches the API query param
export type SearchPodcasts = {
	name?: string;
	language?: string;
	podcast_category?: string;
	tags?: string;
	limit: number;
	offset: number;
};

export type PodcastEmotion = {
	id: number;
	podcast: number;
	emotion_type: string;
	emotion_label: string;
	count: number;
	user_emotion: string | null;
};

export type PodcastEmotionList = {
	items: PodcastEmotion[];
	count: number;
};

export type CreatePodcastCategoryPayload = {
	name: string;
	description: string;
};

export type UpdatePodcastCategoryPayload = Partial<CreatePodcastCategoryPayload> & { id: number };

export type SetPodcastEmotionPayload = {
	podcast_id: number;
	emotion_id: number;
};
