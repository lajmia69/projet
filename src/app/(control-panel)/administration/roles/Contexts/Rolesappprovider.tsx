import { useState, ReactNode } from 'react';
import { RolesAppContext } from './RolesAppContext';

export function RolesAppProvider({ children }: { children: ReactNode }) {
	const [searchText, setSearchText] = useState('');

	const resetSearchText = () => setSearchText('');

	const value = { searchText, setSearchText, resetSearchText };

	return <RolesAppContext.Provider value={value}>{children}</RolesAppContext.Provider>;
}