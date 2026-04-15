import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

const SettingsAppNavigation: FuseNavItemType = {
	id: 'apps.settings',
	title: 'Settings',
	type: 'collapse',
	icon: 'lucide:settings',
	url: '/apps/settings',
	children: [
		{
			id: 'apps.settings.account',
			icon: 'lucide:circle-user',
			title: 'Account',
			type: 'item',
			url: '/settings/account',
			subtitle: 'Manage your public profile and private information'
		},
		{
			id: 'apps.settings.security',
			icon: 'lucide:lock',
			title: 'Security',
			type: 'item',
			url: '/settings/security',
			subtitle: 'Manage your password and 2-step verification preferences'
		},
	]
};

export default SettingsAppNavigation;
