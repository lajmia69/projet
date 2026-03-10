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
import { Tabs, Tab } from '@mui/material';
import useUser from '@auth/useUser';
import SubscriptionHeader from '../../ui/subscriptions/SubscriptionHeader';
import BasicInfoTab from './subscriptions/subscription/tabs/BasicInfoTab';
import { useSubscription } from '../../api/hooks/useSubscription';
import { CreateSubscriptionModel } from '../../api/models/SubscriptionModel';

const schema = z.object({
	reference: z
		.string()
		.nonempty('Reference is required')
		.min(3, 'Reference must be at least 3 characters'),
	account_id: z.number({ required_error: 'Account is required' }).min(1, 'Account is required'),
	start_date: z.string().nonempty('Start date is required'),
	end_date: z.string().nonempty('End date is required'),
	is_active: z.boolean().optional()
});

function SubscriptionDetailView() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const routeParams = useParams<{ subscriptionId: string }>();
	const { subscriptionId } = routeParams;
	const { data: currentAccount } = useUser();

	const { data: subscription, isLoading, isError } = useSubscription(
		currentAccount.token,
		parseInt(subscriptionId)
	);

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
			reset(CreateSubscriptionModel({}));
		}
	}, [subscriptionId, reset]);

	useEffect(() => {
		if (subscription) {
			reset({
				reference: subscription.reference,
				account_id: subscription.account?.id,
				start_date: subscription.start_date?.split('T')[0] ?? '',
				end_date: subscription.end_date?.split('T')[0] ?? '',
				is_active: subscription.is_active
			});
		}
	}, [subscription, reset]);

	function handleTabChange(_event: SyntheticEvent, value: string) {
		setTabValue(value);
	}

	if (isLoading && subscriptionId !== 'new') {
		return <FuseLoading />;
	}

	if (isError && subscriptionId !== 'new') {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex h-full flex-1 flex-col items-center justify-center"
			>
				<Typography color="text.secondary" variant="h5">
					There is no such subscription!
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/administration/subscriptions"
					color="inherit"
				>
					Go to Subscriptions Page
				</Button>
			</motion.div>
		);
	}

	if (
		_.isEmpty(form) ||
		(subscription &&
			parseInt(subscriptionId) !== subscription.id &&
			subscriptionId !== 'new')
	) {
		return <FuseLoading />;
	}

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<SubscriptionHeader />}
				content={
					<div className="flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
						<Tabs value={tabValue} onChange={handleTabChange}>
							<Tab value="basic-info" label="Basic Info" />
						</Tabs>
						<div>
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

export default SubscriptionDetailView;