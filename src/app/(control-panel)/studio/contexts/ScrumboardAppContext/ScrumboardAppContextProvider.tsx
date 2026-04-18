'use client';

import { createContext, useState, ReactNode } from 'react';
import { ScrumboardCard } from '../../api/types';

export type ScrumboardAppContextType = {
	openCard: ScrumboardCard | null;
	openCardDialog: (card: ScrumboardCard) => void;
	closeCardDialog: () => void;
};

export const ScrumboardAppContext = createContext<ScrumboardAppContextType>({
	openCard: null,
	openCardDialog: () => {},
	closeCardDialog: () => {}
});

type Props = { children: ReactNode };

export function ScrumboardAppContextProvider({ children }: Props) {
	const [openCard, setOpenCard] = useState<ScrumboardCard | null>(null);

	function openCardDialog(card: ScrumboardCard) {
		setOpenCard(card);
	}

	function closeCardDialog() {
		setOpenCard(null);
	}

	return (
		<ScrumboardAppContext.Provider value={{ openCard, openCardDialog, closeCardDialog }}>
			{children}
		</ScrumboardAppContext.Provider>
	);
}
