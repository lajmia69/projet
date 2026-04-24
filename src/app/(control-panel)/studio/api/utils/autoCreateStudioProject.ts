/**
 * autoCreateStudioProject.ts
 *
 * Utility for automatically creating a Studio production project board
 * whenever content is created (lessons, radio, podcasts, cultural content).
 * The link is stored in the project's `note` field as `contentType:contentId`.
 */

const BASE_URL = 'https://radio.backend.ecocloud.tn';

export const CONTENT_TYPE_TO_CLASS = {
	lesson:            'Lesson',
	radio_episode:     'Radio Episode',
	radio_emission:    'Radio Emission',
	radio_reportage:   'Radio Reportage',
	podcast:           'Podcast',
	cultural_project:  'Cultural Project',
	cultural_activity: 'Cultural Activity',
} as const;

export type StudioContentType = keyof typeof CONTENT_TYPE_TO_CLASS;

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function apiGet<T>(path: string, token: string): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	if (!res.ok) throw new Error(`${res.status} GET ${path}`);
	return res.json();
}

async function apiPost<T>(path: string, token: string, body: object): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		method:  'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		body:    JSON.stringify(body),
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`${res.status} POST ${path}: ${text}`);
	}
	const text = await res.text();
	return text ? JSON.parse(text) : (undefined as T);
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Creates a Studio production project board for the given content.
 * Call this in mutation `onSuccess` handlers — failures are non-blocking.
 */
export async function createStudioProjectForContent(
	accountId: number,
	token: string,
	contentType: StudioContentType,
	contentId: number,
	contentName: string,
): Promise<{ id: number } | null> {
	if (!accountId || !token || !contentId || !contentName) return null;

	try {
		const types = await apiGet<{ items: Array<{ id: number | null; project_class: string }> }>(
			`/studio/project_type/list/${accountId}/`,
			token,
		);

		console.log('[DEBUG validate] Available project types:', types.items.map(t => t.project_class));

		const targetClass = CONTENT_TYPE_TO_CLASS[contentType];
		const pt = types.items.find(t => t.project_class === targetClass);

		if (!pt?.id) {
			console.warn(`[Studio] No project type found for class "${targetClass}". ` +
				'Add it in Studio > Project Types in the Django admin.');
			return null;
		}

		const today = new Date().toISOString().split('T')[0];
		const noteKey = `${contentType}:${contentId}`;

		// Check if already exists to avoid duplicates
		const existing = await findLinkedStudioProject(accountId, token, contentType, contentId);
		if (existing) {
			console.log(`[Studio] Project already exists for ${noteKey} (id=${existing.id})`);
			return existing;
		}

		const project = await apiPost<{ id: number }>(
			`/studio/production_project/create/${accountId}/`,
			token,
			{
				name:            contentName,
				description:     `Production board for ${targetClass} #${contentId}`,
				start_date:      today,
				end_date:        today,
				note:            noteKey,
				project_type_id: pt.id,
			},
		);

		console.log(`[Studio] Auto-created project id=${project?.id} for ${noteKey}`);
		return project;
	} catch (err) {
		// Non-blocking — content creation should not fail because of this
		console.error('[Studio] Auto-create project failed (non-critical):', err);
		return null;
	}
}

/**
 * Finds the Studio production project linked to a piece of content.
 * Returns `null` if none found.
 */
export async function findLinkedStudioProject(
	accountId: number,
	token: string,
	contentType: StudioContentType,
	contentId: number,
): Promise<{ id: number; name: string; note: string | null } | null> {
	if (!accountId || !token || !contentId) return null;
	try {
		const data = await apiGet<{
			items: Array<{ id: number; name: string; note: string | null }>;
		}>(`/studio/production_project/list/${accountId}/`, token);

		const needle = `${contentType}:${contentId}`;
		return data.items.find(p => p.note === needle) ?? null;
	} catch {
		return null;
	}
}