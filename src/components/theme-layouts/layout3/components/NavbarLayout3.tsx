import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';
import Navigation from '../../components/navigation/Navigation';
import NavigationSearch from '../../components/navigation/NavigationSearch';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';

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

type NavbarLayout3Props = {
	className?: string;
};

/**
 * The navbar layout 3.
 */
function NavbarLayout3(props: NavbarLayout3Props) {
	const { className = '' } = props;

	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	return (
		<Root className={clsx('h-16 max-h-16 min-h-16 w-full', className)}>
			<div className="container flex h-full w-full flex-auto items-center px-4 lg:px-8">
				<FuseScrollbars className="flex h-full w-full flex-auto items-center">
					<Navigation
						className="w-full"
						layout="horizontal"
						dense
					/>
				</FuseScrollbars>
				<div className="flex">{!isMobile && <NavigationSearch variant="basic" />}</div>
			</div>
		</Root>
	);
}

export default memo(NavbarLayout3);