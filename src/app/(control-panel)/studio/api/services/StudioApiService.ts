import {
	TaskStatus,
	ProjectStatus,
	ProjectType,
	TaskType,
	TaskResource,
	ProductionProject,
	ProductionTask,
	CreateProductionProject,
	UpdateProductionProject,
	CreateProductionTask,
	UpdateProductionTask,
	AudioFile,
	CreateAudioFile,
	UpdateAudioFile,
	PagedResponse
} from '../types';

const BASE_URL = 'https://radio.backend.ecocloud.tn';

// ─── Token injection ──────────────────────────────────────────────────────────
let _injectedToken: string | null = null;

const TOKEN_STORAGE_KEYS = [
	'jwt_access_token',
	'access_token',
	'accessToken',
	'token',
	'authToken',
	'jwt',
	'auth_token',
	'id_token',
	'bearer'
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
			} catch { /* not valid JSON */ }
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
			} catch { /* not valid JSON */ }
		}
		if (val.length > 10) return val;
	}

	const store = (window as any).__REDUX_STORE__;
	if (store) {
		const state = store.getState();
		const token =
			state?.auth?.token ??
			state?.user?.token ??
			state?.session?.token ??
			state?.auth?.user?.token;
		if (token) return token;
	}

	return '';
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
		throw new Error(`Studio API error ${res.status}: ${res.statusText}`);
	}
	const text = await res.text();
	if (!text) return undefined as T;
	return JSON.parse(text);
}

/** For multipart/form-data requests (file uploads) — no Content-Type header so the browser sets it with boundary */
async function studioFetchMultipart<T>(path: string, formData: FormData, method = 'POST'): Promise<T> {
	const token = getToken();
	const res = await fetch(`${BASE_URL}${path}`, {
		method,
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {})
			// Do NOT set Content-Type — browser sets it automatically with boundary
		},
		body: formData
	});
	if (!res.ok) {
		throw new Error(`Studio API error ${res.status}: ${res.statusText}`);
	}
	const text = await res.text();
	if (!text) return undefined as T;
	return JSON.parse(text);
}

export const DEFAULT_TASK_STATUSES = ['To Do', 'In Progress', 'Completed', 'Failed'];

export const studioApiService = {
	setToken(token: string) {
		_injectedToken = token;
	},

	clearToken() {
		_injectedToken = null;
	},

	// ── Task Statuses ───────────────────────────────────────────────────────
	getTaskStatuses: (accountId: number): Promise<PagedResponse<TaskStatus>> =>
		studioFetch(`/studio/task_status/list/${accountId}/`),

	getTaskStatus: (accountId: number, statusId: number): Promise<TaskStatus> =>
		studioFetch(`/studio/task_status/detail/${accountId}/${statusId}/`),

	createTaskStatus: (accountId: number, name: string): Promise<TaskStatus> =>
		studioFetch(`/studio/task_status/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify({ name })
		}),

	updateTaskStatus: (accountId: number, status: TaskStatus): Promise<TaskStatus> =>
		studioFetch(`/studio/task_status/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(status)
		}),

	deleteTaskStatus: (accountId: number, statusId: number): Promise<void> =>
		studioFetch(`/studio/task_status/delete/${accountId}/${statusId}/`, {
			method: 'DELETE'
		}),

	seedDefaultStatuses: async (accountId: number): Promise<TaskStatus[]> => {
		const { items } = await studioApiService.getTaskStatuses(accountId);
		if (items.length > 0) return items;
		const created = await Promise.all(
			DEFAULT_TASK_STATUSES.map((name) => studioApiService.createTaskStatus(accountId, name))
		);
		return created;
	},

	// ── Project Statuses ────────────────────────────────────────────────────
	getProjectStatuses: (accountId: number): Promise<PagedResponse<ProjectStatus>> =>
		studioFetch(`/studio/project_status/list/${accountId}/`),

	getProjectStatus: (accountId: number, statusId: number): Promise<ProjectStatus> =>
		studioFetch(`/studio/project_status/detail/${accountId}/${statusId}/`),

	createProjectStatus: (accountId: number, name: string): Promise<ProjectStatus> =>
		studioFetch(`/studio/project_status/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify({ name })
		}),

	updateProjectStatus: (accountId: number, status: ProjectStatus): Promise<ProjectStatus> =>
		studioFetch(`/studio/project_status/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(status)
		}),

	deleteProjectStatus: (accountId: number, statusId: number): Promise<void> =>
		studioFetch(`/studio/project_status/delete/${accountId}/${statusId}/`, {
			method: 'DELETE'
		}),

	// ── Project Types ───────────────────────────────────────────────────────
	getProjectTypes: (accountId: number): Promise<PagedResponse<ProjectType>> =>
		studioFetch(`/studio/project_type/list/${accountId}/`),

	getProjectType: (accountId: number, typeId: number): Promise<ProjectType> =>
		studioFetch(`/studio/project_type/detail/${accountId}/${typeId}/`),

	createProjectType: (accountId: number, data: { name: string; project_class: string }): Promise<ProjectType> =>
		studioFetch(`/studio/project_type/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify(data)
		}),

	updateProjectType: (accountId: number, data: ProjectType): Promise<ProjectType> =>
		studioFetch(`/studio/project_type/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	deleteProjectType: (accountId: number, typeId: number): Promise<void> =>
		studioFetch(`/studio/project_type/delete/${accountId}/${typeId}/`, { method: 'DELETE' }),

	// ── Task Types ──────────────────────────────────────────────────────────
	getTaskTypes: (accountId: number): Promise<PagedResponse<TaskType>> =>
		studioFetch(`/studio/task_type/list/${accountId}/`),

	getTaskType: (accountId: number, typeId: number): Promise<TaskType> =>
		studioFetch(`/studio/task_type/detail/${accountId}/${typeId}/`),

	createTaskType: (accountId: number, name: string): Promise<TaskType> =>
		studioFetch(`/studio/task_type/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify({ name })
		}),

	updateTaskType: (accountId: number, data: TaskType): Promise<TaskType> =>
		studioFetch(`/studio/task_type/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	deleteTaskType: (accountId: number, typeId: number): Promise<void> =>
		studioFetch(`/studio/task_type/delete/${accountId}/${typeId}/`, { method: 'DELETE' }),

	// ── Task Resources ──────────────────────────────────────────────────────
	getTaskResources: (accountId: number): Promise<PagedResponse<TaskResource>> =>
		studioFetch(`/studio/task_resource/list/${accountId}/`),

	getTaskResource: (accountId: number, resourceId: number): Promise<TaskResource> =>
		studioFetch(`/studio/task_resource/detail/${accountId}/${resourceId}/`),

	createTaskResource: (accountId: number, data: { name: string; description: string }): Promise<TaskResource> =>
		studioFetch(`/studio/task_resource/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify(data)
		}),

	updateTaskResource: (accountId: number, data: TaskResource): Promise<TaskResource> =>
		studioFetch(`/studio/task_resource/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	deleteTaskResource: (accountId: number, resourceId: number): Promise<void> =>
		studioFetch(`/studio/task_resource/delete/${accountId}/${resourceId}/`, { method: 'DELETE' }),

	// ── Production Projects ─────────────────────────────────────────────────
	getProjects: (accountId: number): Promise<PagedResponse<ProductionProject>> =>
		studioFetch(`/studio/production_project/list/${accountId}/`),

	getProject: (accountId: number, projectId: number): Promise<ProductionProject> =>
		studioFetch(`/studio/production_project/detail/${accountId}/${projectId}/`),

	createProject: (accountId: number, data: CreateProductionProject): Promise<ProductionProject> =>
		studioFetch(`/studio/production_project/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify(data)
		}),

	updateProject: (accountId: number, data: UpdateProductionProject): Promise<ProductionProject> =>
		studioFetch(`/studio/production_project/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	deleteProject: (accountId: number, projectId: number): Promise<void> =>
		studioFetch(`/studio/production_project/delete/${accountId}/${projectId}/`, {
			method: 'DELETE'
		}),

	// ── Production Tasks ────────────────────────────────────────────────────
	getTasks: (accountId: number): Promise<PagedResponse<ProductionTask>> =>
		studioFetch(`/studio/production_task/list/${accountId}/`),

	getTask: (accountId: number, taskId: number): Promise<ProductionTask> =>
		studioFetch(`/studio/production_task/detail/${accountId}/${taskId}/`),

	createTask: (accountId: number, data: CreateProductionTask): Promise<ProductionTask> =>
		studioFetch(`/studio/production_task/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify(data)
		}),

	updateTask: (accountId: number, data: UpdateProductionTask): Promise<ProductionTask> =>
		studioFetch(`/studio/production_task/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	deleteTask: (accountId: number, taskId: number): Promise<void> =>
		studioFetch(`/studio/production_task/delete/${accountId}/${taskId}/`, {
			method: 'DELETE'
		}),

	// ── Audio Files ─────────────────────────────────────────────────────────
	/**
	 * List all audio files for an account.
	 * Filter by project on the client side using .filter() or pass project_id as query param if the API supports it.
	 */
	getAudioFiles: (accountId: number): Promise<PagedResponse<AudioFile>> =>
		studioFetch(`/studio/audio/list/${accountId}/`),

	getAudioFile: (accountId: number, audioId: number): Promise<AudioFile> =>
		studioFetch(`/studio/audio/detail/${accountId}/${audioId}/`),

	/**
	 * Upload an audio file using multipart/form-data.
	 * The `file` field holds the File object; metadata is sent as additional FormData fields.
	 */
	createAudioFile: (
		accountId: number,
		data: CreateAudioFile,
		file: File
	): Promise<AudioFile> => {
		const formData = new FormData();
		formData.append('title', data.title);
		formData.append('production_project_id', String(data.production_project_id));
		if (data.description) formData.append('description', data.description);
		formData.append('file', file);
		return studioFetchMultipart(`/studio/audio/create/${accountId}/`, formData);
	},

	updateAudioFile: (accountId: number, data: UpdateAudioFile): Promise<AudioFile> =>
		studioFetch(`/studio/audio/update/${accountId}/`, {
			method: 'PUT',
			body: JSON.stringify(data)
		}),

	deleteAudioFile: (accountId: number, audioId: number): Promise<void> =>
		studioFetch(`/studio/audio/delete/${accountId}/${audioId}/`, {
			method: 'DELETE'
		}),

	/** Returns the fully-qualified URL for playing an audio file */
	getAudioUrl: (relativePath: string): string => {
		if (!relativePath) return '';
		if (relativePath.startsWith('http')) return relativePath;
		return `${BASE_URL}/${relativePath.replace(/^\//, '')}`;
	},

	// ── Adapters ────────────────────────────────────────────────────────────
	adaptProjectToBoard(
		project: ProductionProject,
		taskStatuses: TaskStatus[],
		tasks: ProductionTask[]
	) {
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
				cards: projectTasks
					.filter((t) => t.status?.id === status.id)
					.map((t) => String(t.id))
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

	adaptAccountToMember(account: import('../types').SimplifyAccount) {
		return {
			id: String(account.id),
			name: account.full_name || `${account.user.first_name ?? ''} ${account.user.last_name ?? ''}`.trim(),
			avatar: account.avatar ? `https://radio.backend.ecocloud.tn/${account.avatar}` : '',
			class: ''
		};
	}
};