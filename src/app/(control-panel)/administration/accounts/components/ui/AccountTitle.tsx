import { useAccount } from '../../api/hooks/accounts/useAccount';
import useUser from '@auth/useUser';

type AccountTitleProps = {
	accountId?: string;
};

function AccountTitle(props: AccountTitleProps) {
	const { accountId } = props;
	const { data: currentAccount } = useUser();
	const { data: account } = useAccount(currentAccount.token, parseInt(accountId));

	return account?.full_name || 'Account';
}

export default AccountTitle;
