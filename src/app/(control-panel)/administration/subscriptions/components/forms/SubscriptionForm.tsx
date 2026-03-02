'use client';

import Button from '@mui/material/Button';
import Link from '@fuse/core/Link';
import useParams from '@fuse/hooks/useParams';
import { useCallback, useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/system/Box';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useNavigate from '@fuse/hooks/useNavigate';
import { useSnackbar } from 'notistack';
import useUser from '@auth/useUser';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSubscription } from '../../api/hooks/subscriptions/useSubscription';
import { useCreateSubscription } from '../../api/hooks/subscriptions/useCreateSubscription';
import { useUpdateSubscription } from '../../api/hooks/subscriptions/useUpdateSubscription';
import { useDeleteSubscription } from '../../api/hooks/subscriptions/useDeleteSubscription';
import { CreateSubscriptionModel, SubscriptionModel } from '../../api/models/SubscriptionModel.ts';

const schema = z.object({
	reference: z.string().min(1, { message: 'Reference is required' }),
	start_date: z.string().min(1, { message: 'Start date is required' }),
	end_date: z.string().min(1, { message: 'End date is required' }),
	is_active: z.boolean(),
	level_id: z.number({ invalid_type_error: 'Level is required' }).min(1, { message: 'Level is required' }),
	account_id: z.number().optional()
});

type FormType = z.infer<typeof schema>;

type SubscriptionFormProps = {
	isNew?: boolean;
};

function SubscriptionForm(props: SubscriptionFormProps) {
	const { isNew } = props;
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const routeParams = useParams<{ subscriptionId: string }>();
	const { subscriptionId } = routeParams;
	const { data: currentAccount } = useUser();
	const token = currentAccount.token;

	const { data: subscription, isError } = useSubscription(token, parseInt(subscriptionId));
	const { mutate: createSubscription } = useCreateSubscription(token);
	const { mutate: updateSubscription } = useUpdateSubscription(token);
	const { mutate: deleteSubscription } = useDeleteSubscription(token);

	const { control, watch, reset, handleSubmit, formState } = useForm<FormType>({
		mode: 'all',
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;
	const form = watch();

	useEffect(() => {
		if (isNew) {
			reset(CreateSubscriptionModel({}));
		} else if (subscription) {
			reset({
				reference: subscription.reference,
				start_date: subscription.start_date,
				end_date: subscription.end_date,
				is_active: subscription.is_active,
				level_id: subscription.level?.id ?? 0,
				account_id: subscription.account_id
			});
		}
	}, [subscription, reset, isNew]);

	const onSubmit = useCallback(() => {
		if (isNew) {
			createSubscription(form as any, {
				onSuccess: (action) => {
					enqueueSnackbar('Subscription created', { variant: 'success' });
					navigate(`/administration/subscriptions/${action.id}`);
				},
				onError: () => enqueueSnackbar('Failed to create subscription', { variant: 'error' })
			});
		} else {
			updateSubscription(
				{ ...SubscriptionModel(subscription ?? {}), ...form, level: subscription?.level ?? {} },
				{
					onSuccess: () => enqueueSnackbar('Subscription updated', { variant: 'success' }),
					onError: () => enqueueSnackbar('Failed to update subscription', { variant: 'error' })
				}
			);
		}
	}, [form]);

	function handleRemove() {
		deleteSubscription(parseInt(subscriptionId), {
			onSuccess: () => {
				enqueueSnackbar('Subscription deleted', { variant: 'success' });
				navigate('/administration/subscriptions');
			},
			onError: () => enqueueSnackbar('Failed to delete subscription', { variant: 'error' })
		});
	}

	if (isError && !isNew) {
		setTimeout(() => {
			navigate('/administration/subscriptions');
			enqueueSnackbar('NOT FOUND', { variant: 'error' });
		}, 0);
		return null;
	}

	if (_.isEmpty(form)) {
		return <FuseLoading className="min-h-screen" />;
	}

	return (
		<>
			<div className="relative flex flex-auto flex-col overflow-y-auto">
				<div className="w-full px-6 pb-8 pt-6 sm:px-12">
					<div className="flex flex-col gap-4">
						<Controller
							control={control}
							name="reference"
							render={({ field }) => (
								<FormControl className="w-full">
									<FormLabel htmlFor="reference">Reference</FormLabel>
									<TextField
										{...field}
										id="reference"
										placeholder="Reference"
										error={!!errors.reference}
										helperText={errors?.reference?.message}
										variant="outlined"
										required
										fullWidth
										slotProps={{
											input: {
												startAdornment: (
													<FuseSvgIcon color="action">lucide:hash</FuseSvgIcon>
												)
											}
										}}
									/>
								</FormControl>
							)}
						/>

						<Controller
							control={control}
							name="level_id"
							render={({ field }) => (
								<FormControl className="w-full">
									<FormLabel htmlFor="level_id">Level ID</FormLabel>
									<TextField
										{...field}
										id="level_id"
										type="number"
										placeholder="Level ID"
										error={!!errors.level_id}
										helperText={errors?.level_id?.message}
										variant="outlined"
										fullWidth
										onChange={(e) => field.onChange(Number(e.target.value))}
										slotProps={{
											input: {
												startAdornment: (
													<FuseSvgIcon color="action">lucide:layers</FuseSvgIcon>
												)
											}
										}}
									/>
								</FormControl>
							)}
						/>

						<Controller
							control={control}
							name="account_id"
							render={({ field }) => (
								<FormControl className="w-full">
									<FormLabel htmlFor="account_id">Account ID</FormLabel>
									<TextField
										{...field}
										id="account_id"
										type="number"
										placeholder="Account ID"
										error={!!errors.account_id}
										helperText={errors?.account_id?.message}
										variant="outlined"
										fullWidth
										onChange={(e) => field.onChange(Number(e.target.value))}
										slotProps={{
											input: {
												startAdornment: (
													<FuseSvgIcon color="action">lucide:user</FuseSvgIcon>
												)
											}
										}}
									/>
								</FormControl>
							)}
						/>

						<Controller
							control={control}
							name="start_date"
							render={({ field: { value, onChange } }) => (
								<FormControl className="w-full">
									<FormLabel htmlFor="start_date">Start Date</FormLabel>
									<DateTimePicker
										value={value ? new Date(value) : null}
										onChange={(val) => onChange(val?.toISOString() ?? '')}
										slotProps={{
											textField: {
												id: 'start_date',
												fullWidth: true,
												size: 'small',
												variant: 'outlined',
												error: !!errors.start_date,
												helperText: errors?.start_date?.message
											},
											actionBar: { actions: ['clear', 'today'] }
										}}
									/>
								</FormControl>
							)}
						/>

						<Controller
							control={control}
							name="end_date"
							render={({ field: { value, onChange } }) => (
								<FormControl className="w-full">
									<FormLabel htmlFor="end_date">End Date</FormLabel>
									<DateTimePicker
										value={value ? new Date(value) : null}
										onChange={(val) => onChange(val?.toISOString() ?? '')}
										slotProps={{
											textField: {
												id: 'end_date',
												fullWidth: true,
												size: 'small',
												variant: 'outlined',
												error: !!errors.end_date,
												helperText: errors?.end_date?.message
											},
											actionBar: { actions: ['clear', 'today'] }
										}}
									/>
								</FormControl>
							)}
						/>

						<Controller
							control={control}
							name="is_active"
							render={({ field: { value, onChange } }) => (
								<FormControl>
									<FormControlLabel
										control={
											<Switch
												checked={!!value}
												onChange={(e) => onChange(e.target.checked)}
											/>
										}
										label="Active"
									/>
								</FormControl>
							)}
						/>
					</div>
				</div>
			</div>

			<Box
				className="flex items-center border-t py-3.5 pr-4 pl-1 sm:pr-12 sm:pl-9"
				sx={{ backgroundColor: 'background.default' }}
			>
				{!isNew && (
					<Button color="error" onClick={handleRemove}>
						Delete
					</Button>
				)}
				<Button
					component={Link}
					className="ml-auto"
					to="/administration/subscriptions"
				>
					Cancel
				</Button>
				<Button
					className="ml-2"
					variant="contained"
					color="secondary"
					disabled={_.isEmpty(dirtyFields) || !isValid}
					onClick={handleSubmit(onSubmit)}
				>
					Save
				</Button>
			</Box>
		</>
	);
}

export default SubscriptionForm;