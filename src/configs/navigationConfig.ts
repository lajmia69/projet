import i18n from '@i18n';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import fr from './navigation-i18n/fr';
import authRoles from '@auth/authRoles';

i18n.addResourceBundle('en', 'navigation', en);
i18n.addResourceBundle('fr', 'navigation', fr);
i18n.addResourceBundle('ar', 'navigation', ar);

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
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
				id: 'administration.accounts',
				title: 'Account',
				type: 'collapse',
				icon: 'heroicons-outline:user-group',
				translate: 'ACCOUNTS',
				children: [
		
					{
						id: 'account-accounts',
						title: 'Accounts',
						auth: authRoles.memberAdmin,
						type: 'item',
						url: '/administration/accounts'
					},
					{
						id: 'account-roles',
						title: 'Roles',
						auth: authRoles.memberAdmin,
						type: 'item',
						url: '/administration/roles'
					},
					{
						id: 'account-permissions',
						title: 'Permissions',
						auth: authRoles.memberAdmin,
						type: 'item',
						url: '/administration/permissions'
					},
					{
						id: 'account-subscriptions',
						title: 'Subscriptions',
						auth: authRoles.memberAdmin,
						type: 'item',
						url: '/administration/subscriptions'
					}
				]
			},
			{
				id: 'apps.audio',
				title: 'Audio',
				type: 'collapse',
				icon: 'heroicons-outline:microphone',
				translate: 'AUDIO',
				children: [
					{
						id: 'audio-audios',
						title: 'Audios',
						type: 'item',
						url: '/administration/audios'
					},
					{
						id: 'audio-formats',
						title: 'Formats',
						type: 'item',
						url: '/administration/formats'
					}
				]
			},
			{
				id: 'apps.radio',
				title: 'Radio',
				type: 'collapse',
				icon: 'heroicons-outline:radio',
				translate: 'RADIO',
				children: [
					{
						id: 'radio-emissions',
						title: 'Emissions',
						type: 'item',
						url: '/administration/emissions'
					},
					{
						id: 'radio-emission-types',
						title: 'Type des emissions',
						type: 'item',
						url: '/administration/emission-types'
					},
					{
						id: 'radio-guests',
						title: 'Guests',
						type: 'item',
						url: '/administration/guests'
					},
					{
						id: 'radio-guest-types',
						title: 'Guests Types',
						type: 'item',
						url: '/administration/guest-types'
					},
					{
						id: 'radio-seasons',
						title: 'Season',
						type: 'item',
						url: '/administration/seasons'
					},
					{
						id: 'radio-reportage',
						title: 'Reportage',
						type: 'item',
						url: '/administration/reportage'
					},
					{
						id: 'radio-reportage-type',
						title: 'REPORTAGE-TYPE',
						type: 'item',
						url: '/administration/reportage-type'
					},
					{
						id: 'radio-episode-guests',
						title: 'EPISODE-GUEST',
						type: 'item',
						url: '/administration/episode-guests'
					},
					{
						id: 'radio-episodes',
						title: 'Episode',
						type: 'item',
						url: '/administration/episodes'
					}
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
		translate: 'CONTENT',
		children: [
			{
				id: 'content-example',
				title: 'Example',
				translate: 'EXAMPLE',
				auth: authRoles.contentAdmin,
				type: 'item',
				icon: 'heroicons-outline:star',
				url: '/content/example'
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
