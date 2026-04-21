import Card from '@mui/material/Card';
import { lighten, styled } from '@mui/material/styles';
import CardContent from '@mui/material/CardContent';
import clsx from 'clsx';
import { useRef } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import BoardAddCard from '../board-card/BoardAddCard';
import BoardCard from '../board-card/BoardCard';
import BoardListHeader from './BoardListHeader';
import { useGetTaskStatuses } from '../../../../api/hooks/lists/useGetTaskStatuses';

const StyledCard = styled(Card)(({ theme }) => ({
	'&': {
		transitionProperty: 'box-shadow',
		transitionDuration: theme.transitions.duration.short,
		transitionTimingFunction: theme.transitions.easing.easeInOut
	}
}));

type BoardListProps = {
	boardId: string;
	listId: string;
	cardIds: string[];
	index: number;
};

function BoardList(props: BoardListProps) {
	const { boardId, listId, cardIds, index } = props;
	const contentScrollEl = useRef<HTMLDivElement>(null);

	const { data: statuses = [] } = useGetTaskStatuses();
	const status = statuses.find((s) => String(s.id) === listId);

	function handleCardAdded() {
		if (contentScrollEl.current) {
			contentScrollEl.current.scrollTop = contentScrollEl.current.scrollHeight;
		}
	}

	if (!status) return null;

	const numericStatusId = Number(status.id);

	if (!Number.isInteger(numericStatusId) || numericStatusId <= 0) return null;

	return (
		<Draggable draggableId={listId} index={index}>
			{(provided, snapshot) => (
				<div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
					<StyledCard
						sx={(theme) => ({
							backgroundColor: lighten(theme.palette.background.default, 0.02),
							...theme.applyStyles('light', {
								backgroundColor: lighten(theme.palette.background.default, 0.4)
							})
						})}
						className={clsx(
							snapshot.isDragging ? 'shadow-lg' : 'shadow-0',
							'mx-2 flex max-h-full w-64 flex-col rounded-lg border sm:w-80'
						)}
						square
					>
						<BoardListHeader
							statusId={numericStatusId}
							statusName={status.name}
							cardCount={cardIds.length}
							boardId={boardId}
							className="border-b-1"
							handleProps={provided.dragHandleProps}
						/>

						{/*
						 * ✅ FIX: overflow-auto has been removed from CardContent and moved
						 * onto the Droppable's inner div (via ref + style below).
						 *
						 * @hello-pangea/dnd requires that a Droppable has exactly ONE scroll
						 * parent. When CardContent had overflow-auto it became a scroll
						 * container that sat between the board's outer scroll container and
						 * the Droppable, causing the "unsupported nested scroll container"
						 * warning and breaking drag-and-drop entirely.
						 *
						 * The fix: CardContent is now overflow-hidden (not scrollable), and
						 * the droppable inner div is the sole scrollable element for cards.
						 */}
						<CardContent
							className="flex h-full min-h-0 w-full flex-auto flex-col overflow-hidden p-0"
						>
							<Droppable droppableId={listId} direction="vertical" type="card">
								{(_provided) => (
									<div
										ref={(el) => {
											// Forward ref to both @hello-pangea/dnd and our scroll helper
											(_provided.innerRef as React.RefCallback<HTMLDivElement>)(el);
											(contentScrollEl as React.MutableRefObject<HTMLDivElement | null>).current = el;
										}}
										// This div is now the ONLY scroll container for cards.
										className="flex min-h-0.25 w-full flex-col gap-3 p-3 overflow-y-auto"
										style={{ maxHeight: '100%' }}
									>
										{cardIds.map((cardId, idx) => (
											<BoardCard
												key={cardId}
												cardId={cardId}
												boardId={boardId}
												index={idx}
											/>
										))}
										{_provided.placeholder}
									</div>
								)}
							</Droppable>
						</CardContent>

						<div className="px-3 pb-3">
							<BoardAddCard
								boardId={boardId}
								statusId={numericStatusId}
								onCardAdded={handleCardAdded}
							/>
						</div>
					</StyledCard>
				</div>
			)}
		</Draggable>
	);
}

export default BoardList;