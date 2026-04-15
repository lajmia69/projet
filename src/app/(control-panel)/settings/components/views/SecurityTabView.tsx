'use client';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import _ from 'lodash';
import { useEffect } from 'react';
import { useUpdateSecuritySettings } from '../../api/hooks/security/useUpdateSecuritySettings';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const defaultValues = {
	password: '',
	new_password: '',
	new_password_verification: ''
};

/**
 * Form Validation Schema — matches UpdateAccountPasswordSchema
 */
const schema = z
	.object({
		password: z.string().min(1, 'Current password is required'),
		new_password: z.string().min(6, 'New password must be at least 6 characters'),
		new_password_verification: z.string().min(1, 'Please confirm your new password')
	})
	.refine((data) => data.new_password === data.new_password_verification, {
		message: 'Passwords do not match',
		path: ['new_password_verification']
	});

type FormType = z.infer<typeof schema>;

function SecurityTabView() {
	const { mutate: updateSecuritySettings, isSuccess, error: updateError } = useUpdateSecuritySettings();

	const { control, setError, reset, handleSubmit, formState } = useForm<FormType>({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	// Reset form to blank after a successful password change
	useEffect(() => {
		if (isSuccess) {
			reset(defaultValues);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSuccess]);

	useEffect(() => {
		if (updateError) {
			setError('root', { type: 'manual', message: updateError.message });
		}
	}, [updateError, setError]);

	function onSubmit(formData: FormType) {
		updateSecuritySettings({
			password: formData.password || '',
			new_password: formData.new_password || '',
			new_password_verification: formData.new_password_verification || ''
		});
	}

	return (
		<div className="w-full max-w-5xl">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex w-full flex-col gap-12"
			>
				<div className="flex flex-col gap-4">
					<div className="w-full">
						<Typography className="text-xl font-medium">Change your password</Typography>
						<Typography color="text.secondary">
							You can only change your password twice within 24 hours!
						</Typography>
					</div>
					<div className="grid w-full gap-4 sm:grid-cols-4">
						<div className="sm:col-span-4">
							<Controller
								name="password"
								control={control}
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="password">Current password</FormLabel>
										<TextField
											{...field}
											id="password"
											type="password"
											error={!!errors.password}
											helperText={errors?.password?.message}
											variant="outlined"
											fullWidth
											slotProps={{
												input: {
													startAdornment: <FuseSvgIcon color="action">lucide:key</FuseSvgIcon>
												}
											}}
										/>
									</FormControl>
								)}
							/>
						</div>
						<div className="sm:col-span-4">
							<Controller
								name="new_password"
								control={control}
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="new_password">New password</FormLabel>
										<TextField
											{...field}
											id="new_password"
											type="password"
											error={!!errors.new_password}
											helperText={errors?.new_password?.message}
											variant="outlined"
											fullWidth
											slotProps={{
												input: {
													startAdornment: <FuseSvgIcon color="action">lucide:key</FuseSvgIcon>
												}
											}}
										/>
									</FormControl>
								)}
							/>
						</div>
						<div className="sm:col-span-4">
							<Controller
								name="new_password_verification"
								control={control}
								render={({ field }) => (
									<FormControl className="w-full">
										<FormLabel htmlFor="new_password_verification">Confirm new password</FormLabel>
										<TextField
											{...field}
											id="new_password_verification"
											type="password"
											error={!!errors.new_password_verification}
											helperText={errors?.new_password_verification?.message}
											variant="outlined"
											fullWidth
											slotProps={{
												input: {
													startAdornment: <FuseSvgIcon color="action">lucide:key</FuseSvgIcon>
												}
											}}
										/>
									</FormControl>
								)}
							/>
						</div>
					</div>
				</div>

				{errors.root && (
					<Typography color="error">{errors.root.message}</Typography>
				)}

				<div className="flex items-center justify-end gap-2">
					<Button
						variant="outlined"
						disabled={_.isEmpty(dirtyFields)}
						onClick={() => reset(defaultValues)}
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

export default SecurityTabView;
