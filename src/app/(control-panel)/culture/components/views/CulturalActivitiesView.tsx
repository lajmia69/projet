'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
	Box, Button, Card, CardActions, CardContent, Chip, CircularProgress,
	Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl,
	InputAdornment, InputLabel, MenuItem, Select, TextField, Typography,
	Tooltip, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, parseISO, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import Link from '@fuse/core/Link';
import {
	useCulturalActivities,
	useCreateCulturalActivity,
	useDeleteCulturalActivity,
	useCulturalActivityTypes
} from '../../api/hooks/useCultureProjectsActivities';
import { CulturalActivity, CreateCulturalActivityPayload } from '../../api/types/projectsAndActivities';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.primary.dark,
		color: theme.palette.getContrastText(theme.palette.primary.main)
	},
	'& .FusePageSimple-contentWrapper': {
		overflowY: 'auto',
		WebkitOverflowScrolling: 'touch',
	},
	'& .FusePageSimple-content': {
		display: 'flex',
		flexDirection: 'column',
		flex: '1 1 auto',
	}
}));

function safeFormat(dateStr?: string) {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'MMM d, yyyy', { locale: enUS }) : '—';
}

function statusBadge(a: CulturalActivity) {
	if (a.is_published) return { label: 'Published', color: '#15803d', bg: '#dcfce7' };
	if (a.is_approved_content) return { label: 'Approved', color: '#1d4ed8', bg: '#dbeafe' };
	return { label: 'Draft', color: '#b45309', bg: '#fef9c3' };
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({ activity, onDelete }: { activity: CulturalActivity; onDelete: (id: number) => void }) {
	const badge = statusBadge(activity);
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<>
			<Card
				className="flex flex-col h-full shadow-sm"
				sx={{ borderRadius: '14px', overflow: 'hidden', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
			>
				<div style={{ height: 4, backgroundColor: badge.color }} />

				<CardContent className="flex flex-col flex-1 p-4 gap-2">
					<div className="flex items-center gap-1.5 flex-wrap">
						<Chip size="small" label={badge.label}
							sx={{ fontSize: '0.68rem', fontWeight: 700, height: 22, color: badge.color, backgroundColor: badge.bg }} />
						{activity.cultural_activity_type && (
							<Chip size="small" label={activity.cultural_activity_type.name} variant="outlined"
								sx={{ fontSize: '0.68rem', height: 22 }} />
						)}
						{activity.language && (
							<Chip size="small" label={activity.language.short_name.toUpperCase()} sx={{ fontSize: '0.65rem', height: 20 }} />
						)}
					</div>

					<Typography className="font-bold line-clamp-2" sx={{ fontSize: '1rem' }}>
						{activity.name}
					</Typography>

					<Typography className="line-clamp-2 text-sm flex-1" color="text.secondary">
						{activity.description}
					</Typography>

					<Divider sx={{ my: 1 }} />

					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
							<FuseSvgIcon size={13}>lucide:calendar</FuseSvgIcon>
							<span>{safeFormat(activity.date)}</span>
						</div>
						<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
							<FuseSvgIcon size={13}>lucide:eye</FuseSvgIcon>
							<span>{activity.view_number} views</span>
						</div>
						{activity.tags.length > 0 && (
							<div className="flex items-center gap-1.5 text-xs flex-wrap" style={{ color: 'var(--mui-palette-text-secondary)' }}>
								<FuseSvgIcon size={13}>lucide:tag</FuseSvgIcon>
								<span className="truncate">{activity.tags.map(t => t.name).join(', ')}</span>
							</div>
						)}
					</div>
				</CardContent>

				<CardActions
					className="px-4 py-3 flex items-center justify-between"
					sx={{ borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}
				>
					<Tooltip title="Delete">
						<IconButton size="small" color="error" onClick={() => setConfirmOpen(true)}>
							<FuseSvgIcon size={16}>lucide:trash-2</FuseSvgIcon>
						</IconButton>
					</Tooltip>
					<Button
						component={Link}
						to={`/culture/activities/${activity.id}`}
						size="small" variant="contained" color="secondary"
						endIcon={<FuseSvgIcon size={14}>lucide:arrow-right</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 700 }}
					>
						View Details
					</Button>
				</CardActions>
			</Card>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Delete Activity?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						<strong>{activity.name}</strong> will be permanently deleted. This action is irreversible.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined">Cancel</Button>
					<Button onClick={() => { onDelete(activity.id); setConfirmOpen(false); }} variant="contained" color="error">Delete</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

// ─── Create Dialog ────────────────────────────────────────────────────────────

const todayIso = new Date().toISOString().split('T')[0];

const emptyForm = {
	name: '', description: '', poster_description: '',
	date: `${todayIso}T09:00:00`,
	publishing_date: todayIso,
	cultural_activity_type_id: 0, language_id: 1, tags: ''
};

function CreateActivityDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { mutate: create, isPending } = useCreateCulturalActivity();
	const { data: activityTypes = [] } = useCulturalActivityTypes();
	const [form, setForm] = useState(emptyForm);

	const set = (k: keyof typeof emptyForm, v: string | number) =>
		setForm(p => ({ ...p, [k]: v }));

	const canSubmit = !!form.name.trim() && !!form.date && form.cultural_activity_type_id > 0;

	const handleSubmit = () => {
		const payload: CreateCulturalActivityPayload = {
			name: form.name.trim(),
			slug: form.name.toLowerCase().replace(/\s+/g, '-'),
			description: form.description.trim(),
			poster_description: form.poster_description.trim() || form.name.trim(),
			date: form.date.includes('T') ? form.date : `${form.date}T09:00:00`,
			language_id: form.language_id,
			cultural_activity_type_id: form.cultural_activity_type_id,
			tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
		};
		create(payload, { onSuccess: () => { setForm(emptyForm); onClose(); } });
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
			<DialogTitle sx={{ fontWeight: 800 }}>New Cultural Activity</DialogTitle>
			<Divider />
			<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
				<TextField label="Name *" size="small" value={form.name} onChange={e => set('name', e.target.value)} fullWidth />
				<TextField label="Description" size="small" multiline minRows={3} value={form.description} onChange={e => set('description', e.target.value)} fullWidth />
				<TextField label="Poster description" size="small" value={form.poster_description} onChange={e => set('poster_description', e.target.value)} fullWidth />

				<FormControl size="small" fullWidth>
					<InputLabel>Activity Type *</InputLabel>
					<Select value={form.cultural_activity_type_id} label="Activity Type *"
						onChange={e => set('cultural_activity_type_id', Number(e.target.value))}>
						<MenuItem value={0}><em>Select a type…</em></MenuItem>
						{activityTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
					</Select>
				</FormControl>

				<TextField
					label="Date & Time *" type="datetime-local" size="small"
					value={form.date.substring(0, 16)}
					onChange={e => set('date', `${e.target.value}:00`)}
					InputLabelProps={{ shrink: true }} fullWidth
				/>

				<TextField label="Publishing Date" type="date" size="small" value={form.publishing_date}
					onChange={e => set('publishing_date', e.target.value)}
					InputLabelProps={{ shrink: true }} fullWidth />

				<TextField label="Tags (comma-separated)" size="small" value={form.tags}
					onChange={e => set('tags', e.target.value)} fullWidth
					helperText="e.g., culture, youth, art" />
			</DialogContent>
			<Divider />
			<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
				<Button onClick={onClose} variant="outlined" disabled={isPending}>Cancel</Button>
				<Button onClick={handleSubmit} variant="contained" color="secondary"
					disabled={!canSubmit || isPending}
					startIcon={isPending ? <CircularProgress size={14} /> : <FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}>
					{isPending ? 'Creating…' : 'Create Activity'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// ─── Main view ────────────────────────────────────────────────────────────────

const cardContainer = { show: { transition: { staggerChildren: 0.05 } } };
const cardItem = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function CulturalActivitiesView() {
	const { data: activities = [], isLoading } = useCulturalActivities();
	const { mutate: deleteActivity } = useDeleteCulturalActivity();

	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [createOpen, setCreateOpen] = useState(false);

	const activityTypes = useMemo(
		() => [...new Set(activities.map(a => a.cultural_activity_type?.name).filter(Boolean))],
		[activities]
	);

	const filtered = useMemo(() => activities.filter(a => {
		const matchSearch =
			a.name.toLowerCase().includes(search.toLowerCase()) ||
			a.description.toLowerCase().includes(search.toLowerCase());
		const badge = statusBadge(a);
		const matchStatus = statusFilter === 'all' || badge.label.toLowerCase() === statusFilter;
		const matchType = typeFilter === 'all' || a.cultural_activity_type?.name === typeFilter;
		return matchSearch && matchStatus && matchType;
	}), [activities, search, statusFilter, typeFilter]);

	const stats = useMemo(() => ({
		total: activities.length,
		published: activities.filter(a => a.is_published).length,
		approved: activities.filter(a => a.is_approved_content && !a.is_published).length,
		draft: activities.filter(a => !a.is_approved_content && !a.is_published).length
	}), [activities]);

	if (isLoading) return <FuseLoading />;

	return (
		<>
			<Root
				header={
					<Box className="relative flex shrink-0 items-center justify-center overflow-hidden px-4 py-10 md:p-16">
						<div className="mx-auto flex w-full flex-col items-center justify-center">
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
								<PageBreadcrumb color="inherit" borderColor="inherit" className="mb-4" />
							</motion.div>
							<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
								<Typography color="inherit" className="text-center text-4xl font-extrabold tracking-tight sm:text-6xl">
									Cultural Activities
								</Typography>
							</motion.div>
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
								<Typography color="inherit" className="mt-3 max-w-xl text-center text-lg opacity-75">
									Explore and manage all workshops, exhibitions, concerts, and cultural events.
								</Typography>
							</motion.div>

							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} className="mt-6 flex gap-4 flex-wrap justify-center">
								{[
									{ label: `${stats.total} activities`, icon: 'lucide:calendar' },
									{ label: `${stats.published} published`, icon: 'lucide:check-circle' },
									{ label: `${stats.approved} approved`, icon: 'lucide:shield-check' },
									{ label: `${stats.draft} draft`, icon: 'lucide:file-edit' }
								].map(({ label, icon }) => (
									<div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.1)' }}>
										<FuseSvgIcon size={13} sx={{ color: 'rgba(255,255,255,0.7)' }}>{icon}</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{label}</Typography>
									</div>
								))}
							</motion.div>
						</div>
						<svg className="pointer-events-none absolute inset-0" viewBox="0 0 960 540" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
							<g className="opacity-5" fill="none" stroke="currentColor" strokeWidth="100">
								<circle r="234" cx="196" cy="23" /><circle r="234" cx="790" cy="491" />
							</g>
						</svg>
					</Box>
				}
				content={
					<div className="mx-auto flex w-full flex-1 flex-col p-4">
						{/* Toolbar */}
						<div className="flex flex-wrap items-center gap-2 mb-6">
							<TextField
								size="small" placeholder="Search for an activity…" value={search}
								onChange={e => setSearch(e.target.value)}
								InputProps={{ startAdornment: <InputAdornment position="start"><FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon></InputAdornment> }}
								sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
							/>

							<FormControl size="small" sx={{ minWidth: 130 }}>
								<InputLabel>Status</InputLabel>
								<Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
									<MenuItem value="all"><em>All</em></MenuItem>
									<MenuItem value="published">Published</MenuItem>
									<MenuItem value="approved">Approved</MenuItem>
									<MenuItem value="draft">Draft</MenuItem>
								</Select>
							</FormControl>

							{activityTypes.length > 0 && (
								<FormControl size="small" sx={{ minWidth: 140 }}>
									<InputLabel>Type</InputLabel>
									<Select value={typeFilter} label="Type" onChange={e => setTypeFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
										<MenuItem value="all"><em>All types</em></MenuItem>
										{activityTypes.map(t => <MenuItem key={t} value={t!}>{t}</MenuItem>)}
									</Select>
								</FormControl>
							)}

							{filtered.length > 0 && (
								<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
									{filtered.length} {filtered.length === 1 ? 'activity' : 'activities'}
								</Typography>
							)}

							<Button onClick={() => setCreateOpen(true)} variant="contained" color="secondary" size="small"
								startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
								sx={{ ml: 'auto', textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}>
								New activity
							</Button>
						</div>

						{/* Status chips */}
						<div className="flex flex-wrap gap-2 mb-6">
							{(['published', 'approved', 'draft'] as const).map(s => {
								const count = activities.filter(a => statusBadge(a).label.toLowerCase() === s).length;
								const meta = s === 'published'
									? { color: '#15803d', bg: '#dcfce7' }
									: s === 'approved'
									? { color: '#1d4ed8', bg: '#dbeafe' }
									: { color: '#b45309', bg: '#fef9c3' };
								return (
									<Chip key={s}
										label={`${s.charAt(0).toUpperCase() + s.slice(1)} (${count})`}
										size="small" clickable
										onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
										sx={{
											fontWeight: 600,
											color: statusFilter === s ? meta.color : 'text.secondary',
											backgroundColor: statusFilter === s ? meta.bg : 'action.hover',
											border: statusFilter === s ? `1.5px solid ${meta.color}` : '1.5px solid transparent'
										}}
									/>
								);
							})}
							{activityTypes.map(type => (
								<Chip key={type}
									label={`${type} (${activities.filter(a => a.cultural_activity_type?.name === type).length})`}
									size="small" clickable
									onClick={() => setTypeFilter(typeFilter === type ? 'all' : type!)}
									sx={{
										fontWeight: 600,
										color: typeFilter === type ? '#374151' : 'text.secondary',
										backgroundColor: typeFilter === type ? '#f3f4f6' : 'action.hover',
										border: typeFilter === type ? '1.5px solid #374151' : '1.5px solid transparent'
									}}
								/>
							))}
						</div>

						{/* Grid */}
						{filtered.length > 0 ? (
							<motion.div
								className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
								variants={cardContainer} initial="hidden" animate="show"
							>
								{filtered.map(activity => (
									<motion.div variants={cardItem} key={activity.id}>
										<ActivityCard activity={activity} onDelete={deleteActivity} />
									</motion.div>
								))}
							</motion.div>
						) : (
							<div className="flex flex-1 items-center justify-center py-20">
								<div className="flex flex-col items-center gap-3">
									<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:calendar-x</FuseSvgIcon>
									<Typography color="text.secondary" variant="h6">No activities found</Typography>
									<Typography color="text.disabled" variant="body2">Modify your filters or create a new activity</Typography>
									<Button onClick={() => setCreateOpen(true)} variant="outlined" color="secondary"
										startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}>
										Create Activity
									</Button>
								</div>
							</div>
						)}
					</div>
				}
				scroll="page"
			/>

			<CreateActivityDialog open={createOpen} onClose={() => setCreateOpen(false)} />
		</>
	);
}