import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCurrentAccountId } from '../../../../api/useCurrentAccountId';
import { useCreateStudioBoardCard } from '../../../../api/hooks/cards/useStudioCardMutations';

type BoardAddCardProps = {
	boardId: string;
	statusId: number;
	onCardAdded?: () => void;
};

function BoardAddCard({ boardId, statusId, onCardAdded }: BoardAddCardProps) {
	const [open, setOpen] = useState(false);
	const [title, setTitle] = useState('');
	const accountId = useCurrentAccountId();
	const { mutateAsync: createCard, isPending } = useCreateStudioBoardCard();

	async function handleSubmit() {
		const trimmed = title.trim();
		if (!trimmed) return;

		await createCard({
			name: trimmed,
			description: '',
			start_date: new Date().toISOString().split('T')[0],
			end_date: new Date().toISOString().split('T')[0],
			task_type_id: 1,
			status_id: statusId,
			production_project_id: Number(boardId),
			staff_leader_id: accountId,
			resources: [],
			guests: [],
			staffs: []
		});

		setTitle('');
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
				<div className="flex gap-2">
					<Button
						size="small"
						variant="contained"
						color="secondary"
						disabled={!title.trim() || isPending}
						onClick={handleSubmit}
					>
						Add
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
