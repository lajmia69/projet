import { useContext } from 'react';
import { ScrumboardAppContext } from './ScrumboardAppContextProvider';

export function useScrumboardAppContext() {
	return useContext(ScrumboardAppContext);
}
