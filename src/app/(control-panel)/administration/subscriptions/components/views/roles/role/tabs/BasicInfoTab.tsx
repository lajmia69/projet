import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import useUser from '@auth/useUser';
import { useRoleTypesList } from '@/app/(control-panel)/administration/roles/api/hooks/useRoleTypesList';
import FuseLoading from '@fuse/core/FuseLoading';

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;
	const { data: currentAccount } = useUser();
	const { data: roleTypes, isLoading } = useRoleTypesList(currentAccount.token);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<div className="flex flex-col gap-4">
			<Controller
				name="name"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="name">Name</FormLabel>
						<TextField
							id="name"
							{...field}
							value={field.value || ''}
							required
							autoFocus
							fullWidth
							error={!!errors.name}
							helperText={errors?.name?.message as string}
						/>
					</FormControl>
				)}
			/>

			<Controller
				name="type_id"
				control={control}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="type_id">Type</FormLabel>
						<Select
							id="type_id"
							{...field}
							value={field.value ?? 1}
							required
						>
							{roleTypes.map((roleType) => (
								<MenuItem key={roleType.id} value={roleType.id}>
									{roleType.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				)}
			/>
		</div>
	);
}

export default BasicInfoTab;