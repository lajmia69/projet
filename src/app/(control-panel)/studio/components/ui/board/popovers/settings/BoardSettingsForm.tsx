import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import IconButton from '@mui/material/IconButton';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import useNavigate from '@fuse/hooks/useNavigate';
import useParams from '@fuse/hooks/useParams';
import { useGetStudioBoard } from '../../../../../api/hooks/boards/useGetStudioBoard';
import { useDeleteStudioBoard } from '../../../../../api/hooks/boards/useDeleteStudioBoard';

type BoardSettingsFormProps = {
	onClose: () => void;
};

function BoardSettingsForm(props: BoardSettingsFormProps) {
	const { onClose } = props;
	const navigate = useNavigate();
	const routeParams = useParams<{ boardId: string }>();
	const { boardId } = routeParams;

	const { data: project } = useGetStudioBoard(boardId);
	const { mutateAsync: deleteProject } = useDeleteStudioBoard();

	const { watch, control, reset } = useForm({
		mode: 'onChange',
		defaultValues: { cardCoverImages: false, subscribed: true }
	});

	useEffect(() => {
		if (project) {
			reset({ cardCoverImages: false, subscribed: true });
		}
	}, [project, reset]);

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
