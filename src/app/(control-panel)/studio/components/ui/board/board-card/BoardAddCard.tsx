import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCurrentAccountId } from '../../../../api/useCurrentAccountId';
import { useCreateStudioBoardCard } from '../../../../api/hooks/cards/useStudioCardMutations';
import { useGetTaskResources } from '../../../../api/hooks/resources/useGetTaskResources';
import { useGetTaskTypes } from '../../../../api/hooks/cards/useGetTaskTypes';

type BoardAddCardProps = {
	boardId: string;
	statusId: number;
	onCardAdded?: () => void;
};

function BoardAddCard({ boardId, statusId, onCardAdded }: BoardAddCardProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [selectedResourceIds, setSelectedResourceIds] = useState<number[]>([]);
	const [error, setError] = useState<string | null>(null);

	const accountId = useCurrentAccountId();
	const { mutateAsync: createCard, isPending } = useCreateStudioBoardCard();
	const { data: availableResources = [] } = useGetTaskResources();
	const { data: taskTypes = [], isLoading: taskTypesLoading } = useGetTaskTypes();

	const firstTaskTypeId = taskTypes[0]?.id ?? null;
	const noTaskTypes = !taskTypesLoading && taskTypes.length === 0;

	async function handleSubmit() {
		const trimmed = title.trim();
		if (!trimmed) return;

		if (!accountId) {
			setError('User account not ready yet. Please wait a moment and try again.');
			return;
		}

		if (!firstTaskTypeId) {
			setError('No task types configured. Ask an admin to add one in Studio settings.');
			return;
		}

		if (!statusId || !Number.isInteger(statusId) || statusId <= 0) {
			setError('Invalid column status. Please refresh the page and try again.');
			return;
		}

		setError(null);

		try {
			await createCard({
				name: trimmed,
				description: description.trim(),
				note: '',
				start_date: new Date().toISOString().split('T')[0],
				end_date: new Date().toISOString().split('T')[0],
				task_type_id: firstTaskTypeId,
				status_id: statusId,
				production_project_id: Number(boardId),
				staff_leader_id: accountId,
				resources: selectedResourceIds.length > 0
					? selectedResourceIds.map((id) => ({ id }))
					: null,
				guests: null,
				staffs: null,
			});

			setTitle('');
			setDescription('');
			setSelectedResourceIds([]);
			setError(null);
			setOpen(false);
			onCardAdded?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create card. Please try again.');
		}
	}

	if (!open) {
		return (
			<Button
				className="w-full justify-start px-1 py-2 text-sm"
				size="small"
				startIcon={<FuseSvgIcon size={16}>lucide:plus</FuseSvgIcon>}
				onClick={() => setOpen(true)}
			>
				Add card
			</Button>
		);
	}

	return (
		<ClickAwayListener onClickAway={() => { setOpen(false); setError(null); }}>
			<div className="flex flex-col gap-2 pt-1">
				{error && (
					<Alert severity="error" className="text-xs py-1">
						{error}
					</Alert>
				)}

				{noTaskTypes && (
					<Alert severity="warning" className="text-xs py-1">
						No task types exist yet. An admin must create at least one before cards can be added.
					</Alert>
				)}

				<TextField
					autoFocus
					size="small"
					fullWidth
					placeholder="Card title…"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') handleSubmit();
						if (e.key === 'Escape') { setOpen(false); setError(null); }
					}}
				/>
				<TextField
					size="small"
					fullWidth
					multiline
					rows={2}
					placeholder="Description (optional)"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>

				{availableResources.length > 0 && (
					<TextField
						select
						size="small"
						fullWidth
						label="Resources"
						value={selectedResourceIds}
						onChange={(e) => {
							const val = e.target.value;
							setSelectedResourceIds(
								typeof val === 'string' ? val.split(',').map(Number) : (val as number[])
							);
						}}
						SelectProps={{
							multiple: true,
							renderValue: (selected) => {
								const ids = selected as number[];
								return availableResources
									.filter((r) => r.id !== null && ids.includes(r.id as number))
									.map((r) => r.name)
									.join(', ');
							}
						}}
					>
						{availableResources.map((resource) => (
							<MenuItem key={resource.id} value={resource.id ?? 0}>
								<Checkbox
									checked={
										resource.id !== null &&
										selectedResourceIds.includes(resource.id as number)
									}
								/>
								<ListItemText
									primary={resource.name}
									secondary={resource.description || undefined}
								/>
							</MenuItem>
						))}
					</TextField>
				)}

				<div className="flex gap-2 items-center">
					<Button
						size="small"
						variant="contained"
						color="secondary"
						disabled={!title.trim() || isPending || noTaskTypes || taskTypesLoading || !accountId}
						onClick={handleSubmit}
						startIcon={isPending ? <CircularProgress size={12} color="inherit" /> : undefined}
					>
						{isPending ? 'Adding…' : 'Add'}
					</Button>
					<Button size="small" onClick={() => { setOpen(false); setError(null); }}>
						Cancel
					</Button>
				</div>
			</div>
		</ClickAwayListener>
	);
}

export default BoardAddCard;