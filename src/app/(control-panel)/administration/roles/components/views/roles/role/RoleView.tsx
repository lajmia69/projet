'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { SyntheticEvent, useEffect, useState } from 'react';
import useParams from '@fuse/hooks/useParams';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import RoleHeader from '@/app/(control-panel)/administration/roles/components/ui/roles/RoleHeader';
import BasicInfoTab from './tabs/BasicInfoTab';
import { useRole } from '@/app/(control-panel)/administration/roles/api/hooks/useRole';
import { CreateRoleModel } from '@/app/(control-panel)/administration/roles/api/models/RoleModel';
import { Tabs, Tab } from '@mui/material';
import useUser from '@auth/useUser';

/**
 * Form Validation Schema
 */
const schema = z.object({
	name: z.string().nonempty('You must enter a role name').min(5, 'The role name must be at least 5 characters'),
	type_id: z.number()
});

/**
 * The role page.
 */
function RoleView() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const routeParams = useParams();

	const { roleId } = routeParams as { roleId: string };

	const { data: currentAccount } = useUser();
	const { data: role, isLoading, isError } = useRole(currentAccount.token, parseInt(roleId));

	const [tabValue, setTabValue] = useState('basic-info');

	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: zodResolver(schema)
	});

	const { reset, watch } = methods;

	const form = watch();

	useEffect(() => {
		if (roleId === 'new') {
			reset(CreateRoleModel({}));
		}
	}, [roleId, reset]);

	useEffect(() => {
		if (role) {
			reset({ ...role });
		}
	}, [role, reset]);

	/**
	 * Tab Change
	 */
	function handleTabChange(event: SyntheticEvent, value: string) {
		setTabValue(value);
	}

	if (isLoading) {
		return <FuseLoading />;
	}

	/**
	 * Show Message if the requested roles is not exists
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
	 * Wait while role data is loading and form is setted
	 */
	if (_.isEmpty(form) || (role && parseInt(roleId) !== role.id && routeParams.roleId !== 'new')) {
		return <FuseLoading />;
	}

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<RoleHeader />}
				content={
					<div className="flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
						>
							<Tab
								value="basic-info"
								label="Basic Info"
							/>
						</Tabs>
						<div className="">
							<div className={tabValue !== 'basic-info' ? 'hidden' : ''}>
								<BasicInfoTab />
							</div>
						</div>
					</div>
				}
				scroll={isMobile ? 'page' : 'content'}
			/>
		</FormProvider>
	);
}

export default RoleView;
