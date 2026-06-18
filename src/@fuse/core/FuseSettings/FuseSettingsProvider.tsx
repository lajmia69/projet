import { useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { defaultSettings, getParsedQuerySettings } from '@fuse/default-settings';
import settingsConfig from '@/configs/settingsConfig';
import themeLayoutConfigs from '@/components/theme-layouts/themeLayoutConfigs';
import { FuseSettingsConfigType, FuseThemesType } from '@fuse/core/FuseSettings/FuseSettings';
import useUser from '@auth/useUser';
import { PartialDeep } from 'type-fest';
import FuseSettingsContext from './FuseSettingsContext';

const THEME_STORAGE_KEY = 'fuseThemeSettings';

const getStoredThemeSettings = (): Partial<FuseSettingsConfigType> => {
	try {
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch {
		return {};
	}
};

const saveThemeSettings = (settings: Partial<FuseSettingsConfigType>) => {
	try {
		// Only persist the theme slice to avoid stale layout/other settings
		window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ theme: settings.theme }));
	} catch {
		// ignore
	}
};

// Get initial settings
const getInitialSettings = (): FuseSettingsConfigType => {
	const defaultLayoutStyle = settingsConfig.layout?.style || 'layout1';
	const layout = {
		style: defaultLayoutStyle,
		config: themeLayoutConfigs[defaultLayoutStyle]?.defaults
	};
	return _.merge({}, defaultSettings, { layout }, settingsConfig, getParsedQuerySettings());
};

const initialSettings = getInitialSettings();

const generateSettings = (
	_defaultSettings: FuseSettingsConfigType,
	_newSettings: PartialDeep<FuseSettingsConfigType>
) => {
	return _.merge(
		{},
		_defaultSettings,
		{ layout: { config: themeLayoutConfigs[_newSettings?.layout?.style]?.defaults } },
		_newSettings
	);
};

// FuseSettingsProvider component
export function FuseSettingsProvider({ children }: { children: ReactNode }) {
	const { data: user, isGuest } = useUser();

	const userSettings = useMemo(() => user?.settings || {}, [user]);

	const calculateSettings = useCallback(() => {
		const baseSettings = _.merge({}, initialSettings);
		// Always apply localStorage theme on top so user choices survive navigation
		const storedTheme = getStoredThemeSettings();
		return isGuest
			? _.merge({}, baseSettings, storedTheme)
			: _.merge({}, baseSettings, userSettings, storedTheme);
	}, [isGuest, userSettings]);

	const [data, setData] = useState<FuseSettingsConfigType>(calculateSettings());

	// Sync data with userSettings when isGuest or userSettings change
	useEffect(() => {
		const newSettings = calculateSettings();

		// Only update if settings are different
		if (!_.isEqual(data, newSettings)) {
			setData(newSettings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [calculateSettings]);

	const setSettings = useCallback(
		(newSettings: Partial<FuseSettingsConfigType>) => {
			const _settings = generateSettings(data, newSettings);

			if (!_.isEqual(_settings, data)) {
				setData(_.merge({}, _settings));
				saveThemeSettings(_settings);
			}

			return _settings;
		},
		[data]
	);

	const changeTheme = useCallback(
		(newTheme: FuseThemesType) => {
			const { navbar, footer, toolbar, main } = newTheme;

			const newSettings: FuseSettingsConfigType = {
				...data,
				theme: {
					main,
					navbar,
					toolbar,
					footer
				}
			};

			setSettings(newSettings);
		},
		[data, setSettings]
	);

	return (
		<FuseSettingsContext
			value={useMemo(
				() => ({
					data,
					setSettings,
					changeTheme
				}),
				[data, setSettings, changeTheme]
			)}
		>
			{children}
		</FuseSettingsContext>
	);
}

export default FuseSettingsProvider;