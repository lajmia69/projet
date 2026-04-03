/**
 * types/index.ts
 */

// ─── Shared ───────────────────────────────────────────────────────────────────

export type RadioAudio = {
	id?: number;
	src: string;
	file: string;
	name: string;
	description: string;
	duration: string;
	timestamp?: number;
	type: number;
	type_label: string;
	reference?: string;
	format: {
		id?: number;
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

export type RadioLanguageList = { items: RadioLanguage[]; count: number };

export type RadioTag = {
	id: number;
	name: string;
};

export type RadioTagList = { items: RadioTag[]; count: number };

export type RadioAccount = {
	id?: number;
	full_name: string;
	avatar?: string;
	is_active?: boolean;
	phone?: string;
	address?: string | null;
	biography?: string | null;
	user?: {
		id?: number;
		username: string;
		first_name?: string | null;
		last_name?: string | null;
		email?: string | null;
		date_joined?: string;
	};
	level?: { id?: number; name: string } | null;
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
	title?: string;
	author?: string;
	source?: string;
	language_orientation?: string;
	is_original?: boolean;
	type?: string;
	content?: RadioTranscriptionContent[];
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
	description?: string;
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
	biography?: string | null;
	avatar?: string;
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

export type Emission = {
	id: number;
	name: string;
	slug?: string;
	description?: string;
	poster?: string;
	poster_description?: string;
	start_date?: string;
	end_date?: string;
	is_approved_content: boolean;
	/** Backend field is spelled `is_pubic_content` (typo in the API). */
	is_pubic_content: boolean;
	is_published: boolean;
	publishing_date?: string;
	emission_type?: EmissionType;
	language?: RadioLanguage;
	tags?: RadioTag[];
	created_by?: RadioAccount;
	approved_by?: RadioAccount | null;
	// Detail-only fields — undefined on list responses
	season_episodes_list?: EmissionSeasonEpisodeDetail[] | null;
	view_number?: number;
	hd_version?: RadioAudio | null;
	streaming_version?: RadioAudio | null;
	teaser_version?: RadioAudio | null;
	transcription?: RadioTranscription;
};

export type EmissionSeasonDetail = {
	id?: number;
	name: string;
	slug?: string;
	description?: string;
	start_date?: string;
	end_date?: string;
};

export type EmissionSeasonEpisodeDetail = {
	season: EmissionSeasonDetail;
	episodes: Episode[];
};

export type EmissionList = { items: Emission[]; count: number };

export type SearchEmissionsParams = {
	name?: string;
	language?: string;
	emission_type?: string;
	tags?: string;
	limit?: number;
	offset?: number;
};

export type CreateEmissionPayload = {
	// ── Required ──────────────────────────────────────────────────────────────
	name: string;
	/** Account PK of the creator — required by backend ("Created by *"). */
	created_by_id: number;
	language_id: number;
	/** Tag names — required; send at least an empty array. */
	tags: string[];

	// ── Shown as required (*) in Django admin ─────────────────────────────────
	emission_type_id?: number;
	publishing_date?: string;   // YYYY-MM-DD
	start_date?: string;        // YYYY-MM-DD

	// ── Optional ──────────────────────────────────────────────────────────────
	slug?: string;
	description?: string;
	poster_description?: string;
	end_date?: string;
	/** Backend field is spelled `is_pubic_content` (typo in the API). */
	is_pubic_content?: boolean;
	is_published?: boolean;
	transcription?: Record<string, unknown>;
};

export type UpdateEmissionPayload = Partial<CreateEmissionPayload> & {
	id: number;
	remove_tags?: string[] | null;
	add_tags?: string[] | null;
	end_date?: string | null;
};

// ─── Episode ──────────────────────────────────────────────────────────────────

export type Episode = {
	id: number;
	name: string;
	slug?: string;
	description?: string;
	is_approved_content: boolean;
	/** Backend field is spelled `is_pubic_content` (typo in the API). */
	is_pubic_content: boolean;
	is_published: boolean;
	publishing_date?: string;
	online_date?: string;
	emission?: Emission;
	season?: Season;
	language?: RadioLanguage;
	tags?: RadioTag[];
	created_by?: RadioAccount;
	approved_by?: RadioAccount | null;
	// Detail-only fields
	view_number?: number;
	hd_version?: RadioAudio | null;
	streaming_version?: RadioAudio | null;
	teaser_version?: RadioAudio | null;
	transcription?: RadioTranscription;
	episode_guests_list?: EpisodeGuestItem[];
	emotions?: RadioEmotion[] | null;
	production_project?: ProductionProject | null;
};

export type EpisodeGuestItem = {
	guest: Guest;
	guest_type: GuestType;
};

export type RadioEmotionBase = {
	id?: number;
	icon: string;
	name: string;
	description: string;
};

export type RadioEmotion = {
	emotion: RadioEmotionBase;
	emotion_count: number;
};

export type ProductionProject = {
	id?: number;
	name: string;
	description?: string;
	start_date?: string;
	end_date?: string;
	note?: string | null;
};

export type EpisodeList = { items: Episode[]; count: number };

export type SearchEpisodesParams = {
	emission?: string;
	season?: string;
	name?: string;
	language?: string;
	emission_type?: string;
	tags?: string;
	limit?: number;
	offset?: number;
};

/**
 * Matches the backend CreateEpisodeSchema exactly:
 *   { tags, name, description, slug, transcription, emission_id, season_id }
 *
 * Scheduling fields (publishing_date, online_date) are NOT accepted at creation
 * time — use UpdateEpisodePayload / dedicated PATCH endpoints instead.
 */
export type CreateEpisodePayload = {
	name:           string;
	slug?:          string;
	description?:   string;
	emission_id?:   number;
	season_id?:     number;
	transcription?: Record<string, unknown>;
	tags?:          string[];
};

/**
 * All create fields become optional on update, plus scheduling fields that
 * the backend only accepts via PUT/PATCH.
 */
export type UpdateEpisodePayload = Partial<CreateEpisodePayload> & {
	id:              number;
	remove_tags?:    string[] | null;
	add_tags?:       string[] | null;
	publishing_date?: string;
	online_date?:    string;
};

// ─── Episode Emotion ──────────────────────────────────────────────────────────

export type EpisodeEmotion = {
	id?: number;
	episode: Episode;
	account: RadioAccount;
	emotion: RadioEmotionBase;
};

export type EpisodeEmotionList = { items: EpisodeEmotion[]; count: number };
export type SetEpisodeEmotionPayload = { episode_id: number; emotion_id: number };

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

export type Reportage = {
	id: number;
	name: string;
	slug?: string;
	description?: string;
	is_approved_content: boolean;
	/** Backend field is spelled `is_pubic_content` (typo in the API). */
	is_pubic_content: boolean;
	is_published: boolean;
	publishing_date?: string;
	online_date?: string;
	reportage_type?: ReportageType;
	language?: RadioLanguage;
	tags?: RadioTag[];
	created_by?: RadioAccount;
	approved_by?: RadioAccount | null;
	episode?: Episode | null;
	// Detail-only fields
	view_number?: number;
	hd_version?: RadioAudio | null;
	streaming_version?: RadioAudio | null;
	teaser_version?: RadioAudio | null;
	transcription?: RadioTranscription;
	emotions?: RadioEmotion[] | null;
	production_project?: ProductionProject | null;
};

export type ReportageList = { items: Reportage[]; count: number };

export type SearchReportagesParams = {
	episode?: string;
	name?: string;
	language?: string;
	reportage_type?: string;
	tags?: string;
	limit?: number;
	offset?: number;
};

export type CreateReportagePayload = {
	name: string;
	slug?: string;
	description?: string;
	language_id: number;
	reportage_type_id?: number;
	episode_id?: number | null;
	transcription?: Record<string, unknown>;
	tags?: string[];
	publishing_date?: string;
	online_date?: string;
};
export type UpdateReportagePayload = Partial<CreateReportagePayload> & {
	id: number;
	remove_tags?: string[] | null;
	add_tags?: string[] | null;
};

// ─── Reportage Emotion ────────────────────────────────────────────────────────

export type ReportageEmotion = {
	id?: number;
	reportage: Reportage;
	account: RadioAccount;
	emotion: RadioEmotionBase;
};

export type ReportageEmotionList = { items: ReportageEmotion[]; count: number };
export type SetReportageEmotionPayload = { reportage_id: number; emotion_id: number };