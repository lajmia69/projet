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
	PagedResponse
} from '../types';

const BASE_URL = 'https://radio.backend.ecocloud.tn';

function getToken(): string {
	// Adapt this to wherever your JWT is stored (localStorage, cookie, Redux store, etc.)
	if (typeof window !== 'undefined') {
		return localStorage.getItem('access_token') || localStorage.getItem('token') || '';
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
	// DELETE returns empty body
	if (res.status === 204 || res.headers.get('content-length') === '0') {
		return undefined as T;
	}
	return res.json();
}

// ─── Default task statuses (seeded on first load) ────────────────────────────
export const DEFAULT_TASK_STATUSES = ['To Do', 'In Progress', 'Completed', 'Failed'];

export const studioApiService = {
	// ── Task Statuses (kanban columns) ──────────────────────────────────────
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

	/** Seed the four default statuses if none exist yet */
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

	createProjectStatus: (accountId: number, name: string): Promise<ProjectStatus> =>
		studioFetch(`/studio/project_status/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify({ name })
		}),

	deleteProjectStatus: (accountId: number, statusId: number): Promise<void> =>
		studioFetch(`/studio/project_status/delete/${accountId}/${statusId}/`, {
			method: 'DELETE'
		}),

	// ── Project Types ───────────────────────────────────────────────────────
	getProjectTypes: (accountId: number): Promise<PagedResponse<ProjectType>> =>
		studioFetch(`/studio/project_type/list/${accountId}/`),

	createProjectType: (accountId: number, data: { name: string; project_class: string }): Promise<ProjectType> =>
		studioFetch(`/studio/project_type/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify(data)
		}),

	// ── Task Types (used as labels) ─────────────────────────────────────────
	getTaskTypes: (accountId: number): Promise<PagedResponse<TaskType>> =>
		studioFetch(`/studio/task_type/list/${accountId}/`),

	createTaskType: (accountId: number, name: string): Promise<TaskType> =>
		studioFetch(`/studio/task_type/create/${accountId}/`, {
			method: 'POST',
			body: JSON.stringify({ name })
		}),

	deleteTaskType: (accountId: number, typeId: number): Promise<void> =>
		studioFetch(`/studio/task_type/delete/${accountId}/${typeId}/`, { method: 'DELETE' }),

	// ── Task Resources ──────────────────────────────────────────────────────
	getTaskResources: (accountId: number): Promise<PagedResponse<TaskResource>> =>
		studioFetch(`/studio/task_resource/list/${accountId}/`),

	// ── Production Projects (boards) ────────────────────────────────────────
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

	// ── Production Tasks (cards) ────────────────────────────────────────────
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

	// ── Adapters: convert studio data → ScrumboardBoard shape ───────────────
	/**
	 * Build a ScrumboardBoard from a ProductionProject + task statuses + tasks.
	 * Each column = one TaskStatus; cards = tasks whose status matches.
	 */
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