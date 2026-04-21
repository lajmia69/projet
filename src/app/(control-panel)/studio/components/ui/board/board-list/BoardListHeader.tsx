import { Controller, useForm } from 'react-hook-form';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, MouseEvent } from 'react';
import _ from 'lodash';
import Box from '@mui/material/Box';
import { darken } from '@mui/material/styles';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnackbar } from 'notistack';
import { useUpdateTaskStatus, useDeleteTaskStatus } from '../../../../api/hooks/lists/useTaskStatusMutations';

const schema = z.object({
	title: z.string().nonempty('You must enter a title')
});

type FormType = z.infer<typeof schema>;

type BoardListHeaderProps = {
	statusId: number;
	statusName: string;
	boardId: string;
	cardCount: number;
	handleProps: DraggableProvidedDragHandleProps | null | undefined;
	className?: string;
};

function BoardListHeader(props: BoardListHeaderProps) {
	const { statusId, statusName, cardCount, className, handleProps } = props;

	const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null);
	const [formOpen, setFormOpen] = useState(false);

	const { enqueueSnackbar } = useSnackbar();
	const { mutateAsync: updateStatus } = useUpdateTaskStatus();
	const { mutateAsync: deleteStatus } = useDeleteTaskStatus();

	const { control, formState, handleSubmit, reset } = useForm<FormType>({
		mode: 'onChange',
		defaultValues: { title: statusName },
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields } = formState;

	useEffect(() => {
		if (!formOpen) reset({ title: statusName });
	}, [formOpen, reset, statusName]);

	function handleMenuClick(event: MouseEvent<HTMLButtonElement>) {
		setAnchorEl(event.currentTarget);
	}
	function handleMenuClose() {
		setAnchorEl(null);
	}
	function handleOpenForm(ev: MouseEvent<HTMLAnchorElement | HTMLLIElement>) {
		ev.stopPropagation();
		setFormOpen(true);
	}
	function handleCloseForm() {
		setFormOpen(false);
	}

	function onSubmit(data: FormType) {
		updateStatus({ id: statusId, name: data.title });
		handleCloseForm();
	}

	// ✅ FIX: Catch the 403 "already used" error from the backend and show it
	// in a snackbar instead of letting it crash silently.
	async function handleDeleteColumn() {
		handleMenuClose();
		try {
			await deleteStatus(statusId);
		} catch (err) {
			// Extract the human-readable detail from the API error message if available.
			// The error message is in the form: "Studio API error 403 on /...: {"detail": "..."}"
			let userMessage = 'Could not delete column.';
			if (err instanceof Error) {
				const detailMatch = err.message.match(/"detail"\s*:\s*"([^"]+)"/);
				if (detailMatch) {
					userMessage = detailMatch[1];
				}
			}
			enqueueSnackbar(userMessage, { variant: 'error' });
		}
	}

	return (
		<div {...handleProps}>
			<div className={clsx('flex h-12 items-center justify-between px-3 sm:h-14', className)}>
				<div className="flex min-w-0 items-center">
					{formOpen ? (
						<ClickAwayListener onClickAway={handleCloseForm}>
							<form className="flex w-full" onSubmit={handleSubmit(onSubmit)}>
								<Controller
									name="title"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											variant="outlined"
											margin="none"
											autoFocus
											size="small"
											slotProps={{
												input: {
													endAdornment: (
														<InputAdornment position="end">
															<IconButton
																type="submit"
																disabled={_.isEmpty(dirtyFields) || !isValid}
																size="large"
															>
																<FuseSvgIcon>lucide:check</FuseSvgIcon>
															</IconButton>
														</InputAdornment>
													)
												}
											}}
										/>
									)}
								/>
							</form>
						</ClickAwayListener>
					) : (
						<Typography
							className="cursor-pointer text-base font-medium"
							onClick={handleOpenForm}
						>
							{statusName}
						</Typography>
					)}
				</div>

				<div className="flex items-center">
					<Box
						className="mx-1 flex h-6 min-w-6 items-center justify-center rounded-full text-sm leading-[2] font-semibold"
						sx={{
							backgroundColor: (theme) =>
								darken(theme.palette.background.default, theme.palette.mode === 'light' ? 0.1 : 0.3),
							color: 'text.secondary'
						}}
					>
						{cardCount}
					</Box>
					<IconButton aria-haspopup="true" onClick={handleMenuClick} size="small">
						<FuseSvgIcon>lucide:ellipsis-vertical</FuseSvgIcon>
					</IconButton>
					<Menu
						id="actions-menu"
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleMenuClose}
					>
						<MenuItem onClick={handleDeleteColumn}>
							<ListItemIcon className="min-w-9">
								<FuseSvgIcon>lucide:trash</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Remove Column" />
						</MenuItem>
						<MenuItem onClick={handleOpenForm}>
							<ListItemIcon className="min-w-9">
								<FuseSvgIcon>lucide:pencil</FuseSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Rename Column" />
						</MenuItem>
					</Menu>
				</div>
			</div>
		</div>
	);
}

export default BoardListHeader;