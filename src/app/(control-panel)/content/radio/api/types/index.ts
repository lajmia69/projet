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

export type RadioCategory = {
	id: number;
	name: string;
	description: string;
	color: string;
};

export type RadioCategoryList = {
	items: RadioCategory[];
	count: number;
};

export type RadioTranscriptionContent = {
	index: number;
	type: string;
	paragraph: number;
	is_new_paragraph: boolean;
	text: string;
	speaker: string;
	time: string;
	timestamp: number;
};

export type RadioTranscription = {
	title: string;
	author: string;
	source: string;
	language_orientation: string;
	is_original: boolean;
	type: string;
	content: RadioTranscriptionContent[];
};

export type Radio = {
	id: number;
	name: string;
	description: string;
	transcription: RadioTranscription;
	is_approved_content: boolean;
	is_public_content: boolean;
	is_published: boolean;
	publishing_date: string;
	view_number: number;
	hd_version: Audio;
	streaming_version: Audio;
	teaser_version: Audio;
	category: RadioCategory;
	language: Language;
	tags: string[];
	created_by: Account;
};

export type RadioList = {
	items: Radio[];
	count: number;
};

export type SearchRadios = {
	language?: string;
	category?: number;
	limit: number;
	offset: number;
};

export type RadioEmotion = {
	id: number;
	radio: number;
	emotion_type: string;
	emotion_label: string;
	count: number;
	user_emotion: string | null;
};

export type RadioEmotionList = {
	items: RadioEmotion[];
	count: number;
};

export type CreateRadioCategoryPayload = {
	name: string;
	description?: string;
	color?: string;
};

export type UpdateRadioCategoryPayload = Partial<CreateRadioCategoryPayload> & { id: number };

export type SetRadioEmotionPayload = {
	radio_id: number;
	emotion_type: string;
};