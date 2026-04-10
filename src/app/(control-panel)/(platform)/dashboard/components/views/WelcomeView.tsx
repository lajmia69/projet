'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Typography, Box, Paper, Avatar, Chip, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import useUser from '@auth/useUser';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': {
		display: 'none'
	},
	'& .FusePageSimple-contentWrapper': {
		overflow: 'auto'
	}
}));

// ─── Quick-access cards ───────────────────────────────────────────────────────

const quickLinks = [
	{
		label: 'Lessons',
		description: 'Browse and listen to educational content',
		icon: 'heroicons-outline:academic-cap',
		url: '/content/lessons',
		color: '#2563eb',
		bg: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
		accent: 'rgba(37,99,235,0.15)'
	},
	{
		label: 'Radio',
		description: 'Emissions, episodes and reportages',
		icon: 'heroicons-outline:radio',
		url: '/content/radio/emissions',
		color: '#f59e0b',
		bg: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
		accent: 'rgba(245,158,11,0.15)'
	},
	{
		label: 'Podcast',
		description: 'Discover podcast episodes',
		icon: 'heroicons-outline:microphone',
		url: '/content/podcast/courses',
		color: '#8b5cf6',
		bg: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)',
		accent: 'rgba(139,92,246,0.15)'
	},
	{
		label: 'Culture',
		description: 'Projects and cultural activities',
		icon: 'heroicons-outline:sparkles',
		url: '/culture/projects',
		color: '#10b981',
		bg: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
		accent: 'rgba(16,185,129,0.15)'
	},
	{
		label: 'Accounts',
		description: 'Manage users and permissions',
		icon: 'heroicons-outline:user-group',
		url: '/administration/accounts',
		color: '#ef4444',
		bg: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
		accent: 'rgba(239,68,68,0.15)'
	},
	{
		label: 'Administration',
		description: 'System settings and overview',
		icon: 'heroicons-outline:cog',
		url: '/administration/dashboard',
		color: '#64748b',
		bg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
		accent: 'rgba(100,116,139,0.15)'
	}
];

// ─── Stats row ────────────────────────────────────────────────────────────────

const stats = [
	{ label: 'Platform', value: 'EcoCloud', icon: 'heroicons-outline:globe-alt' },
	{ label: 'Content Types', value: '4', icon: 'heroicons-outline:collection' },
	{ label: 'Modules', value: 'Radio · Lesson · Podcast · Culture', icon: 'heroicons-outline:view-grid' }
];

// ─── Animated greeting ────────────────────────────────────────────────────────

function Greeting({ name }: { name: string }) {
	const hour = new Date().getHours();
	const salutation =
		hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

	return (
		<>
			<span style={{ color: 'rgba(255,255,255,0.55)' }}>{salutation}, </span>
			<span style={{ color: '#fff' }}>{name || 'there'}</span>
		</>
	);
}

// ─── Clock ────────────────────────────────────────────────────────────────────

function LiveClock() {
	const [time, setTime] = useState('');

	useEffect(() => {
		const update = () =>
			setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
		update();
		const id = setInterval(update, 1000);
		return () => clearInterval(id);
	}, []);

	return (
		<Typography
			sx={{
				fontSize: '0.85rem',
				fontWeight: 600,
				color: 'rgba(255,255,255,0.45)',
				letterSpacing: '0.08em',
				fontVariantNumeric: 'tabular-nums'
			}}
		>
			{time}
		</Typography>
	);
}

// ─── Quick-link card ──────────────────────────────────────────────────────────

function QuickLinkCard({ link, delay }: { link: (typeof quickLinks)[0]; delay: number }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0, transition: { delay, duration: 0.4 } }}
			style={{ height: '100%' }}
		>
			<Paper
				component={Link}
				to={link.url}
				sx={(theme) => ({
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
					p: 3,
					borderRadius: '16px',
					height: '100%',
					textDecoration: 'none',
					border: '1px solid',
					borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
					backgroundColor:
						theme.palette.mode === 'dark'
							? 'rgba(255,255,255,0.03)'
							: 'rgba(255,255,255,0.9)',
					backdropFilter: 'blur(12px)',
					transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
					'&:hover': {
						transform: 'translateY(-6px)',
						boxShadow: `0 12px 40px ${link.accent}`,
						borderColor: link.color
					}
				})}
				elevation={0}
			>
				{/* Icon */}
				<Box
					sx={{
						width: 48,
						height: 48,
						borderRadius: '12px',
						background: link.bg,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						boxShadow: `0 4px 16px ${link.accent}`
					}}
				>
					<FuseSvgIcon sx={{ color: '#fff' }} size={22}>
						{link.icon}
					</FuseSvgIcon>
				</Box>

				{/* Text */}
				<div>
					<Typography
						sx={{
							fontWeight: 800,
							fontSize: '1rem',
							letterSpacing: '-0.01em',
							color: 'text.primary'
						}}
					>
						{link.label}
					</Typography>
					<Typography
						sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}
					>
						{link.description}
					</Typography>
				</div>

				{/* Arrow */}
				<Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: link.color }}>
						Open
					</Typography>
					<FuseSvgIcon size={14} sx={{ color: link.color }}>
						lucide:arrow-right
					</FuseSvgIcon>
				</Box>
			</Paper>
		</motion.div>
	);
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function WelcomeView() {
	const { data: user, isGuest } = useUser();

	const displayName = useMemo(() => {
		if (isGuest || !user) return '';
		return (user as any)?.displayName || (user as any)?.email?.split('@')[0] || '';
	}, [user, isGuest]);

	const today = useMemo(
		() =>
			new Date().toLocaleDateString([], {
				weekday: 'long',
				month: 'long',
				day: 'numeric'
			}),
		[]
	);

	return (
		<Root
			scroll="page"
			content={
				<div
					style={{
						minHeight: '100vh',
						display: 'flex',
						flexDirection: 'column'
					}}
				>
					{/* ── Hero ───────────────────────────────────────────────── */}
					<Box
						sx={{
							position: 'relative',
							overflow: 'hidden',
							background:
								'linear-gradient(160deg, #0f172a 0%, #1e2d45 45%, #0f1a2e 100%)',
							px: { xs: 4, md: 8 },
							py: { xs: 8, md: 10 },
							flexShrink: 0
						}}
					>
						{/* Grid pattern */}
						<div
							style={{
								position: 'absolute',
								inset: 0,
								backgroundImage:
									'linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)',
								backgroundSize: '40px 40px',
								pointerEvents: 'none'
							}}
						/>
						{/* Glow blobs */}
						<div
							style={{
								position: 'absolute',
								top: '-80px',
								right: '-60px',
								width: '360px',
								height: '360px',
								borderRadius: '50%',
								background:
									'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)',
								pointerEvents: 'none'
							}}
						/>
						<div
							style={{
								position: 'absolute',
								bottom: '-100px',
								left: '10%',
								width: '320px',
								height: '320px',
								borderRadius: '50%',
								background:
									'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)',
								pointerEvents: 'none'
							}}
						/>

						{/* Content */}
						<div style={{ position: 'relative', zIndex: 1 }}>
							<motion.div
								initial={{ opacity: 0, y: -12 }}
								animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
								style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}
							>
								<Chip
									label="Platform"
									size="small"
									sx={{
										backgroundColor: 'rgba(37,99,235,0.2)',
										color: '#93c5fd',
										border: '1px solid rgba(37,99,235,0.35)',
										fontWeight: 700,
										fontSize: '0.7rem',
										letterSpacing: '0.06em'
									}}
								/>
								<LiveClock />
								<Typography
									sx={{
										fontSize: '0.8rem',
										color: 'rgba(255,255,255,0.3)',
										ml: 'auto'
									}}
								>
									{today}
								</Typography>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.08, duration: 0.55 } }}
							>
								<Typography
									component="h1"
									sx={{
										fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' },
										fontWeight: 900,
										lineHeight: 1.12,
										letterSpacing: '-0.03em',
										mb: 2
									}}
								>
									<Greeting name={displayName} />
								</Typography>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.45 } }}
							>
								<Typography
									sx={{
										fontSize: { xs: '0.95rem', md: '1.1rem' },
										color: 'rgba(148,163,184,0.7)',
										maxWidth: 520,
										lineHeight: 1.75,
										mb: 4
									}}
								>
									Welcome to the EcoCloud platform. Manage content, accounts, and
									cultural programmes all in one place.
								</Typography>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.28, duration: 0.4 } }}
								style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
							>
								<Button
									component={Link}
									to="/content/lessons"
									variant="contained"
									size="medium"
									startIcon={<FuseSvgIcon size={16}>heroicons-outline:academic-cap</FuseSvgIcon>}
									sx={{
										background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
										fontWeight: 700,
										textTransform: 'none',
										borderRadius: '10px',
										px: 3,
										boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
										'&:hover': {
											background: 'linear-gradient(135deg, #1e40af, #1d4ed8)',
											boxShadow: '0 6px 20px rgba(37,99,235,0.55)'
										}
									}}
								>
									Browse Lessons
								</Button>
								<Button
									component={Link}
									to="/administration/dashboard"
									variant="outlined"
									size="medium"
									sx={{
										borderColor: 'rgba(255,255,255,0.2)',
										color: 'rgba(255,255,255,0.75)',
										fontWeight: 600,
										textTransform: 'none',
										borderRadius: '10px',
										px: 3,
										'&:hover': {
											borderColor: 'rgba(255,255,255,0.45)',
											backgroundColor: 'rgba(255,255,255,0.06)'
										}
									}}
								>
									Go to Admin
								</Button>
							</motion.div>
						</div>
					</Box>

					{/* ── Quick links ─────────────────────────────────────────── */}
					<Box sx={{ p: { xs: 3, md: 6 }, flex: 1 }}>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0.35 } }}
						>
							<Typography
								sx={{
									fontSize: '0.72rem',
									fontWeight: 800,
									letterSpacing: '0.12em',
									textTransform: 'uppercase',
									color: 'text.disabled',
									mb: 3
								}}
							>
								Quick access
							</Typography>
						</motion.div>

						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
								gap: 16
							}}
						>
							{quickLinks.map((link, i) => (
								<QuickLinkCard key={link.url} link={link} delay={0.4 + i * 0.06} />
							))}
						</div>

						{/* ── Footer note ── */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, transition: { delay: 0.85 } }}
							style={{ marginTop: 48, textAlign: 'center' }}
						>
							<Typography sx={{ fontSize: '0.78rem', color: 'text.disabled' }}>
								EcoCloud Media Platform &mdash; All rights reserved
							</Typography>
						</motion.div>
					</Box>
				</div>
			}
		/>
	);
}