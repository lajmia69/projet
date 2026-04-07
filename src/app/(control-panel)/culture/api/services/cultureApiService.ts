import {
	CulturalProject,
	CulturalActivity,
	CulturalProjectType,
	CulturalActivityType,
	CreateCulturalProjectPayload,
	UpdateCulturalProjectPayload,
	CreateCulturalActivityPayload,
	UpdateCulturalActivityPayload,
	Paged
} from '../types/projectsAndActivities';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = 'https://radio.backend.ecocloud.tn';

function getToken(): string {
	return (
		localStorage.getItem('jwt_access_token') ||
		localStorage.getItem('fusejs_access_token') ||
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
	// 204 / empty body
	const text = await res.text();
	return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

// ─── Project Types ────────────────────────────────────────────────────────────

export const getProjectTypes = async (accountId: number): Promise<CulturalProjectType[]> => {
	const res = await fetch(
		`${BASE_URL}/culture/project/type/list/${accountId}/?limit=200`,
		{ headers: authHeaders() }
	);
	const data = await handleResponse<Paged<CulturalProjectType>>(res);
	return data.items;
};

// ─── Activity Types ───────────────────────────────────────────────────────────

export const getActivityTypes = async (accountId: number): Promise<CulturalActivityType[]> => {
	const res = await fetch(
		`${BASE_URL}/culture/activity/type/list/${accountId}/?limit=200`,
		{ headers: authHeaders() }
	);
	const data = await handleResponse<Paged<CulturalActivityType>>(res);
	return data.items;
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const getProjects = async (accountId: number): Promise<CulturalProject[]> => {
	const res = await fetch(
		`${BASE_URL}/culture/project/list/${accountId}/?limit=200`,
		{ headers: authHeaders() }
	);
	const data = await handleResponse<Paged<CulturalProject>>(res);
	return data.items;
};

export const getProject = async (accountId: number, projectId: number): Promise<CulturalProject> => {
	const res = await fetch(
		`${BASE_URL}/culture/project/detail/${accountId}/${projectId}/`,
		{ headers: authHeaders() }
	);
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
		headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type → browser sets multipart boundary
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
	const res = await fetch(
		`${BASE_URL}/culture/project/delete/${accountId}/${projectId}/`,
		{ method: 'DELETE', headers: authHeaders() }
	);
	await handleResponse<void>(res);
};

// ─── Activities ───────────────────────────────────────────────────────────────

export const getActivities = async (accountId: number): Promise<CulturalActivity[]> => {
	const res = await fetch(
		`${BASE_URL}/culture/activity/list/${accountId}/?limit=200`,
		{ headers: authHeaders() }
	);
	const data = await handleResponse<Paged<CulturalActivity>>(res);
	return data.items;
};

export const getActivity = async (accountId: number, activityId: number): Promise<CulturalActivity> => {
	const res = await fetch(
		`${BASE_URL}/culture/activity/detail/${accountId}/${activityId}/`,
		{ headers: authHeaders() }
	);
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
	const res = await fetch(
		`${BASE_URL}/culture/activity/delete/${accountId}/${activityId}/`,
		{ method: 'DELETE', headers: authHeaders() }
	);
	await handleResponse<void>(res);
};