import TextField from '@mui/material/TextField';
// import Autocomplete from '@mui/material/Autocomplete';
import { Controller, useFormContext } from 'react-hook-form';
// import { Product } from '../../../../../api/types';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import useUser from '@auth/useUser';
import { useRoleTypesList } from '@/app/(control-panel)/administration/roles/api/hooks/useRoleTypesList';
import { useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
// import { useRole } from '@/app/(control-panel)/administration/roles/api/hooks/useRole';

/**
 * The basic info tab.
 */
function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState, reset } = methods;
	const { errors } = formState;
	const { data: currentAccount } = useUser();
	// const { data: role } = useRole(currentAccount.token, roleId);
	const { data: roleTypes, isLoading } = useRoleTypesList(currentAccount.token);
	// const handleChange = (event: SelectChangeEvent) => {
	// 	console.log(parseInt(event.target.value));
	// };

	useEffect(() => {
		if (roleTypes) {
			reset({ ...roleTypes });
		}
	}, [roleTypes, reset]);

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
							// onChange={handleChange}
						>
							{roleTypes.map((roleType) => {
								return (
									<MenuItem
										key={roleType.id}
										value={roleType.id}
									>
										{roleType.name}
									</MenuItem>
								);
							})}
						</Select>
					</FormControl>
				)}
			/>

			{/*<Controller*/}
			{/*	name="tags"*/}
			{/*	control={control}*/}
			{/*	defaultValue={[]}*/}
			{/*	render={({ field: { onChange, value } }) => (*/}
			{/*		<FormControl className="w-full">*/}
			{/*			<FormLabel htmlFor="tags">Tags</FormLabel>*/}
			{/*			<Autocomplete*/}
			{/*				multiple*/}
			{/*				freeSolo*/}
			{/*				options={[]}*/}
			{/*				value={value as Product['tags']}*/}
			{/*				onChange={(event, newValue) => {*/}
			{/*					onChange(newValue);*/}
			{/*				}}*/}
			{/*				renderInput={(params) => (*/}
			{/*					<TextField*/}
			{/*						{...params}*/}
			{/*						placeholder="Select multiple tags"*/}
			{/*					/>*/}
			{/*				)}*/}
			{/*			/>*/}
			{/*		</FormControl>*/}
			{/*	)}*/}
			{/*/>*/}
		</div>
	);
}

export default BasicInfoTab;
