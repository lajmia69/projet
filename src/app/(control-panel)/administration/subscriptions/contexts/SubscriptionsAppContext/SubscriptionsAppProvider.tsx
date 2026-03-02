import { useState, ReactNode } from 'react';
import { SubscriptionsAppContext } from './SubscriptionsAppContext';

export function SubscriptionsAppProvider({ children }: { children: ReactNode }) {
	const [searchText, setSearchText] = useState('');

	const resetSearchText = () => {
		setSearchText('');
	};

	const value = {
		searchText,
		setSearchText,
		resetSearchText
	};

	return <SubscriptionsAppContext.Provider value={value}>{children}</SubscriptionsAppContext.Provider>;
}