'use client';

import FusePageCarded from '@fuse/core/FusePageCarded';
import { styled } from '@mui/material/styles';
import SubscriptionsHeader from '../../ui/subscriptions/SubscriptionsHeader';
import SubscriptionsTable from '../../ui/subscriptions/SubscriptionsTable';

const Root = styled(FusePageCarded)(() => ({
	'& .container': {
		maxWidth: '100%!important'
	}
}));

function SubscriptionsView() {
	return (
		<Root
			header={<SubscriptionsHeader />}
			content={<SubscriptionsTable />}
		/>
	);
}

export default SubscriptionsView;