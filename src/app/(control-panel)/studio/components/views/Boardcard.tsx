import _ from 'lodash';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import { Draggable } from '@hello-pangea/dnd';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Chip from '@mui/material/Chip';
import { MouseEvent } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import { getUnixTime } from 'date-fns/getUnixTime';
import { format } from 'date-fns/format';
import { fromUnixTime } from 'date-fns/fromUnixTime';
import { useScrumboardAppContext } from '../../../../contexts/ScrumboardAppContext/useScrumboardAppContext';
import { useGetStudioBoardCards } from '../../../../api/hooks/cards/useGetStudioBoardCards';
import { ScrumboardCard } from '../../../../api/types';

const StyledCard = styled(Card)(({ theme }) => ({
	'& ': {
		transitionProperty: 'box-shadow',
		transitionDuration: theme.transitions.duration.short,
		transitionTimingFunction: theme.transitions.easing.easeInOut
	}
}));

type BoardCardProps = {
	cardId: string;
	index: number;
	boardId: string;
};

function BoardCard(props: BoardCardProps) {
	const { cardId, index, boardId } = props;
	const { openCardDialog } = useScrumboardAppContext();

	const { data: cards = [], isLoading } = useGetStudioBoardCards(boardId);
	const card = cards.find((c) => c.id === cardId);

	function handleCardClick(ev: MouseEvent<HTMLDivElement>, _card: ScrumboardCard) {
		ev.preventDefault();
		openCardDialog(_card);
	}

	if (isLoading) return <FuseLoading />;
	if (!card) return null;

	const isOverdue = card.dueDate && getUnixTime(new Date()) > card.dueDate;

	return (
		<Draggable draggableId={cardId} index={index}>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
				>
					<StyledCard
						className={clsx(
							snapshot.isDragging ? 'shadow-lg' : 'shadow-sm',
							'w-full cursor-pointer rounded-lg border-1'
						)}
						onClick={(ev) => handleCardClick(ev, card)}
					>
						<div className="p-4 pb-0">
							<Typography className="mb-3 font-medium">{card.title}</Typography>

							{card.description && (
								<Typography
									className="mb-2 text-sm line-clamp-2"
									color="text.secondary"
								>
									{card.description}
								</Typography>
							)}

							{card.dueDate && (
								<div className="mb-3">
									<Chip
										size="small"
										className={clsx(
											'text-xs font-semibold',
											isOverdue ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
										)}
										sx={{ '& .MuiChip-icon': { color: 'inherit' } }}
										icon={<FuseSvgIcon size={14} color="inherit">lucide:clock</FuseSvgIcon>}
										label={format(fromUnixTime(card.dueDate), 'MMM do yy')}
									/>
								</div>
							)}
						</div>

						<div className="flex h-10 items-center justify-between px-4">
							<div className="flex items-center gap-1.5">
								{card.description && (
									<FuseSvgIcon size={16} color="action">lucide:file-text</FuseSvgIcon>
								)}
								{card.memberIds.length > 0 && (
									<span className="flex items-center gap-0.5">
										<FuseSvgIcon size={16} color="action">lucide:users</FuseSvgIcon>
										<Typography color="text.secondary" className="text-xs">
											{card.memberIds.length}
										</Typography>
									</span>
								)}
							</div>
						</div>
					</StyledCard>
				</div>
			)}
		</Draggable>
	);
}

export default BoardCard;