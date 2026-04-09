'use client';

import { useMemo } from 'react';
import {
	Box, Typography, Paper, Chip, Avatar, Divider, LinearProgress,
	List, ListItem, ListItemAvatar, ListItemText, Grid
} from '@mui/material';
import { motion } from 'motion/react';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { styled } from '@mui/material/styles';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import useUser from '@auth/useUser';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import Button from '@mui/material/Button';
import PageBreadcrumb from 'src/components/PageBreadcrumb';

import { useAccountsList } from '@/app/(control-panel)/administration/accounts/api/hooks/accounts/useAccountsList';
import { useSubscriptionsList } from '@/app/(control-panel)/administration/subscriptions/api/hooks/useSubscriptionsList';
import { useRolesList } from '@/app/(control-panel)/administration/roles/api/hooks/useRolesList';
import { useRadioAdminEmissions, useRadioAdminEpisodes, useRadioAdminReportages } from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' }
}));

function safeFmt(dateStr: string | undefined) {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
}

function daysLeft(endDate: string | undefined): number | null {
	if (!endDate) return null;
	const d = parseISO(endDate);
	if (!isValid(d)) return null;
	return differenceInDays(d, new Date());
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type StatCardProps = {
	icon: string;
	label: string;
	value: number | string;
	sub?: string;
	color: string;
	bgColor: string;
	delay?: number;
	to?: string;
};

function StatCard({ icon, label, value, sub, color, bgColor, delay = 0, to }: StatCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0, transition: { delay } }}
			style={{ height: '100%' }}
		>
			<Paper
				component={to ? NavLinkAdapter : 'div'}
				{...(to ? { to } : {})}
				elevation={0}
				sx={{
					p: 3,
					height: '100%',
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: 3,
					display: 'flex',
					alignItems: 'center',
					gap: 2.5,
					cursor: to ? 'pointer' : 'default',
					transition: 'box-shadow 0.2s, transform 0.2s',
					textDecoration: 'none',
					'&:hover': to ? {
						boxShadow: 4,
						transform: 'translateY(-2px)'
					} : {}
				}}
			>
				<Box
					sx={{
						width: 56, height: 56, borderRadius: 2.5,
						backgroundColor: bgColor,
						display: 'flex', alignItems: 'center', justifyContent: 'center',
						flexShrink: 0
					}}
				>
					<FuseSvgIcon sx={{ color }} size={26}>{icon}</FuseSvgIcon>
				</Box>
				<Box>
					<Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, color: 'text.primary' }}>
						{value}
					</Typography>
					<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.secondary', mt: 0.3 }}>
						{label}
					</Typography>
					{sub && (
						<Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', mt: 0.2 }}>
							{sub}
						</Typography>
					)}
				</Box>
			</Paper>
		</motion.div>
	);
}

type SectionCardProps = {
	title: string;
	icon: string;
	children: React.ReactNode;
	action?: React.ReactNode;
	delay?: number;
};

function SectionCard({ title, icon, children, action, delay = 0 }: SectionCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0, transition: { delay } }}
			style={{ height: '100%' }}
		>
			<Paper
				elevation={0}
				sx={{
					border: '1px solid',
					borderColor: 'divider',
					borderRadius: 3,
					overflow: 'hidden',
					height: '100%',
					display: 'flex',
					flexDirection: 'column'
				}}
			>
				<Box
					sx={{
						px: 3, py: 2,
						display: 'flex', alignItems: 'center', justifyContent: 'space-between',
						borderBottom: '1px solid',
						borderColor: 'divider',
						backgroundColor: 'background.default'
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<FuseSvgIcon size={18} sx={{ color: '#1565C0' }}>{icon}</FuseSvgIcon>
						<Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
							{title}
						</Typography>
					</Box>
					{action}
				</Box>
				<Box sx={{ flex: 1, overflow: 'hidden' }}>{children}</Box>
			</Paper>
		</motion.div>
	);
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

type MiniBarProps = { label: string; count: number; max: number; color: string };
function MiniBar({ label, count, max, color }: MiniBarProps) {
	const pct = max > 0 ? (count / max) * 100 : 0;
	return (
		<Box sx={{ mb: 1.5 }}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
				<Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
				<Typography sx={{ fontSize: '0.8rem', color: 'text.primary', fontWeight: 700 }}>{count}</Typography>
			</Box>
			<LinearProgress
				variant="determinate"
				value={pct}
				sx={{
					height: 6, borderRadius: 3,
					backgroundColor: 'action.hover',
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
				height: 20, fontSize: '0.7rem', fontWeight: 700,
				backgroundColor: active ? '#dcfce7' : '#f1f5f9',
				color: active ? '#15803d' : '#94a3b8',
				border: `1px solid ${active ? '#86efac' : '#e2e8f0'}`
			}}
		/>
	);
}

// ─── Dashboard header ─────────────────────────────────────────────────────────

function DashboardHeader() {
	return (
		<Box sx={{ width: '100%' }}>
			<Box sx={{ px: 4, py: 2 }}>
				<PageBreadcrumb className="text-sm" />
			</Box>
			<Box
				sx={{
					position: 'relative',
					px: 6, py: 5,
					background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 45%, #0A2472 100%)',
					overflow: 'hidden'
				}}
			>
				{/* decorative blobs */}
				<Box sx={{
					position: 'absolute', inset: 0, pointerEvents: 'none',
					backgroundImage: `
						radial-gradient(circle at 10% 80%, rgba(255,255,255,0.07) 0%, transparent 40%),
						radial-gradient(circle at 90% 20%, rgba(255,255,255,0.05) 0%, transparent 35%)
					`
				}} />

				<motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}>
					<Typography variant="h3" sx={{ color: 'white', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
						Administration Dashboard
					</Typography>
					<Typography sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.5, fontSize: '0.95rem', fontWeight: 400 }}>
						Overview of accounts, subscriptions, and radio content
					</Typography>
				</motion.div>
			</Box>
		</Box>
	);
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function DashboardView() {
	const { data: currentAccount } = useUser();
	const token = currentAccount?.token;

	const { data: accounts = [], isLoading: loadingAccounts }           = useAccountsList(token);
	const { data: subscriptions = [], isLoading: loadingSubs }           = useSubscriptionsList(token);
	const { data: roles = [], isLoading: loadingRoles }                  = useRolesList(token);
	const { data: emissionsData, isLoading: loadingEmissions }           = useRadioAdminEmissions(token);
	const { data: episodesData, isLoading: loadingEpisodes }             = useRadioAdminEpisodes(token);
	const { data: reportagesData, isLoading: loadingReportages }         = useRadioAdminReportages(token);

	const emissions  = emissionsData?.items  ?? [];
	const episodes   = episodesData?.items   ?? [];
	const reportages = reportagesData?.items ?? [];

	const isLoading = loadingAccounts || loadingSubs || loadingRoles || loadingEmissions || loadingEpisodes || loadingReportages;

	// ── derived stats ──────────────────────────────────────────────────────────

	const activeAccounts   = useMemo(() => accounts.filter((a) => a.is_active).length, [accounts]);
	const activeSubs       = useMemo(() => subscriptions.filter((s) => s.is_active).length, [subscriptions]);
	const publishedEmissions = useMemo(() => emissions.filter((e) => e.is_published).length, [emissions]);
	const publishedEpisodes  = useMemo(() => episodes.filter((e) => e.is_published).length, [episodes]);

	const recentAccounts = useMemo(() =>
		[...accounts]
			.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
			.slice(0, 6),
		[accounts]
	);

	const recentSubs = useMemo(() =>
		[...subscriptions]
			.sort((a, b) => b.id - a.id)
			.slice(0, 5),
		[subscriptions]
	);

	const recentEmissions = useMemo(() =>
		[...emissions].sort((a, b) => b.id - a.id).slice(0, 5),
		[emissions]
	);

	const subsExpiringSoon = useMemo(() =>
		subscriptions.filter((s) => {
			const days = daysLeft(s.end_date);
			return s.is_active && days !== null && days >= 0 && days <= 30;
		}).length,
		[subscriptions]
	);

	// ── role distribution ──────────────────────────────────────────────────────
	const roleDistribution = useMemo(() => {
		const counts: Record<string, number> = {};
		accounts.forEach((a) => {
			a.roles?.forEach((r) => {
				counts[r.name] = (counts[r.name] ?? 0) + 1;
			});
		});
		return Object.entries(counts)
			.sort((x, y) => y[1] - x[1])
			.slice(0, 5);
	}, [accounts]);

	const maxRoleCount = roleDistribution[0]?.[1] ?? 1;

	// ── emission type distribution ─────────────────────────────────────────────
	const emissionTypeDistribution = useMemo(() => {
		const counts: Record<string, number> = {};
		emissions.forEach((e) => {
			const name = e.emission_type?.name ?? 'Untyped';
			counts[name] = (counts[name] ?? 0) + 1;
		});
		return Object.entries(counts).sort((x, y) => y[1] - x[1]).slice(0, 4);
	}, [emissions]);

	const maxEmTypeCount = emissionTypeDistribution[0]?.[1] ?? 1;

	if (isLoading) return <FuseLoading />;

	const ROLE_COLORS = ['#1565C0', '#0284c7', '#7c3aed', '#db2777', '#059669'];

	return (
		<Root
			header={<DashboardHeader />}
			content={
				<Box sx={{ p: { xs: 2, sm: 3, md: 4 }, overflowY: 'auto', height: '100%' }}>

					{/* ── Stat cards row ─────────────────────────────────────── */}
					<Grid container spacing={2.5} sx={{ mb: 3.5 }}>
						{[
							{
								icon: 'lucide:users', label: 'Total Accounts', value: accounts.length,
								sub: `${activeAccounts} active`, color: '#1565C0', bgColor: '#eff6ff',
								delay: 0.05, to: '/administration/accounts'
							},
							{
								icon: 'lucide:credit-card', label: 'Subscriptions', value: subscriptions.length,
								sub: `${activeSubs} active · ${subsExpiringSoon} expiring soon`,
								color: '#7c3aed', bgColor: '#f5f3ff', delay: 0.1, to: '/administration/subscriptions'
							},
							{
								icon: 'lucide:radio', label: 'Emissions', value: emissions.length,
								sub: `${publishedEmissions} published`, color: '#0891b2', bgColor: '#ecfeff',
								delay: 0.15, to: '/administration/radio/emissions'
							},
							{
								icon: 'lucide:mic-2', label: 'Episodes', value: episodes.length,
								sub: `${publishedEpisodes} published`, color: '#059669', bgColor: '#ecfdf5',
								delay: 0.2, to: '/administration/radio/episodes'
							},
							{
								icon: 'lucide:film', label: 'Reportages', value: reportages.length,
								sub: `${reportages.filter(r => r.is_published).length} published`,
								color: '#dc2626', bgColor: '#fef2f2', delay: 0.25, to: '/administration/radio/reportages'
							},
							{
								icon: 'lucide:shield', label: 'Roles', value: roles.length,
								sub: 'access control groups', color: '#d97706', bgColor: '#fffbeb',
								delay: 0.3, to: '/administration/roles'
							}
						].map((card) => (
							<Grid item xs={12} sm={6} md={4} lg={2} key={card.label}>
								<StatCard {...card} />
							</Grid>
						))}
					</Grid>

					{/* ── Middle row ─────────────────────────────────────────── */}
					<Grid container spacing={2.5} sx={{ mb: 3.5 }}>

						{/* Recent accounts */}
						<Grid item xs={12} md={5}>
							<SectionCard
								title="Recent Accounts"
								icon="lucide:user-plus"
								delay={0.35}
								action={
									<Button
										component={NavLinkAdapter}
										to="/administration/accounts"
										size="small"
										sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#1565C0' }}
									>
										View all
									</Button>
								}
							>
								<List disablePadding>
									{recentAccounts.map((acc, i) => (
										<ListItem
											key={acc.id}
											divider={i < recentAccounts.length - 1}
											sx={{ px: 3, py: 1.5 }}
										>
											<ListItemAvatar>
												<Avatar
													src={acc.avatar_url}
													sx={{
														width: 36, height: 36,
														fontSize: '0.85rem', fontWeight: 700,
														background: 'linear-gradient(135deg, #1565C0, #0A2472)',
														color: '#fff'
													}}
												>
													{acc.username?.charAt(0)?.toUpperCase()}
												</Avatar>
											</ListItemAvatar>
											<ListItemText
												primary={
													<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
														{acc.full_name || acc.username}
													</Typography>
												}
												secondary={
													<Typography sx={{ fontSize: '0.775rem', color: 'text.secondary' }}>
														{acc.email}
													</Typography>
												}
											/>
											<StatusBadge active={acc.is_active} />
										</ListItem>
									))}
								</List>
							</SectionCard>
						</Grid>

						{/* Role & subscription distribution */}
						<Grid item xs={12} md={3.5}>
							<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>
								<SectionCard title="Role Distribution" icon="lucide:pie-chart" delay={0.4}>
									<Box sx={{ px: 3, py: 2.5 }}>
										{roleDistribution.length === 0 ? (
											<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No data</Typography>
										) : (
											roleDistribution.map(([name, count], i) => (
												<MiniBar key={name} label={name} count={count} max={maxRoleCount} color={ROLE_COLORS[i % ROLE_COLORS.length]} />
											))
										)}
									</Box>
								</SectionCard>

								<SectionCard title="Emission Types" icon="lucide:layers" delay={0.45}>
									<Box sx={{ px: 3, py: 2.5 }}>
										{emissionTypeDistribution.length === 0 ? (
											<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No data</Typography>
										) : (
											emissionTypeDistribution.map(([name, count], i) => (
												<MiniBar key={name} label={name} count={count} max={maxEmTypeCount} color={ROLE_COLORS[i % ROLE_COLORS.length]} />
											))
										)}
									</Box>
								</SectionCard>
							</Box>
						</Grid>

						{/* Recent subscriptions */}
						<Grid item xs={12} md={3.5}>
							<SectionCard
								title="Recent Subscriptions"
								icon="lucide:credit-card"
								delay={0.5}
								action={
									<Button
										component={NavLinkAdapter}
										to="/administration/subscriptions"
										size="small"
										sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#1565C0' }}
									>
										View all
									</Button>
								}
							>
								<List disablePadding>
									{recentSubs.map((sub, i) => {
										const acct = sub.account as any;
										const days = daysLeft(sub.end_date);
										const expiringSoon = days !== null && days >= 0 && days <= 14;
										return (
											<ListItem
												key={sub.id}
												divider={i < recentSubs.length - 1}
												sx={{ px: 3, py: 1.5, flexDirection: 'column', alignItems: 'flex-start' }}
											>
												<Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', mb: 0.4 }}>
													<Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.primary' }}>
														{acct?.full_name ?? `Account #${acct?.id}`}
													</Typography>
													<StatusBadge active={sub.is_active} />
												</Box>
												<Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
													<Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontFamily: 'monospace' }}>
														{sub.reference || '—'}
													</Typography>
													{expiringSoon && sub.is_active && (
														<Chip
															label={`${days}d left`}
															size="small"
															sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#fef9c3', color: '#854d0e' }}
														/>
													)}
												</Box>
												<Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', mt: 0.2 }}>
													{safeFmt(sub.start_date)} → {safeFmt(sub.end_date)}
												</Typography>
											</ListItem>
										);
									})}
									{recentSubs.length === 0 && (
										<Box sx={{ p: 3 }}>
											<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No subscriptions yet</Typography>
										</Box>
									)}
								</List>
							</SectionCard>
						</Grid>
					</Grid>

					{/* ── Bottom row — Radio content ─────────────────────────── */}
					<Grid container spacing={2.5}>

						{/* Recent Emissions */}
						<Grid item xs={12} md={4}>
							<SectionCard
								title="Recent Emissions"
								icon="lucide:radio"
								delay={0.55}
								action={
									<Button
										component={NavLinkAdapter}
										to="/administration/radio/emissions"
										size="small"
										sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#1565C0' }}
									>
										View all
									</Button>
								}
							>
								<List disablePadding>
									{recentEmissions.map((em, i) => (
										<ListItem key={em.id} divider={i < recentEmissions.length - 1} sx={{ px: 3, py: 1.5 }}>
											<Box sx={{ width: '100%' }}>
												<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
													<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }} className="truncate" style={{ maxWidth: 180 }}>
														{em.name}
													</Typography>
													<Chip
														label={em.is_published ? 'Published' : em.is_approved_content ? 'Approved' : 'Draft'}
														size="small"
														sx={{
															height: 20, fontSize: '0.68rem', fontWeight: 700,
															backgroundColor: em.is_published ? '#dcfce7' : em.is_approved_content ? '#dbeafe' : '#f1f5f9',
															color: em.is_published ? '#15803d' : em.is_approved_content ? '#1d4ed8' : '#64748b'
														}}
													/>
												</Box>
												<Box sx={{ display: 'flex', gap: 1 }}>
													{em.emission_type?.name && (
														<Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
															{em.emission_type.name}
														</Typography>
													)}
													{em.language?.name && (
														<Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>· {em.language.name}</Typography>
													)}
												</Box>
											</Box>
										</ListItem>
									))}
									{recentEmissions.length === 0 && (
										<Box sx={{ p: 3 }}>
											<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No emissions yet</Typography>
										</Box>
									)}
								</List>
							</SectionCard>
						</Grid>

						{/* Recent Episodes */}
						<Grid item xs={12} md={4}>
							<SectionCard
								title="Recent Episodes"
								icon="lucide:mic-2"
								delay={0.6}
								action={
									<Button
										component={NavLinkAdapter}
										to="/administration/radio/episodes"
										size="small"
										sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#1565C0' }}
									>
										View all
									</Button>
								}
							>
								<List disablePadding>
									{episodes.slice(0, 5).sort((a, b) => b.id - a.id).map((ep, i) => (
										<ListItem key={ep.id} divider={i < 4} sx={{ px: 3, py: 1.5 }}>
											<Box sx={{ width: '100%' }}>
												<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
													<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }} className="truncate" style={{ maxWidth: 180 }}>
														{ep.name}
													</Typography>
													<Chip
														label={ep.is_published ? 'Published' : 'Draft'}
														size="small"
														sx={{
															height: 20, fontSize: '0.68rem', fontWeight: 700,
															backgroundColor: ep.is_published ? '#dcfce7' : '#f1f5f9',
															color: ep.is_published ? '#15803d' : '#64748b'
														}}
													/>
												</Box>
												<Typography sx={{ fontSize: '0.72rem', color: 'text.disabled' }}>
													{ep.emission?.name ?? '—'} {ep.season?.name ? `· ${ep.season.name}` : ''}
												</Typography>
											</Box>
										</ListItem>
									))}
									{episodes.length === 0 && (
										<Box sx={{ p: 3 }}>
											<Typography sx={{ color: 'text.disabled', fontSize: '0.85rem' }}>No episodes yet</Typography>
										</Box>
									)}
								</List>
							</SectionCard>
						</Grid>

						{/* Quick actions */}
						<Grid item xs={12} md={4}>
							<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.65 } }} style={{ height: '100%' }}>
								<Paper
									elevation={0}
									sx={{
										border: '1px solid', borderColor: 'divider',
										borderRadius: 3, overflow: 'hidden', height: '100%'
									}}
								>
									<Box
										sx={{
											px: 3, py: 2,
											display: 'flex', alignItems: 'center', gap: 1.5,
											borderBottom: '1px solid', borderColor: 'divider',
											backgroundColor: 'background.default'
										}}
									>
										<FuseSvgIcon size={18} sx={{ color: '#1565C0' }}>lucide:zap</FuseSvgIcon>
										<Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Quick Actions</Typography>
									</Box>
									<Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
										{[
											{ label: 'Add Account', icon: 'lucide:user-plus', to: '/administration/accounts/new', color: '#1565C0', bg: '#eff6ff' },
											{ label: 'New Subscription', icon: 'lucide:credit-card', to: '/administration/subscriptions/new', color: '#7c3aed', bg: '#f5f3ff' },
											{ label: 'Create Role', icon: 'lucide:shield-plus', to: '/administration/roles/new', color: '#d97706', bg: '#fffbeb' },
											{ label: 'Add Emission', icon: 'lucide:radio', to: '/administration/radio/emissions', color: '#0891b2', bg: '#ecfeff' },
											{ label: 'New Episode', icon: 'lucide:mic-2', to: '/administration/radio/episodes', color: '#059669', bg: '#ecfdf5' },
											{ label: 'Add Reportage', icon: 'lucide:film', to: '/administration/radio/reportages', color: '#dc2626', bg: '#fef2f2' }
										].map((action) => (
											<Box
												key={action.label}
												component={NavLinkAdapter}
												to={action.to}
												sx={{
													display: 'flex', alignItems: 'center', gap: 2,
													p: 1.5, borderRadius: 2,
													border: '1px solid', borderColor: 'divider',
													textDecoration: 'none',
													transition: 'background-color 0.15s, box-shadow 0.15s',
													'&:hover': { backgroundColor: 'action.hover', boxShadow: 1 }
												}}
											>
												<Box
													sx={{
														width: 32, height: 32, borderRadius: 1.5,
														backgroundColor: action.bg,
														display: 'flex', alignItems: 'center', justifyContent: 'center',
														flexShrink: 0
													}}
												>
													<FuseSvgIcon size={16} sx={{ color: action.color }}>{action.icon}</FuseSvgIcon>
												</Box>
												<Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
													{action.label}
												</Typography>
												<FuseSvgIcon size={14} sx={{ color: 'text.disabled', ml: 'auto' }}>
													lucide:chevron-right
												</FuseSvgIcon>
											</Box>
										))}
									</Box>
								</Paper>
							</motion.div>
						</Grid>
					</Grid>
				</Box>
			}
		/>
	);
}