// src/app/(control-panel)/studio/components/ui/board/board-card/BoardAddCard.tsx
import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCurrentAccountId } from '../../../../api/useCurrentAccountId';
import { useCreateStudioBoardCard } from '../../../../api/hooks/cards/useStudioCardMutations';
import { useGetTaskResources } from '../../../../api/hooks/resources/useGetTaskResources';
import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../../../api/services/studioApiService';

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

	const accountId = useCurrentAccountId();
	const { mutateAsync: createCard, isPending } = useCreateStudioBoardCard();
	const { data: availableResources = [] } = useGetTaskResources();

	// ✅ Fetch real task types instead of hardcoding id: 1
	const { data: taskTypes = [] } = useQuery({
		queryKey: ['studio', 'task-types', accountId],
		queryFn: async () => {
			const { items } = await studioApiService.getTaskTypes(accountId);
			return items;
		},
		enabled: !!accountId
	});

	async function handleSubmit() {
		const trimmed = title.trim();
		if (!trimmed) return;

		// ✅ Use the first real task type id from the API
		const taskTypeId = taskTypes[0]?.id ?? 0;

		await createCard({
			name: trimmed,
			description: description.trim(),
			start_date: new Date().toISOString().split('T')[0],
			end_date: new Date().toISOString().split('T')[0],
			task_type_id: taskTypeId,
			status_id: statusId,
			production_project_id: Number(boardId),
			staff_leader_id: accountId,
			resources: selectedResourceIds.map((id) => ({ id })),
			guests: [],
			staffs: []
		});

		setTitle('');
		setDescription('');
		setSelectedResourceIds([]);
		setOpen(false);
		onCardAdded?.();
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
		<ClickAwayListener onClickAway={() => setOpen(false)}>
			<div className="flex flex-col gap-2 pt-1">
				<TextField
					autoFocus
					size="small"
					fullWidth
					placeholder="Card title…"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') handleSubmit();
						if (e.key === 'Escape') setOpen(false);
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
				<div className="flex gap-2">
					<Button
						size="small"
						variant="contained"
						color="secondary"
						disabled={!title.trim() || isPending || taskTypes.length === 0}
						onClick={handleSubmit}
					>
						{isPending ? 'Adding…' : 'Add'}
					</Button>
					<Button size="small" onClick={() => setOpen(false)}>
						Cancel
					</Button>
				</div>
			</div>
		</ClickAwayListener>
	);
}

export default BoardAddCard;