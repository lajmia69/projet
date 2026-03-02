import { useContext } from 'react';
import { SubscriptionsAppContext } from './SubscriptionsAppContext';

export function useSubscriptionsAppContext() {
	const context = useContext(SubscriptionsAppContext);
	if (!context) throw new Error('useSubscriptionsApp must be used within a SubscriptionsAppProvider');
	return context;
}