import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import useUser from '@auth/useUser';
import { useRoleTypesList } from '@/app/(control-panel)/administration/roles/api/hooks/useRoleTypesList';
import FuseLoading from '@fuse/core/FuseLoading';

/**
 * The basic info tab.
 */
function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;
	const { data: currentAccount } = useUser();
	// const { data: role } = useRole(currentAccount.token, roleId);
	const { data: roleTypes, isLoading } = useRoleTypesList(currentAccount.token);
	// const handleChange = (event: SelectChangeEvent) => {
	// 	console.log(parseInt(event.target.value));
	// };

	// useEffect(() => {
	// 	// if (roleTypes) {
	// 	// 	reset({ ...roleTypes });
	// 	// }
	// }, []);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<div className="flex flex-col gap-4">
			<Controller
				name="name"
				control={control}
				// defaultValue={}
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
				name="type.id"
				control={control}
				// defaultValue={formState.defaultValues.type_id}
				render={({ field }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="type.id">Type</FormLabel>
						<Select
							id="type.id"
							{...field}
							value={field.value}
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
