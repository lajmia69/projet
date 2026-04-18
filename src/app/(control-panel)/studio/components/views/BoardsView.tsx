'use client';

import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import FuseLoading from '@fuse/core/FuseLoading';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import BoardItem from '../ui/boards/BoardItem';
import NewBoardItem from '../ui/boards/NewBoardItem';
import { useGetStudioBoards } from '../../api/hooks/boards/useGetStudioBoards';

/**
 * The Studio boards view — lists all production projects.
 */
function BoardsView() {
	const { data: boards, isLoading } = useGetStudioBoards();

	const container = {
		show: { transition: { staggerChildren: 0.04 } }
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 }
	};

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<div className="container flex shrink-0 grow flex-col items-center p-4">
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
			>
				<div className="flex flex-col">
					<PageBreadcrumb className="mb-4 justify-center" />
					<Typography className="text-center text-3xl leading-none font-extrabold tracking-tight">
						Studio Boards
					</Typography>
				</div>
			</motion.div>

			<motion.div
				variants={container}
				initial="hidden"
				animate="show"
				className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 md:mt-12 md:gap-6 lg:grid-cols-4"
			>
				{boards?.map((board) => (
					<motion.div
						variants={item}
						className="min-h-80 min-w-full sm:min-w-56 md:min-h-90"
						key={board.id}
					>
						<BoardItem board={board} key={board.id} />
					</motion.div>
				))}

				<motion.div
					variants={item}
					className="min-h-80 min-w-full sm:min-w-56 md:min-h-90"
				>
					<NewBoardItem />
				</motion.div>
			</motion.div>
		</div>
	);
}

export default BoardsView;