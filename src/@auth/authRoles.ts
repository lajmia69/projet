/**
 * The authRoles object defines the authorization roles for the Fuse application.
 */
const authRoles = {
	/**
	 * The admin role grants access to users with the 'admin' role.
	 */
	superAdminOnly: ['SuperAdmin'],
	contentAdminOnly: ['ContentAdmin' , 'SuperAdmin'],
	contentAdmin: ['ContentAdmin', 'SuperAdmin'],
	memberAdminOnly: ['MemberAdmin' , 'SuperAdmin'],
	memberAdmin: ['MemberAdmin', 'SuperAdmin'],
	studioAdminOnly: ['StudioAdmin' , 'SuperAdmin'],
	studioAdmin: ['StudioAdmin', 'SuperAdmin'],
	Contact : ['Contact', 'SuperAdmin'],
	/**
	 * The staff role grants access to users with the 'admin' or 'staff' role.
	 */
	radioContentCreator: ['RadioContentCreator', 'ContentAdmin', 'SuperAdmin'],
	podcastContentCreator: ['PodcastContentCreator', 'ContentAdmin', 'SuperAdmin'],
	cultureContentCreator: ['CultureContentCreator', 'ContentAdmin', 'SuperAdmin'],
	LessonContentCreator: ['	LessonContentCreator', 'ContentAdmin', 'SuperAdmin'],
	studioStaff: ['StudioStaff', 'StudioAdmin', 'SuperAdmin'],
	/**
	 * The user role grants access to users with the 'admin', 'staff', or 'user' role.
	 */
	member: [
		'SuperAdmin',
		'ContentAdmin',
		'MemberAdmin',
		'StudioAdmin',
		'StudioStaff',
		'RadioContentCreator',
		'PoadcastContentCreator',
		'CultureContentCreator',
		'LessonContentCreator',
		'Member',
		'Contact',
		'application'
		],

	/**
	 * The onlyGuest role grants access to unauthenticated users.
	 */
	onlyGuest: []
};

export default authRoles;
