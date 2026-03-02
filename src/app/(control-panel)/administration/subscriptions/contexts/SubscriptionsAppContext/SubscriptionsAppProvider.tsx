import { useState, ReactNode } from 'react';
import { SubscriptionsAppContext } from './SubscriptionsAppContext';

export function SubscriptionsAppProvider({ children }: { children: ReactNode }) {
	const [searchText, setSearchText] = useState('');
	const resetSearchText = () => setSearchText('');

	return (
		<SubscriptionsAppContext.Provider value={{ searchText, setSearchText, resetSearchText }}>
			{children}
		</SubscriptionsAppContext.Provider>
	);
}