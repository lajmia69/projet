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

export type SchoolLevel = 'primary' | 'secondary' | '';

// ─── Secondary sections per grade ────────────────────────────────────────────

export const SECONDARY_SECTIONS: Record<number, string[]> = {
	1: ['Generale', 'Sports'],
	2: ['IT', 'Science', 'Economics', 'Letters', 'Sports'],
	3: ['IT', 'Science', 'Maths', 'Economics', 'Letters', 'Technique', 'Sports'],
	4: ['IT', 'Science', 'Maths', 'Economics', 'Letters', 'Technique', 'Sports']
};

/** Union of sections for a set of secondary grades */
export function sectionsForGrades(grades: number[]): string[] {
	const all: string[] = [];
	grades.forEach((g) => {
		(SECONDARY_SECTIONS[g] ?? []).forEach((s) => {
			if (!all.includes(s)) all.push(s);
		});
	});
	return all;
}

// ─── Tutor subject list ───────────────────────────────────────────────────────

export const TUTOR_SUBJECTS = [
	'Mathematics',
	'Physics',
	'Chemistry',
	'Biology / Life Sciences',
	'Science (General)',
	'Arabic',
	'French',
	'English',
	'History',
	'Geography',
	'Philosophy',
	'Islamic Studies',
	'Technology',
	'IT / Computer Science',
	'Economics',
	'Accounting',
	'Arts',
	'Music',
	'Other'
] as const;

export type TutorSubject = (typeof TUTOR_SUBJECTS)[number] | '';

// ─── Contact type ─────────────────────────────────────────────────────────────

export type Contact = {
	id: string;
	avatar?: string;
	background?: string;
	firstName: string;
	lastName: string;
	// computed helper (not stored separately)
	emails?: ContactEmail[];
	phoneNumbers?: ContactPhoneNumber[];

	// Role
	role?: UserRole;

	// Tutor-specific
	tutorSubject?: TutorSubject;
	tutorSchoolLevel?: SchoolLevel;
	tutorGrades?: number[];       // multi-select
	tutorSections?: string[];     // multi-select (secondary only)

	// Student-specific
	schoolLevel?: SchoolLevel;
	grade?: number | null;
	section?: string;

	// Shared
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

// ─── Display helpers ──────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<UserRole, string> = {
	'': '',
	super_admin: 'Super Admin',
	content_admin: 'Content Admin',
	member_admin: 'Member Admin',
	studio_admin: 'Studio Admin',
	radio_content_creator: 'Radio Content Creator',
	broadcast_content_creator: 'Broadcast Content Creator',
	culture_content_creator: 'Culture Content Creator',
	lesson_content_creator: 'Lesson Content Creator',
	member: 'Member',
	studio_staff: 'Studio Staff'
};

/** Get available roles for creating/assigning users based on current user's role */
export function getAvailableRoles(currentUserRole: UserRole | null | undefined): UserRole[] {
	// Super admin can assign all roles
	if (currentUserRole === 'super_admin') {
		return [...Object.keys(ROLE_LABELS).filter(r => r !== '') as UserRole[]];
	}
	// Members cannot add anyone
	if (currentUserRole === 'member') {
		return [];
	}
	// All other roles (admins, creators, staff) can only add members
	return ['member'];
}

export const SCHOOL_LEVEL_LABELS: Record<SchoolLevel, string> = { '': '', primary: 'Primary', secondary: 'Secondary' };

export function studentPlacementLabel(
	schoolLevel: SchoolLevel,
	grade: number | null | undefined,
	section: string | undefined
): string {
	if (!schoolLevel || !grade) return '';
	if (schoolLevel === 'primary') return `Primary – Grade ${grade}`;
	return `Secondary – Year ${grade}${section ? ` (${section})` : ''}`;
}

export function tutorAssignmentLabel(
	schoolLevel: SchoolLevel,
	grades: number[],
	sections: string[]
): string {
	if (!schoolLevel || !grades.length) return '';
	const lvl = schoolLevel === 'primary' ? 'Primary' : 'Secondary';
	const gradeStr = grades.length === 1 ? `Grade ${grades[0]}` : `${grades.length} grades`;
	const secStr = sections.length ? ` · ${sections.length} section${sections.length > 1 ? 's' : ''}` : '';
	return `${lvl} – ${gradeStr}${secStr}`;
}