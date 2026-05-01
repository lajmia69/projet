import Fab from '@mui/material/Fab';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

/* ─── Design tokens ─────────────────────────────────────────────── */
const C = {
	cream: '#E8E4DA',
	teal:  '#2D8B7C',
	dteal: '#1C4A52',
	navy:  '#1A2E38',
};

const Root = styled(Tooltip)<{ position: 'left' | 'right' }>(({ theme }) => ({
	'& > .button': {
		height: 40,
		position: 'absolute',
		zIndex: 99,
		top: 12,
		width: 24,
		borderRadius: 38,
		padding: 8,
		backgroundColor: C.cream,
		border: `1px solid rgba(28,74,82,0.15)`,
		boxShadow: `2px 0 12px rgba(28,74,82,0.08)`,
		transition: theme.transitions.create(
			['background-color', 'border-radius', 'width', 'min-width', 'padding', 'border-color'],
			{ easing: theme.transitions.easing.easeInOut, duration: theme.transitions.duration.shorter }
		),
		'&:hover': {
			width: 52,
			paddingLeft: 8,
			paddingRight: 8,
			backgroundColor: C.cream,
			borderColor: C.teal,
			'& .button-icon': {
				color: `${C.teal} !important`,
				fill: `${C.teal} !important`,
			},
		},
		'& > .button-icon': {
			fontSize: 18,
			color: `${C.dteal} !important`,
			transition: theme.transitions.create(['transform', 'color'], {
				easing: theme.transitions.easing.easeInOut,
				duration: theme.transitions.duration.short,
			}),
		},
	},
	variants: [
		{
			props: { position: 'left' },
			style: {
				'& > .button': {
					borderBottomLeftRadius: 0,
					borderTopLeftRadius: 0,
					paddingLeft: 4,
					left: 0,
					borderLeft: 'none',
					/* teal top-to-bottom left-edge glow */
					'&::before': {
						content: '""',
						position: 'absolute',
						left: 0,
						top: '10%',
						width: 2,
						height: '80%',
						borderRadius: 1,
						background: `linear-gradient(180deg, ${C.teal}, ${C.dteal})`,
					},
				},
			},
		},
		{
			props: { position: 'right' },
			style: {
				'& > .button': {
					borderBottomRightRadius: 0,
					borderTopRightRadius: 0,
					paddingRight: 4,
					right: 0,
					borderRight: 'none',
					'& > .button-icon': { transform: 'rotate(-180deg)' },
				},
			},
		},
	],
}));

type NavbarToggleFabProps = {
	className?: string;
	position?: string;
	onClick?: () => void;
};

/**
 * The NavbarToggleFab component — EduVoice branded.
 */
function NavbarToggleFab(props: NavbarToggleFabProps) {
	const { className = '', position = 'left', onClick } = props;

	return (
		<Root
			title="Show Navigation"
			placement={position === 'left' ? 'right' : 'left'}
			position={position as 'left' | 'right'}
		>
			<Fab
				className={clsx('button', className)}
				onClick={onClick}
				disableRipple
			>
				<FuseSvgIcon color="action" className="button-icon">
					lucide:menu
				</FuseSvgIcon>
			</Fab>
		</Root>
	);
}

export default NavbarToggleFab;