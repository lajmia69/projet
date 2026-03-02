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
import subscriptionHeader from '@/app/(control-panel)/administration/subscriptions/components/ui/subscriptions/subscriptionHeader';
import BasicInfoTab from './tabs/BasicInfoTab';
import { usesubscription } from '@/app/(control-panel)/administration/subscriptions/api/hooks/usesubscription';
import { CreatesubscriptionModel } from '@/app/(control-panel)/administration/subscriptions/api/models/subscriptionModel';
import { Tabs, Tab } from '@mui/material';
import useUser from '@auth/useUser';

/**
 * Form Validation Schema
 */
const schema = z.object({
	name: z.string().nonempty('You must enter a subscription name').min(5, 'The subscription name must be at least 5 characters'),
	type_id: z.number()
});

/**
 * The subscription page.
 */
function subscriptionView() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const routeParams = useParams();

	const { subscriptionId } = routeParams as { subscriptionId: string };

	const { data: currentAccount } = useUser();
	const { data: subscription, isLoading, isError } = usesubscription(currentAccount.token, parseInt(subscriptionId));

	const [tabValue, setTabValue] = useState('basic-info');

	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: zodResolver(schema)
	});

	const { reset, watch } = methods;

	const form = watch();

	useEffect(() => {
		if (subscriptionId === 'new') {
			reset(CreatesubscriptionModel({}));
		}
	}, [subscriptionId, reset]);

	useEffect(() => {
		if (subscription) {
			reset({ ...subscription });
		}
	}, [subscription, reset]);

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
	 * Show Message if the requested subscriptions is not exists
	 */
	if (isError && subscriptionId !== 'new') {
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
					There is no such subscription!
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/administration/subscriptions"
					color="inherit"
				>
					Go to subscriptions Page
				</Button>
			</motion.div>
		);
	}

	/**
	 * Wait while subscription data is loading and form is setted
	 */
	if (_.isEmpty(form) || (subscription && parseInt(subscriptionId) !== subscription.id && routeParams.subscriptionId !== 'new')) {
		return <FuseLoading />;
	}

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<subscriptionHeader />}
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

export default subscriptionView;
