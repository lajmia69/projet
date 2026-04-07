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
    children: [
        {
            id: 'culture-projects',
            title: 'Cultural Projects',
            type: 'collapse',
            icon: 'heroicons-outline:folder-open',
            children: [
                { id: 'culture-projects-list',        title: 'All Projects', type: 'item', icon: 'heroicons-outline:view-grid',    url: '/culture/projects' },
                { id: 'culture-projects-in-progress', title: 'In Progress',  type: 'item', icon: 'heroicons-outline:play',         url: '/culture/projects?status=in_progress' },
                { id: 'culture-projects-planning',    title: 'Planning',     type: 'item', icon: 'heroicons-outline:calendar',     url: '/culture/projects?status=planning' },
                { id: 'culture-projects-completed',   title: 'Completed',   type: 'item', icon: 'heroicons-outline:check-circle', url: '/culture/projects?status=completed' }
            ]
        },
        {
            id: 'culture-activities',
            title: 'Cultural Activities',
            type: 'collapse',
            icon: 'heroicons-outline:sparkles',
            children: [
                { id: 'culture-activities-list',        title: 'All Activities', type: 'item', icon: 'heroicons-outline:view-grid',               url: '/culture/activities' },
                { id: 'culture-activities-workshops',   title: 'Workshops',      type: 'item', icon: 'heroicons-outline:pencil',                   url: '/culture/activities?type=workshop' },
                { id: 'culture-activities-exhibitions', title: 'Exhibitions',    type: 'item', icon: 'heroicons-outline:photograph',               url: '/culture/activities?type=exhibition' },
                { id: 'culture-activities-concerts',    title: 'Concerts',       type: 'item', icon: 'heroicons-outline:music-note',               url: '/culture/activities?type=concert' },
                { id: 'culture-activities-conferences', title: 'Conferences',    type: 'item', icon: 'heroicons-outline:presentation-chart-bar',   url: '/culture/activities?type=conference' },
                { id: 'culture-activities-festivals',   title: 'Festivals',      type: 'item', icon: 'heroicons-outline:star',                     url: '/culture/activities?type=festival' }
            ]
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
					{ id: 'radio-content-emissions', title: 'Emissions',  auth: authRoles.contentAdmin, type: 'item', url: '/content/radio/emissions' },
					{ id: 'radio-content-episodes',  title: 'Episodes',   auth: authRoles.contentAdmin, type: 'item', url: '/content/radio/episodes' },
					{ id: 'radio-content-reportage', title: 'Reportage',  auth: authRoles.contentAdmin, type: 'item', url: '/content/radio/reportage' }
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