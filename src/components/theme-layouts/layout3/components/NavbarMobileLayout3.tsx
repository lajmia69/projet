import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';
import { Divider } from '@mui/material';
import UserMenu from '@/components/theme-layouts/components/UserMenu';
import Navigation from '../../components/navigation/Navigation';
import Logo from '../../components/Logo';
import GoToDocBox from '../../components/GoToDocBox';
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

	'&::before': {
		content: '""',
		position: 'absolute',
		top: 0, left: 0,
		width: 2, height: '100%',
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
	},
	'& svg': { color: `${C.navy} !important`, fill: `${C.navy} !important` },
	'& .MuiListItemIcon-root': { color: `${C.navy} !important` },
	'& .MuiSvgIcon-root': { color: `${C.navy} !important`, fill: `${C.navy} !important` },
	'& ::-webkit-scrollbar-thumb': {
		boxShadow: `inset 0 0 0 20px rgba(0,0,0,0.14)`,
		...theme.applyStyles('light', { boxShadow: `inset 0 0 0 20px rgba(0,0,0,0.14)` }),
	},
	'& ::-webkit-scrollbar-thumb:active': {
		boxShadow: `inset 0 0 0 20px rgba(0,0,0,0.24)`,
		...theme.applyStyles('light', { boxShadow: `inset 0 0 0 20px rgba(0,0,0,0.24)` }),
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

function BrailleBackground() {
	const dots = [
		{ x: 252, y: 68  }, { x: 266, y: 68  },
		{ x: 252, y: 82  },
		{ x: 252, y: 96  }, { x: 266, y: 96  },
		{ x: 256, y: 270 }, { x: 270, y: 270 },
		{ x: 270, y: 284 },
		{ x: 256, y: 298 },
		{ x: 250, y: 440 }, { x: 264, y: 440 },
		{ x: 250, y: 454 }, { x: 264, y: 454 },
		{ x: 264, y: 468 },
	];
	return (
		<svg
			aria-hidden="true"
			style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.07 }}
			viewBox="0 0 280 540"
			xmlns="http://www.w3.org/2000/svg"
		>
			{dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="3.5" fill={C.teal} />)}
			<circle cx="280" cy="540" r="220" fill="none" stroke={C.teal} strokeWidth="0.5" strokeDasharray="3 8" />
		</svg>
	);
}

function VoiceWave() {
	const heights = [6, 12, 18, 10, 22, 14, 8, 16];
	return (
		<div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20, marginLeft: 8 }}>
			<style>{`
				@keyframes evWaveMob3 { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.7)} }
			`}</style>
			{heights.map((h, i) => (
				<div key={i} style={{
					width: 2, height: h, borderRadius: 2,
					background: `rgba(45,139,124,${0.28 + i * 0.06})`,
					transformOrigin: 'center bottom',
					animation: `evWaveMob3 1.3s ease-in-out ${(i * 0.1).toFixed(1)}s infinite`,
				}} />
			))}
		</div>
	);
}

type NavbarMobileLayout3Props = { className?: string };

/**
 * The navbar mobile layout 3 — EduVoice branded.
 */
function NavbarMobileLayout3(props: NavbarMobileLayout3Props) {
	const { className = '' } = props;
	const { t } = useTranslation('navigation');

	return (
		<Root className={clsx('flex h-full flex-col overflow-hidden', className)}>
			<BrailleBackground />

			<div
				className="flex h-12 shrink-0 flex-row items-center px-3 md:h-18"
				style={{ borderBottom: `1px solid rgba(28,74,82,0.1)`, position: 'relative', zIndex: 2 }}
			>
				<Logo />
				<VoiceWave />
			</div>

			{/* Mini brand strip */}
			<div style={{
				display: 'flex', alignItems: 'center', gap: 6,
				padding: '7px 14px 5px',
				borderBottom: `0.5px solid rgba(28,74,82,0.07)`,
				position: 'relative', zIndex: 2,
			}}>
				<svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"
						stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
					<path d="M19 10a7 7 0 0 1-14 0"
						stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
					<line x1="12" y1="17" x2="12" y2="21" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
					<line x1="9"  y1="21" x2="15" y2="21" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
				</svg>
				<span style={{
					fontFamily: 'Cormorant Garamond, Georgia, serif',
					fontSize: 10, fontWeight: 300,
					letterSpacing: '0.2em', textTransform: 'uppercase',
					color: C.teal,
				}}>
					Edu<em style={{ fontStyle: 'italic' }}>Voice</em>
				</span>
			</div>

			<div style={{ position: 'relative', zIndex: 2, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
			<StyledContent
				className="flex min-h-0 flex-1 flex-col"
				option={{ suppressScrollX: true, wheelPropagation: false }}
			>
				<Navigation layout="vertical" />
				<div className="flex shrink-0 items-center justify-center py-12" style={{ opacity: 0.06 }}>
					<img className="w-full max-w-16" src="/assets/images/logo/logo.png" alt="" aria-hidden="true" />
				</div>
			</StyledContent>
			</div>

			<div style={{ position: 'relative', zIndex: 2 }}>
				<GoToDocBox className="mx-3 my-4" />
			</div>

			<Divider />

			<div className="w-full p-1 md:p-4" style={{ position: 'relative', zIndex: 2 }}>
				<div style={{
					textAlign: 'center',
					fontFamily: 'Cormorant Garamond, Georgia, serif',
					fontStyle: 'italic', fontSize: 10,
					color: `rgba(28,74,82,0.3)`,
					letterSpacing: '0.06em',
					paddingBottom: 6,
				}}>
					{t('SLOGAN')}
				</div>
				<UserMenu className="w-full" />
			</div>
		</Root>
	);
}

export default memo(NavbarMobileLayout3);