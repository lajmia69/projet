import { useContext } from 'react';
import { RolesAppContext } from './RolesAppContext';

export function useRolesAppContext() {
	const context = useContext(RolesAppContext);
	if (!context) throw new Error('useRolesAppContext must be used within RolesAppProvider');
	return context;
}