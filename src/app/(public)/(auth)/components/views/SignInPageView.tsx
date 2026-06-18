'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { keyframes } from '@mui/material/styles';
import Link from '@fuse/core/Link';
import AuthJsForm from '@auth/forms/AuthJsForm';
import { useSearchParams, useRouter } from 'next/navigation';

// ─── Color tokens ────────────────────────────────────────────────────────────
const C = {
	cream: '#E8E4DA',
	creamDark: '#D9D4C7',
	teal: '#2D8B7C',
	darkTeal: '#1C4A52',
	navy: '#1A2E38',
} as const;

// ─── Waveform animation ───────────────────────────────────────────────────────
const pulse = keyframes`
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.8); }
`;

const barCount = 28;

// ─── Dot grid helper ─────────────────────────────────────────────────────────
function DotGrid() {
	const dots = [];
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 10; c++) {
			dots.push(
				<div
					key={`${r}-${c}`}
					style={{
						width: 3,
						height: 3,
						borderRadius: '50%',
						background: 'rgba(45,139,124,0.35)',
						margin: 7,
						display: 'inline-block',
					}}
				/>
			);
		}
	}
	return <div style={{ lineHeight: 0, letterSpacing: 0 }}>{dots}</div>;
}

// ─── Right decorative panel ───────────────────────────────────────────────────
function RightPanel() {
	return (
		<Box
			sx={{
				width: '48%',
				background: `linear-gradient(160deg, ${C.darkTeal} 0%, ${C.navy} 60%)`,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				position: 'relative',
				overflow: 'hidden',
				p: 5,
				gap: 3,
			}}
		>
			<Box sx={{ position: 'absolute', top: 24, right: 20, opacity: 0.5 }}>
				<DotGrid />
			</Box>
			<Box sx={{ position: 'absolute', bottom: 24, left: 20, opacity: 0.3 }}>
				<DotGrid />
			</Box>

			<Box
				sx={{
					fontFamily: '"DM Mono", monospace',
					fontSize: 9,
					letterSpacing: '0.22em',
					color: C.teal,
					textTransform: 'uppercase',
					position: 'absolute',
					top: 32,
					left: '50%',
					transform: 'translateX(-50%)',
					whiteSpace: 'nowrap',
				}}
			>
				Designed for every learner
			</Box>

			<Box
				sx={{
					width: 72,
					height: 72,
					borderRadius: '50%',
					border: `1.5px solid rgba(45,139,124,0.45)`,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'rgba(45,139,124,0.08)',
				}}
			>
				<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
					<rect x="9" y="2" width="6" height="11" rx="3" />
					<path d="M5 10a7 7 0 0 0 14 0" />
					<line x1="12" y1="19" x2="12" y2="22" />
					<line x1="8" y1="22" x2="16" y2="22" />
				</svg>
			</Box>

			<Box sx={{ textAlign: 'center', lineHeight: 1 }}>
				<Box component="span" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 40, fontWeight: 400, color: C.cream, letterSpacing: '-0.01em' }}>
					Edu
				</Box>
				<Box component="span" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 40, fontWeight: 400, fontStyle: 'italic', color: C.teal }}>
					Voice
				</Box>
			</Box>

			<Box sx={{ textAlign: 'center', maxWidth: 220 }}>
				<Box sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontStyle: 'italic', fontSize: 17, color: C.cream, opacity: 0.88, lineHeight: 1.5 }}>
					"Your voice is<br />your vision."
				</Box>
				<Box sx={{ fontFamily: '"DM Mono", monospace', fontSize: 9, letterSpacing: '0.18em', color: C.teal, textTransform: 'uppercase', mt: 1.5 }}>
					Audio-first learning for the blind
				</Box>
			</Box>

			<Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 36 }}>
				{Array.from({ length: barCount }).map((_, i) => {
					const h = 6 + Math.abs(Math.sin(i * 0.7)) * 22;
					const delay = (i * 0.07).toFixed(2);
					return (
						<Box
							key={i}
							sx={{
								width: 3,
								height: `${h}px`,
								borderRadius: 4,
								background: C.teal,
								opacity: 0.7,
								animation: `${pulse} ${1.2 + (i % 5) * 0.18}s ease-in-out infinite`,
								animationDelay: `${delay}s`,
							}}
						/>
					);
				})}
			</Box>

			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 280 }}>
				{['Voice-guided', 'Braille-ready', 'Screen-reader', 'Audio-first'].map((b) => (
					<Box
						key={b}
						sx={{
							px: 1.75,
							py: 0.5,
							borderRadius: '20px',
							border: `1px solid rgba(45,139,124,0.45)`,
							fontFamily: '"DM Mono", monospace',
							fontSize: 9,
							letterSpacing: '0.1em',
							color: C.teal,
							textTransform: 'uppercase',
						}}
					>
						{b}
					</Box>
				))}
			</Box>

			<Box
				sx={{
					position: 'absolute',
					bottom: 20,
					fontFamily: '"DM Mono", monospace',
					fontSize: 9,
					letterSpacing: '0.15em',
					color: 'rgba(232,228,218,0.25)',
					textTransform: 'uppercase',
				}}
			>
				© 2025 EduVoice
			</Box>
		</Box>
	);
}

// ─── Wrong-password popup ─────────────────────────────────────────────────────
function WrongPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					background: C.navy,
					borderRadius: '14px',
					border: `1px solid rgba(45,139,124,0.3)`,
					boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
					minWidth: 320,
					maxWidth: 380,
				},
			}}
		>
			<DialogContent sx={{ p: '28px 32px' }}>
				{/* Icon */}
				<Box
					sx={{
						width: 48,
						height: 48,
						borderRadius: '50%',
						background: 'rgba(220,60,60,0.12)',
						border: '1.5px solid rgba(220,60,60,0.35)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						mx: 'auto',
						mb: 2,
					}}
				>
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e05555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<circle cx="12" cy="12" r="10" />
						<line x1="12" y1="8" x2="12" y2="12" />
						<line x1="12" y1="16" x2="12.01" y2="16" />
					</svg>
				</Box>

				{/* Title */}
				<Box
					sx={{
						fontFamily: '"Playfair Display", Georgia, serif',
						fontSize: 22,
						fontWeight: 400,
						color: C.cream,
						textAlign: 'center',
						mb: 1,
					}}
				>
					Wrong password
				</Box>

				{/* Body */}
				<Box
					sx={{
						fontFamily: '"DM Sans", sans-serif',
						fontSize: 13,
						color: 'rgba(232,228,218,0.6)',
						textAlign: 'center',
						lineHeight: 1.6,
						mb: 3,
					}}
				>
					The password you entered is incorrect. Please try again.
				</Box>

				{/* Dismiss button */}
				<Box
					component="button"
					onClick={onClose}
					sx={{
						display: 'block',
						width: '100%',
						py: '10px',
						background: C.darkTeal,
						color: C.cream,
						border: 'none',
						borderRadius: '8px',
						fontFamily: '"DM Sans", sans-serif',
						fontWeight: 500,
						fontSize: 12,
						letterSpacing: '0.14em',
						textTransform: 'uppercase',
						cursor: 'pointer',
						transition: 'background 0.2s',
						'&:hover': { background: C.teal },
					}}
				>
					Try again
				</Box>
			</DialogContent>
		</Dialog>
	);
}

// ─── Main component ───────────────────────────────────────────────────────────
function SignInPageView() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [wrongPasswordOpen, setWrongPasswordOpen] = useState(false);

	// next-auth redirects back with ?error=CredentialsSignin on bad password
	useEffect(() => {
		const error = searchParams.get('error');
		if (error === 'CredentialsSignin' || error === 'credentials') {
			setWrongPasswordOpen(true);
			// Clean the URL so the dialog doesn't re-open on refresh
			const params = new URLSearchParams(Array.from(searchParams.entries()));
			params.delete('error');
			const clean = params.toString();
			router.replace(`/sign-in${clean ? `?${clean}` : ''}`, { scroll: false });
		}
	}, [searchParams, router]);

	return (
		<Box
			sx={{
				display: 'flex',
				width: '100%',
				minHeight: '100vh',
				fontFamily: '"DM Sans", sans-serif',
			}}
		>
			{/* ── LEFT PANEL ── */}
			<Box
				sx={{
					width: '52%',
					background: C.cream,
					display: 'flex',
					flexDirection: 'column',
					position: 'relative',
					overflow: 'hidden',
				}}
			>
				<Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', p: '36px 44px 32px' }}>

					{/* Brand */}
					<Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
						<img
							src="/assets/images/logo_association.jpg"
							alt="Logo Association"
							style={{ height: 140, width: 'auto', objectFit: 'contain' }}
						/>
					</Box>

					{/* Tab bar */}
					<Box
						sx={{
							display: 'flex',
							background: 'rgba(26,46,56,0.07)',
							borderRadius: '10px',
							p: '3px',
							mb: 3,
						}}
					>
						{([
							{ label: 'Sign In', path: '/sign-in' },
							{ label: 'Sign Up', path: '/sign-up' },
						] as const).map(({ label, path }) => (
							<Link key={label} to={path} style={{ flex: 1, textDecoration: 'none' }}>
								<Box
									sx={{
										textAlign: 'center',
										py: '8px',
										borderRadius: '8px',
										fontSize: 11,
										fontWeight: 500,
										letterSpacing: '0.1em',
										textTransform: 'uppercase',
										cursor: 'pointer',
										transition: 'all 0.2s',
										...(label === 'Sign In'
											? { background: C.navy, color: C.cream, boxShadow: '0 2px 8px rgba(26,46,56,0.25)' }
											: { color: C.darkTeal, opacity: 0.5, '&:hover': { opacity: 0.8 } }),
									}}
								>
									{label}
								</Box>
							</Link>
						))}
					</Box>

					{/* Accessibility chips */}
					<Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
						{['Voice-guided', 'Braille-ready', 'Screen-reader'].map((chip) => (
							<Box
								key={chip}
								sx={{
									display: 'flex',
									alignItems: 'center',
									gap: 0.5,
									px: 1.25,
									py: 0.5,
									borderRadius: '20px',
									border: `1px solid rgba(28,74,82,0.2)`,
									fontSize: 11,
									color: C.darkTeal,
									fontWeight: 300,
								}}
							>
								<Box sx={{ width: 6, height: 6, borderRadius: '50%', border: `1.5px solid ${C.teal}` }} />
								{chip}
							</Box>
						))}
					</Box>

					{/* Heading */}
					<Box sx={{ mb: 3 }}>
						<Box sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 42, fontWeight: 400, color: C.navy, lineHeight: 1.0 }}>
							Welcome
						</Box>
						<Box sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 42, fontWeight: 400, fontStyle: 'italic', color: C.teal, lineHeight: 1.0 }}>
							back.
						</Box>
						<Box sx={{ fontSize: 13, color: C.darkTeal, opacity: 0.65, mt: 0.75, fontWeight: 300 }}>
							Sign in — your voice assistant is ready
						</Box>
					</Box>

					{/* Form */}
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							gap: 2,
							'& input': {
								background: `${C.navy} !important`,
								color: `${C.cream} !important`,
								border: `1.5px solid transparent !important`,
								borderRadius: '8px !important',
								fontFamily: '"DM Sans", sans-serif !important',
								fontSize: '14px !important',
								outline: 'none !important',
								transition: 'border-color 0.2s !important',
								'&::placeholder': { color: 'rgba(232,228,218,0.25) !important' },
								'&:focus': { borderColor: `${C.teal} !important` },
							},
							'& label': {
								fontSize: '10px !important',
								fontWeight: '500 !important',
								letterSpacing: '0.15em !important',
								textTransform: 'uppercase !important',
								color: `${C.navy} !important`,
								opacity: '0.5 !important',
							},
							'& button[type="submit"]': {
								background: `${C.darkTeal} !important`,
								color: `${C.cream} !important`,
								border: 'none !important',
								borderRadius: '8px !important',
								fontFamily: '"DM Sans", sans-serif !important',
								fontWeight: '500 !important',
								letterSpacing: '0.16em !important',
								textTransform: 'uppercase !important',
								fontSize: '11px !important',
								transition: 'background 0.2s !important',
								'&:hover': { background: `${C.navy} !important` },
							},
							'& a': { color: `${C.teal} !important` },
						}}
					>
						<AuthJsForm formType="signin" />
						<Box sx={{ textAlign: 'center', fontSize: 12, color: C.darkTeal, opacity: 0.55 }}>
							No account?{' '}
							<MuiLink component={Link} to="/sign-up" underline="hover" sx={{ color: C.teal, fontWeight: 500, opacity: 1 }}>
								Create one
							</MuiLink>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* ── RIGHT PANEL ── */}
			<RightPanel />

			{/* ── WRONG PASSWORD DIALOG ── */}
			<WrongPasswordDialog open={wrongPasswordOpen} onClose={() => setWrongPasswordOpen(false)} />
		</Box>
	);
}

export default SignInPageView;