'use client';

import { useMemo, useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Paper,
	Chip,
	Avatar,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	LinearProgress,
	Button,
	Skeleton
} from '@mui/material';
import { Grid } from '@mui/material';
import { motion } from 'motion/react';
import FusePageCarded from '@fuse/core/FusePageCarded';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { styled } from '@mui/material/styles';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import useUser from '@auth/useUser';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';

import { useAccountsList } from '@/app/(control-panel)/administration/accounts/api/hooks/accounts/useAccountsList';
import { useSubscriptionsList } from '@/app/(control-panel)/administration/subscriptions/api/hooks/useSubscriptionsList';
import {
	useRadioAdminEmissions,
	useRadioAdminEpisodes,
	useRadioAdminReportages
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { useSearchLessons } from '../../../../content/(lesson)/api/hooks/lessons/useSearchLessons';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT_BLUE = '#1565C0';

const PALETTE: Array<{ color: string; bg: string }> = [
	{ color: ACCENT_BLUE, bg: '#eff6ff' },
	{ color: '#0284c7',   bg: '#e0f2fe' },
	{ color: '#7c3aed',   bg: '#f5f3ff' },
	{ color: '#db2777',   bg: '#fdf2f8' },
	{ color: '#059669',   bg: '#ecfdf5' }
];

const FADE_START = 20;
const FADE_END   = 180;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100% !important' }
}));

function safeFmt(dateStr?: string): string {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
}

function daysLeft(endDate?: string): number | null {
	if (!endDate) return null;
	const d = parseISO(endDate);
	return isValid(d) ? differenceInDays(d, new Date()) : null;
}

function initials(name?: string): string {
	if (!name) return '?';
	return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Fade({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 18 }}
			animate={{ opacity: 1, y: 0, transition: { delay, duration: 0.35 } }}
			style={{ height: '100%' }}
		>
			{children}
		</motion.div>
	);
}

// ─── Stat card ────────────────────────────────────────────────────────────────

type StatCardProps = {
	icon: string;
	label: string;
	value: number | string;
	sub?: string;
	color: string;
	bgColor: string;
	delay?: number;
	to?: string;
	loading?: boolean;
};

function StatCard({ icon, label, value, sub, color, bgColor, delay = 0, to, loading }: StatCardProps) {
	return (
		<Fade delay={delay}>
			<Paper
				component={to ? NavLinkAdapter : 'div'}
				{...(to ? { to } : {})}
				elevation={0}
				sx={{
					p: 2.5,
					height: '100%',
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: 3,
					display: 'flex',
					alignItems: 'center',
					gap: 2,
					cursor: to ? 'pointer' : 'default',
					textDecoration: 'none',
					transition: 'box-shadow 0.2s, transform 0.2s',
					'&:hover': to ? { boxShadow: 4, transform: 'translateY(-2px)' } : {}
				}}
			>
				<Box
					sx={{
						width: 48, height: 48, borderRadius: 2.5,
						backgroundColor: bgColor,
						display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
					}}
				>
					<FuseSvgIcon sx={{ color }} size={22}>{icon}</FuseSvgIcon>
				</Box>

				<Box sx={{ minWidth: 0 }}>
					{loading ? (
						<>
							<Skeleton width={48} height={28} />
							<Skeleton width={80} height={14} sx={{ mt: 0.3 }} />
						</>
					) : (
						<>
							<Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, color: 'text.primary' }}>
								{value}
							</Typography>
							<Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.secondary', mt: 0.3 }}>
								{label}
							</Typography>
							{sub && (
								<Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', mt: 0.2 }}>
									{sub}
								</Typography>
							)}
						</>
					)}
				</Box>
			</Paper>
		</Fade>
	);
}

// ─── Section card ─────────────────────────────────────────────────────────────

type SectionCardProps = {
	title: string;
	icon: string;
	children: React.ReactNode;
	action?: React.ReactNode;
	delay?: number;
};

function SectionCard({ title, icon, children, action, delay = 0 }: SectionCardProps) {
	return (
		<Fade delay={delay}>
			<Paper
				elevation={0}
				sx={{
					border: '1px solid', borderColor: 'divider', borderRadius: 3,
					overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column'
				}}
			>
				<Box
					sx={{
						px: 2.5, py: 1.5,
						display: 'flex', alignItems: 'center', justifyContent: 'space-between',
						borderBottom: '1px solid', borderColor: 'divider',
						backgroundColor: 'background.default', flexShrink: 0
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
						<FuseSvgIcon size={16} sx={{ color: ACCENT_BLUE }}>{icon}</FuseSvgIcon>
						<Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: 'text.primary' }}>
							{title}
						</Typography>
					</Box>
					{action}
				</Box>
				<Box sx={{ flex: 1, overflow: 'hidden' }}>{children}</Box>
			</Paper>
		</Fade>
	);
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function MiniBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
	const pct = max > 0 ? (count / max) * 100 : 0;
	return (
		<Box sx={{ mb: 1.5 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
				<Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
				<Typography sx={{ fontSize: '0.78rem', color: 'text.primary', fontWeight: 700 }}>{count}</Typography>
			</Box>
			<LinearProgress
				variant="determinate"
				value={pct}
				sx={{
					height: 5, borderRadius: 3, backgroundColor: 'action.hover',
					'& .MuiLinearProgress-bar': { backgroundColor: color, borderRadius: 3 }
				}}
			/>
		</Box>
	);
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
	return (
		<Chip
			label={active ? 'Active' : 'Inactive'}
			size="small"
			sx={{
				height: 20, fontSize: '0.68rem', fontWeight: 700,
				backgroundColor: active ? '#dcfce7' : '#f1f5f9',
				color: active ? '#15803d' : '#94a3b8',
				border: `1px solid ${active ? '#86efac' : '#e2e8f0'}`
			}}
		/>
	);
}

// ─── Publication chip ─────────────────────────────────────────────────────────

function PubChip({ published, approved }: { published: boolean; approved?: boolean }) {
	const label    = published ? 'Published' : approved ? 'Approved' : 'Draft';
	const bgColor  = published ? '#dcfce7' : approved ? '#dbeafe' : '#f1f5f9';
	const txtColor = published ? '#15803d' : approved ? '#1d4ed8' : '#64748b';
	return (
		<Chip
			label={label}
			size="small"
			sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, backgroundColor: bgColor, color: txtColor }}
		/>
	);
}

// ─── "View all" button ────────────────────────────────────────────────────────

function ViewAll({ to }: { to: string }) {
	return (
		<Button
			component={NavLinkAdapter}
			to={to}
			size="small"
			sx={{ fontSize: '0.72rem', textTransform: 'none', color: ACCENT_BLUE, minWidth: 0 }}
		>
			View all
		</Button>
	);
}

// ─── Dashboard header ─────────────────────────────────────────────────────────

function DashboardHeader() {
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const el = document.querySelector('.FusePageCarded-contentWrapper') as HTMLElement;
		if (!el) return;
		const onScroll = () => setScrollY(el.scrollTop);
		el.addEventListener('scroll', onScroll, { passive: true });
		return () => el.removeEventListener('scroll', onScroll);
	}, []);

	const progress       = Math.min(1, Math.max(0, (scrollY - FADE_START) / (FADE_END - FADE_START)));
	const heroOpacity    = 1 - progress;
	const heroTranslateY = -(progress * 24);

	return (
		<Box
			sx={{ width: '100%', overflow: 'hidden' }}
			style={{
				opacity: heroOpacity,
				transform: `translateY(${heroTranslateY}px)`,
				pointerEvents: progress > 0.9 ? 'none' : 'auto',
				willChange: 'opacity, transform, max-height',
				maxHeight: progress >= 1 ? 0 : undefined,
			}}
		>
			<Box
				sx={{
					position: 'relative',
					px: 6, py: 5,
					background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 45%, #0A2472 100%)',
					overflow: 'hidden'
				}}
			>
				<Box
					sx={{
						position: 'absolute', inset: 0, pointerEvents: 'none',
						backgroundImage: `
							radial-gradient(circle at 10% 80%, rgba(255,255,255,0.07) 0%, transparent 40%),
							radial-gradient(circle at 90% 20%, rgba(255,255,255,0.05) 0%, transparent 35%)
						`
					}}
				/>
				<motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.08 } }}>
					<Typography
						variant="h3"
						sx={{ color: 'white', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em', position: 'relative' }}
					>
						Administration Dashboard
					</Typography>
					<Typography sx={{ mt: 1, fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, position: 'relative' }}>
						Manage accounts, subscriptions, roles, and radio content all in one place.
					</Typography>
				</motion.div>
			</Box>
		</Box>
	);
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function DashboardView() {
	const { data: currentAccount } = useUser();
	const token = currentAccount?.token;

	const { data: accounts      = [], isLoading: loadingAccounts  } = useAccountsList(token);
	const { data: subscriptions = [], isLoading: loadingSubs      } = useSubscriptionsList(token);
	const { data: emissionsData,      isLoading: loadingEmissions } = useRadioAdminEmissions(token);
	const { data: episodesData,       isLoading: loadingEpisodes  } = useRadioAdminEpisodes(token);
	const { data: reportagesData,     isLoading: loadingReportages} = useRadioAdminReportages(token);
	const { data: lessonsData,        isLoading: loadingLessons   } = useSearchLessons(
		currentAccount?.id,
		currentAccount?.token?.access,
		{ limit: 200, offset: 0 }
	);

	const emissions  = emissionsData?.items  ?? [];
	const episodes   = episodesData?.items   ?? [];
	const reportages = reportagesData?.items ?? [];
	const lessons    = lessonsData?.items    ?? [];

	const isLoading =
		loadingAccounts || loadingSubs ||
		loadingEmissions || loadingEpisodes || loadingReportages || loadingLessons;

	// ── Derived stats ──────────────────────────────────────────────────────────

	const activeAccounts      = useMemo(() => accounts.filter((a) => a.is_active).length, [accounts]);
	const activeSubs          = useMemo(() => subscriptions.filter((s) => s.is_active).length, [subscriptions]);
	const publishedEmissions  = useMemo(() => emissions.filter((e) => e.is_published).length, [emissions]);
	const publishedEpisodes   = useMemo(() => episodes.filter((e) => e.is_published).length, [episodes]);
	const publishedReportages = useMemo(() => reportages.filter((r) => r.is_published).length, [reportages]);
	const publishedLessons    = useMemo(() => lessons.filter((l) => l.is_published).length, [lessons]);

	const subsExpiringSoon = useMemo(
		() => subscriptions.filter((s) => {
			const days = daysLeft(s.end_date);
			return s.is_active && days !== null && days >= 0 && days <= 30;
		}).length,
		[subscriptions]
	);

	const recentAccounts = useMemo(
		() => [...accounts].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')).slice(0, 6),
		[accounts]
	);

	const recentSubs = useMemo(
		() => [...subscriptions].sort((a, b) => b.id - a.id).slice(0, 5),
		[subscriptions]
	);

	const recentEmissions = useMemo(
		() => [...emissions].sort((a, b) => b.id - a.id).slice(0, 5),
		[emissions]
	);

	const recentEpisodes = useMemo(
		() => [...episodes].sort((a, b) => b.id - a.id).slice(0, 5),
		[episodes]
	);

	// ── Role distribution ──────────────────────────────────────────────────────

	const roleDistribution = useMemo(() => {
		const counts: Record<string, number> = {};
		accounts.forEach((a) => {
			a.roles?.forEach((r) => { counts[r.name] = (counts[r.name] ?? 0) + 1; });
		});
		return Object.entries(counts).sort((x, y) => y[1] - x[1]).slice(0, 5);
	}, [accounts]);

	const maxRoleCount = roleDistribution[0]?.[1] ?? 1;

	// ── Emission type distribution ─────────────────────────────────────────────

	const emissionTypeDistribution = useMemo(() => {
		const counts: Record<string, number> = {};
		emissions.forEach((e) => {
			const name = e.emission_type?.name ?? 'Untyped';
			counts[name] = (counts[name] ?? 0) + 1;
		});
		return Object.entries(counts).sort((x, y) => y[1] - x[1]).slice(0, 4);
	}, [emissions]);

	const maxEmTypeCount = emissionTypeDistribution[0]?.[1] ?? 1;

	// ── Stat cards config ──────────────────────────────────────────────────────

	const statCards = [
		{
			icon: 'lucide:users',
			label: 'Total Accounts',
			value: accounts.length,
			sub: `${activeAccounts} active`,
			color: ACCENT_BLUE,
			bgColor: '#eff6ff',
			delay: 0.05,
			to: '/administration/accounts'
		},
		{
			icon: 'lucide:credit-card',
			label: 'Subscriptions',
			value: subscriptions.length,
			sub: `${activeSubs} active · ${subsExpiringSoon} expiring soon`,
			color: '#7c3aed',
			bgColor: '#f5f3ff',
			delay: 0.1,
			to: '/administration/subscriptions'
		},
		{
			icon: 'lucide:radio',
			label: 'Emissions',
			value: emissions.length,
			sub: `${publishedEmissions} published`,
			color: '#0891b2',
			bgColor: '#ecfeff',
			delay: 0.15,
			to: '/administration/radio/emissions'
		},
		{
			icon: 'lucide:mic-2',
			label: 'Episodes',
			value: episodes.length,
			sub: `${publishedEpisodes} published`,
			color: '#059669',
			bgColor: '#ecfdf5',
			delay: 0.2,
			to: '/administration/radio/episodes'
		},
		{
			icon: 'lucide:film',
			label: 'Reportages',
			value: reportages.length,
			sub: `${publishedReportages} published`,
			color: '#dc2626',
			bgColor: '#fef2f2',
			delay: 0.25,
			to: '/administration/radio/reportages'
		},
		{
			icon: 'lucide:book-open',
			label: 'Lessons',
			value: lessons.length,
			sub: `${publishedLessons} published`,
			color: '#7c3aed',
			bgColor: '#f5f3ff',
			delay: 0.3,
			to: '/lessons'
		}
	];

	// ── Quick actions config ───────────────────────────────────────────────────

	const quickActions = [
		{ label: 'Add Account',      icon: 'lucide:user-plus',   to: '/administration/accounts/new',      color: ACCENT_BLUE, bg: '#eff6ff' },
		{ label: 'New Subscription', icon: 'lucide:credit-card', to: '/administration/subscriptions/new', color: '#7c3aed',   bg: '#f5f3ff' },
		{ label: 'Create Role',      icon: 'lucide:shield-plus', to: '/administration/roles/new',         color: '#d97706',   bg: '#fffbeb' },
		{ label: 'Add Emission',     icon: 'lucide:radio',       to: '/administration/radio/emissions',   color: '#0891b2',   bg: '#ecfeff' },
		{ label: 'New Episode',      icon: 'lucide:mic-2',       to: '/administration/radio/episodes',    color: '#059669',   bg: '#ecfdf5' },
		{ label: 'Add Reportage',    icon: 'lucide:film',        to: '/administration/radio/reportages',  color: '#dc2626',   bg: '#fef2f2' }
	];

	// ── Skeleton placeholder ───────────────────────────────────────────────────

	function ListSkeleton({ rows = 5 }: { rows?: number }) {
		return (
			<>
				{Array.from({ length: rows }).map((_, i) => (
					<Box key={i} sx={{ px: 2.5, py: 1.5, borderBottom: i < rows - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
						<Skeleton width="60%" height={14} />
						<Skeleton width="40%" height={12} sx={{ mt: 0.5 }} />
					</Box>
				))}
			</>
		);
	}

	// ──────────────────────────────────────────────────────────────────────────

	return (
		<Root
			scroll="content"
			header={<DashboardHeader />}
			content={
				<Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>

					{/* ── Stat cards ──────────────────────────────────────── */}
					<Grid container spacing={2} sx={{ mb: 3 }}>
						{statCards.map((card) => (
							<Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={card.label}>
								<StatCard {...card} loading={isLoading} />
							</Grid>
						))}
					</Grid>

					{/* ── Middle row ──────────────────────────────────────── */}
					<Grid container spacing={2} sx={{ mb: 3 }}>

						{/* Recent accounts */}
						<Grid size={{ xs: 12, md: 5 }}>
							<SectionCard title="Recent Accounts" icon="lucide:user-plus" delay={0.35} action={<ViewAll to="/administration/accounts" />}>
								{isLoading ? (
									<ListSkeleton rows={6} />
								) : (
									<List disablePadding>
										{recentAccounts.length === 0 && (
											<Box sx={{ p: 3 }}>
												<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No accounts yet</Typography>
											</Box>
										)}
										{recentAccounts.map((acc, i) => (
											<ListItem key={acc.id} divider={i < recentAccounts.length - 1} sx={{ px: 2.5, py: 1.25 }}>
												<ListItemAvatar>
													<Avatar
														src={acc.avatar_url}
														sx={{
															width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700,
															background: `linear-gradient(135deg, ${ACCENT_BLUE}, #0A2472)`, color: '#fff'
														}}
													>
														{initials(acc.full_name || acc.username)}
													</Avatar>
												</ListItemAvatar>
												<ListItemText
													primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>{acc.full_name || acc.username}</Typography>}
													secondary={<Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{acc.email}</Typography>}
												/>
												<StatusBadge active={acc.is_active} />
											</ListItem>
										))}
									</List>
								)}
							</SectionCard>
						</Grid>

						{/* Role distribution + Emission types */}
						<Grid size={{ xs: 12, md: 3.5 }}>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
								<SectionCard title="Role Distribution" icon="lucide:pie-chart" delay={0.4}>
									<Box sx={{ px: 2.5, py: 2 }}>
										{isLoading ? (
											<>{[80, 60, 45, 35, 25].map((w, i) => <Skeleton key={i} width={`${w}%`} height={14} sx={{ mb: 1 }} />)}</>
										) : roleDistribution.length === 0 ? (
											<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No data</Typography>
										) : (
											roleDistribution.map(([name, count], i) => (
												<MiniBar key={name} label={name} count={count} max={maxRoleCount} color={PALETTE[i % PALETTE.length].color} />
											))
										)}
									</Box>
								</SectionCard>

								<SectionCard title="Emission Types" icon="lucide:layers" delay={0.45}>
									<Box sx={{ px: 2.5, py: 2 }}>
										{isLoading ? (
											<>{[70, 55, 40, 30].map((w, i) => <Skeleton key={i} width={`${w}%`} height={14} sx={{ mb: 1 }} />)}</>
										) : emissionTypeDistribution.length === 0 ? (
											<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No data</Typography>
										) : (
											emissionTypeDistribution.map(([name, count], i) => (
												<MiniBar key={name} label={name} count={count} max={maxEmTypeCount} color={PALETTE[i % PALETTE.length].color} />
											))
										)}
									</Box>
								</SectionCard>
							</Box>
						</Grid>

						{/* Recent subscriptions */}
						<Grid size={{ xs: 12, md: 3.5 }}>
							<SectionCard title="Recent Subscriptions" icon="lucide:credit-card" delay={0.5} action={<ViewAll to="/administration/subscriptions" />}>
								{isLoading ? (
									<ListSkeleton rows={5} />
								) : (
									<List disablePadding>
										{recentSubs.length === 0 && (
											<Box sx={{ p: 3 }}>
												<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No subscriptions yet</Typography>
											</Box>
										)}
										{recentSubs.map((sub, i) => {
											const acct     = sub.account as any;
											const days     = daysLeft(sub.end_date);
											const expiring = sub.is_active && days !== null && days >= 0 && days <= 14;
											return (
												<ListItem key={sub.id} divider={i < recentSubs.length - 1} sx={{ px: 2.5, py: 1.25, flexDirection: 'column', alignItems: 'flex-start' }}>
													<Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 0.3 }}>
														<Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
															{acct?.full_name ?? `Account #${acct?.id}`}
														</Typography>
														<StatusBadge active={sub.is_active} />
													</Box>
													<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
														<Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', fontFamily: 'monospace' }}>
															{sub.reference || '—'}
														</Typography>
														{expiring && (
															<Chip label={`${days}d left`} size="small" sx={{ height: 17, fontSize: '0.63rem', fontWeight: 700, backgroundColor: '#fef9c3', color: '#854d0e' }} />
														)}
													</Box>
													<Typography sx={{ fontSize: '0.7rem', color: 'text.disabled', mt: 0.2 }}>
														{safeFmt(sub.start_date)} → {safeFmt(sub.end_date)}
													</Typography>
												</ListItem>
											);
										})}
									</List>
								)}
							</SectionCard>
						</Grid>
					</Grid>

					{/* ── Bottom row ──────────────────────────────────────── */}
					<Grid container spacing={2}>

						{/* Recent emissions */}
						<Grid size={{ xs: 12, md: 4 }}>
							<SectionCard title="Recent Emissions" icon="lucide:radio" delay={0.55} action={<ViewAll to="/administration/radio/emissions" />}>
								{isLoading ? (
									<ListSkeleton rows={5} />
								) : (
									<List disablePadding>
										{recentEmissions.length === 0 && (
											<Box sx={{ p: 3 }}>
												<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No emissions yet</Typography>
											</Box>
										)}
										{recentEmissions.map((em, i) => (
											<ListItem key={em.id} divider={i < recentEmissions.length - 1} sx={{ px: 2.5, py: 1.25 }}>
												<Box sx={{ width: '100%', minWidth: 0 }}>
													<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
														<Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
															{em.name}
														</Typography>
														<PubChip published={em.is_published} approved={em.is_approved_content} />
													</Box>
													<Box sx={{ display: 'flex', gap: 0.75 }}>
														{em.emission_type?.name && <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>{em.emission_type.name}</Typography>}
														{em.language?.name && <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>· {em.language.name}</Typography>}
													</Box>
												</Box>
											</ListItem>
										))}
									</List>
								)}
							</SectionCard>
						</Grid>

						{/* Recent episodes */}
						<Grid size={{ xs: 12, md: 4 }}>
							<SectionCard title="Recent Episodes" icon="lucide:mic-2" delay={0.6} action={<ViewAll to="/administration/radio/episodes" />}>
								{isLoading ? (
									<ListSkeleton rows={5} />
								) : (
									<List disablePadding>
										{recentEpisodes.length === 0 && (
											<Box sx={{ p: 3 }}>
												<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No episodes yet</Typography>
											</Box>
										)}
										{recentEpisodes.map((ep, i) => (
											<ListItem key={ep.id} divider={i < recentEpisodes.length - 1} sx={{ px: 2.5, py: 1.25 }}>
												<Box sx={{ width: '100%', minWidth: 0 }}>
													<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
														<Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
															{ep.name}
														</Typography>
														<PubChip published={ep.is_published} />
													</Box>
													<Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
														{ep.emission?.name ?? '—'}{ep.season?.name ? ` · ${ep.season.name}` : ''}
													</Typography>
												</Box>
											</ListItem>
										))}
									</List>
								)}
							</SectionCard>
						</Grid>

						{/* Quick actions */}
						<Grid size={{ xs: 12, md: 4 }}>
							<Fade delay={0.65}>
								<Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', height: '100%' }}>
									<Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.25, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}>
										<FuseSvgIcon size={16} sx={{ color: ACCENT_BLUE }}>lucide:zap</FuseSvgIcon>
										<Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Quick Actions</Typography>
									</Box>
									<Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
										{quickActions.map((action) => (
											<Box
												key={action.label}
												component={NavLinkAdapter}
												to={action.to}
												sx={{
													display: 'flex', alignItems: 'center', gap: 1.5,
													p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider',
													textDecoration: 'none',
													transition: 'background-color 0.15s, box-shadow 0.15s',
													'&:hover': { backgroundColor: 'action.hover', boxShadow: 1 }
												}}
											>
												<Box sx={{ width: 30, height: 30, borderRadius: 1.5, backgroundColor: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
													<FuseSvgIcon size={15} sx={{ color: action.color }}>{action.icon}</FuseSvgIcon>
												</Box>
												<Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: 'text.primary' }}>{action.label}</Typography>
												<FuseSvgIcon size={13} sx={{ color: 'text.disabled', ml: 'auto' }}>lucide:chevron-right</FuseSvgIcon>
											</Box>
										))}
									</Box>
								</Paper>
							</Fade>
						</Grid>
					</Grid>
				</Box>
			}
		/>
	);
}