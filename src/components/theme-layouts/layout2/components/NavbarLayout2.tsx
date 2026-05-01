import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';
import Navigation from 'src/components/theme-layouts/components/navigation/Navigation';
import Logo from '../../components/Logo';

/* ─── Design tokens ─────────────────────────────────────────────── */
const C = {
	cream: '#E8E4DA',
	teal:  '#2D8B7C',
	dteal: '#1C4A52',
	navy:  '#1A2E38',
};

const Root = styled('div')(() => ({
	backgroundColor: C.cream,
	color: C.dteal,
	position: 'relative',
	overflow: 'hidden',

	/* Teal bottom accent stripe */
	'&::after': {
		content: '""',
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		height: 2,
		background: `linear-gradient(90deg, transparent 0%, ${C.teal} 30%, ${C.dteal} 70%, transparent 100%)`,
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
	'& svg': { color: `${C.navy} !important`, fill: `${C.navy} !important` },
	'& .MuiListItemIcon-root': { color: `${C.navy} !important` },
	'& .MuiSvgIcon-root': { color: `${C.navy} !important`, fill: `${C.navy} !important` },
}));

type NavbarLayout2Props = { className?: string };

/**
 * The navbar layout 2 — EduVoice branded.
 */
function NavbarLayout2(props: NavbarLayout2Props) {
	const { className = '' } = props;

	return (
		<Root className={clsx('h-16 max-h-16 min-h-16 w-full', className)}>
			<div className="z-20 container flex h-full w-full flex-auto items-center justify-between gap-2 p-0 lg:px-8">

				{/* Logo + EduVoice wordmark */}
				<div className="flex flex-auto items-center gap-3">
					<Logo className="" />

					{/* Divider pip */}
					<div style={{ width: 1, height: 20, background: `rgba(28,74,82,0.2)` }} />

					{/* Mic icon + wordmark */}
					<div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
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
							fontSize: 13,
							fontWeight: 300,
							letterSpacing: '0.18em',
							textTransform: 'uppercase',
							color: C.teal,
						}}>
							Edu<em style={{ fontStyle: 'italic' }}>Voice</em>
						</span>
					</div>
				</div>

				{/* Nav links */}
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