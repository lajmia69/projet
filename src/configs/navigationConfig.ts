import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import authRoles from '@auth/authRoles';

const navigationConfig: FuseNavItemType[] = [
	// ── Platform ─────────────────────────────────────────────────────────────
	{
		id: 'platform',
		type: 'group',
		title: 'Platform',
		auth: authRoles.member,
		translate: 'PLATFORM',
		disabled: true,
		children: [
			{
				id: 'platform-home',
				title: 'Home',
				translate: 'HOME',
				auth: authRoles.member,
				type: 'item',
				icon: 'heroicons-outline:star',
				url: '/platform/dashboard/welcome'
			},
			{
				id: 'platform-lesson',
				title: 'Lesson',
				translate: 'LESSON',
				auth: authRoles.member,
				type: 'item',
				icon: 'heroicons-outline:academic-cap',
				url: '/content/lessons'
			},
			{
				id: 'platform-radio',
				title: 'Radio',
				translate: 'RADIO',
				type: 'collapse',
				icon: 'heroicons-outline:radio',
				auth: authRoles.member,
				children: [
					{ id: 'platform-radio-emissions', title: 'Emissions', translate: 'EMISSIONS', auth: authRoles.member, type: 'item', url: '/content/radio/emissions' },
					{ id: 'platform-radio-episodes',  title: 'Episodes',  translate: 'EPISODES',  auth: authRoles.member, type: 'item', url: '/content/radio/episodes' },
					{ id: 'platform-radio-reportage', title: 'Reportage', translate: 'REPORTAGE', auth: authRoles.member, type: 'item', url: '/content/radio/reportages' }
				]
			},
						{
				id: 'platform-culture',
				title: 'Culture',
				translate: 'CULTURE',
				type: 'collapse',
				icon: 'heroicons-outline:folder-open',
				auth: authRoles.member,
				children: [
					{ id: 'platform-culture-activities', title: 'Cultural Activities', translate: 'CULTURAL_ACTIVITIES', auth: authRoles.member, type: 'item', url: '/culture/activities' },
					{ id: 'platform-culture-projects',  title: 'Cultural Projects',  translate: 'CULTURAL_PROJECTS',  auth: authRoles.member, type: 'item', url: '/culture/projects' },
				]
			},
			
		{
			id: 'platform-podcast',
			title: 'Podcast',
			translate: 'PODCAST',
			type: 'item',
			icon: 'heroicons-outline:microphone',
			auth: authRoles.member,
			url : '/content/podcast/courses'
		},

	]
},

	// ── Culture ──────────────────────────────────────────────────────────────
//	{
//		id: 'culture',
//		type: 'group',
//		auth: authRoles.cultureContentCreator,
	//	title: 'Culture',
		//children: [
		//	{
		//		id: 'culture-projects',
		//		title: 'Cultural Projects',
		//		type: 'collapse',
		//		auth: authRoles.cultureContentCreator,
		//		icon: 'heroicons-outline:folder-open',
		//		children: [
		//			{
		//				id: 'culture-projects-list',
		//				title: 'All Projects',
		//				type: 'item',
		//				auth: authRoles.cultureContentCreator,
		//				icon: 'heroicons-outline:view-grid',
		//				url: '/culture/projects'
		//			},
		//			{
		//				id: 'culture-project-types',
		//				title: 'Project Types',
		//				type: 'item',
		//				auth: authRoles.cultureContentCreator,
		//				icon: 'heroicons-outline:tag',
		//				url: '/culture/project-types'
		//			}
		//		]
		//	},
		//	{
			//	id: 'culture-activities',
		////		title: 'Cultural Activities',
		//		type: 'collapse',
		//		auth: authRoles.cultureContentCreator,
		//		icon: 'heroicons-outline:sparkles',
		//		children: [
		//			{
		//				id: 'culture-activities-list',
		//				title: 'All Activities',
		//				type: 'item',
		//				auth: authRoles.cultureContentCreator,
		//				icon: 'heroicons-outline:view-grid',
		//				url: '/culture/activities'
		//			},
		//			{
		//				id: 'culture-activity-types',
		//				title: 'Activity Types',
		//				type: 'item',
		//				auth: authRoles.cultureContentCreator,
		//				icon: 'heroicons-outline:tag',
		//				url: '/culture/activity-types'
		//			}  
		//		]
	//		}
	//	]
	
	//},
	

	// ── Administration ───────────────────────────────────────────────────────
	{
		id: 'administration',
		type: 'group',
        // color removed to comply with FuseNavItemType definitions
		title: 'Administration',
		translate: 'ADMINISTRATION',
		disabled: true,
		auth: [
			'Super Admin', 'SuperAdmin',
			'Content Admin', 'ContentAdmin',
			'Member Admin', 'MemberAdmin',
			'Radio Content Creator', 'RadioContentCreator',
			'Podcast Content Creator', 'PodcastContentCreator',
			'Culture Content Creator', 'CultureContentCreator',
			'Lesson Content Creator', 'LessonContentCreator'
		],
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
					{ id: 'accounts-list',          title: 'Accounts',      translate: 'ACCOUNTS',  auth: authRoles.memberAdmin, type: 'item', url: '/administration/accounts' },
					{ id: 'accounts-roles',         title: 'Roles',         translate: 'ROLES',         auth: authRoles.memberAdmin, type: 'item', url: '/administration/roles' },
					{ id: 'accounts-subscriptions', title: 'Subscriptions', translate: 'SUBSCRIPTIONS', auth: authRoles.memberAdmin, type: 'item', url: '/administration/subscriptions' }
				]
			},
			{
				id: 'administration-radio',
				title: 'Radio',
				auth: authRoles.radioContentCreator,
				type: 'collapse',
				icon: 'heroicons-outline:radio',
        // color removed to comply with FuseNavItemType definitions
				translate: 'RADIO',
				children: [
					{ id: 'radio-emissions',     title: 'Emissions',       translate: 'EMISSIONS',       auth: authRoles.radioContentCreator, type: 'item', url: '/administration/radio/emissions' },
					{ id: 'radio-emissiontypes', title: 'Emission Types',  translate: 'EMISSION_TYPES',  auth: authRoles.radioContentCreator, type: 'item', url: '/administration/radio/emission-types' },
					{ id: 'radio-episodes',      title: 'Episodes',        translate: 'EPISODES',        auth: authRoles.radioContentCreator, type: 'item', url: '/administration/radio/episodes' },
					{ id: 'radio-episodeguests', title: 'Episode Guests',  translate: 'EPISODE_GUESTS',  auth: authRoles.radioContentCreator, type: 'item', url: '/administration/radio/episode-guests' },
					{ id: 'radio-guesttypes',    title: 'Guest Types',     translate: 'GUEST_TYPES',     auth: authRoles.radioContentCreator, type: 'item', url: '/administration/radio/guest-types' },
					{ id: 'radio-seasons',       title: 'Seasons',         translate: 'SEASONS',         auth: authRoles.radioContentCreator, type: 'item', url: '/administration/radio/seasons' },
					{ id: 'radio-reportage',     title: 'Reportage',       translate: 'REPORTAGE',       auth: authRoles.radioContentCreator, type: 'item', url: '/administration/radio/reportages' },
					{ id: 'radio-reportagetype', title: 'Reportage Types', translate: 'REPORTAGE_TYPES', auth: authRoles.radioContentCreator, type: 'item', url: '/administration/radio/reportage-types' }
				]
			},
				{
					id: 'administration-podcast',
					title: 'Podcast',
					translate: 'PODCAST',
					type: 'collapse',
					icon: 'heroicons-outline:microphone',
					auth: authRoles.podcastContentCreator,
					children: [
					{ id: 'administration-podcast-courses',    title: 'Episodes',   translate: 'EPISODES',   auth: authRoles.podcastContentCreator, type: 'item', url: '/administration/podcasts' },
					{ id: 'administration-podcast-categories', title: 'Categories', translate: 'CATEGORIES', auth: authRoles.podcastContentCreator, type: 'item', url: '/administration/podcasts/categories' }
				]
			},
				{
					id: 'administration-lessons',
					title: 'Lessons',
					translate: 'LESSONS',
					type: 'collapse',
					icon: 'heroicons-outline:academic-cap',
					auth: authRoles.lessonContentCreator,
					children: [
					{ id: 'administration-lessons-list', title: 'All Lessons', translate: 'ALL_LESSONS', auth: authRoles.contentAdmin, type: 'item', url: '/administration/lessons' }
				]
			},
			{
				id: 'administration-culture',
				title: 'Culture',
				type: 'collapse',
				auth: authRoles.cultureContentCreator,
				icon: 'heroicons-outline:folder-open',
				translate: 'CULTURE',
				children: [
					{ id: 'cultural-activities',          title: 'Cultural Activities',        translate: 'CULTURAL_ACTIVITIES',      auth: authRoles.cultureContentCreator, type: 'item', url: '/administration/culture/activities' },
					{ id: 'cultural-activities-types',    title: 'Cultural Activity Types',    translate: 'CULTURAL_ACTIVITY_TYPES',  auth: authRoles.cultureContentCreator, type: 'item', url: '/administration/culture/activities/types' },
					{ id: 'cultural-projects',            title: 'Cultural Projects',          translate: 'CULTURAL_PROJECTS',        auth: authRoles.cultureContentCreator, type: 'item', url: '/administration/culture/projects' },
					{ id: 'cultural-projects-types',      title: 'Cultural Project Types',     translate: 'CULTURAL_PROJECT_TYPES',   auth: authRoles.cultureContentCreator, type: 'item', url: '/administration/culture/projects/types' }
				]
			}
		]
	},

	// ── Content ──────────────────────────────────────────────────────────────
//	{
//		id: 'content',
//		type: 'group',
//		auth: authRoles.contentAdmin,
  //      // color removed to comply with FuseNavItemType definitions
	//	title: 'Content',
//		children: [
//			{
//				id: 'content-lessons',
//				title: 'Lessons',
//				type: 'collapse',
//				icon: 'heroicons-outline:academic-cap',
//				auth: authRoles.lessonContentCreator,
//				children: [
//					{ id: 'lessons-list', title: 'All Lessons', auth: authRoles.contentAdmin, type: 'item', url: '/content/lessons' }
//				]
//			},
//			{
//				id: 'content-podcast',
//				title: 'Podcast',
//				type: 'collapse',
//				icon: 'heroicons-outline:microphone',
//				auth: authRoles.podcastContentCreator,
//				children: [
//					{ id: 'podcast-courses', title: 'Episodes', auth: authRoles.podcastContentCreator, type: 'item', url: '/content/podcast/courses' }
//				]
//			},
//			{
//				id: 'content-radio',
//				title: 'Radio',
//				type: 'collapse',
//				icon: 'heroicons-outline:radio',
//				auth: authRoles.radioContentCreator,
//				children: [
//					{ id: 'radio-content-emissions', title: 'Emissions', auth: authRoles.radioContentCreator, type: 'item', url: '/content/radio/emissions' },
//					{ id: 'radio-content-episodes',  title: 'Episodes',  auth: authRoles.radioContentCreator, type: 'item', url: '/content/radio/episodes' },
//					{ id: 'radio-content-reportage', title: 'Reportage', auth: authRoles.radioContentCreator, type: 'item', url: '/content/radio/reportages' }
//				]
//			}
//		]
//	},

	// ── Studio ───────────────────────────────────────────────────────────────
	{
		id: 'studio',
		type: 'group',
		title: 'Studio',
        // color removed to comply with FuseNavItemType definitions
		translate: 'STUDIO',
		auth: authRoles.studioAdmin,
		icon: 'heroicons-outline:color-swatch',
		disabled: true,
		children: [
			// ✅ ADDED: Boards entry — was completely missing, causing /studio/boards to be unreachable from the nav
			{
				id: 'studio-boards',
				title: 'Boards',
				translate: 'BOARDS',
				type: 'item',
				auth: authRoles.studioStaff,
				icon: 'lucide:layout-grid',
				url: '/studio/boards'
			},
			{
				// ✅ FIXED: was 'administration-audio' — wrong prefix, breaks active-link highlighting
				id: 'studio-audio',
				title: 'Audio',
				type: 'collapse',
				auth: authRoles.studioStaff,
				icon: 'heroicons-outline:microphone',
				translate: 'AUDIO',
				children: [
					// ✅ FIXED: missing auth on both children
					{ id: 'studio-audio-list',    title: 'Audios',  translate: 'AUDIOS',  auth: authRoles.studioStaff, type: 'item', url: '/studio/audio' },
					{ id: 'studio-audio-formats', title: 'Formats', translate: 'FORMATS', auth: authRoles.studioStaff, type: 'item', url: '/studio/formats' }
				]
			}
		]
	}
];

export default navigationConfig;
