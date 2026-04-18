'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { format, fromUnixTime } from 'date-fns';
import clsx from 'clsx';
import { useScrumboardAppContext } from '../../../../contexts/ScrumboardAppContext/useScrumboardAppContext';

function BoardCardDialog() {
	const { openCard, closeCardDialog } = useScrumboardAppContext();
	const open = Boolean(openCard);

	if (!openCard) return null;

	const isOverdue =
		openCard.dueDate && Math.floor(Date.now() / 1000) > openCard.dueDate;

	return (
		<Dialog open={open} onClose={closeCardDialog} maxWidth="sm" fullWidth scroll="body">
			<DialogTitle className="flex items-start justify-between gap-2 pr-2">
				<span>{openCard.title}</span>
				<Button
					size="small"
					onClick={closeCardDialog}
					sx={{ minWidth: 0, p: '4px' }}
				>
					<FuseSvgIcon size={18}>lucide:x</FuseSvgIcon>
				</Button>
			</DialogTitle>

			<DialogContent dividers>
				{openCard.description && (
					<Typography className="mb-4 whitespace-pre-wrap text-sm" color="text.secondary">
						{openCard.description}
					</Typography>
				)}

				{openCard.dueDate && (
					<div className="mb-3 flex items-center gap-2">
						<FuseSvgIcon size={16} color="action">lucide:calendar</FuseSvgIcon>
						<Chip
							size="small"
							className={clsx(
								'text-xs font-semibold',
								isOverdue ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
							)}
							label={format(fromUnixTime(openCard.dueDate), 'PPP')}
						/>
					</div>
				)}

				{openCard.memberIds.length > 0 && (
					<div className="flex items-center gap-2">
						<FuseSvgIcon size={16} color="action">lucide:users</FuseSvgIcon>
						<Typography className="text-sm" color="text.secondary">
							{openCard.memberIds.length} member{openCard.memberIds.length !== 1 ? 's' : ''}
						</Typography>
					</div>
				)}
			</DialogContent>

			<DialogActions>
				<Button onClick={closeCardDialog}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}

export default BoardCardDialog;
