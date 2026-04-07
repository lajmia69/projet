// ─── Cultural Projects ────────────────────────────────────────────────────────

export type CulturalProjectStatus = 'planning' | 'in_progress' | 'completed' | 'cancelled';

export type CulturalProject = {
	id: string;
	title: string;
	slug: string;
	description: string;
	status: CulturalProjectStatus;
	category: string;
	startDate: string;
	endDate?: string;
	location?: string;
	budget?: number;
	teamSize?: number;
	coverImage?: string;
	tags: string[];
	createdAt: string;
	updatedAt: string;
};

// ─── Cultural Activities ──────────────────────────────────────────────────────

export type CulturalActivityType =
	| 'workshop'
	| 'exhibition'
	| 'concert'
	| 'conference'
	| 'festival'
	| 'other';

export type CulturalActivity = {
	id: string;
	title: string;
	slug: string;
	description: string;
	type: CulturalActivityType;
	category: string;
	date: string;
	endDate?: string;
	location: string;
	capacity?: number;
	price?: number;
	isFree: boolean;
	isOnline: boolean;
	coverImage?: string;
	projectId?: string;
	tags: string[];
	createdAt: string;
	updatedAt: string;
};