// ─── Base contact fields ──────────────────────────────────────────────────────

export type ContactPhoneNumber = {
	country: string;
	phoneNumber: string;
	label?: string;
};

export type ContactEmail = {
	email: string;
	label?: string;
};

// ─── Role ────────────────────────────────────────────────────────────────────

export type UserRole =
	| 'contact'
	| 'super_admin'
	| 'content_admin'
	| 'member_admin'
	| 'studio_admin'
	| 'radio_content_creator'
	| 'broadcast_content_creator'
	| 'culture_content_creator'
	| 'lesson_content_creator'
	| 'member'
	| 'studio_staff'
	| '';

export const ALL_ROLES: UserRole[] = [
	'contact',
	'super_admin',
	'content_admin',
	'member_admin',
	'studio_admin',
	'radio_content_creator',
	'broadcast_content_creator',
	'culture_content_creator',
	'lesson_content_creator',
	'member',
	'studio_staff'
];

export type RoleConfig = {
	label: string;
	icon: string;
	from: string;
	to: string;
	description: string;
};

export const ROLE_MAP: Record<Exclude<UserRole, ''>, RoleConfig> = {
	contact: {
		label: 'Contact',
		icon: 'lucide:user',
		from: '#64748b',
		to: '#475569',
		description: 'External contact'
	},
	super_admin: {
		label: 'Super Admin',
		icon: 'lucide:shield-check',
		from: '#ef4444',
		to: '#dc2626',
		description: 'Full platform access'
	},
	content_admin: {
		label: 'Content Admin',
		icon: 'lucide:file-pen',
		from: '#f97316',
		to: '#ea580c',
		description: 'Manages all content'
	},
	member_admin: {
		label: 'Member Admin',
		icon: 'lucide:users',
		from: '#eab308',
		to: '#ca8a04',
		description: 'Manages members'
	},
	studio_admin: {
		label: 'Studio Admin',
		icon: 'lucide:mic-2',
		from: '#22c55e',
		to: '#16a34a',
		description: 'Manages studio'
	},
	radio_content_creator: {
		label: 'Radio Creator',
		icon: 'lucide:radio',
		from: '#06b6d4',
		to: '#0891b2',
		description: 'Creates radio content'
	},
	broadcast_content_creator: {
		label: 'Broadcast Creator',
		icon: 'lucide:tv-2',
		from: '#3b82f6',
		to: '#2563eb',
		description: 'Creates broadcast content'
	},
	culture_content_creator: {
		label: 'Culture Creator',
		icon: 'lucide:landmark',
		from: '#8b5cf6',
		to: '#7c3aed',
		description: 'Creates culture content'
	},
	lesson_content_creator: {
		label: 'Lesson Creator',
		icon: 'lucide:book-open',
		from: '#ec4899',
		to: '#db2777',
		description: 'Creates lesson content'
	},
	member: {
		label: 'Member',
		icon: 'lucide:user-check',
		from: '#10b981',
		to: '#059669',
		description: 'Platform member'
	},
	studio_staff: {
		label: 'Studio Staff',
		icon: 'lucide:headphones',
		from: '#f59e0b',
		to: '#d97706',
		description: 'Studio team member'
	}
};

// ─── Contact type ─────────────────────────────────────────────────────────────

export type Contact = {
	id: string;
	avatar?: string;
	background?: string;
	firstName: string;
	lastName: string;
	emails?: ContactEmail[];
	phoneNumbers?: ContactPhoneNumber[];
	role?: UserRole;
	birthday?: string;
	address?: string;
	notes?: string;
	tags?: string[];
};

/** Full display name */
export function contactFullName(contact: Pick<Contact, 'firstName' | 'lastName'>): string {
	return [contact.firstName, contact.lastName].filter(Boolean).join(' ');
}

// ─── Tag / Country / Grouped ──────────────────────────────────────────────────

export type Tag = {
	id: string;
	title: string;
};

export type Country = {
	id?: string;
	title?: string;
	iso?: string;
	code?: string;
	flagImagePos?: string;
};

export type GroupedContacts = {
	group: string;
	children?: Contact[];
};

export type AccumulatorType = Record<string, GroupedContacts>;