import { useState, ReactNode } from 'react';
import { AccountsAppContext } from './AccountsAppContext';

export function AccountsAppProvider({ children }: { children: ReactNode }) {
	const [searchText, setSearchText] = useState('');

	const resetSearchText = () => {
		setSearchText('');
	};

	const value = {
		searchText,
		setSearchText,
		resetSearchText
	};

	return <AccountsAppContext.Provider value={value}>{children}</AccountsAppContext.Provider>;
}
