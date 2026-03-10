import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import useParams from '@fuse/hooks/useParams';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import useUser from '@auth/useUser';
import { useCreateSubscription } from '../../../api/hooks/useCreateSubscription';
import { CreateSubscription } from '../../../api/types';

function SubscriptionHeader() {
	const routeParams = useParams<{ subscriptionId: string }>();
	const isNew = routeParams.subscriptionId === 'new';

	const { data: currentAccount } = useUser();
	const { mutate: createSubscription } = useCreateSubscription(currentAccount.token);
	const navigate = useNavigate();

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;
	const { reference } = watch();

	function handleCreate() {
		createSubscription(getValues() as CreateSubscription, {
			onSuccess: () => navigate('/administration/subscriptions')
		});
	}

	return (
		<div className="flex flex-auto flex-col py-4">
			<PageBreadcrumb className="mb-2" />
			<div className="flex min-w-0 flex-auto flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-auto items-center gap-2">
					<motion.div
						className="flex min-w-0 flex-col"
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className="truncate text-lg font-semibold sm:text-2xl">
							{reference || 'New Subscription'}
						</Typography>
						<Typography variant="caption" className="font-medium">
							Subscription Detail
						</Typography>
					</motion.div>
				</div>

				<motion.div
					className="flex w-full flex-1 justify-end"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
				>
					{isNew ? (
						<Button
							className="mx-1 whitespace-nowrap"
							variant="contained"
							color="secondary"
							disabled={_.isEmpty(dirtyFields) || !isValid}
							onClick={handleCreate}
						>
							Add
						</Button>
					) : (
						<Button
							className="mx-1 whitespace-nowrap"
							variant="outlined"
							color="secondary"
							onClick={() => navigate('/administration/subscriptions')}
							startIcon={<FuseSvgIcon>lucide:arrow-left</FuseSvgIcon>}
						>
							Back
						</Button>
					)}
				</motion.div>
			</div>
		</div>
	);
}

export default SubscriptionHeader;