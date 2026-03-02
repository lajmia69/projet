import { useSubscriptionsAppContext } from '../contexts/SubscriptionsAppContext/useSubscriptionsAppContext';

export function useSearch() {
	const { searchText, setSearchText, resetSearchText } = useSubscriptionsAppContext();

	return {
		searchText,
		setSearchText,
		resetSearchText
	};
}