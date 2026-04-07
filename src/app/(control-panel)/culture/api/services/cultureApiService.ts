import {
	CulturalProject,
	CulturalActivity,
	CulturalProjectType,
	CulturalActivityType,
	CreateCulturalProjectPayload,
	UpdateCulturalProjectPayload,
	CreateCulturalActivityPayload,
	UpdateCulturalActivityPayload,
	CreateCulturalProjectTypePayload,
	UpdateCulturalProjectTypePayload,
	CreateCulturalActivityTypePayload,
	UpdateCulturalActivityTypePayload,
	Paged
} from '../types/projectsAndActivities';

const BASE_URL = 'https://radio.backend.ecocloud.tn';

function getToken(): string {
	return (
		localStorage.getItem('jwt_access_token') ||
		localStorage.getItem('fusejs_access_token') ||
		localStorage.getItem('access_token') ||
		''
	);
}

function authHeaders(): HeadersInit {
	return {
		Authorization: `Bearer ${getToken()}`,
		'Content-Type': 'application/json'
	};
}

async function handleResponse<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(`API error ${res.status}: ${text}`);
	}
	const text = await res.text();
	return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

// ─── Project Types ────────────────────────────────────────────────────────────

export const getProjectTypes = async (accountId: number): Promise<CulturalProjectType[]> => {
	const res = await fetch(`${BASE_URL}/culture/project/type/list/${accountId}/?limit=200`, { headers: authHeaders() });
	const data = await handleResponse<Paged<CulturalProjectType>>(res);
	return data.items;
};

export const createProjectType = async (
	accountId: number,
	payload: CreateCulturalProjectTypePayload
): Promise<CulturalProjectType> => {
	const res = await fetch(`${BASE_URL}/culture/project/type/create/${accountId}/`, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify(payload)
	});
	return handleResponse<CulturalProjectType>(res);
};

export const updateProjectType = async (
	accountId: number,
	payload: UpdateCulturalProjectTypePayload
): Promise<CulturalProjectType> => {
	const res = await fetch(`${BASE_URL}/culture/project/type/update/${accountId}/`, {
		method: 'PUT',
		headers: authHeaders(),
		body: JSON.stringify(payload)
	});
	return handleResponse<CulturalProjectType>(res);
};

export const deleteProjectType = async (accountId: number, typeId: number): Promise<void> => {
	const res = await fetch(`${BASE_URL}/culture/project/type/delete/${accountId}/${typeId}/`, {
		method: 'DELETE',
		headers: authHeaders()
	});
	await handleResponse<void>(res);
};

// ─── Activity Types ───────────────────────────────────────────────────────────

export const getActivityTypes = async (accountId: number): Promise<CulturalActivityType[]> => {
	const res = await fetch(`${BASE_URL}/culture/activity/type/list/${accountId}/?limit=200`, { headers: authHeaders() });
	const data = await handleResponse<Paged<CulturalActivityType>>(res);
	return data.items;
};

export const createActivityType = async (
	accountId: number,
	payload: CreateCulturalActivityTypePayload
): Promise<CulturalActivityType> => {
	const res = await fetch(`${BASE_URL}/culture/activity/type/create/${accountId}/`, {
		method: 'POST',
		headers: authHeaders(),
		body: JSON.stringify(payload)
	});
	return handleResponse<CulturalActivityType>(res);
};

export const updateActivityType = async (
	accountId: number,
	payload: UpdateCulturalActivityTypePayload
): Promise<CulturalActivityType> => {
	const res = await fetch(`${BASE_URL}/culture/activity/type/update/${accountId}/`, {
		method: 'PUT',
		headers: authHeaders(),
		body: JSON.stringify(payload)
	});
	return handleResponse<CulturalActivityType>(res);
};

export const deleteActivityType = async (accountId: number, typeId: number): Promise<void> => {
	const res = await fetch(`${BASE_URL}/culture/activity/type/delete/${accountId}/${typeId}/`, {
		method: 'DELETE',
		headers: authHeaders()
	});
	await handleResponse<void>(res);
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const getProjects = async (accountId: number): Promise<CulturalProject[]> => {
	const res = await fetch(`${BASE_URL}/culture/project/list/${accountId}/?limit=200`, { headers: authHeaders() });
	const data = await handleResponse<Paged<CulturalProject>>(res);
	return data.items;
};

export const getProject = async (accountId: number, projectId: number): Promise<CulturalProject> => {
	const res = await fetch(`${BASE_URL}/culture/project/detail/${accountId}/${projectId}/`, { headers: authHeaders() });
	return handleResponse<CulturalProject>(res);
};

export const createProject = async (
	accountId: number,
	payload: CreateCulturalProjectPayload
): Promise<CulturalProject> => {
	const formData = new FormData();
	formData.append('payload', JSON.stringify(payload));
	const res = await fetch(`${BASE_URL}/culture/project/create/${accountId}/`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${getToken()}` },
		body: formData
	});
	return handleResponse<CulturalProject>(res);
};

export const updateProject = async (
	accountId: number,
	payload: UpdateCulturalProjectPayload
): Promise<CulturalProject> => {
	const res = await fetch(`${BASE_URL}/culture/project/update/${accountId}/`, {
		method: 'PUT',
		headers: authHeaders(),
		body: JSON.stringify(payload)
	});
	return handleResponse<CulturalProject>(res);
};

export const deleteProject = async (accountId: number, projectId: number): Promise<void> => {
	const res = await fetch(`${BASE_URL}/culture/project/delete/${accountId}/${projectId}/`, {
		method: 'DELETE',
		headers: authHeaders()
	});
	await handleResponse<void>(res);
};

// ─── Activities ───────────────────────────────────────────────────────────────

export const getActivities = async (accountId: number): Promise<CulturalActivity[]> => {
	const res = await fetch(`${BASE_URL}/culture/activity/list/${accountId}/?limit=200`, { headers: authHeaders() });
	const data = await handleResponse<Paged<CulturalActivity>>(res);
	return data.items;
};

export const getActivity = async (accountId: number, activityId: number): Promise<CulturalActivity> => {
	const res = await fetch(`${BASE_URL}/culture/activity/detail/${accountId}/${activityId}/`, { headers: authHeaders() });
	return handleResponse<CulturalActivity>(res);
};

export const createActivity = async (
	accountId: number,
	payload: CreateCulturalActivityPayload
): Promise<CulturalActivity> => {
	const formData = new FormData();
	formData.append('payload', JSON.stringify(payload));
	const res = await fetch(`${BASE_URL}/culture/activity/create/${accountId}/`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${getToken()}` },
		body: formData
	});
	return handleResponse<CulturalActivity>(res);
};

export const updateActivity = async (
	accountId: number,
	payload: UpdateCulturalActivityPayload
): Promise<CulturalActivity> => {
	const res = await fetch(`${BASE_URL}/culture/activity/update/${accountId}/`, {
		method: 'PUT',
		headers: authHeaders(),
		body: JSON.stringify(payload)
	});
	return handleResponse<CulturalActivity>(res);
};

export const deleteActivity = async (accountId: number, activityId: number): Promise<void> => {
	const res = await fetch(`${BASE_URL}/culture/activity/delete/${accountId}/${activityId}/`, {
		method: 'DELETE',
		headers: authHeaders()
	});
	await handleResponse<void>(res);
};