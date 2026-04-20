import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import useNavigate from '@fuse/hooks/useNavigate';
import useParams from '@fuse/hooks/useParams';
import { useGetStudioBoard } from '../../../../../api/hooks/boards/useGetStudioBoard';
import { useDeleteStudioBoard } from '../../../../../api/hooks/boards/useDeleteStudioBoard';
import { useUpdateStudioBoard } from '../../../../../api/hooks/boards/useUpdateStudioBoard';
import { useGetProjectStatuses } from '../../../../../api/hooks/boards/useGetProjectStatuses';
type BoardSettingsFormProps = {
	onClose: () => void;
};

function BoardSettingsForm(props: BoardSettingsFormProps) {
	const { onClose } = props;
	const navigate = useNavigate();
	const routeParams = useParams<{ boardId: string }>();
	const { boardId } = routeParams;

	const { data: project } = useGetStudioBoard(boardId);
	const { data: projectStatuses = [], isLoading: statusesLoading } = useGetProjectStatuses();
	const { mutateAsync: deleteProject } = useDeleteStudioBoard();
	const { mutateAsync: updateProject, isPending: isUpdating } = useUpdateStudioBoard();

	const { watch, control, reset } = useForm({
		mode: 'onChange',
		defaultValues: {
			cardCoverImages: false,
			subscribed: true,
			status_id: 0
		}
	});

	useEffect(() => {
		if (project) {
			reset({
				cardCoverImages: false,
				subscribed: true,
				status_id: project.status?.id ?? 0
			});
		}
	}, [project, reset]);

	// Watch status changes and persist immediately
	const statusId = watch('status_id');

	useEffect(() => {
		if (!project || !statusId || statusId === (project.status?.id ?? 0)) return;

		updateProject({
			id: project.id,
			name: project.name,
			description: project.description,
			start_date: project.start_date,
			end_date: project.end_date,
			note: project.note,
			status_id: Number(statusId)
		});
	}, [statusId]);	// eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="relative w-full">
			<IconButton
				className="absolute top-0 right-0 z-10 m-1"
				onClick={onClose}
				color="inherit"
				size="small"
			>
				<FuseSvgIcon>lucide:x</FuseSvgIcon>
			</IconButton>

			<List className="pt-8">
				{/* ── Project Status ─────────────────────────────── */}
				<ListItem>
					<ListItemIcon>
						<FuseSvgIcon>lucide:tag</FuseSvgIcon>
					</ListItemIcon>
					<Controller
						name="status_id"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								select
								label="Project Status"
								size="small"
								fullWidth
								disabled={statusesLoading || isUpdating}
								InputProps={{
									endAdornment: isUpdating ? (
										<CircularProgress size={16} className="mr-6" />
									) : undefined
								}}
							>
								{projectStatuses.map((s) => (
									<MenuItem key={s.id} value={s.id ?? 0}>
										{s.name}
									</MenuItem>
								))}
							</TextField>
						)}
					/>
				</ListItem>

				{/* ── Card Cover Images ──────────────────────────── */}
				<ListItem>
					<ListItemIcon>
						<FuseSvgIcon>lucide:image</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primary="Card Cover Images" />
					<Controller
						name="cardCoverImages"
						control={control}
						render={({ field: { onChange, value } }) => (
							<Switch onChange={(ev) => onChange(ev.target.checked)} checked={value} />
						)}
					/>
				</ListItem>

				{/* ── Subscribe ──────────────────────────────────── */}
				<Controller
					name="subscribed"
					control={control}
					render={({ field: { onChange, value } }) => (
						<ListItem>
							<ListItemIcon>
								<FuseSvgIcon>{value ? 'lucide:eye' : 'lucide:eye-off'}</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Subscribe" />
							<Switch onChange={(ev) => onChange(ev.target.checked)} checked={value} />
						</ListItem>
					)}
				/>

				{/* ── Delete Board ───────────────────────────────── */}
				<ListItemButton
					className="px-4"
					onClick={() => {
						if (!project?.id) return;
						deleteProject(Number(project.id)).then(() => {
							navigate('/studio/boards');
						});
					}}
				>
					<ListItemIcon>
						<FuseSvgIcon>lucide:trash</FuseSvgIcon>
					</ListItemIcon>
					<ListItemText primary="Delete Board" />
				</ListItemButton>
			</List>
		</div>
	);
}

export default BoardSettingsForm;