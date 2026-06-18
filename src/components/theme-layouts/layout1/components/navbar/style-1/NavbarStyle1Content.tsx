import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';
import Navigation from '@/components/theme-layouts/components/navigation/Navigation';
import UserMenu from '@/components/theme-layouts/components/UserMenu';
import Logo from '../../../../components/Logo';
import { useTranslation } from 'react-i18next';

/* ─── Design tokens ─────────────────────────────────────────────── */
const C = {
	cream: '#E8E4DA',
	teal:  '#2D8B7C',
	dteal: '#1C4A52',
	navy:  '#1A2E38',
};

const Root = styled('div')(({ theme }) => ({
	backgroundColor: C.cream,
	color: C.dteal,
	position: 'relative',
	overflow: 'hidden',

	/* Teal left-edge accent stripe */
	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0,
		left: 0,
		width: 2,
		height: '100%',
		background: `linear-gradient(180deg, ${C.teal} 0%, ${C.dteal} 60%, transparent 100%)`,
		zIndex: 10,
		pointerEvents: 'none',
	},

	'& .MuiTypography-root': {
		background: `linear-gradient(135deg, ${C.dteal} 0%, ${C.teal} 100%)`,
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		display: 'inline-block',
	},
	'& .MuiListItemText-primary, & .MuiListItemText-secondary': {
		background: `linear-gradient(135deg, ${C.dteal} 0%, ${C.teal} 100%)`,
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		display: 'inline-block',
	},
	'& .MuiListSubheader-root': {
		background: `linear-gradient(135deg, ${C.dteal} 0%, ${C.teal} 100%)`,
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		backgroundColor: 'transparent',
		borderBottom: `1px solid rgba(28,74,82,0.12)`,
		paddingBottom: 6,
		marginBottom: 6,
		pointerEvents: 'none',
	},
	'& svg': { color: `${C.navy} !important`, fill: `${C.navy} !important` },
	'& .MuiListItemIcon-root': { color: `${C.navy} !important` },
	'& .MuiSvgIcon-root': { color: `${C.navy} !important`, fill: `${C.navy} !important` },
	'& ::-webkit-scrollbar-thumb': {
		boxShadow: `inset 0 0 0 20px rgba(0,0,0,0.14)`,
	},
	'& ::-webkit-scrollbar-thumb:active': {
		boxShadow: `inset 0 0 0 20px rgba(0,0,0,0.24)`,
	},
}));

const StyledContent = styled(FuseScrollbars)(() => ({
	overscrollBehavior: 'contain',
	overflowX: 'hidden',
	overflowY: 'auto',
	WebkitOverflowScrolling: 'touch',
	backgroundRepeat: 'no-repeat',
	backgroundSize: '100% 40px, 100% 10px',
	backgroundAttachment: 'local, scroll',
}));

/* ─── Braille dot art (decorative background) ───────────────────── */
function BrailleBackground() {
	const dots = [
		// cluster top-right
		{ x: 230, y: 60  }, { x: 244, y: 60  },
		{ x: 230, y: 74  }, { x: 244, y: 74  },
		{ x: 230, y: 88  },
		// cluster mid-right
		{ x: 238, y: 200 }, { x: 252, y: 200 },
		{ x: 252, y: 214 },
		{ x: 238, y: 228 }, { x: 252, y: 228 },
		// cluster lower-right
		{ x: 234, y: 380 }, { x: 248, y: 380 },
		{ x: 234, y: 394 },
		{ x: 234, y: 408 }, { x: 248, y: 408 },
	];

	return (
		<svg
			aria-hidden="true"
			style={{
				position: 'absolute',
				right: 0,
				top: 0,
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
				opacity: 0.07,
			}}
			viewBox="0 0 280 500"
			xmlns="http://www.w3.org/2000/svg"
		>
			{dots.map((d, i) => (
				<circle key={i} cx={d.x} cy={d.y} r="3.5" fill={C.teal} />
			))}
			{/* faint orbit arc */}
			<circle cx="280" cy="500" r="220" fill="none" stroke={C.teal} strokeWidth="0.5" strokeDasharray="3 8" />
		</svg>
	);
}

/* ─── Animated voice wave bars ──────────────────────────────────── */
function VoiceWave() {
	const heights = [6, 12, 18, 10, 22, 14, 8, 16, 20, 8];
	return (
		<div
			aria-hidden="true"
			style={{
				display: 'flex',
				alignItems: 'flex-end',
				gap: 3,
				height: 22,
				marginLeft: 8,
			}}
		>
			<style>{`
				@keyframes evWave {
					0%, 100% { transform: scaleY(1); }
					50%       { transform: scaleY(1.8); }
				}
			`}</style>
			{heights.map((h, i) => (
				<div
					key={i}
					style={{
						width: 2,
						height: h,
						borderRadius: 2,
						background: `rgba(45,139,124,${0.3 + i * 0.05})`,
						transformOrigin: 'center bottom',
						animation: `evWave 1.3s ease-in-out ${(i * 0.09).toFixed(2)}s infinite`,
					}}
				/>
			))}
		</div>
	);
}

type NavbarStyle1ContentProps = { className?: string };

/**
 * The navbar style 1 content — EduVoice branded.
 */
function NavbarStyle1Content(props: NavbarStyle1ContentProps) {
	const { className = '' } = props;
	const { t } = useTranslation('navigation');

	return (
		<Root className={clsx('flex h-full flex-auto flex-col overflow-hidden', className)}>
			<BrailleBackground />

			{/* Header: Logo + EduVoice wordmark */}
			<div
				className="flex h-12 shrink-0 flex-row items-center px-5 md:h-16"
				style={{ borderBottom: `1px solid rgba(28,74,82,0.1)` }}
			>
				<Logo />
				<VoiceWave />
			</div>

			{/* EduVoice mini-brand strip */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 6,
					padding: '8px 20px 6px',
					borderBottom: `0.5px solid rgba(28,74,82,0.08)`,
				}}
			>
				<svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"
						stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
					<path d="M19 10a7 7 0 0 1-14 0"
						stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
					<line x1="12" y1="17" x2="12" y2="21" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
					<line x1="9"  y1="21" x2="15" y2="21" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				<span style={{
					fontFamily: 'Cormorant Garamond, Georgia, serif',
					fontSize: 11,
					fontWeight: 300,
					letterSpacing: '0.18em',
					textTransform: 'uppercase',
					color: C.teal,
				}}>
					Edu<em style={{ fontStyle: 'italic' }}>Voice</em>
				</span>
			</div>

			<StyledContent
				className="flex min-h-0 flex-1 flex-col"
				option={{ suppressScrollX: true, wheelPropagation: false }}
			>
				<Navigation layout="vertical" />
			</StyledContent>

			{/* Footer: slogan + user menu */}
			<div className="flex flex-col gap-3 p-3">
				{/* Slogan line */}
				<div style={{
					textAlign: 'center',
					fontFamily: 'Cormorant Garamond, Georgia, serif',
					fontStyle: 'italic',
					fontSize: 10,
					color: `rgba(28,74,82,0.35)`,
					letterSpacing: '0.06em',
					padding: '4px 0',
				}}>
					{t('SLOGAN')}
				</div>
				<UserMenu className="w-full" />
			</div>
		</Root>
	);
}

export default memo(NavbarStyle1Content);