import { createContext } from 'react';

export type SubscriptionsAppState = {
	searchText: string;
	setSearchText: (text: string) => void;
	resetSearchText: () => void;
};

export const SubscriptionsAppContext = createContext<SubscriptionsAppState | null>(null);