// import { useContactsAppContext } from '../contexts/ContactsAppContext/useContactsAppContext';
import { useAccountsAppContext } from '@/app/(control-panel)/administration/accounts/contexts/ContactsAppContext/useAccountsAppContext';

export function useSearch() {
	// const { searchText, setSearchText, resetSearchText } = useContactsAppContext();
	const { searchText, setSearchText, resetSearchText } = useAccountsAppContext();

	return {
		searchText,
		setSearchText,
		resetSearchText
	};
}
