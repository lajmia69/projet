/**
 * The authRoles object defines the authorization roles for the Fuse application.
 * This version includes both spaced and non-spaced strings to ensure matches.
 */
const authRoles = {
	superAdminOnly: ['Super Admin', 'SuperAdmin'],
	
	contentAdminOnly: ['Content Admin', 'ContentAdmin', 'Super Admin', 'SuperAdmin'],
	contentAdmin: ['Content Admin', 'ContentAdmin', 'Super Admin', 'SuperAdmin'],
	
	memberAdminOnly: ['Member Admin', 'MemberAdmin', 'Super Admin', 'SuperAdmin'],
	memberAdmin: ['Member Admin', 'MemberAdmin', 'Super Admin', 'SuperAdmin'],
	
	studioAdminOnly: ['Studio Admin', 'StudioAdmin', 'Super Admin', 'SuperAdmin'],
	studioAdmin: ['Studio Admin', 'StudioAdmin', 'Super Admin', 'SuperAdmin'],
	
	Contact: ['Contact', 'Super Admin', 'SuperAdmin'],

	radioContentCreator: [
		'Radio Content Creator', 
		'RadioContentCreator', 
		'Content Admin', 
		'ContentAdmin', 
		'Super Admin', 
		'SuperAdmin'
	],
	podcastContentCreator: [
		'Podcast Content Creator', 
		'PodcastContentCreator', 
		'Content Admin', 
		'ContentAdmin', 
		'Super Admin', 
		'SuperAdmin'
	],
	cultureContentCreator: [
		'Culture Content Creator', 
		'CultureContentCreator', 
		'Content Admin', 
		'ContentAdmin', 
		'Super Admin', 
		'SuperAdmin'
	],
	lessonContentCreator: [
		'Lesson Content Creator', 
		'LessonContentCreator', 
		'Content Admin', 
		'ContentAdmin', 
		'Super Admin', 
		'SuperAdmin'
	],
	
	studioStaff: [
		'Studio Staff', 
		'StudioStaff', 
		'Studio Admin', 
		'StudioAdmin', 
		'Super Admin', 
		'SuperAdmin'
	],

	/**
	 * CRITICAL: This array is used by the 'Platform' menu items.
	 * It MUST contain the spaced versions of the roles.
	 */
	member: [
		'Super Admin',
		'SuperAdmin',
		'Content Admin',
		'ContentAdmin',
		'Member Admin',
		'MemberAdmin',
		'Studio Admin',
		'StudioAdmin',
		'Studio Staff',
		'StudioStaff',
		'Radio Content Creator',
		'RadioContentCreator',
		'Podcast Content Creator',
		'PodcastContentCreator',
		'Culture Content Creator',
		'CultureContentCreator',
		'Lesson Content Creator',
		'LessonContentCreator',
		'Member',
		'Contact',
		'Application',
		'application'
	],

	onlyGuest: []
};

export default authRoles;