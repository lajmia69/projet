import { createContext } from 'react';

export type RolesAppState = {
	searchText: string;
	setSearchText: (text: string) => void;
	resetSearchText: () => void;
};

export const RolesAppContext = createContext<RolesAppState | null>(null);