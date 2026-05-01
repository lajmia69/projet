import IconButton from '@mui/material/IconButton';
import _ from 'lodash';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { IconButtonProps } from '@mui/material/IconButton';
import useFuseLayoutSettings from '@fuse/core/FuseLayout/useFuseLayoutSettings';
import useFuseSettings from '@fuse/core/FuseSettings/hooks/useFuseSettings';
import { useNavbarContext } from './contexts/NavbarContext/useNavbarContext';

/* ─── Design tokens ─────────────────────────────────────────────── */
const C = {
	teal:  '#2D8B7C',
	dteal: '#1C4A52',
	navy:  '#1A2E38',
};

export type NavbarToggleButtonProps = IconButtonProps;

/**
 * The navbar toggle button — EduVoice branded.
 */
function NavbarToggleButton(props: NavbarToggleButtonProps) {
	const {
		className = 'h-7 w-7',
		children = <FuseSvgIcon>lucide:panel-left</FuseSvgIcon>,
		...rest
	} = props;

	const { toggleMobileNavbar, toggleNavbar } = useNavbarContext();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const { config } = useFuseLayoutSettings();
	const { setSettings } = useFuseSettings();

	return (
		<IconButton
			size="small"
			onClick={() => {
				if (isMobile) {
					toggleMobileNavbar();
				} else if (config?.navbar?.style === 'style-2') {
					setSettings(_.set({}, 'layout.config.navbar.folded', !config?.navbar?.folded));
				} else {
					toggleNavbar();
				}
			}}
			{...rest}
			className={className}
			sx={{
				border: `1px solid rgba(28,74,82,0.2)`,
				color: C.dteal,
				borderRadius: '4px',
				transition: 'all 0.2s ease',
				'&:hover': {
					borderColor: C.teal,
					color: C.teal,
					backgroundColor: 'rgba(45,139,124,0.06)',
				},
				'& svg': {
					color: 'inherit !important',
					fill: 'inherit !important',
				},
				...((rest as any).sx || {}),
			}}
		>
			{children}
		</IconButton>
	);
}

export default NavbarToggleButton;