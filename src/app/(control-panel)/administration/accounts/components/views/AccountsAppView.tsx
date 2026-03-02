'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import { useEffect, useRef, useState } from 'react';
import useParams from '@fuse/hooks/useParams';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import useNavigate from '@fuse/hooks/useNavigate';
import AccountsHeader from '../ui/AccountsHeader';
import AccountsList from '@/app/(control-panel)/administration/accounts/components/ui/account-list/AccountsList';
import AccountsSidebarContent from '../ui/AccountsSidebarContent';
import { AccountsAppProvider } from '@/app/(control-panel)/administration/accounts/contexts/ContactsAppContext/AccountsAppProvider';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .container': {
		maxWidth: '100%!important'
	},
	'& .FusePageSimple-contentWrapper': {
		paddingTop: 2
	},
	'& .FusePageSimple-content': {
		boxShadow: theme.vars.shadows[2]
	}
}));

type AccountsAppProps = {
	children?: React.ReactNode;
};

/**
 * The AccountsApp page.
 */
function AccountsAppView(props: AccountsAppProps) {
	const { children } = props;
	const navigate = useNavigate();
	const routeParams = useParams();

	const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
	const pageLayout = useRef(null);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	useEffect(() => {
		setRightSidebarOpen(!!routeParams.accountId);
	}, [routeParams]);

	return (
		<Root
			header={<AccountsHeader />}
			content={<AccountsList />}
			ref={pageLayout}
			rightSidebarProps={{
				content: <AccountsSidebarContent>{children}</AccountsSidebarContent>,
				open: rightSidebarOpen,
				onClose: () => navigate('/administration/accounts'),
				width: 640,
				variant: 'temporary'
			}}
			scroll={isMobile ? 'page' : 'content'}
		/>
	);
}

function AccountsAppWrapper(props: { children?: React.ReactNode }) {
	return (
		<AccountsAppProvider>
			<AccountsAppView {...props} />
		</AccountsAppProvider>
	);
}

export default AccountsAppWrapper;
