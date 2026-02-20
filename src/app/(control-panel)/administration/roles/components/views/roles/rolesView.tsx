// File: src/app/(control-panel)/administration/roles/components/views/roles/RolesView.tsx

'use client';
import RolesHeader from '../../ui/roles/RolesHeader';
import RolesTable from '../../ui/roles/RolesTable';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { styled } from '@mui/material/styles';

const Root = styled(FusePageCarded)(() => ({
	'& .container': {
		maxWidth: '100%!important'
	}
}));

/**
 * The roles page.
 */
function Roles() {
	return (
		<Root
			header={<RolesHeader />}
			content={<RolesTable />}
		/>
	);
}

export default Roles;