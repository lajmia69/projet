import { redirect } from 'next/navigation';

function SettingsApp() {
	redirect(`/settings/account`);
	return null;
}

export default SettingsApp;
