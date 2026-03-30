// ─── Shared base types ────────────────────────────────────────────────────────

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

// ─── Emission Type ────────────────────────────────────────────────────────────

export type EmissionType = {
	id: number;
	name: string;
	description: string;
};

export type EmissionTypeList = {
	items: EmissionType[];
	count: number;
};

export type CreateEmissionTypePayload = {
	name: string;
	description?: string;
};

export type UpdateEmissionTypePayload = Partial<CreateEmissionTypePayload> & { id: number };

// ─── Season ───────────────────────────────────────────────────────────────────

export type Season = {
	id: number;
	name: string;
	description: string;
	number: number;
};

export type SeasonList = {
	items: Season[];
	count: number;
};

export type CreateSeasonPayload = {
	name: string;
	description?: string;
	number?: number;
};

export type UpdateSeasonPayload = Partial<CreateSeasonPayload> & { id: number };

// ─── Guest Type ───────────────────────────────────────────────────────────────

export type GuestType = {
	id: number;
	name: string;
	description: string;
};

export type GuestTypeList = {
	items: GuestType[];
	count: number;
};

export type CreateGuestTypePayload = {
	name: string;
	description?: string;
};

export type UpdateGuestTypePayload = Partial<CreateGuestTypePayload> & { id: number };

// ─── Episode Guest ────────────────────────────────────────────────────────────

export type EpisodeGuest = {
	id: number;
	full_name: string;
	biography: string;
	guest_type: GuestType;
};

export type EpisodeGuestList = {
	items: EpisodeGuest[];
	count: number;
};

export type CreateEpisodeGuestPayload = {
	full_name: string;
	biography?: string;
	guest_type_id: number;
};

export type UpdateEpisodeGuestPayload = Partial<CreateEpisodeGuestPayload> & { id: number };

// ─── Emission ─────────────────────────────────────────────────────────────────

export type EmissionTranscriptionContent = {
	index: number;
	type: string;
	paragraph: number;
	is_new_paragraph: boolean;
	text: string;
	speaker: string;
	time: string;
	timestamp: number;
};

export type EmissionTranscription = {
	title: string;
	author: string;
	source: string;
	language_orientation: string;
	is_original: boolean;
	type: string;
	content: EmissionTranscriptionContent[];
};

export type Emission = {
	id: number;
	name: string;
	description: string;
	transcription: EmissionTranscription;
	poster: string;
	is_approved_content: boolean;
	is_public_content: boolean;
	is_published: boolean;
	publishing_date: string;
	view_number: number;
	hd_version: Audio;
	streaming_version: Audio;
	teaser_version: Audio;
	emission_type: EmissionType;
	season: Season;
	language: Language;
	tags: string[];
	created_by: Account;
};

export type EmissionList = {
	items: Emission[];
	count: number;
};

export type SearchEmissions = {
	language?: string;
	emission_type?: number;
	season?: number;
	limit: number;
	offset: number;
};

export type CreateEmissionPayload = {
	name: string;
	description?: string;
	language_id: number;
	emission_type_id?: number;
	season_id?: number;
	transcription?: Record<string, unknown>;
	tags?: string[];
};

export type UpdateEmissionPayload = Partial<CreateEmissionPayload> & { id: number };

// ─── Emission Emotion ─────────────────────────────────────────────────────────

export type EmissionEmotion = {
	id: number;
	emission: number;
	emotion_type: string;
	emotion_label: string;
	count: number;
	user_emotion: string | null;
};

export type EmissionEmotionList = {
	items: EmissionEmotion[];
	count: number;
};

export type SetEmissionEmotionPayload = {
	emission_id: number;
	emotion_type: string;
};

// ─── Episode ──────────────────────────────────────────────────────────────────

export type EpisodeTranscriptionContent = EmissionTranscriptionContent;

export type EpisodeTranscription = EmissionTranscription;

export type Episode = {
	id: number;
	name: string;
	description: string;
	transcription: EpisodeTranscription;
	is_approved_content: boolean;
	is_public_content: boolean;
	is_published: boolean;
	publishing_date: string;
	view_number: number;
	hd_version: Audio;
	streaming_version: Audio;
	teaser_version: Audio;
	emission: Emission;
	season: Season;
	language: Language;
	guests: EpisodeGuest[];
	tags: string[];
	created_by: Account;
};

export type EpisodeList = {
	items: Episode[];
	count: number;
};

export type SearchEpisodes = {
	language?: string;
	emission?: number;
	season?: number;
	limit: number;
	offset: number;
};

export type CreateEpisodePayload = {
	name: string;
	description?: string;
	language_id: number;
	emission_id?: number;
	season_id?: number;
	transcription?: Record<string, unknown>;
	tags?: string[];
};

export type UpdateEpisodePayload = Partial<CreateEpisodePayload> & { id: number };

// ─── Episode Emotion ──────────────────────────────────────────────────────────

export type EpisodeEmotion = {
	id: number;
	episode: number;
	emotion_type: string;
	emotion_label: string;
	count: number;
	user_emotion: string | null;
};

export type EpisodeEmotionList = {
	items: EpisodeEmotion[];
	count: number;
};

export type SetEpisodeEmotionPayload = {
	episode_id: number;
	emotion_type: string;
};

// ─── Reportage Type ───────────────────────────────────────────────────────────

export type ReportageType = {
	id: number;
	name: string;
	description: string;
};

export type ReportageTypeList = {
	items: ReportageType[];
	count: number;
};

export type CreateReportageTypePayload = {
	name: string;
	description?: string;
};

export type UpdateReportageTypePayload = Partial<CreateReportageTypePayload> & { id: number };

// ─── Reportage ────────────────────────────────────────────────────────────────

export type ReportageTranscriptionContent = EmissionTranscriptionContent;
export type ReportageTranscription = EmissionTranscription;

export type Reportage = {
    [x: string]: any;
	id: number;
	name: string;
	description: string;
	transcription: ReportageTranscription;
	is_approved_content: boolean;
	is_public_content: boolean;
	is_published: boolean;
	publishing_date: string;
	view_number: number;
	hd_version: Audio;
	streaming_version: Audio;
	teaser_version: Audio;
	reportage_type: ReportageType;
	language: Language;
	tags: string[];
	created_by: Account;
};

export type ReportageList = {
	items: Reportage[];
	count: number;
};

export type SearchReportages = {
	language?: string;
	reportage_type?: number;
	limit: number;
	offset: number;
};

export type CreateReportagePayload = {
	name: string;
	description?: string;
	language_id: number;
	reportage_type_id?: number;
	transcription?: Record<string, unknown>;
	tags?: string[];
};

export type UpdateReportagePayload = Partial<CreateReportagePayload> & { id: number };

// ─── Reportage Emotion ────────────────────────────────────────────────────────

export type ReportageEmotion = {
	id: number;
	reportage: number;
	emotion_type: string;
	emotion_label: string;
	count: number;
	user_emotion: string | null;
};

export type ReportageEmotionList = {
	items: ReportageEmotion[];
	count: number;
};

export type SetReportageEmotionPayload = {
	reportage_id: number;
	emotion_type: string;
};