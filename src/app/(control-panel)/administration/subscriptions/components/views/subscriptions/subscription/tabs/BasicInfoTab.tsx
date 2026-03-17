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
import { useQuery } from '@tanstack/react-query';
import { Token } from '@auth/user';
import { subscriptionsApi } from '../../../../../api/services/subscriptionsApiService';

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

	if (accountsLoading || levelsLoading) return <FuseLoading />;

	return (
		<div className="flex flex-col gap-4">
			{/* Reference */}
			<Controller
				name="reference"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="reference" required={isNew}>
							Reference
						</FormLabel>
						<TextField
							id="reference"
							{...field}
							value={field.value ?? ''}
							autoFocus={isNew}
							fullWidth
							disabled={!isNew}
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
						<FormLabel htmlFor="account_id" required={isNew}>
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
						<FormLabel htmlFor="level_id" required={isNew}>
							Plan
						</FormLabel>
						{levels && levels.length > 0 ? (
							<Select
								id="level_id"
								{...field}
								value={field.value && field.value > 0 ? field.value : ''}
								disabled={!isNew}
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
							<TextField
								id="level_id"
								type="number"
								{...field}
								value={field.value ?? ''}
								fullWidth
								disabled={!isNew}
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

			{/* Start Date */}
			<Controller
				name="start_date"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="start_date" required={isNew}>
							Start Date
						</FormLabel>
						<TextField
							id="start_date"
							type="date"
							fullWidth
							disabled={!isNew}
							error={!!errors.start_date}
							helperText={errors?.start_date?.message as string}
							InputLabelProps={{ shrink: true }}
							// Use nullish check: only render a value when it's a non-empty string
							value={field.value && field.value !== '' ? field.value : ''}
							onChange={(e) => field.onChange(e.target.value ?? '')}
							onBlur={field.onBlur}
							name={field.name}
							ref={field.ref}
							inputProps={{ placeholder: 'yyyy-mm-dd' }}
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
						<FormLabel htmlFor="end_date" required={isNew}>
							End Date
						</FormLabel>
						<TextField
							id="end_date"
							type="date"
							fullWidth
							disabled={!isNew}
							error={!!errors.end_date}
							helperText={errors?.end_date?.message as string}
							InputLabelProps={{ shrink: true }}
							value={field.value && field.value !== '' ? field.value : ''}
							onChange={(e) => field.onChange(e.target.value ?? '')}
							onBlur={field.onBlur}
							name={field.name}
							ref={field.ref}
							inputProps={{ placeholder: 'yyyy-mm-dd' }}
						/>
					</FormControl>
				)}
			/>

			{/* Active — read-only display for existing subscriptions */}
			<Controller
				name="is_active"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormControlLabel
							control={
								<Switch
									checked={!!field.value}
									disabled={!isNew}
									color="success"
									onChange={(e) => {
										if (isNew) {
											field.onChange(e.target.checked);
										}
									}}
								/>
							}
							label={isNew ? 'Active' : `Status: ${field.value ? 'Active' : 'Inactive'}`}
						/>
					</FormControl>
				)}
			/>
		</div>
	);
}

export default BasicInfoTab;