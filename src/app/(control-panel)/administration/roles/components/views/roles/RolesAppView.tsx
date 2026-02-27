'use client';

import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { RolesAppProvider } from '../../../Contexts/Rolesappprovider';
import RolesHeader from '../../ui/roles/RolesHeader';
import RolesTable from '../../ui/roles/RolesTable';

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
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	return (
		<Root
			header={<RolesHeader />}
			content={<RolesTable />}
			scroll={isMobile ? 'page' : 'content'}
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