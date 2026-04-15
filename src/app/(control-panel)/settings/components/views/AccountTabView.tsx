'use client';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import _ from 'lodash';
import { useEffect, useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useAccountSettings } from '../../api/hooks/account/useAccountSettings';
import { useUpdateAccountSettings } from '../../api/hooks/account/useUpdateAccountSettings';
import { useUpdateAccountAvatar } from '../../api/hooks/account/useUpdateAccountAvatar';
import type { UpdateAccountPayload } from '../../api/types';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const defaultValues = {
	user: {
		username: '',
		first_name: '',
		last_name: '',
		email: ''
	},
	phone: '',
	address: '',
	biography: ''
};

/**
 * Form Validation Schema — matches UpdateAccountSchema from backend
 */
const schema = z.object({
	user: z.object({
		username: z.string().min(1, 'Username is required'),
		first_name: z.string().nullable().optional(),
		last_name: z.string().nullable().optional(),
		email: z.string().email('Invalid email').nullable().optional()
	}),
	phone: z.string().min(1, 'Phone is required'),
	address: z.string().nullable().optional(),
	biography: z.string().nullable().optional()
});

type FormType = z.infer<typeof schema>;

function AccountTabView() {
	const { data: accountSettings } = useAccountSettings();
	const { mutate: updateAccountSettings } = useUpdateAccountSettings();
	const { mutate: updateAvatar, isPending: isUploadingAvatar } = useUpdateAccountAvatar();
	const avatarInputRef = useRef<HTMLInputElement>(null);

	const { control, reset, handleSubmit, formState } = useForm<FormType>({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	useEffect(() => {
		if (!accountSettings) return;
		reset({
			user: {
				username: accountSettings.user?.username ?? '',
				first_name: accountSettings.user?.first_name ?? '',
				last_name: accountSettings.user?.last_name ?? '',
				email: accountSettings.user?.email ?? ''
			},
			phone: accountSettings.phone ?? '',
			address: accountSettings.address ?? '',
			biography: accountSettings.biography ?? ''
		});
	}, [accountSettings, reset]);

	function onSubmit(formData: FormType) {
		updateAccountSettings(formData as UpdateAccountPayload);
	}

	return (
		<div className="w-full max-w-5xl">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex w-full flex-col gap-12"
			>
				<div className="flex flex-col gap-4">
					<div className="w-full">
						<Typography className="text-xl font-medium">Avatar</Typography>
						<Typography color="text.secondary">
							Click on the avatar to upload a new photo.
						</Typography>
					</div>
					<div className="flex flex-row items-center gap-4 max-w-xs">
						<Tooltip title="Click to change avatar">
							<IconButton
								onClick={() => avatarInputRef.current?.click()}
								disabled={isUploadingAvatar}
								sx={{ p: 0, flexShrink: 0, width: 64, height: 64 }}
							>
								<Avatar
									src={accountSettings?.avatar_url}
									alt={accountSettings?.avatar_alt ?? 'avatar'}
									sx={{ width: 64, height: 64 }}
								/>
							</IconButton>
						</Tooltip>
						<div className="flex flex-col items-start gap-1">
							<Button
								variant="outlined"
								size="small"
								startIcon={<FuseSvgIcon size={16}>lucide:upload</FuseSvgIcon>}
								onClick={() => avatarInputRef.current?.click()}
								disabled={isUploadingAvatar}
							>
								{isUploadingAvatar ? 'Uploading...' : 'Upload Photo'}
							</Button>
							<Typography variant="caption" color="text.secondary">
								JPG, PNG or GIF. Max 2MB.
							</Typography>
						</div>
						<input
							ref={avatarInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) updateAvatar(file);
								e.target.value = '';
							}}
						/>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="w-full">
						<Typography className="text-xl font-medium">Profile</Typography>
						<Typography color="text.secondary">
							Following information is publicly displayed, be careful!
						</Typography>
					</div>

					<div className="grid w-full gap-4 sm:grid-cols-4">
						<div className="sm:col-span-2">
							<Controller
								control={control}
								name="user.first_name"
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="first_name">First Name</FormLabel>
										<TextField
											{...field}
											value={field.value ?? ''}
											placeholder="First name"
											id="first_name"
											error={!!errors.user?.first_name}
											helperText={errors?.user?.first_name?.message}
											variant="outlined"
											fullWidth
											slotProps={{
												input: {
													startAdornment: (
														<FuseSvgIcon color="action">lucide:circle-user</FuseSvgIcon>
													)
												}
											}}
										/>
									</FormControl>
								)}
							/>
						</div>
						<div className="sm:col-span-2">
							<Controller
								control={control}
								name="user.last_name"
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="last_name">Last Name</FormLabel>
										<TextField
											{...field}
											value={field.value ?? ''}
											placeholder="Last name"
											id="last_name"
											error={!!errors.user?.last_name}
											helperText={errors?.user?.last_name?.message}
											variant="outlined"
											fullWidth
											slotProps={{
												input: {
													startAdornment: (
														<FuseSvgIcon color="action">lucide:circle-user</FuseSvgIcon>
													)
												}
											}}
										/>
									</FormControl>
								)}
							/>
						</div>
						<div className="sm:col-span-4">
							<Controller
								control={control}
								name="user.username"
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="username">Username</FormLabel>
										<TextField
											{...field}
											placeholder="Username"
											id="username"
											error={!!errors.user?.username}
											helperText={errors?.user?.username?.message}
											variant="outlined"
											required
											fullWidth
											slotProps={{
												input: {
													startAdornment: (
														<Typography color="text.secondary" className="italic">
															@
														</Typography>
													)
												}
											}}
										/>
									</FormControl>
								)}
							/>
						</div>
						<div className="sm:col-span-4">
							<Controller
								control={control}
								name="biography"
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="biography">Biography</FormLabel>
										<TextField
											{...field}
											value={field.value ?? ''}
											placeholder="Tell us about yourself"
											id="biography"
											error={!!errors.biography}
											variant="outlined"
											fullWidth
											multiline
											minRows={5}
											maxRows={10}
											slotProps={{
												input: {
													className: 'items-start gap-2',
													startAdornment: (
														<FuseSvgIcon className="mt-1" color="action">
															lucide:align-left
														</FuseSvgIcon>
													)
												}
											}}
											helperText={
												<span className="flex flex-col">
													<span>Brief description for your profile.</span>
													<span>{errors?.biography?.message}</span>
												</span>
											}
										/>
									</FormControl>
								)}
							/>
						</div>
					</div>
				</div>

				<div className="flex w-full flex-col gap-4">
					<div className="w-full">
						<Typography className="text-xl font-medium">Personal Information</Typography>
						<Typography color="text.secondary">
							Communication details kept private.
						</Typography>
					</div>
					<div className="grid w-full gap-4 sm:grid-cols-4">
						<div className="sm:col-span-2">
							<Controller
								control={control}
								name="user.email"
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="email">Email</FormLabel>
										<TextField
											{...field}
											value={field.value ?? ''}
											id="email"
											placeholder="Email"
											variant="outlined"
											fullWidth
											error={!!errors.user?.email}
											helperText={errors?.user?.email?.message}
											slotProps={{
												input: {
													startAdornment: (
														<FuseSvgIcon color="action">lucide:mail</FuseSvgIcon>
													)
												}
											}}
										/>
									</FormControl>
								)}
							/>
						</div>
						<div className="sm:col-span-2">
							<Controller
								control={control}
								name="phone"
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="phone">Phone Number</FormLabel>
										<TextField
											{...field}
											id="phone"
											placeholder="Phone Number"
											variant="outlined"
											fullWidth
											required
											error={!!errors.phone}
											helperText={errors?.phone?.message}
											slotProps={{
												input: {
													startAdornment: (
														<FuseSvgIcon color="action">lucide:phone</FuseSvgIcon>
													)
												}
											}}
										/>
									</FormControl>
								)}
							/>
						</div>
						<div className="sm:col-span-4">
							<Controller
								control={control}
								name="address"
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="address">Address</FormLabel>
										<TextField
											{...field}
											value={field.value ?? ''}
											id="address"
											placeholder="Postal address"
											variant="outlined"
											fullWidth
											error={!!errors.address}
											helperText={errors?.address?.message}
											slotProps={{
												input: {
													startAdornment: (
														<FuseSvgIcon color="action">lucide:map-pin</FuseSvgIcon>
													)
												}
											}}
										/>
									</FormControl>
								)}
							/>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-end gap-2">
					<Button
						variant="outlined"
						disabled={_.isEmpty(dirtyFields)}
						onClick={() => reset()}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						color="secondary"
						disabled={_.isEmpty(dirtyFields) || !isValid}
						type="submit"
					>
						Save
					</Button>
				</div>
			</form>
		</div>
	);
}

export default AccountTabView;
