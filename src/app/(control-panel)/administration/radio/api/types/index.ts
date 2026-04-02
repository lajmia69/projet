// ─── Shared ───────────────────────────────────────────────────────────────────

export type RadioAudio = {
	id: number;
	src: string;
	file: string;
	name: string;
	description: string;
	duration: string;
	timestamp: number;
	type: number;
	type_label: string;
	reference: string;
	format: {
		id: number;
		name: string;
		extension: string;
		bit_rates: string;
		flow_rates: string;
		frequency: string;
		channel: number;
		channel_label: string;
	};
};

export type RadioLanguage = {
	id: number;
	name: string;
	short_name: string;
	icon: string;
};

export type RadioAccount = {
	id: number;
	full_name: string;
	avatar: string;
	is_active: boolean;
	phone: string;
	address: string;
	biography: string;
	user: {
		id: number;
		username: string;
		first_name: string;
		last_name: string;
		email: string;
		date_joined: string;
	};
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

// ─── Emission Type ────────────────────────────────────────────────────────────

export type EmissionType = {
	id: number;
	name: string;
	description: string;
};

export type EmissionTypeList = { items: EmissionType[]; count: number };

export type CreateEmissionTypePayload = {
	name: string;
	description?: string;
};
export type UpdateEmissionTypePayload = Partial<CreateEmissionTypePayload> & { id: number };

// ─── Season ───────────────────────────────────────────────────────────────────

export type Season = {
	id: number;
	name: string;
	slug?: string;
	description: string;
	start_date?: string;
	end_date?: string;
};

export type SeasonList = { items: Season[]; count: number };

export type CreateSeasonPayload = {
	name: string;
	slug?: string;
	description?: string;
	start_date?: string;
	end_date?: string;
};
export type UpdateSeasonPayload = Partial<CreateSeasonPayload> & { id: number };

// ─── Guest Type ───────────────────────────────────────────────────────────────

export type GuestType = {
	id: number;
	name: string;
	description: string;
};

export type GuestTypeList = { items: GuestType[]; count: number };

export type CreateGuestTypePayload = {
	name: string;
	description?: string;
};
export type UpdateGuestTypePayload = Partial<CreateGuestTypePayload> & { id: number };

// ─── Episode Guest ────────────────────────────────────────────────────────────

export type Guest = {
	id: number;
	full_name: string;
	biography?: string;
};

export type GuestList = { items: Guest[]; count: number };

export type EpisodeGuest = {
	id: number;
	episode: { id: number; name: string };
	guest: Guest;
	guest_type: GuestType;
};

export type EpisodeGuestList = { items: EpisodeGuest[]; count: number };

export type CreateEpisodeGuestPayload = {
	episode_id: number;
	guest_id: number;
	guest_type_id: number;
};
export type UpdateEpisodeGuestPayload = Partial<CreateEpisodeGuestPayload> & { id: number };

// ─── Emission ─────────────────────────────────────────────────────────────────
// FIX #1: Backend uses `is_pubic_content` (backend typo — match it exactly so
//         JSON deserialization succeeds; rename locally via a type alias if/when
//         the backend spelling is corrected).

export type Emission = {
	id: number;
	name: string;
	slug?: string;
	description: string;
	transcription: RadioTranscription;
	poster: string;
	poster_description?: string;
	start_date?: string;
	is_approved_content: boolean;
	/** @note Backend field is spelled `is_pubic_content` — matches the JSON key exactly. */
	is_pubic_content: boolean;
	is_published: boolean;
	publishing_date: string;
	view_number: number;
	hd_version: RadioAudio;
	streaming_version: RadioAudio;
	teaser_version: RadioAudio;
	emission_type: EmissionType;
	season: Season;
	language: RadioLanguage;
	tags: { id: number; name: string }[];
	created_by: RadioAccount;
	approved_by?: RadioAccount;
};

export type EmissionList = { items: Emission[]; count: number };

export type SearchEmissionsParams = {
	language?: string;
	emission_type?: number;
	season?: number;
	limit?: number;
	offset?: number;
};

// FIX #2: Restore `tags` and `transcription` that were mistakenly removed from
//         the payload type — the backend schema does accept them.
export type CreateEmissionPayload = {
	name: string;
	slug?: string;
	description?: string;
	language_id: number;
	emission_type_id?: number;
	publishing_date?: string;
	start_date?: string;
	tags?: string[];
	transcription?: Record<string, unknown>;
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

export type EmissionEmotionList = { items: EmissionEmotion[]; count: number };
export type SetEmissionEmotionPayload = { emission_id: number; emotion_type: string };

// ─── Episode ──────────────────────────────────────────────────────────────────
// FIX #1 (same as Emission): backend JSON key is `is_pubic_content`.

export type Episode = {
	id: number;
	name: string;
	slug?: string;
	description: string;
	transcription: RadioTranscription;
	is_approved_content: boolean;
	/** @note Backend field is spelled `is_pubic_content` — matches the JSON key exactly. */
	is_pubic_content: boolean;
	is_published: boolean;
	publishing_date: string;
	online_date?: string;
	view_number: number;
	hd_version: RadioAudio;
	streaming_version: RadioAudio;
	teaser_version: RadioAudio;
	emission: Emission;
	emission_type?: EmissionType;
	episode_number?: number;
	season: Season;
	language: RadioLanguage;
	guests: EpisodeGuest[];
	tags: { id: number; name: string }[];
	created_by: RadioAccount;
	approved_by?: RadioAccount;
};

export type EpisodeList = { items: Episode[]; count: number };

export type SearchEpisodesParams = {
	language?: string;
	emission?: number;
	season?: number;
	limit?: number;
	offset?: number;
};

export type CreateEpisodePayload = {
	name: string;
	slug?: string;
	description?: string;
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

export type EpisodeEmotionList = { items: EpisodeEmotion[]; count: number };
export type SetEpisodeEmotionPayload = { episode_id: number; emotion_type: string };

// ─── Reportage Type ───────────────────────────────────────────────────────────

export type ReportageType = {
	id: number;
	name: string;
	description: string;
};

export type ReportageTypeList = { items: ReportageType[]; count: number };

export type CreateReportageTypePayload = {
	name: string;
	description?: string;
};
export type UpdateReportageTypePayload = Partial<CreateReportageTypePayload> & { id: number };

// ─── Reportage ────────────────────────────────────────────────────────────────
// FIX #1 (same as Emission): backend JSON key is `is_pubic_content`.

export type Reportage = {
	id: number;
	name: string;
	slug?: string;
	description: string;
	transcription: RadioTranscription;
	is_approved_content: boolean;
	/** @note Backend field is spelled `is_pubic_content` — matches the JSON key exactly. */
	is_pubic_content: boolean;
	is_published: boolean;
	publishing_date: string;
	online_date?: string;
	view_number: number;
	hd_version: RadioAudio;
	streaming_version: RadioAudio;
	teaser_version: RadioAudio;
	reportage_type: ReportageType;
	language: RadioLanguage;
	tags: { id: number; name: string }[];
	created_by: RadioAccount;
	episode?: Episode;
};

export type ReportageList = { items: Reportage[]; count: number };

export type SearchReportagesParams = {
	language?: string;
	reportage_type?: number;
	limit?: number;
	offset?: number;
};

export type CreateReportagePayload = {
	name: string;
	slug?: string;
	description?: string;
	language_id: number;
	reportage_type_id?: number;
	episode_id?: number;
	transcription?: Record<string, unknown>;
	tags?: string[];
	publishing_date?: string;
	online_date?: string;
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

export type ReportageEmotionList = { items: ReportageEmotion[]; count: number };
export type SetReportageEmotionPayload = { reportage_id: number; emotion_type: string };

// ─── Radio Language List ──────────────────────────────────────────────────────

export type RadioLanguageList = { items: RadioLanguage[]; count: number };