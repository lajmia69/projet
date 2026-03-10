import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import useUser from '@auth/useUser';
import FuseLoading from '@fuse/core/FuseLoading';
import useParams from '@fuse/hooks/useParams';
import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import { Token } from '@auth/user';
import { subscriptionsApi } from '../../../../../api/services/subscriptionsApiService';
import { useToggleSubscription } from '../../../../../api/hooks/useToggleSubscription';

function useAccountsList(token: Token) {
	return useQuery({
		queryFn: () => subscriptionsApi.getAccountsList(token),
		queryKey: ['subscriptions', 'accounts', token]
	});
}

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;

	const routeParams = useParams<{ subscriptionId: string }>();
	const isNew = routeParams.subscriptionId === 'new';

	const { data: currentAccount } = useUser();
	const token = currentAccount.token;

	const { data: accounts, isLoading: accountsLoading } = useAccountsList(token);
	const { mutate: toggleSubscription, isPending } = useToggleSubscription(token);
	const { enqueueSnackbar } = useSnackbar();

	if (accountsLoading) return <FuseLoading />;

	return (
		<div className="flex flex-col gap-4">
			<Controller
				name="reference"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="reference">Reference</FormLabel>
						<TextField
							id="reference"
							{...field}
							value={field.value || ''}
							required
							autoFocus
							fullWidth
							error={!!errors.reference}
							helperText={errors?.reference?.message as string}
						/>
					</FormControl>
				)}
			/>

			<Controller
				name="account_id"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="account_id">Account</FormLabel>
						<Select
							id="account_id"
							{...field}
							value={field.value || ''}
							required
							disabled={!isNew}
							error={!!errors.account_id}
						>
							{accounts?.map((account) => (
								<MenuItem key={account.id} value={account.id}>
									{account.full_name} — {account.email}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				)}
			/>

			<Controller
				name="level_id"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="level_id">Level ID</FormLabel>
						<TextField
							id="level_id"
							type="number"
							{...field}
							value={field.value || ''}
							required
							fullWidth
							error={!!errors.level_id}
							helperText={errors?.level_id?.message as string}
							onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
						/>
					</FormControl>
				)}
			/>

			<Controller
				name="start_date"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="start_date">Start Date</FormLabel>
						<TextField
							id="start_date"
							type="date"
							{...field}
							value={field.value || ''}
							required
							fullWidth
							error={!!errors.start_date}
							helperText={errors?.start_date?.message as string}
						/>
					</FormControl>
				)}
			/>

			<Controller
				name="end_date"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="end_date">End Date</FormLabel>
						<TextField
							id="end_date"
							type="date"
							{...field}
							value={field.value || ''}
							required
							fullWidth
							error={!!errors.end_date}
							helperText={errors?.end_date?.message as string}
						/>
					</FormControl>
				)}
			/>

			<Controller
				name="is_active"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormControlLabel
							control={
								<Switch
									checked={!!field.value}
									disabled={isPending}
									color="success"
									onChange={(e) => {
										if (!isNew) {
											const subscriptionId = parseInt(routeParams.subscriptionId);
											toggleSubscription(
												{ subscriptionId, is_active: e.target.checked },
												{
													onSuccess: () => {
														field.onChange(e.target.checked);
														enqueueSnackbar(
															`Subscription ${e.target.checked ? 'activated' : 'deactivated'} successfully`,
															{ variant: 'success' }
														);
													},
													onError: () =>
														enqueueSnackbar('Failed to update subscription', {
															variant: 'error'
														})
												}
											);
										} else {
											field.onChange(e.target.checked);
										}
									}}
								/>
							}
							label="Active"
						/>
					</FormControl>
				)}
			/>
		</div>
	);
}

export default BasicInfoTab;