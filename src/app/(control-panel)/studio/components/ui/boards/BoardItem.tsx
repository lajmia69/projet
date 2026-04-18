import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { formatDistance } from 'date-fns';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { ProductionProject } from '../../../api/types';

type BoardItemProps = {
	board: ProductionProject;
};

function BoardItem(props: BoardItemProps) {
	const { board } = props;

	return (
		<Card
			component={NavLinkAdapter}
			to={`/studio/boards/${board.id}`}
			role="button"
			className="flex h-full w-full flex-col items-start rounded-lg p-4 shadow-sm transition-shadow duration-150 ease-in-out hover:shadow-xl md:p-6"
		>
			<div className="flex w-full flex-auto flex-col items-start justify-start">
				<Box
					sx={{
						backgroundColor: (theme) => `rgba(${theme.vars.palette.secondary.mainChannel} / 0.2)`,
						color: 'secondary.main'
					}}
					className="flex items-center justify-center rounded-full p-4"
				>
					<FuseSvgIcon>lucide:layout-grid</FuseSvgIcon>
				</Box>

				<Typography className="mt-5 text-lg leading-5 font-medium">{board.name}</Typography>

				<Typography className="text-secondary mt-0.5 line-clamp-2">{board.description}</Typography>

				{board.status && (
					<Typography
						className="mt-2 text-xs font-semibold uppercase tracking-wide"
						color="text.secondary"
					>
						{board.status.name}
					</Typography>
				)}

				<Divider className="mt-6 h-0.5 w-12" />
			</div>

			<div className="flex w-full flex-auto flex-col items-start justify-end">
				<div className="text-md font-md mt-6 flex items-center">
					<Typography color="text.secondary">Ends:</Typography>
					<Typography className="mx-1 truncate">
						{board.end_date
							? formatDistance(new Date(board.end_date), new Date(), { addSuffix: true })
							: '—'}
					</Typography>
				</div>
			</div>
		</Card>
	);
}

export default BoardItem;
