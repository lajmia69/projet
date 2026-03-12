import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import useUser from '@auth/useUser';
import FuseLoading from '@fuse/core/FuseLoading';
import useParams from '@fuse/hooks/useParams';
import { useSnackbar } from 'notistack';
import { useQuery } from '@tanstack/react-query';
import { Token } from '@auth/user';
import { subscriptionsApi } from '../../../../../api/services/subscriptionsApiService';
import { useToggleSubscription } from '../../../../../api/hooks/useToggleSubscription';

// ─── local hooks ─────────────────────────────────────────────────────────────

function useAccountsList(token: Token) {
	return useQuery({
		queryFn: () => subscriptionsApi.getAccountsList(token),
		queryKey: ['subscriptions', 'accounts', token],
		staleTime: 2 * 60 * 1000
	});
}

function useLevelsList(token: Token) {
	return useQuery({
		queryFn: () => subscriptionsApi.getLevelsList(token),
		queryKey: ['subscriptions', 'levels', token],
		staleTime: 5 * 60 * 1000
	});
}

// ─── component ───────────────────────────────────────────────────────────────

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;

	const routeParams = useParams<{ subscriptionId: string }>();
	const isNew = routeParams.subscriptionId === 'new';

	const { data: currentAccount } = useUser();
	const token = currentAccount.token;

	const { data: accounts, isLoading: accountsLoading } = useAccountsList(token);
	const { data: levels, isLoading: levelsLoading } = useLevelsList(token);
	const { mutate: toggleSubscription, isPending } = useToggleSubscription(token);
	const { enqueueSnackbar } = useSnackbar();

	if (accountsLoading || levelsLoading) return <FuseLoading />;

	return (
		<div className="flex flex-col gap-4">
			{/* Reference */}
			<Controller
				name="reference"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="reference" required>
							Reference
						</FormLabel>
						<TextField
							id="reference"
							{...field}
							value={field.value ?? ''}
							autoFocus
							fullWidth
							error={!!errors.reference}
							helperText={errors?.reference?.message as string}
						/>
					</FormControl>
				)}
			/>

			{/* Account */}
			<Controller
				name="account_id"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full" error={!!errors.account_id}>
						<FormLabel htmlFor="account_id" required>
							Account
						</FormLabel>
						<Select
							id="account_id"
							{...field}
							value={field.value && field.value > 0 ? field.value : ''}
							disabled={!isNew}
							displayEmpty
						>
							<MenuItem value="" disabled>
								<em>Select an account…</em>
							</MenuItem>
							{accounts?.map((account) => (
								<MenuItem key={account.id} value={account.id}>
									{account.full_name} — {account.email}
								</MenuItem>
							))}
						</Select>
						{errors.account_id && (
							<FormHelperText>{errors.account_id.message as string}</FormHelperText>
						)}
					</FormControl>
				)}
			/>

			{/* Plan / Level */}
			<Controller
				name="level_id"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full" error={!!errors.level_id}>
						<FormLabel htmlFor="level_id" required>
							Plan
						</FormLabel>
						{levels && levels.length > 0 ? (
							<Select
								id="level_id"
								{...field}
								value={field.value && field.value > 0 ? field.value : ''}
								displayEmpty
							>
								<MenuItem value="" disabled>
									<em>Select a plan…</em>
								</MenuItem>
								{levels.map((level) => (
									<MenuItem key={level.id} value={level.id}>
										{level.name}
									</MenuItem>
								))}
							</Select>
						) : (
							// Fallback: numeric input if no levels endpoint available
							<TextField
								id="level_id"
								type="number"
								{...field}
								value={field.value ?? ''}
								fullWidth
								error={!!errors.level_id}
								inputProps={{ min: 1 }}
								onChange={(e) => {
									const val = parseInt(e.target.value, 10);
									field.onChange(isNaN(val) ? '' : val);
								}}
							/>
						)}
						{errors.level_id && (
							<FormHelperText>{errors.level_id.message as string}</FormHelperText>
						)}
					</FormControl>
				)}
			/>

			{/* Start Date — key fix: InputLabelProps shrink + no defaultValue */}
			<Controller
				name="start_date"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="start_date" required>
							Start Date
						</FormLabel>
						<TextField
							id="start_date"
							type="date"
							fullWidth
							error={!!errors.start_date}
							helperText={errors?.start_date?.message as string}
							InputLabelProps={{ shrink: true }}
							// Never fall back to a non-empty default — keep blank until user picks
							value={field.value || ''}
							onChange={(e) => field.onChange(e.target.value || '')}
							onBlur={field.onBlur}
							name={field.name}
							ref={field.ref}
						/>
					</FormControl>
				)}
			/>

			{/* End Date */}
			<Controller
				name="end_date"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="end_date" required>
							End Date
						</FormLabel>
						<TextField
							id="end_date"
							type="date"
							fullWidth
							error={!!errors.end_date}
							helperText={errors?.end_date?.message as string}
							InputLabelProps={{ shrink: true }}
							value={field.value || ''}
							onChange={(e) => field.onChange(e.target.value || '')}
							onBlur={field.onBlur}
							name={field.name}
							ref={field.ref}
						/>
					</FormControl>
				)}
			/>

			{/* Active toggle */}
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
											const subscriptionId = parseInt(routeParams.subscriptionId, 10);
											toggleSubscription(
												{ subscriptionId, is_active: e.target.checked },
												{
													onSuccess: () => {
														field.onChange(e.target.checked);
														enqueueSnackbar(
															`Subscription ${
																e.target.checked ? 'activated' : 'deactivated'
															} successfully`,
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