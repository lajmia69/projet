import FuseScrollbars from '@fuse/core/FuseScrollbars';
import { styled } from '@mui/material/styles';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import clsx from 'clsx';
import { memo, useEffect, useState } from 'react';
import FuseNavigation from '@fuse/core/FuseNavigation';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import isUrlInChildren from '@fuse/core/FuseNavigation/isUrlInChildren';
import { Theme } from '@mui/system';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import UserMenu from 'src/components/theme-layouts/components/UserMenu';
import usePathname from '@fuse/hooks/usePathname';
import useNavigationItems from '@/components/theme-layouts/components/navigation/hooks/useNavigationItems';
import { useNavbarContext } from '@/components/theme-layouts/components/navbar/contexts/NavbarContext/useNavbarContext';

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
}));

type StyledPanelProps = { theme?: Theme; opened?: boolean };

const StyledPanel = styled(FuseScrollbars)<StyledPanelProps>(({ theme }) => ({
	backgroundColor: `rgba(232,228,218,0.95)`,
	backdropFilter: 'blur(8px)',
	borderLeft: `1px solid rgba(28,74,82,0.1)`,
	color: theme.vars.palette.text.primary,
	transition: theme.transitions.create(['opacity'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.shortest,
	}),
	opacity: 0,
	pointerEvents: 'none',
	minHeight: 0,
	variants: [
		{
			props: ({ opened }: { opened?: boolean }) => opened,
			style: { opacity: 1, pointerEvents: 'initial' },
		},
	],
}));

/* ─── Braille dots background for the side strip ────────────────── */
function BrailleStrip() {
	const dots = [
		{ x: 24, y: 220 }, { x: 36, y: 220 },
		{ x: 24, y: 234 },
		{ x: 24, y: 248 }, { x: 36, y: 248 },
		{ x: 24, y: 320 }, { x: 36, y: 320 },
		{ x: 36, y: 334 },
		{ x: 24, y: 348 },
		{ x: 24, y: 430 }, { x: 36, y: 430 },
		{ x: 24, y: 444 }, { x: 36, y: 444 },
		{ x: 36, y: 458 },
	];
	return (
		<svg
			aria-hidden="true"
			style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.08 }}
			viewBox="0 0 48 600"
			xmlns="http://www.w3.org/2000/svg"
		>
			{dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="3" fill={C.teal} />)}
			{/* vertical teal line left edge */}
			<rect x="0" y="0" width="2" height="600"
				fill={`url(#ev-grad)`} />
			<defs>
				<linearGradient id="ev-grad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%"   stopColor={C.teal} stopOpacity="0.8" />
					<stop offset="60%"  stopColor={C.dteal} stopOpacity="0.6" />
					<stop offset="100%" stopColor={C.teal}  stopOpacity="0" />
				</linearGradient>
			</defs>
		</svg>
	);
}

/* ─── Animated voice wave bars ──────────────────────────────────── */
function VoiceWaveBars() {
	const heights = [8, 14, 20, 10, 24, 16, 10, 18, 14, 6];
	return (
		<div aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 24, justifyContent: 'center', marginBottom: 8 }}>
			<style>{`
				@keyframes evWave2 {
					0%, 100% { transform: scaleY(1); }
					50%       { transform: scaleY(1.9); }
				}
			`}</style>
			{heights.map((h, i) => (
				<div key={i} style={{
					width: 2,
					height: h,
					borderRadius: 2,
					background: `rgba(45,139,124,${0.25 + i * 0.05})`,
					transformOrigin: 'center bottom',
					animation: `evWave2 1.4s ease-in-out ${(i * 0.1).toFixed(1)}s infinite`,
				}} />
			))}
		</div>
	);
}

function needsToBeOpened(pathname: string, item: FuseNavItemType) {
	return pathname && isUrlInChildren(item, pathname);
}

type NavbarStyle2ContentProps = { className?: string };

/**
 * The navbar style 2 content — EduVoice branded.
 */
function NavbarStyle2Content(props: NavbarStyle2ContentProps) {
	const { className = '' } = props;

	const [logoOpacity, setLogoOpacity] = useState<number>(1);
	useEffect(() => {
		const onScroll = () => {
			const t = window.scrollY || window.pageYOffset;
			setLogoOpacity(Math.max(0, 1 - t / 200));
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const { data: navigation } = useNavigationItems();
	const { closeMobileNavbar } = useNavbarContext();
	const [selectedNavigation, setSelectedNavigation] = useState<FuseNavItemType[]>([]);
	const [panelOpen, setPanelOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		navigation?.forEach((item) => {
			if (needsToBeOpened(pathname, item)) setSelectedNavigation([item]);
		});
	}, [navigation, pathname]);

	function handleParentItemClick(selected: FuseNavItemType) {
		if (!selected.children) {
			setSelectedNavigation([]);
			setPanelOpen(false);
			return;
		}
		if (selectedNavigation[0]?.id === selected.id) {
			setPanelOpen(!panelOpen);
		} else {
			setSelectedNavigation([selected]);
			setPanelOpen(true);
		}
	}

	function handleChildItemClick() {
		setPanelOpen(false);
		if (isMobile) closeMobileNavbar();
	}

	return (
		<ClickAwayListener onClickAway={() => setPanelOpen(false)}>
			<Root className={clsx('flex h-full flex-auto', className)}>

				{/* Side icon strip */}
				<div
					id="fuse-navbar-side-panel"
					className="flex h-full shrink-0 flex-col items-center justify-center"
					style={{ position: 'relative', background: C.cream }}
				>
					<BrailleStrip />

					{/* Logo + brand */}
					<div style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 4,
						marginBottom: 8,
						position: 'relative',
						zIndex: 2,
					}}>
						<div style={{
							width: 36,
							height: 36,
							borderRadius: '50%',
							border: `1px solid rgba(45,139,124,0.3)`,
							background: 'rgba(45,139,124,0.06)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							opacity: logoOpacity,
							transition: 'opacity 0.25s ease-out',
						}}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-label="EduVoice">
								<path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"
									stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
								<path d="M19 10a7 7 0 0 1-14 0"
									stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
								<line x1="12" y1="17" x2="12" y2="21" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
								<line x1="9"  y1="21" x2="15" y2="21" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</div>
					</div>

					<div style={{ position: 'relative', zIndex: 2, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
					<FuseScrollbars
						className="flex min-h-0 w-full flex-1 flex-col justify-start overflow-x-hidden overflow-y-auto"
						option={{ suppressScrollX: true, wheelPropagation: false }}
					>
						<FuseNavigation
							className={clsx('navigation min-h-full shrink-0')}
							navigation={navigation}
							layout="vertical-2"
							onItemClick={handleParentItemClick}
							firstLevel
							selectedId={selectedNavigation[0]?.id}
						/>
					</FuseScrollbars>
					</div>

					{/* Wave bars above user avatar */}
					<div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
						<VoiceWaveBars />
						<div className="flex w-full shrink-0 items-center justify-center py-2">
							<UserMenu onlyAvatar />
						</div>
					</div>
				</div>

				{/* Slide-out panel */}
				{selectedNavigation.length > 0 && (
					<StyledPanel
						id="fuse-navbar-panel"
						opened={panelOpen}
						className={clsx('overflow-x-hidden overflow-y-auto shadow-sm')}
						option={{ suppressScrollX: true, wheelPropagation: false }}
					>
						{/* Panel brand header */}
						<div style={{
							padding: '12px 16px 8px',
							borderBottom: `1px solid rgba(28,74,82,0.08)`,
							display: 'flex',
							alignItems: 'center',
							gap: 6,
						}}>
							<span style={{
								fontFamily: 'Cormorant Garamond, Georgia, serif',
								fontSize: 13,
								fontWeight: 300,
								letterSpacing: '0.12em',
								textTransform: 'uppercase',
								color: C.teal,
							}}>
								Edu<em style={{ fontStyle: 'italic' }}>Voice</em>
							</span>
							<div style={{ flex: 1, height: 0.5, background: `rgba(45,139,124,0.25)` }} />
						</div>

						<FuseNavigation
							className={clsx('navigation')}
							navigation={selectedNavigation}
							layout="vertical"
							onItemClick={handleChildItemClick}
						/>

						{/* Slogan footer in panel */}
						<div style={{
							padding: '16px',
							borderTop: `0.5px solid rgba(28,74,82,0.08)`,
							fontFamily: 'Cormorant Garamond, Georgia, serif',
							fontStyle: 'italic',
							fontSize: 10,
							color: `rgba(28,74,82,0.3)`,
							letterSpacing: '0.06em',
							textAlign: 'center',
						}}>
							Your voice is your vision.
						</div>
					</StyledPanel>
				)}
			</Root>
		</ClickAwayListener>
	);
}

export default memo(NavbarStyle2Content);