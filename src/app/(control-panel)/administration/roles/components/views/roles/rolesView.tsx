'use client';

import RolesHeader from '@/app/(control-panel)/administration/roles/components/ui/roles/RolesHeader';
import RolesTable from '@/app/(control-panel)/administration/roles/components/ui/roles/RolesTable';
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
function RolesView() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	return (
		<Root
			scroll={isMobile ? 'page' : 'content'}
			header={<RolesHeader />}
			content={<RolesTable />}
		/>
	);
}

export default RolesView;
