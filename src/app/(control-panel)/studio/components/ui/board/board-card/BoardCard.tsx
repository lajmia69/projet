'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { format, fromUnixTime } from 'date-fns';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useScrumboardAppContext } from '../../../../contexts/ScrumboardAppContext/useScrumboardAppContext';
import { useGetStudioBoardCards } from '../../../../api/hooks/cards/useGetStudioBoardCards';
import { useDeleteStudioBoardCard } from '../../../../api/hooks/cards/useStudioCardMutations';
import { useSnackbar } from 'notistack';

type BoardCardProps = {
	cardId: string;
	boardId: string;
	index: number;
};

function BoardCard({ cardId, boardId, index }: BoardCardProps) {
	const { openCardDialog } = useScrumboardAppContext();
	const { data: cards = [] } = useGetStudioBoardCards(boardId);
	const { mutateAsync: deleteCard, isPending: isDeleting } = useDeleteStudioBoardCard(boardId);
	const { enqueueSnackbar } = useSnackbar();

	const [confirmOpen, setConfirmOpen] = useState(false);

	const card = cards.find((c) => c.id === cardId);

	if (!card) return null;

	const isOverdue = card.dueDate && Math.floor(Date.now() / 1000) > card.dueDate;

	async function handleConfirmDelete() {
		try {
			await deleteCard(Number(cardId));
			setConfirmOpen(false);
			enqueueSnackbar('Card deleted', { variant: 'success' });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to delete card.';
			enqueueSnackbar(message, { variant: 'error' });
		}
	}

	return (
		<>
			<Draggable draggableId={cardId} index={index}>
				{(provided, snapshot) => (
					<div
						ref={provided.innerRef}
						{...provided.draggableProps}
						{...provided.dragHandleProps}
					>
						<Card
							className="cursor-pointer rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-150"
							onClick={() => openCardDialog(card)}
							elevation={snapshot.isDragging ? 4 : 1}
						>
							<div className="flex items-start justify-between gap-1">
								<Typography className="text-sm font-semibold leading-snug flex-1 min-w-0">
									{card.title}
								</Typography>
								<Tooltip title="Delete card">
									<IconButton
										size="small"
										color="error"
										onClick={(e) => {
											e.stopPropagation();
											setConfirmOpen(true);
										}}
										sx={{ mt: '-4px', mr: '-4px', flexShrink: 0 }}
									>
										<FuseSvgIcon size={14}>lucide:trash-2</FuseSvgIcon>
									</IconButton>
								</Tooltip>
							</div>

							{card.description && (
								<Typography
									className="text-xs mt-1 line-clamp-2"
									color="text.secondary"
								>
									{card.description}
								</Typography>
							)}

							<div className="flex items-center flex-wrap gap-2 mt-2">
								{card.dueDate && (
									<div className="flex items-center gap-1">
										<FuseSvgIcon size={12} color="action">
											lucide:calendar
										</FuseSvgIcon>
										<Chip
											size="small"
											label={format(fromUnixTime(card.dueDate), 'MMM d')}
											className="text-xs h-5"
											color={isOverdue ? 'error' : 'default'}
										/>
									</div>
								)}

								{card.memberIds.length > 0 && (
									<div className="flex items-center gap-1">
										<FuseSvgIcon size={12} color="action">
											lucide:users
										</FuseSvgIcon>
										<Typography variant="caption" color="text.secondary">
											{card.memberIds.length}
										</Typography>
									</div>
								)}

								{card.resources.length > 0 && (
									<div className="flex items-center gap-1">
										<FuseSvgIcon size={12} color="action">
											lucide:package
										</FuseSvgIcon>
										<Typography variant="caption" color="text.secondary">
											{card.resources.length} resource
											{card.resources.length !== 1 ? 's' : ''}
										</Typography>
									</div>
								)}
							</div>
						</Card>
					</div>
				)}
			</Draggable>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
				<DialogTitle>Delete card?</DialogTitle>
				<DialogContent>
					<Typography className="text-sm">
						Are you sure you want to delete <strong>{card.title}</strong>? This cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						color="error"
						variant="contained"
						onClick={handleConfirmDelete}
						disabled={isDeleting}
					>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default BoardCard;