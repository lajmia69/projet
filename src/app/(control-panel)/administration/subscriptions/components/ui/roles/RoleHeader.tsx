import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import useParams from '@fuse/hooks/useParams';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import { subscription, Createsubscription } from '@/app/(control-panel)/administration/subscriptions/api/types';
import { useCreatesubscription } from '@/app/(control-panel)/administration/subscriptions/api/hooks/useCreatesubscription';
import { useUpdatesubscription } from '@/app/(control-panel)/administration/subscriptions/api/hooks/useUpdatesubscription';
import { useDeletesubscription } from '@/app/(control-panel)/administration/subscriptions/api/hooks/useDeletesubscription';
import useUser from '@auth/useUser';
import { useSnackbar } from 'notistack';

function subscriptionHeader() {
	const routeParams = useParams<{ subscriptionId: string }>();
	const { subscriptionId } = routeParams;
	const { data: currentAccount } = useUser();
	const { enqueueSnackbar } = useSnackbar();
	const navigate = useNavigate();

	const { mutate: createsubscription } = useCreatesubscription(currentAccount.token);
	const { mutate: updatesubscription } = useUpdatesubscription(currentAccount.token);
	const { mutate: deletesubscription } = useDeletesubscription(currentAccount.token);

	const methods = useFormContext();
	const { formState, getValues, watch } = methods;
	const { isValid, dirtyFields } = formState;

	const { name } = watch() as subscription;

	function handleCreatesubscription() {
		createsubscription(getValues() as Createsubscription, {
			onSuccess: () => {
				enqueueSnackbar('subscription created successfully', { variant: 'success' });
				navigate('/administration/subscriptions');
			},
			onError: () => {
				enqueueSnackbar('Failed to create subscription', { variant: 'error' });
			}
		});
	}

	function handleSavesubscription() {
		updatesubscription(getValues() as subscription, {
			onSuccess: () => {
				enqueueSnackbar('subscription updated successfully', { variant: 'success' });
			},
			onError: () => {
				enqueueSnackbar('Failed to update subscription', { variant: 'error' });
			}
		});
	}

	function handleRemovesubscription() {
		deletesubscription(parseInt(subscriptionId), {
			onSuccess: () => {
				enqueueSnackbar('subscription deleted successfully', { variant: 'success' });
				navigate('/administration/subscriptions');
			},
			onError: () => {
				enqueueSnackbar('Failed to delete subscription', { variant: 'error' });
			}
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
							{name || 'New subscription'}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							subscription Detail
						</Typography>
					</motion.div>
				</div>
				<motion.div
					className="flex w-full flex-1 justify-end"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
				>
					{subscriptionId !== 'new' ? (
						<>
							<Button
								className="mx-1 whitespace-nowrap"
								variant="contained"
								color="error"
								onClick={handleRemovesubscription}
								startIcon={<FuseSvgIcon>lucide:trash</FuseSvgIcon>}
							>
								Remove
							</Button>
							<Button
								className="mx-1 whitespace-nowrap"
								variant="contained"
								color="secondary"
								disabled={_.isEmpty(dirtyFields) || !isValid}
								onClick={handleSavesubscription}
							>
								Save
							</Button>
						</>
					) : (
						<Button
							className="mx-1 whitespace-nowrap"
							variant="contained"
							color="secondary"
							disabled={_.isEmpty(dirtyFields) || !isValid}
							onClick={handleCreatesubscription}
						>
							Add
						</Button>
					)}
				</motion.div>
			</div>
		</div>
	);
}

export default subscriptionHeader;