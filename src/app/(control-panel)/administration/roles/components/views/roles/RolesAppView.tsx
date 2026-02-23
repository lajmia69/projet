'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { RolesAppProvider } from '../../../contexts/RolesAppProvider';
import RolesHeader from '../../ui/roles/RolesHeader';
import RolesList from '../../ui/roles/RolesList';

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

function RolesAppView() {
	return (
		<Root
			header={<RolesHeader />}
			content={<RolesList />}
		/>
	);
}

function RolesAppWrapper() {
	return (
		<RolesAppProvider>
			<RolesAppView />
		</RolesAppProvider>
	);
}

export default RolesAppWrapper;