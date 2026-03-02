import { useContext } from 'react';
import { AccountsAppContext } from './AccountsAppContext';

export function useAccountsAppContext() {
	const context = useContext(AccountsAppContext);

	if (!context) {
		throw new Error('useAccountsApp must be used within a AccountsAppProvider');
	}

	return context;
}
