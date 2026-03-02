import { useSubscriptionsAppContext } from '../contexts/SubscriptionsAppContext/useSubscriptionsAppContext';

export function useSearch() {
	return useSubscriptionsAppContext();
}