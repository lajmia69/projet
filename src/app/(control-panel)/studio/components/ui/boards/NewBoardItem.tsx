import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateStudioBoard } from '../../../api/hooks/boards/useCreateStudioBoard';
import { useGetProjectTypes } from '../../../api/hooks/boards/useGetProjectTypes';
import { CreateProductionProject } from '../../../api/types';
import MenuItem from '@mui/material/MenuItem';

const schema = z.object({
	name: z.string().nonempty('Name is required'),
	description: z.string().default(''),
	start_date: z.string().nonempty('Start date is required'),
	end_date: z.string().nonempty('End date is required'),
	project_type_id: z.coerce.number().min(1, 'Select a type')
});

type FormType = z.infer<typeof schema>;

function NewBoardItem() {
	const [open, setOpen] = useState(false);
	const { mutateAsync: createBoard } = useCreateStudioBoard();
	const { data: allProjectTypes = [] } = useGetProjectTypes();
	// Filter to show only Radio Episode type
	const projectTypes = allProjectTypes.filter((pt) => pt.project_class === 'Radio Episode');

	const today = new Date().toISOString().split('T')[0];

	const { control, handleSubmit, reset, formState } = useForm<FormType>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: '',
			description: '',
			start_date: today,
			end_date: today,
			project_type_id: 0
		}
	});

	function onSubmit(data: FormType) {
		createBoard({
			name: data.name,
			description: data.description,
			start_date: data.start_date,
			end_date: data.end_date,
			project_type_id: data.project_type_id
		} as CreateProductionProject).then(() => {
			reset();
			setOpen(false);
		});
	}

	return (
		<>
			<Box
				sx={{ borderColor: 'divider' }}
				className="hover:bg-hover flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors duration-150 ease-in-out"
				onClick={() => setOpen(true)}
				role="button"
				tabIndex={0}
			>
				<FuseSvgIcon size={48} color="disabled">lucide:plus</FuseSvgIcon>
			</Box>

			<Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
				<DialogTitle>New Production Project</DialogTitle>
				<DialogContent>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-4 pt-2"
					>
						<Controller
							name="name"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									label="Project name"
									fullWidth
									required
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								/>
							)}
						/>

						<Controller
							name="description"
							control={control}
							render={({ field }) => (
								<TextField {...field} label="Description" fullWidth multiline rows={2} />
							)}
						/>

						<Controller
							name="project_type_id"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									select
									label="Project type"
									fullWidth
									required
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
								>
									{projectTypes.map((pt) => (
										<MenuItem key={pt.id} value={pt.id ?? 0}>
											{pt.name}
										</MenuItem>
									))}
								</TextField>
							)}
						/>

						<div className="flex gap-4">
							<Controller
								name="start_date"
								control={control}
								render={({ field }) => (
									<TextField {...field} type="date" label="Start date" fullWidth InputLabelProps={{ shrink: true }} />
								)}
							/>
							<Controller
								name="end_date"
								control={control}
								render={({ field }) => (
									<TextField {...field} type="date" label="End date" fullWidth InputLabelProps={{ shrink: true }} />
								)}
							/>
						</div>

						<div className="flex justify-end gap-2 pt-2">
							<Button onClick={() => setOpen(false)}>Cancel</Button>
							<Button
								type="submit"
								variant="contained"
								color="secondary"
								disabled={formState.isSubmitting}
							>
								Create
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default NewBoardItem;