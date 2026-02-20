// File: src/app/(control-panel)/administration/roles/components/views/roles/role/tabs/RoleBasicInfoTab.tsx

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Controller, useFormContext } from 'react-hook-form';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const ROLE_TYPES = [
	'Contact',
	'SuperAdmin',
	'ContentAdmin',
	'MemberAdmin',
	'StudioAdmin',
	'RadioContentCreator',
	'PodcastContentCreator',
	'CultureContentCreator',
	'Teacher',
	'StudioStaff',
	'Member',
	'Application'
];

/**
 * The role basic info tab.
 */
function RoleBasicInfoTab() {
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;

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
				name="type"
				control={control}
				render={({ field: { onChange, value } }) => (
					<FormControl className="w-full">
						<FormLabel htmlFor="type">Type</FormLabel>
						<Autocomplete
							options={ROLE_TYPES}
							value={value || ''}
							onChange={(event, newValue) => {
								onChange(newValue || '');
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									placeholder="Select a role type"
									id="type"
									required
								/>
							)}
						/>
					</FormControl>
				)}
			/>
		</div>
	);
}

export default RoleBasicInfoTab;