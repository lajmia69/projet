/**
 * The authRoles object defines the authorization roles for the Fuse application.
 */
const authRoles = {
	/**
	 * The admin role grants access to users with the 'admin' role.
	 */
	superAdminOnly: ['SuperAdmin'],
	contentAdminOnly: ['ContentAdmin'],
	contentAdmin: ['ContentAdmin', 'SuperAdmin'],
	memberAdminOnly: ['MemberAdmin'],
	memberAdmin: ['MemberAdmin', 'SuperAdmin'],
	studioAdminOnly: ['StudioAdmin'],
	studioAdmin: ['StudioAdmin', 'SuperAdmin'],
	/**
	 * The staff role grants access to users with the 'admin' or 'staff' role.
	 */
	radioContentCreator: ['RadioContentCreator', 'ContentAdmin', 'SuperAdmin'],
	broadcastContentCreator: ['BroadcastContentCreator', 'ContentAdmin', 'SuperAdmin'],
	cultureContentCreator: ['CultureContentCreator', 'ContentAdmin', 'SuperAdmin'],
	teacher: ['Teacher', 'ContentAdmin', 'SuperAdmin'],
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
		'BroadcastContentCreator',
		'CultureContentCreator',
		'Teacher',
		'Member'
	],

	/**
	 * The onlyGuest role grants access to unauthenticated users.
	 */
	onlyGuest: []
};

export default authRoles;
