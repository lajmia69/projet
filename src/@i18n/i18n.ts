import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enNav from '@/configs/navigation-i18n/en';
import frNav from '@/configs/navigation-i18n/fr';
import arNav from '@/configs/navigation-i18n/ar';
import enDash from '@/app/(control-panel)/platform/dashboard/i18n/en';
import frDash from '@/app/(control-panel)/platform/dashboard/i18n/fr';
import arDash from '@/app/(control-panel)/platform/dashboard/i18n/ar';
import enHeroes from '@/app/(control-panel)/heroes-i18n/en';
import frHeroes from '@/app/(control-panel)/heroes-i18n/fr';
import arHeroes from '@/app/(control-panel)/heroes-i18n/ar';
import enMailbox from '@/app/(control-panel)/apps/mailbox/i18n/en';
import frMailbox from '@/app/(control-panel)/apps/mailbox/i18n/fr';
import arMailbox from '@/app/(control-panel)/apps/mailbox/i18n/ar';

/**
 * resources is an object that contains all the translations for the different languages.
 */
const resources = {
	en: {
		translation: {
			'Welcome to React': 'Welcome to React and react-i18next'
		},
		navigation: enNav,
		dashboard: enDash,
		heroes: enHeroes,
		mailbox: enMailbox
	},
	fr: {
		navigation: frNav,
		dashboard: frDash,
		heroes: frHeroes,
		mailbox: frMailbox
	},
	ar: {
		navigation: arNav,
		dashboard: arDash,
		heroes: arHeroes,
		mailbox: arMailbox
	}
};

/**
 * i18n is initialized with the resources object and the language to use.
 * The keySeparator option is set to false because we do not use keys in form messages.welcome.
 * The interpolation option is set to false because we do not use interpolation in form messages.welcome.
 */
i18n.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		lng: 'en',

		keySeparator: false, // we do not use keys in form messages.welcome

		interpolation: {
			escapeValue: false // react already safes from xss
		}
	});

export default i18n;
