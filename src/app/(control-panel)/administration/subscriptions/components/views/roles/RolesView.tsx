'use client';

import subscriptionsHeader from '@/app/(control-panel)/administration/subscriptions/components/ui/subscriptions/subscriptionsHeader';
import subscriptionsTable from '@/app/(control-panel)/administration/subscriptions/components/ui/subscriptions/subscriptionsTable';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '../../../../../../../@fuse/hooks/useThemeMediaQuery';

const Root = styled(FusePageCarded)(() => ({
	'& .container': {
		maxWidth: '100%!important'
	}
}));

/**
 * The products page.
 */
function subscriptionsView() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	return (
		<Root
			scroll={isMobile ? 'page' : 'content'}
			header={<subscriptionsHeader />}
			content={<subscriptionsTable />}
		/>
	);
}

export default subscriptionsView;
