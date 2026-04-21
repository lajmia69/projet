'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { Draggable } from '@hello-pangea/dnd';
import { format, fromUnixTime } from 'date-fns';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useScrumboardAppContext } from '../../../../contexts/ScrumboardAppContext/useScrumboardAppContext';
import { useGetStudioBoardCards } from '../../../../api/hooks/cards/useGetStudioBoardCards';

type BoardCardProps = {
	cardId: string;
	boardId: string;
	index: number;
};

function BoardCard({ cardId, boardId, index }: BoardCardProps) {
	const { openCardDialog } = useScrumboardAppContext();
	const { data: cards = [] } = useGetStudioBoardCards(boardId);
	const card = cards.find((c) => c.id === cardId);

	if (!card) return null;

	const isOverdue = card.dueDate && Math.floor(Date.now() / 1000) > card.dueDate;

	return (
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
						<Typography className="text-sm font-semibold leading-snug">
							{card.title}
						</Typography>

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
	);
}

export default BoardCard;