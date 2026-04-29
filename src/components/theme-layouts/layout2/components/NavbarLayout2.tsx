import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';
import Navigation from 'src/components/theme-layouts/components/navigation/Navigation';
import Logo from '../../components/Logo';

const Root = styled('div')(() => ({
	backgroundColor: '#E8E4DA',
	color: '#1C4A52',
	'& .MuiTypography-root': {
		background: 'linear-gradient(135deg, #1C4A52 0%, #2D8B7C 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		display: 'inline-block',
	},
	'& .MuiListItemText-primary, & .MuiListItemText-secondary': {
		background: 'linear-gradient(135deg, #1C4A52 0%, #2D8B7C 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		display: 'inline-block',
	},
	'& svg': {
		color: '#1A2E38 !important',
		fill: '#1A2E38 !important',
	},
	'& .MuiListItemIcon-root': {
		color: '#1A2E38 !important',
	},
	'& .MuiSvgIcon-root': {
		color: '#1A2E38 !important',
		fill: '#1A2E38 !important',
	},
}));

type NavbarLayout2Props = {
	className?: string;
};

/**
 * The navbar layout 2.
 */
function NavbarLayout2(props: NavbarLayout2Props) {
	const { className = '' } = props;

	return (
		<Root className={clsx('h-16 max-h-16 min-h-16 w-full', className)}>
			<div className="z-20 container flex h-full w-full flex-auto items-center justify-between gap-2 p-0 lg:px-8">
				<div className="flex flex-auto">
					<Logo className="" />
				</div>

				<FuseScrollbars className="flex h-full w-full flex-auto items-center">
					<Navigation
						className="w-full justify-end"
						layout="horizontal"
					/>
				</FuseScrollbars>
			</div>
		</Root>
	);
}

export default memo(NavbarLayout2);