// ─── Studio Backend Types (from openapi.json) ────────────────────────────────

export type TaskStatus = {
	id: number | null;
	name: string;
};

export type ProjectStatus = {
	id: number | null;
	name: string;
};

export type ProjectType = {
	id: number | null;
	name: string;
	project_class: string;
};

export type TaskType = {
	id: number | null;
	name: string;
};

export type TaskResource = {
	id: number | null;
	name: string;
	description: string;
};

export type UserSchema = {
	id: number | null;
	username: string;
	first_name: string | null;
	last_name: string | null;
	email: string | null;
	date_joined: string;
};

export type AccountLevel = {
	id: number | null;
	name: string;
};

export type SimplifyAccount = {
	id: number | null;
	user: UserSchema;
	full_name: string;
	level: AccountLevel | null;
	avatar: string;
	is_active: boolean;
	phone: string;
	address: string | null;
	biography: string | null;
};

export type ProductionProject = {
	id: number | null;
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	note: string | null;
	status: ProjectStatus;
	project_type: ProjectType;
	studio_leader: SimplifyAccount;
	created_by: SimplifyAccount;
};

export type CreateProductionProject = {
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	note?: string | null;
	project_type_id: number;
};

export type UpdateProductionProject = {
	id?: number | null;
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	note?: string | null;
	status_id: number;
};

export type AddAccountSchema = {
	id: number | null;
};

export type AddTaskResourceSchema = {
	id: number | null;
};

export type ProductionTask = {
	id: number | null;
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	note: string | null;
	status: TaskStatus;
	task_type: TaskType;
	resources: TaskResource[];
	production_project: ProductionProject;
	staff_leader: SimplifyAccount;
	guests: SimplifyAccount[];
	staffs: SimplifyAccount[];
	created_by: SimplifyAccount;
};

export type CreateProductionTask = {
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	note?: string | null;
	task_type_id: number;
	status_id: number;
	production_project_id: number;
	staff_leader_id: number;
	resources: AddTaskResourceSchema[] | null;
	guests: AddAccountSchema[] | null;
	staffs: AddAccountSchema[] | null;
};

export type UpdateProductionTask = {
	id?: number | null;
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	note?: string | null;
	task_type_id: number;
	status_id: number;
	production_project_id: number;
	staff_leader_id: number;
	resources: AddTaskResourceSchema[] | null;
	guests: AddAccountSchema[] | null;
	staffs: AddAccountSchema[] | null;
};

// ─── Audio Format (GET /audio/format/list/{accountId}/) ─────────────────────

export type AudioFormat = {
	id: number | null;
	name: string;
	extension: string;
	bit_rates: string;
	flow_rates: string;
	frequency: string;
	channel: number;
	channel_label: string;
};

export type CreateAudioFormat = {
	name: string;
	extension: string;
	bit_rates: string;
	flow_rates: string;
	frequency: string;
	channel: number;
};

// ─── Audio File (GET /audio/list/{accountId}/ → AudioSchema) ────────────────

export type AudioFile = {
	id: number | null;
	/** Relative storage path */
	file: string;
	/** Full playable URL from backend */
	src: string;
	name: string;
	description: string;
	/** ISO 8601 duration string – e.g. "PT01H30M00S" */
	duration: string;
	type: number;
	type_label: string;
	/** UUID */
	reference?: string;
	format: AudioFormat;
};

// ─── Create Audio (POST /audio/create/{accountId}/) ─────────────────────────
// Multipart: field "file" = binary, field "payload" = JSON string of CreateAudioFile

export type CreateAudioFile = {
	name: string;
	description: string;
	/** ISO 8601 duration string */
	duration: string;
	/** Unix timestamp in seconds */
	timestamp: number;
	format_id: number;
	/** Audio type integer – 1 = default */
	type: number;
	production_task_id: number;
};

// ─── Update Audio Metadata (PUT /audio/update/{accountId}/) ─────────────────

export type UpdateAudioFile = {
	id?: number | null;
	name: string;
	description: string;
	/** ISO 8601 duration string */
	duration: string;
	timestamp: number;
	format_id: number;
	type: number;
};

// ─────────────────────────────────────────────────────────────────────────────

export type PagedResponse<T> = {
	items: T[];
	count: number;
};

// ─── UI-compatible types (scrumboard-style) ──────────────────────────────────

export type ScrumboardMember = {
	id: string;
	name: string;
	avatar: string;
	class: string;
};

export type ScrumboardList = {
	id: string;
	boardId: string;
	title: string;
};

export type ScrumboardBoardList = {
	id: string;
	cards: ScrumboardCard['id'][];
};

export type ScrumboardLabel = {
	id: string;
	boardId: string;
	title: string;
};

export type ScrumboardAttachment = {
	id: string;
	name: string;
	src: string;
	url: string;
	time: number;
	type: string;
};

export type ScrumboardCheckListItem = {
	id: number;
	name: string;
	checked: boolean;
};

export type ScrumboardChecklist = {
	id?: string;
	name: string;
	checkItems: ScrumboardCheckListItem[];
};

export type ScrumboardCard = {
	id: string;
	boardId: string;
	listId: string;
	title: string;
	description: string;
	labels: string[];
	dueDate?: number | null;
	attachmentCoverId: string;
	memberIds: string[];
	resources: TaskResource[];
	attachments: ScrumboardAttachment[];
	subscribed: boolean;
	checklists: ScrumboardChecklist[];
	activities: {
		id: string;
		type: string;
		idMember: string;
		message: string;
		time: number;
	}[];
};

export type ScrumboardBoard = {
	id: string;
	title: string;
	description: string;
	icon: string;
	lastActivity: string;
	members: string[];
	settings: {
		subscribed: boolean;
		cardCoverImages: boolean;
	};
	lists: {
		id: string;
		cards?: string[];
	}[];
};

export type ScrumboardComment = {
	id: string;
	type: string;
	idMember: string;
	message: string;
	time: number;
};

export type OrderResult = {
	source: { droppableId: string; index: number };
	destination: { droppableId: string; index: number } | null | undefined;
};