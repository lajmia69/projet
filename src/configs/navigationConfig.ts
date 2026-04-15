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
				url: '/dashboard/welcome'
			},
			{
				id: 'platform-lesson',
				title: 'Lesson',
				translate: 'LESSON',
				auth: authRoles.member,
				type: 'item',
				icon: 'heroicons-outline:academic-cap',
				url: '/content/lessons'
			}
				,{
				id: 'platform-radio',
				title: 'Radio',
				type: 'collapse',
				icon: 'heroicons-outline:radio',
				auth: authRoles.member,
				children: [
					// Add 'platform-' prefix to make IDs unique
					{ id: 'platform-radio-emissions', title: 'Emissions',  auth: authRoles.member, type: 'item', url: '/content/radio/emissions' },
					{ id: 'platform-radio-episodes',  title: 'Episodes',   auth: authRoles.member, type: 'item', url: '/content/radio/episodes' },
					{ id: 'platform-radio-reportage', title: 'Reportage',  auth: authRoles.member, type: 'item', url: '/content/radio/reportage' }
				]
			}
			,{
				id: 'platform-podcast',
				title: 'Podcast',
				type: 'collapse',
				icon: 'heroicons-outline:microphone',
				auth: authRoles.member,
				children: [
					// Add 'platform-' prefix to make ID unique
					{ id: 'platform-podcast-courses', title: 'Episodes', auth: authRoles.member, type: 'item', url: '/content/podcast/courses' }
				]
			}
		
		]
	},

	// ── Culture ──────────────────────────────────────────────────────────────
	{
		id: 'culture',
		type: 'group',
		auth : authRoles.cultureContentCreator,

		title: 'Culture',
		children: [
			// ── Projects ─────────────────────────────────────────────────────
			{
				id: 'culture-projects',
				title: 'Cultural Projects',
				type: 'collapse',
				auth : authRoles.cultureContentCreator,
				icon: 'heroicons-outline:folder-open',
				children: [
					{
						id: 'culture-projects-list',
						title: 'All Projects',
						type: 'item',
						auth : authRoles.cultureContentCreator,
						icon: 'heroicons-outline:view-grid',
						url: '/culture/projects'
					},
					{
						id: 'culture-project-types',
						title: 'Project Types',
						type: 'item',						
						auth : authRoles.cultureContentCreator,

						icon: 'heroicons-outline:tag',
						url: '/culture/project-types'
					}
				]
			},

			// ── Activities ───────────────────────────────────────────────────
			{
				id: 'culture-activities',
				title: 'Cultural Activities',
				type: 'collapse',
				auth : authRoles.cultureContentCreator,
				icon: 'heroicons-outline:sparkles',
				children: [
					{
						id: 'culture-activities-list',
						title: 'All Activities',
						type: 'item',
						auth : authRoles.cultureContentCreator,
						icon: 'heroicons-outline:view-grid',
						url: '/culture/activities'
					},
					{
						id: 'culture-activity-types',
						title: 'Activity Types',
						type: 'item',
						auth : authRoles.cultureContentCreator,
						icon: 'heroicons-outline:tag',
						url: '/culture/activity-types'
					}
				]
			}
		]
	},

	// ── Administration ───────────────────────────────────────────────────────
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
				auth: authRoles.memberAdmin,
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
				id: 'administration-radio',
				title: 'Radio',
				type: 'collapse',
				icon: 'heroicons-outline:radio',
				auth : authRoles.radioContentCreator,
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

	// ── Studio ───────────────────────────────────────────────────────────────
	{
		id: 'studio',
		type: 'group',
		title: 'Studio',
		translate: 'STUDIO',
		children: [
			{
				id: 'administration-audio',
				title: 'Audio',
				type: 'collapse',
				auth : authRoles.studioStaff,
				icon: 'heroicons-outline:microphone',
				translate: 'AUDIO',
				children: [
					{ id: 'audio-list',    title: 'Audios',  type: 'item', url: '/administration/audios' },
					{ id: 'audio-formats', title: 'Formats', type: 'item', url: '/administration/formats' }
				]
			}
		]
	},

	// ── Content ──────────────────────────────────────────────────────────────
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
				auth: authRoles.lessonContentCreator,
				children: [
					{ id: 'lessons-list', title: 'All Lessons', auth: authRoles.contentAdmin, type: 'item', url: '/content/lessons' }
				]
			},
			{
				id: 'content-podcast',
				title: 'Podcast',
				type: 'collapse',
				icon: 'heroicons-outline:microphone',
				auth: authRoles.podcastContentCreator,
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

];

export default navigationConfig;