import { useMemo } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { useGetStudioBoard } from '../boards/useGetStudioBoard';
import { useGetTaskStatuses } from '../lists/useGetTaskStatuses';
import { useGetStudioBoardCards } from '../cards/useGetStudioBoardCards';
import { useCurrentAccountId } from '../../useCurrentAccountId';
import { studioApiService } from '../../services/studioApiService';
import { useUpdateStudioBoardCard } from '../cards/useStudioCardMutations';
import { useQueryClient } from '@tanstack/react-query';
import { studioTasksQueryKey } from '../cards/useGetStudioBoardCards';
import { ProductionTask } from '../../types';

/**
 * Provides drag-and-drop reorder handlers and the adapted board shape.
 *
 * - reorderList  → list (column) drag: no-op because the API has no
 *                  explicit column ordering; columns are ordered by status ID.
 * - reorderCard  → card drag between columns: updates task status via API.
 */
export function useScrumboardReorder(boardId: string) {
	const accountId = useCurrentAccountId();
	const queryClient = useQueryClient();

	const { data: project } = useGetStudioBoard(boardId);
	const { data: statuses = [] } = useGetTaskStatuses();
	const { mutateAsync: updateTask } = useUpdateStudioBoardCard();

	// Raw tasks (not adapted) — needed so we can send the full payload on update
	const numericProjectId = Number(boardId);
	const rawTasksQueryKey = studioTasksQueryKey(accountId, boardId);

	const board = useMemo(() => {
		if (!project || statuses.length === 0) return null;

		// Get raw tasks from query cache (already fetched by useGetStudioBoardCards)
		const cached = queryClient.getQueryData<ProductionTask[]>(rawTasksQueryKey) ?? [];

		return studioApiService.adaptProjectToBoard(project, statuses, cached);
	}, [project, statuses, queryClient, rawTasksQueryKey]);

	function reorderList(_result: DropResult) {
		// Column reordering is not supported by the API — statuses keep their natural order.
		// A future enhancement could store a sort_order field per status.
	}

	async function reorderCard(result: DropResult) {
		const { source, destination, draggableId } = result;
		if (!destination) return;

		const sourceStatusId = Number(source.droppableId);
		const destStatusId = Number(destination.droppableId);

		// Same column, same position — nothing to do
		if (sourceStatusId === destStatusId && source.index === destination.index) return;

		const taskId = Number(draggableId);
		if (isNaN(taskId)) return;

		// Retrieve the raw task from query cache to build the full update payload
		const cached = queryClient.getQueryData<ProductionTask[]>(rawTasksQueryKey) ?? [];
		const task = cached.find((t) => t.id === taskId);
		if (!task) return;

		await updateTask({
			id: task.id,
			name: task.name,
			description: task.description,
			start_date: task.start_date,
			end_date: task.end_date,
			note: task.note,
			task_type_id: task.task_type?.id ?? 0,
			status_id: destStatusId,
			production_project_id: task.production_project?.id ?? numericProjectId,
			staff_leader_id: task.staff_leader?.id ?? 0,
			resources: (task.resources ?? []).map((r) => ({ id: r.id })),
			guests: (task.guests ?? []).map((g) => ({ id: g.id })),
			staffs: (task.staffs ?? []).map((s) => ({ id: s.id }))
		});
	}

	return { board, reorderList, reorderCard };
}
