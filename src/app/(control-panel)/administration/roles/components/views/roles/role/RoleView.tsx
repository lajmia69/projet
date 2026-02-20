// File: src/app/(control-panel)/administration/roles/components/views/roles/role/RoleView.tsx

'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import useParams from '@fuse/hooks/useParams';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RoleHeader from '../../../ui/roles/RoleHeader';
import RoleBasicInfoTab from './tabs/RoleBasicInfo';
import { useRole } from '../../../../api/hooks/useRoles';
import RoleModel from '../../../../api/models/RoleModel';

/**
 * Form Validation Schema
 */
const schema = z.object({
	name: z.string().nonempty('You must enter a role name').min(2, 'The role name must be at least 2 characters'),
	type: z.string().nonempty('You must select a role type')
});

/**
 * The role detail page.
 */
function Role() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const routeParams = useParams();

	const { roleId } = routeParams as { roleId: string };

	const { data: role, isLoading, isError } = useRole(roleId);

	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: zodResolver(schema)
	});

	const { reset, watch } = methods;

	const form = watch();

	useEffect(() => {
		if (roleId === 'new') {
			reset(RoleModel({}));
		}
	}, [roleId, reset]);

	useEffect(() => {
		if (role) {
			reset({ ...role });
		}
	}, [role, reset]);

	if (isLoading) {
		return <FuseLoading />;
	}

	/**
	 * Show Message if the requested role does not exist
	 */
	if (isError && roleId !== 'new') {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex h-full flex-1 flex-col items-center justify-center"
			>
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There is no such role!
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/administration/roles"
					color="inherit"
				>
					Go to Roles Page
				</Button>
			</motion.div>
		);
	}

	/**
	 * Wait while role data is loading and form is set
	 */
	if (_.isEmpty(form) || (role && routeParams.roleId !== role.id && routeParams.roleId !== 'new')) {
		return <FuseLoading />;
	}

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<RoleHeader />}
				content={
					<div className="flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
						<RoleBasicInfoTab />
					</div>
				}
				scroll={isMobile ? 'page' : 'content'}
			/>
		</FormProvider>
	);
}

export default Role;