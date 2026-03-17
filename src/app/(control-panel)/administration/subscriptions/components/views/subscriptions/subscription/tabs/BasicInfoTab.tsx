import TextField from '@mui/material/TextField';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
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
import { useEffect } from 'react';
import { subscriptionsApi } from '../../../../../api/services/subscriptionsApiService';
import { useLevelsList } from '../../../../../api/hooks/useLevelsList';

// ─── local hook (accounts only) ──────────────────────────────────────────────

function useAccountsList(token: Token) {
	return useQuery({
		queryFn: () => subscriptionsApi.getAccountsList(token),
		queryKey: ['subscriptions', 'accounts', token],
		staleTime: 2 * 60 * 1000
	});
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9-]/g, '')
		.slice(0, 20);
}

function randomSuffix(): string {
	return Math.random().toString(36).slice(2, 7).toUpperCase();
}

// ─── component ───────────────────────────────────────────────────────────────

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState, setValue } = methods;
	const { errors } = formState;

	const routeParams = useParams<{ subscriptionId: string }>();
	const isNew = routeParams.subscriptionId === 'new';

	const { data: currentAccount } = useUser();
	const token = currentAccount.token;

	const { data: accounts, isLoading: accountsLoading } = useAccountsList(token);
	const { data: levels, isLoading: levelsLoading } = useLevelsList(token);

	// Watch both selectors
	const selectedAccountId = useWatch({ control, name: 'account_id' });
	const selectedLevelId = useWatch({ control, name: 'level_id' });

	// Auto-generate reference when account or level changes
	useEffect(() => {
		if (!isNew) return;
		if (!selectedAccountId || !selectedLevelId) return;

		const account = accounts?.find((a) => a.id === selectedAccountId);
		const level = levels?.find((l) => l.id === selectedLevelId);

		if (!account || !level) return;

		const levelSlug = slugify(level.name);
		const accountSlug = slugify(account.full_name);
		const suffix = randomSuffix();

		setValue('reference', `${levelSlug}-${accountSlug}-${suffix}`, {
			shouldValidate: true,
			shouldDirty: true
		});
	}, [selectedAccountId, selectedLevelId, accounts, levels, isNew, setValue]);

	if (accountsLoading || levelsLoading) return <FuseLoading />;

	return (
		<div className="flex flex-col gap-4">
			{/* Account — pick this first */}
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

			{/* Level */}
			<Controller
				name="level_id"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full" error={!!errors.level_id}>
						<FormLabel htmlFor="level_id" required={isNew}>
							Level
						</FormLabel>
						<Select
							id="level_id"
							{...field}
							value={field.value && field.value > 0 ? field.value : ''}
							disabled={!isNew}
							displayEmpty
						>
							<MenuItem value="" disabled>
								<em>Select a level…</em>
							</MenuItem>
							{levels?.map((level) => (
								<MenuItem key={level.id} value={level.id}>
									{level.name}
								</MenuItem>
							))}
						</Select>
						{errors.level_id && (
							<FormHelperText>{errors.level_id.message as string}</FormHelperText>
						)}
					</FormControl>
				)}
			/>

			{/* Reference — auto-generated, still editable */}
			<Controller
				name="reference"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="reference" required={isNew}>
							Reference
							{isNew && (
								<span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: 8, color: '#6b7280' }}>
									(auto-generated but editable)
								</span>
							)}
						</FormLabel>
						<TextField
							id="reference"
							{...field}
							value={field.value ?? ''}
							fullWidth
							disabled={!isNew}
							error={!!errors.reference}
							helperText={errors?.reference?.message as string}
						/>
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

			{/* Active */}
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
										if (isNew) field.onChange(e.target.checked);
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