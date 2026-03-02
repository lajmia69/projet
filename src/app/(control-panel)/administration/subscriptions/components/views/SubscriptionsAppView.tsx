'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import { useEffect, useRef, useState } from 'react';
import useParams from '@fuse/hooks/useParams';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import useNavigate from '@fuse/hooks/useNavigate';
import SubscriptionsHeader from '../ui/SubscriptionsHeader';
import AccountsList from '../ui/account-list/AccountsList';
import SubscriptionsSidebarContent from '../ui/SubscriptionsSidebarContent';
import { SubscriptionsAppProvider } from '../../contexts/SubscriptionsAppContext/SubscriptionsAppProvider';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .container': { maxWidth: '100%!important' },
	'& .FusePageSimple-contentWrapper': { paddingTop: 2 },
	'& .FusePageSimple-content': { boxShadow: theme.vars.shadows[2] }
}));

type Props = { children?: React.ReactNode };

function SubscriptionsAppView({ children }: Props) {
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
			header={<SubscriptionsHeader />}
			content={<AccountsList />}
			ref={pageLayout}
			rightSidebarProps={{
				content: <SubscriptionsSidebarContent>{children}</SubscriptionsSidebarContent>,
				open: rightSidebarOpen,
				onClose: () => navigate('/administration/subscriptions'),
				width: 640,
				variant: 'temporary'
			}}
			scroll={isMobile ? 'page' : 'content'}
		/>
	);
}

function SubscriptionsAppWrapper(props: Props) {
	return (
		<SubscriptionsAppProvider>
			<SubscriptionsAppView {...props} />
		</SubscriptionsAppProvider>
	);
}

export default SubscriptionsAppWrapper;