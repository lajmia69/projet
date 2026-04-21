import {
	TaskStatus,
	ProjectStatus,
	ProjectType,
	TaskType,
	TaskResource,
	SimplifyAccount,
	ProductionProject,
	ProductionTask,
	CreateProductionProject,
	UpdateProductionProject,
	CreateProductionTask,
	UpdateProductionTask,
	AudioFile,
	AudioFormat,
	CreateAudioFile,
	UpdateAudioFile,
	CreateAudioFormat,
	PagedResponse
} from '../types';

const BASE_URL = 'https://radio.backend.ecocloud.tn';

let _injectedToken: string | null = null;

const TOKEN_STORAGE_KEYS = [
	'jwt_access_token', 'access_token', 'accessToken', 'token',
	'authToken', 'jwt', 'auth_token', 'id_token', 'bearer'
];

function getToken(): string {
	if (_injectedToken) return _injectedToken;
	if (typeof window === 'undefined') return '';
	for (const key of TOKEN_STORAGE_KEYS) {
		const val = localStorage.getItem(key);
		if (!val || val.length < 10) continue;
		if (val.split('.').length === 3) return val;
		if (val.startsWith('{')) {
			try {
				const obj = JSON.parse(val);
				const t = obj.access_token ?? obj.accessToken ?? obj.token ?? obj.jwt;
				if (t && typeof t === 'string' && t.length > 10) return t;
			} catch { /* skip */ }
		}
		if (val.length > 10) return val;
	}
	for (const key of TOKEN_STORAGE_KEYS) {
		const val = sessionStorage.getItem(key);
		if (!val || val.length < 10) continue;
		if (val.split('.').length === 3) return val;
		if (val.startsWith('{')) {
			try {
				const obj = JSON.parse(val);
				const t = obj.access_token ?? obj.accessToken ?? obj.token ?? obj.jwt;
				if (t && typeof t === 'string' && t.length > 10) return t;
			} catch { /* skip */ }
		}
		if (val.length > 10) return val;
	}
	const store = (window as any).__REDUX_STORE__;
	if (store) {
		const state = store.getState();
		const token = state?.auth?.token ?? state?.user?.token ?? state?.session?.token ?? state?.auth?.user?.token;
		if (token) return token;
	}
	return '';
}

/**
 * Strips undefined and NaN values so they never silently become null/missing
 * in the JSON body and cause a 422 from the backend.
 */
function sanitizeBody(data: Record<string, unknown>): Record<string, unknown> {
	return Object.fromEntries(
		Object.entries(data).filter(
			([, v]) => v !== undefined && !(typeof v === 'number' && isNaN(v))
		)
	);
}

async function studioFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const token = getToken();
	const res = await fetch(`${BASE_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(options.headers ?? {})
		}
	});

	if (!res.ok) {
		let body = '';
		try { body = await res.text(); } catch { /* ignore */ }
		console.error(`[StudioAPI] ${res.status} on ${options.method ?? 'GET'} ${BASE_URL}${path}`);
		console.error(`[StudioAPI] Response body:`, body);
		console.error(`[StudioAPI] Request body:`, options.body ?? '(none)');
		throw new Error(`Studio API error ${res.status} on ${path}: ${body || res.statusText}`);
	}

	const text = await res.text();
	if (!text) return undefined as T;
	return JSON.parse(text);
}

async function studioFetchMultipart<T>(path: string, formData: FormData, method = 'POST'): Promise<T> {
	const token = getToken();
	const res = await fetch(`${BASE_URL}${path}`, {
		method,
		headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
		body: formData
	});
	if (!res.ok) throw new Error(`Studio API error ${res.status}: ${res.statusText}`);
	const text = await res.text();
	if (!text) return undefined as T;
	return JSON.parse(text);
}

export const DEFAULT_TASK_STATUSES = ['To Do', 'In Progress', 'Completed', 'Failed'];

// ─── Duration helpers ─────────────────────────────────────────────────────────

export function isoDurationToSeconds(duration: string): number {
	if (!duration) return 0;
	const m = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
	if (!m) return 0;
	return parseFloat(m[1] || '0') * 3600 + parseFloat(m[2] || '0') * 60 + parseFloat(m[3] || '0');
}

export function secondsToIsoDuration(totalSeconds: number): string {
	const s = Math.max(0, Math.floor(totalSeconds));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	return `PT${String(h).padStart(2, '0')}H${String(m).padStart(2, '0')}M${String(sec).padStart(2, '0')}S`;
}

export function formatIsoDuration(duration: string): string {
	const total = isoDurationToSeconds(duration);
	if (!total) return '—';
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const sec = Math.floor(total % 60);
	if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	return `${m}:${String(sec).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export const studioApiService = {
	setToken(token: string) { _injectedToken = token; },
	clearToken() { _injectedToken = null; },

	getTaskStatuses: (accountId: number): Promise<PagedResponse<TaskStatus>> =>
		studioFetch(`/studio/task_status/list/${accountId}/`),
	getTaskStatus: (accountId: number, statusId: number): Promise<TaskStatus> =>
		studioFetch(`/studio/task_status/detail/${accountId}/${statusId}/`),
	createTaskStatus: (accountId: number, name: string): Promise<TaskStatus> =>
		studioFetch(`/studio/task_status/create/${accountId}/`, { method: 'POST', body: JSON.stringify({ name }) }),
	updateTaskStatus: (accountId: number, status: TaskStatus): Promise<TaskStatus> =>
		studioFetch(`/studio/task_status/update/${accountId}/`, { method: 'PUT', body: JSON.stringify(status) }),
	deleteTaskStatus: (accountId: number, statusId: number): Promise<void> =>
		studioFetch(`/studio/task_status/delete/${accountId}/${statusId}/`, { method: 'DELETE' }),
	seedDefaultStatuses: async (accountId: number): Promise<TaskStatus[]> => {
		const { items } = await studioApiService.getTaskStatuses(accountId);
		if (items.length > 0) return items;
		return Promise.all(DEFAULT_TASK_STATUSES.map((name) => studioApiService.createTaskStatus(accountId, name)));
	},

	getProjectStatuses: (accountId: number): Promise<PagedResponse<ProjectStatus>> =>
		studioFetch(`/studio/project_status/list/${accountId}/`),
	getProjectStatus: (accountId: number, statusId: number): Promise<ProjectStatus> =>
		studioFetch(`/studio/project_status/detail/${accountId}/${statusId}/`),
	createProjectStatus: (accountId: number, name: string): Promise<ProjectStatus> =>
		studioFetch(`/studio/project_status/create/${accountId}/`, { method: 'POST', body: JSON.stringify({ name }) }),
	updateProjectStatus: (accountId: number, status: ProjectStatus): Promise<ProjectStatus> =>
		studioFetch(`/studio/project_status/update/${accountId}/`, { method: 'PUT', body: JSON.stringify(status) }),
	deleteProjectStatus: (accountId: number, statusId: number): Promise<void> =>
		studioFetch(`/studio/project_status/delete/${accountId}/${statusId}/`, { method: 'DELETE' }),

	getProjectTypes: (accountId: number): Promise<PagedResponse<ProjectType>> =>
		studioFetch(`/studio/project_type/list/${accountId}/`),
	getProjectType: (accountId: number, typeId: number): Promise<ProjectType> =>
		studioFetch(`/studio/project_type/detail/${accountId}/${typeId}/`),
	createProjectType: (accountId: number, data: { name: string; project_class: string }): Promise<ProjectType> =>
		studioFetch(`/studio/project_type/create/${accountId}/`, { method: 'POST', body: JSON.stringify(data) }),
	updateProjectType: (accountId: number, data: ProjectType): Promise<ProjectType> =>
		studioFetch(`/studio/project_type/update/${accountId}/`, { method: 'PUT', body: JSON.stringify(data) }),
	deleteProjectType: (accountId: number, typeId: number): Promise<void> =>
		studioFetch(`/studio/project_type/delete/${accountId}/${typeId}/`, { method: 'DELETE' }),

	getTaskTypes: (accountId: number): Promise<PagedResponse<TaskType>> =>
		studioFetch(`/studio/task_type/list/${accountId}/`),
	getTaskType: (accountId: number, typeId: number): Promise<TaskType> =>
		studioFetch(`/studio/task_type/detail/${accountId}/${typeId}/`),
	createTaskType: (accountId: number, name: string): Promise<TaskType> =>
		studioFetch(`/studio/task_type/create/${accountId}/`, { method: 'POST', body: JSON.stringify({ name }) }),
	updateTaskType: (accountId: number, data: TaskType): Promise<TaskType> =>
		studioFetch(`/studio/task_type/update/${accountId}/`, { method: 'PUT', body: JSON.stringify(data) }),
	deleteTaskType: (accountId: number, typeId: number): Promise<void> =>
		studioFetch(`/studio/task_type/delete/${accountId}/${typeId}/`, { method: 'DELETE' }),

	getTaskResources: (accountId: number): Promise<PagedResponse<TaskResource>> =>
		studioFetch(`/studio/task_resource/list/${accountId}/`),
	getTaskResource: (accountId: number, resourceId: number): Promise<TaskResource> =>
		studioFetch(`/studio/task_resource/detail/${accountId}/${resourceId}/`),
	createTaskResource: (accountId: number, data: { name: string; description: string }): Promise<TaskResource> =>
		studioFetch(`/studio/task_resource/create/${accountId}/`, { method: 'POST', body: JSON.stringify(data) }),
	updateTaskResource: (accountId: number, data: TaskResource): Promise<TaskResource> =>
		studioFetch(`/studio/task_resource/update/${accountId}/`, { method: 'PUT', body: JSON.stringify(data) }),
	deleteTaskResource: (accountId: number, resourceId: number): Promise<void> =>
		studioFetch(`/studio/task_resource/delete/${accountId}/${resourceId}/`, { method: 'DELETE' }),

	getProjects: (accountId: number): Promise<PagedResponse<ProductionProject>> =>
		studioFetch(`/studio/production_project/list/${accountId}/`),
	getProject: (accountId: number, projectId: number): Promise<ProductionProject> =>
		studioFetch(`/studio/production_project/detail/${accountId}/${projectId}/`),
	createProject: (accountId: number, data: CreateProductionProject): Promise<ProductionProject> =>
		studioFetch(`/studio/production_project/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify(sanitizeBody({ ...data, note: data.note ?? '' }))
		}),
	updateProject: (accountId: number, data: UpdateProductionProject): Promise<ProductionProject> =>
		studioFetch(`/studio/production_project/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(sanitizeBody({ ...data, note: data.note ?? '' }))
		}),
	deleteProject: (accountId: number, projectId: number): Promise<void> =>
		studioFetch(`/studio/production_project/delete/${accountId}/${projectId}/`, { method: 'DELETE' }),

	getTasks: (accountId: number): Promise<PagedResponse<ProductionTask>> =>
		studioFetch(`/studio/production_task/list/${accountId}/`),
	getTask: (accountId: number, taskId: number): Promise<ProductionTask> =>
		studioFetch(`/studio/production_task/detail/${accountId}/${taskId}/`),
	createTask: (accountId: number, data: CreateProductionTask): Promise<ProductionTask> =>
		studioFetch(`/studio/production_task/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify(sanitizeBody({ ...data, note: data.note ?? '' }))
		}),
	updateTask: (accountId: number, data: UpdateProductionTask): Promise<ProductionTask> =>
		studioFetch(`/studio/production_task/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(sanitizeBody({ ...data, note: data.note ?? '' }))
		}),
	deleteTask: (accountId: number, taskId: number): Promise<void> =>
		studioFetch(`/studio/production_task/delete/${accountId}/${taskId}/`, { method: 'DELETE' }),

	// ── Audio Files — base path: /audio/... (NOT /studio/audio/...) ──────────

	getAudioFiles: (accountId: number): Promise<PagedResponse<AudioFile>> =>
		studioFetch(`/audio/list/${accountId}/`),
	getAudioFile: (accountId: number, audioId: number): Promise<AudioFile> =>
		studioFetch(`/audio/detail/${accountId}/${audioId}/`),

	createAudioFile: (accountId: number, data: CreateAudioFile, file: File): Promise<AudioFile> => {
		const fd = new FormData();
		fd.append('file', file);
		fd.append('payload', JSON.stringify(data));
		return studioFetchMultipart(`/audio/create/${accountId}/`, fd, 'POST');
	},

	updateAudioFile: (accountId: number, data: UpdateAudioFile): Promise<AudioFile> =>
		studioFetch(`/audio/update/${accountId}/`, { method: 'PUT', body: JSON.stringify(data) }),

	updateAudioFileBinary: (accountId: number, audioId: number, file: File, duration: string, timestamp: number): Promise<AudioFile> => {
		const fd = new FormData();
		fd.append('file', file);
		fd.append('payload', JSON.stringify({ duration, timestamp }));
		return studioFetchMultipart(`/audio/update/file/${accountId}/${audioId}/`, fd, 'POST');
	},

	deleteAudioFile: (accountId: number, audioId: number): Promise<void> =>
		studioFetch(`/audio/delete/${accountId}/${audioId}/`, { method: 'DELETE' }),

	// ── Audio Formats ─────────────────────────────────────────────────────────

	getAudioFormats: (accountId: number): Promise<PagedResponse<AudioFormat>> =>
		studioFetch(`/audio/format/list/${accountId}/`),
	getAudioFormat: (accountId: number, formatId: number): Promise<AudioFormat> =>
		studioFetch(`/audio/format/detail/${accountId}/${formatId}/`),
	createAudioFormat: (accountId: number, data: CreateAudioFormat): Promise<AudioFormat> =>
		studioFetch(`/audio/format/create/${accountId}/`, { method: 'POST', body: JSON.stringify(data) }),
	updateAudioFormat: (accountId: number, data: AudioFormat): Promise<AudioFormat> =>
		studioFetch(`/audio/format/update/${accountId}/`, { method: 'PUT', body: JSON.stringify(data) }),
	deleteAudioFormat: (accountId: number, formatId: number): Promise<void> =>
		studioFetch(`/audio/format/delete/${accountId}/${formatId}/`, { method: 'DELETE' }),

	// ── Adapters ──────────────────────────────────────────────────────────────

	adaptProjectToBoard(project: ProductionProject, taskStatuses: TaskStatus[], tasks: ProductionTask[]) {
		const projectTasks = tasks.filter((t) => t.production_project?.id === project.id);
		return {
			id: String(project.id),
			title: project.name,
			description: project.description,
			icon: 'lucide:layout-grid',
			lastActivity: project.end_date ?? new Date().toISOString(),
			members: [],
			settings: { subscribed: true, cardCoverImages: false },
			lists: taskStatuses.map((status) => ({
				id: String(status.id),
				cards: projectTasks.filter((t) => t.status?.id === status.id).map((t) => String(t.id))
			}))
		};
	},

	adaptTaskToCard(task: ProductionTask) {
		return {
			id: String(task.id),
			boardId: String(task.production_project?.id),
			listId: String(task.status?.id),
			title: task.name,
			description: task.description ?? '',
			labels: task.task_type ? [String(task.task_type.id)] : [],
			dueDate: task.end_date ? new Date(task.end_date).getTime() / 1000 : null,
			attachmentCoverId: '',
			memberIds: task.staffs?.map((s) => String(s.id)) ?? [],
			resources: task.resources ?? [],
			attachments: [],
			subscribed: false,
			checklists: [],
			activities: []
		};
	},

	adaptAccountToMember(account: SimplifyAccount) {
		return {
			id: String(account.id),
			name: account.full_name || `${account.user.first_name ?? ''} ${account.user.last_name ?? ''}`.trim(),
			avatar: account.avatar ? `https://radio.backend.ecocloud.tn/${account.avatar}` : '',
			class: ''
		};
	}
};