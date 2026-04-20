'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import BoardTitle from './BoardTitle';
import BoardSettingsPopover from './popovers/settings/BoardSettingsPopover';
import useParams from '@fuse/hooks/useParams';
import { AudioPanel } from './audio/AudioPanel';
import { useGetStudioBoard } from '../../../api/hooks/boards/useGetStudioBoard';
import { useGetProjectAudios } from '../../../api/hooks/audio/useGetProjectAudios';
import { useGetStudioBoardCards } from '../../../api/hooks/cards/useGetStudioBoardCards';
import { useCurrentAccountId } from '../../../api/useCurrentAccountId';
import { studioApiService } from '../../../api/services/studioApiService';
import { useQuery } from '@tanstack/react-query';
import { studioTasksQueryKey } from '../../../api/hooks/cards/useGetStudioBoardCards';
import { useQueryClient } from '@tanstack/react-query';
import { ProductionTask } from '../../../api/types';

function BoardHeader() {
	const [audioOpen, setAudioOpen] = useState(false);
	const routeParams = useParams<{ boardId: string }>();
	const { boardId } = routeParams;
	const accountId = useCurrentAccountId();
	const queryClient = useQueryClient();

	const { data: project } = useGetStudioBoard(boardId);
	const { data: audios = [] } = useGetProjectAudios(boardId);

	// Fetch raw tasks for this project so AudioPanel can show the task selector
	const { data: rawTasks } = useQuery({
		queryKey: ['studio', 'tasks-raw', accountId, boardId],
		queryFn: async () => {
			const { items } = await studioApiService.getTasks(accountId);
			return items.filter((t) => t.production_project?.id === Number(boardId));
		},
		enabled: !!accountId && !!boardId
	});

	const tasks = (rawTasks ?? [])
		.filter((t) => t.id !== null)
		.map((t) => ({ id: t.id as number, name: t.name }));

	return (
		<>
			<div className="container flex w-full">
				<div className="flex flex-auto flex-col p-4 pb-0 md:px-6 md:pb-0">
					<PageBreadcrumb className="mb-2" />
					<div className="flex min-w-0 flex-auto items-center">
						<div className="flex flex-auto flex-col">
							<BoardTitle />
						</div>
						<div className="flex items-center gap-2 sm:mx-2 sm:mt-0">
							<Button
								className="whitespace-nowrap"
								component={NavLinkAdapter}
								to="/studio/boards"
								startIcon={<FuseSvgIcon>lucide:columns-3</FuseSvgIcon>}
							>
								Boards
							</Button>

							{/* ── Audio button ─────────────────────────────── */}
							<Badge
								badgeContent={audios.length}
								color="secondary"
								max={99}
								invisible={audios.length === 0}
							>
								<Button
									className="whitespace-nowrap"
									startIcon={<FuseSvgIcon>lucide:headphones</FuseSvgIcon>}
									onClick={() => setAudioOpen(true)}
								>
									Audio
								</Button>
							</Badge>

							<BoardSettingsPopover />
						</div>
					</div>
				</div>
			</div>

			<AudioPanel
				open={audioOpen}
				onClose={() => setAudioOpen(false)}
				projectId={boardId}
				projectName={project?.name}
				tasks={tasks}
			/>
		</>
	);
}

export default BoardHeader;