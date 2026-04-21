import { useMemo } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useGetStudioBoard } from '../boards/useGetStudioBoard';
import { useGetTaskStatuses } from '../lists/useGetTaskStatuses';
import { useCurrentAccountId } from '../../useCurrentAccountId';
import { studioApiService } from '../../services/studioApiService';
import { useUpdateStudioBoardCard } from '../cards/useStudioCardMutations';
import { studioTasksQueryKey } from '../cards/useGetStudioBoardCards';
import { ProductionTask } from '../../types';

export function useScrumboardReorder(boardId: string) {
	const accountId = useCurrentAccountId();
	const queryClient = useQueryClient();
	const numericProjectId = Number(boardId);

	const { data: project } = useGetStudioBoard(boardId);
	const { data: statuses = [] } = useGetTaskStatuses();
	const { mutateAsync: updateTask } = useUpdateStudioBoardCard();

	// ── Subscribe to tasks reactively so the board memo reruns on changes ──
	const { data: rawTasks = [] } = useQuery<ProductionTask[]>({
		queryKey: studioTasksQueryKey(accountId, boardId),
		queryFn: async () => {
			const { items } = await studioApiService.getTasks(accountId);
			return items.filter((t) => t.production_project?.id === numericProjectId);
		},
		enabled: !!accountId && !!numericProjectId && !isNaN(numericProjectId)
	});

	// ── Board shape recomputed whenever project, statuses, or tasks change ──
	const board = useMemo(() => {
		if (!project || statuses.length === 0) return null;
		return studioApiService.adaptProjectToBoard(project, statuses, rawTasks);
	}, [project, statuses, rawTasks]);

	function reorderList(_result: DropResult) {
		// Column reordering not supported by the API
	}

	async function reorderCard(result: DropResult) {
		const { source, destination, draggableId } = result;
		if (!destination) return;

		const sourceStatusId = Number(source.droppableId);
		const destStatusId = Number(destination.droppableId);

		if (sourceStatusId === destStatusId && source.index === destination.index) return;

		const taskId = Number(draggableId);
		if (isNaN(taskId)) return;

		const task = rawTasks.find((t) => t.id === taskId);
		if (!task) return;

		const taskTypeId = task.task_type?.id;
		const staffLeaderId = task.staff_leader?.id;

		if (!taskTypeId || !staffLeaderId) {
			console.warn('[reorderCard] Missing task_type or staff_leader — skipping update', task);
			return;
		}

		await updateTask({
			id: task.id,
			name: task.name,
			description: task.description,
			start_date: task.start_date,
			end_date: task.end_date,
			note: task.note ?? '',
			task_type_id: taskTypeId,
			status_id: destStatusId,
			production_project_id: task.production_project?.id ?? numericProjectId,
			staff_leader_id: staffLeaderId,
			resources: task.resources?.map((r) => ({ id: r.id })) ?? null,
			guests: task.guests?.map((g) => ({ id: g.id })) ?? null,
			staffs: task.staffs?.map((s) => ({ id: s.id })) ?? null
		});
	}

	return { board, reorderList, reorderCard };
}