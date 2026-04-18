import { useState, MouseEvent } from 'react';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import BoardSettingsForm from './BoardSettingsForm';

function BoardSettingsPopover() {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

	function handleOpen(ev: MouseEvent<HTMLButtonElement>) {
		setAnchorEl(ev.currentTarget);
	}

	function handleClose() {
		setAnchorEl(null);
	}

	return (
		<>
			<IconButton onClick={handleOpen} size="small" aria-label="Board settings">
				<FuseSvgIcon>lucide:settings</FuseSvgIcon>
			</IconButton>

			<Popover
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				transformOrigin={{ vertical: 'top', horizontal: 'right' }}
			>
				<div className="w-64">
					<BoardSettingsForm onClose={handleClose} />
				</div>
			</Popover>
		</>
	);
}

export default BoardSettingsPopover;
