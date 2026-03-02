import { createContext } from 'react';

export type AccountsAppState = {
	searchText: string;
	setSearchText: (text: string) => void;
	resetSearchText: () => void;
};

export const AccountsAppContext = createContext<AccountsAppState | null>(null);
