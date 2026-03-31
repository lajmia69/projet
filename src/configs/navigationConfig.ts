import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import fr from './navigation-i18n/fr';
import authRoles from '@auth/authRoles';

i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('fr', 'navigation', fr);
i18n.addResourceBundle('ar', 'navigation', ar);

const navigationConfig: FuseNavItemType[] = [
	{
		id: 'platform',
		type: 'group',
		title: 'Platform',
		translate: 'PLATFORM',
		children: [
			{
				id: 'platform-home',
				title: 'Home',
				translate: 'HOME',
				auth: authRoles.member,
				type: 'item',
				icon: 'heroicons-outline:star',
				url: '/dashboard'
			},
			{
				id: 'platform-lesson',
				title: 'Lesson',
				translate: 'LESSON',
				auth: authRoles.member,
				type: 'item',
				icon: 'heroicons-outline:academic-cap',
				url: '/lessons'
			}
		]
	},
	{
		id: 'culture',
		type: 'group',
		title: 'Culture',
		translate: 'CULTURE',
		children: [
			{
				id: 'culture-courses',
				title: 'Courses',
				type: 'item',
				icon: 'heroicons-outline:book-open',
				url: '/culture/courses'
			}
		]
	},
	{
		id: 'administration',
		type: 'group',
		title: 'Administration',
		translate: 'ADMINISTRATION',
		children: [
			{
				id: 'administration-dashboard',
				title: 'Dashboard',
				translate: 'DASHBOARD',
				auth: authRoles.superAdminOnly,
				type: 'item',
				icon: 'heroicons-outline:star',
				url: '/administration/dashboard'
			},
			{
				id: 'administration-accounts',
				title: 'Account',
				type: 'collapse',
				icon: 'heroicons-outline:user-group',
				translate: 'ACCOUNTS',
				children: [
					{ id: 'accounts-list',          title: 'Accounts',      auth: authRoles.memberAdmin, type: 'item', url: '/administration/accounts' },
					{ id: 'accounts-roles',         title: 'Roles',         auth: authRoles.memberAdmin, type: 'item', url: '/administration/roles' },
					{ id: 'accounts-permissions',   title: 'Permissions',   auth: authRoles.memberAdmin, type: 'item', url: '/administration/permissions' },
					{ id: 'accounts-subscriptions', title: 'Subscriptions', auth: authRoles.memberAdmin, type: 'item', url: '/administration/subscriptions' }
				]
			},
			{
				id: 'administration-audio',
				title: 'Audio',
				type: 'collapse',
				icon: 'heroicons-outline:microphone',
				translate: 'AUDIO',
				children: [
					{ id: 'audio-list',    title: 'Audios',  type: 'item', url: '/administration/audios' },
					{ id: 'audio-formats', title: 'Formats', type: 'item', url: '/administration/formats' }
				]
			},
			{
				id: 'administration-radio',
				title: 'Radio',
				type: 'collapse',
				icon: 'heroicons-outline:radio',
				translate: 'RADIO',
				children: [
					{ id: 'radio-emissions',     title: 'Emissions',      type: 'item', url: '/administration/radio/emissions' },
					{ id: 'radio-emissiontypes', title: 'Emission Types',  type: 'item', url: '/administration/radio/emission-types' },
					{ id: 'radio-episodes',      title: 'Episodes',        type: 'item', url: '/administration/radio/episodes' },
					{ id: 'radio-episodeguests', title: 'Episode Guests',  type: 'item', url: '/administration/radio/episode-guests' },
					{ id: 'radio-guesttypes',    title: 'Guest Types',     type: 'item', url: '/administration/radio/guest-types' },
					{ id: 'radio-seasons',       title: 'Seasons',         type: 'item', url: '/administration/radio/seasons' },
					{ id: 'radio-reportage',     title: 'Reportage',       type: 'item', url: '/administration/radio/reportages' },
					{ id: 'radio-reportagetype', title: 'Reportage Types', type: 'item', url: '/administration/radio/reportage-types' }
				]
			}
		]
	},
	{
		id: 'studio',
		type: 'group',
		title: 'Studio',
		translate: 'STUDIO',
		children: [
			{
				id: 'studio-example',
				title: 'Example',
				translate: 'EXAMPLE',
				auth: authRoles.studioStaff,
				type: 'item',
				icon: 'heroicons-outline:star',
				url: '/studio/example'
			}
		]
	},
	{
		id: 'content',
		type: 'group',
		title: 'Content',
		children: [
			{
				id: 'content-lessons',
				title: 'Lessons',
				type: 'collapse',
				icon: 'heroicons-outline:academic-cap',
				auth: authRoles.contentAdmin,
				children: [
					{ id: 'lessons-list', title: 'All Lessons', auth: authRoles.contentAdmin, type: 'item', url: '/content/lessons' }
				]
			},
			{
				id: 'content-podcast',
				title: 'Podcast',
				type: 'collapse',
				icon: 'heroicons-outline:microphone',
				auth: authRoles.contentAdmin,
				children: [
					{ id: 'podcast-courses', title: 'Episodes', auth: authRoles.contentAdmin, type: 'item', url: '/content/podcast/courses' }
				]
			},
			{
				id: 'content-radio',
				title: 'Radio',
				type: 'collapse',
				icon: 'heroicons-outline:radio',
				auth: authRoles.contentAdmin,
				children: [
					{
						id: 'radio-content-emissions',
						title: 'Emissions',
						auth: authRoles.contentAdmin,
						type: 'item',
						url: '/content/radio/emissions'
					},
					{
						id: 'radio-content-episodes',
						title: 'Episodes',
						auth: authRoles.contentAdmin,
						type: 'item',
						url: '/content/radio/episodes'
					},
					{
						id: 'radio-content-reportage',
						title: 'Reportage',
						auth: authRoles.contentAdmin,
						type: 'item',
						url: '/content/radio/reportage'
					}
				]
			}
		]
	},
	{
		id: 'member',
		type: 'group',
		title: 'Member',
		translate: 'MEMBER',
		children: [
			{
				id: 'member-example',
				title: 'Example',
				translate: 'EXAMPLE',
				auth: authRoles.memberAdmin,
				type: 'item',
				icon: 'heroicons-outline:star',
				url: '/member/example'
			}
		]
	}
];

export default navigationConfig;