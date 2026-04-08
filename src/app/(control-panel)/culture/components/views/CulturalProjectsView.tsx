'use client';

import { useMemo, useState, useEffect } from 'react';
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

import Link from '@fuse/core/Link';
import {
	useCulturalProjects,
	useCreateCulturalProject,
	useDeleteCulturalProject,
	useCulturalProjectTypes
} from '../../api/hooks/useCultureProjectsActivities';
import { CulturalProject, CreateCulturalProjectPayload } from '../../api/types/projectsAndActivities';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': {
		background: 'transparent',
		border: 'none',
		boxShadow: 'none',
		padding: 0,
	},
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' },
}));

const FADE_START = 20;
const FADE_END = 180;

function safeFormat(dateStr?: string) {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'MMM d, yyyy', { locale: enUS }) : '—';
}

function statusBadge(p: CulturalProject) {
	if (p.is_published) return { label: 'Published', color: '#15803d', bg: '#dcfce7' };
	if (p.is_approved_content) return { label: 'Approved', color: '#1d4ed8', bg: '#dbeafe' };
	return { label: 'Draft', color: '#b45309', bg: '#fef9c3' };
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ProjectCard({ project, onDelete }: { project: CulturalProject; onDelete: (id: number) => void }) {
	const badge = statusBadge(project);
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
						<Chip
							size="small"
							label={badge.label}
							sx={{ fontSize: '0.68rem', fontWeight: 700, height: 22, color: badge.color, backgroundColor: badge.bg }}
						/>
						{project.cultural_project_type && (
							<Chip size="small" label={project.cultural_project_type.name} sx={{ fontSize: '0.68rem', height: 22 }} variant="outlined" />
						)}
						{project.language && (
							<Chip size="small" label={project.language.short_name.toUpperCase()} sx={{ fontSize: '0.65rem', height: 20 }} />
						)}
					</div>

					<Typography className="font-bold line-clamp-2" sx={{ fontSize: '1rem' }}>
						{project.name}
					</Typography>

					<Typography className="line-clamp-2 text-sm flex-1" color="text.secondary">
						{project.description}
					</Typography>

					<Divider sx={{ my: 1 }} />

					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
							<FuseSvgIcon size={13}>lucide:calendar</FuseSvgIcon>
							<span>{safeFormat(project.start_date)}{project.end_date ? ` → ${safeFormat(project.end_date)}` : ''}</span>
						</div>
						<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
							<FuseSvgIcon size={13}>lucide:eye</FuseSvgIcon>
							<span>{project.view_number} views</span>
						</div>
						{project.tags.length > 0 && (
							<div className="flex items-center gap-1.5 text-xs flex-wrap" style={{ color: 'var(--mui-palette-text-secondary)' }}>
								<FuseSvgIcon size={13}>lucide:tag</FuseSvgIcon>
								<span className="truncate">{project.tags.map(t => t.name).join(', ')}</span>
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
						to={`/culture/projects/${project.id}`}
						size="small"
						variant="contained"
						color="secondary"
						endIcon={<FuseSvgIcon size={14}>lucide:arrow-right</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 700 }}
					>
						View Project
					</Button>
				</CardActions>
			</Card>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Delete Project?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						<strong>{project.name}</strong> will be permanently deleted. This action is irreversible.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined">Cancel</Button>
					<Button onClick={() => { onDelete(project.id); setConfirmOpen(false); }} variant="contained" color="error">Delete</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

// ─── Create Dialog ────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];

const emptyForm = {
	name: '', description: '', poster_description: '',
	start_date: today, end_date: today, publishing_date: today,
	cultural_project_type_id: 0, language_id: 1, tags: ''
};

function CreateProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { mutate: create, isPending } = useCreateCulturalProject();
	const { data: projectTypes = [] } = useCulturalProjectTypes();
	const [form, setForm] = useState(emptyForm);

	const set = (k: keyof typeof emptyForm, v: string | number) =>
		setForm(p => ({ ...p, [k]: v }));

	const canSubmit = !!form.name.trim() && !!form.start_date && form.cultural_project_type_id > 0;

	const handleSubmit = () => {
		const payload: CreateCulturalProjectPayload = {
			name: form.name.trim(),
			slug: form.name.toLowerCase().replace(/\s+/g, '-'),
			description: form.description.trim(),
			poster_description: form.poster_description.trim() || form.name.trim(),
			start_date: form.start_date,
			end_date: form.end_date || form.start_date,
			publishing_date: form.publishing_date || today,
			language_id: form.language_id,
			cultural_project_type_id: form.cultural_project_type_id,
			tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
		};
		create(payload, { onSuccess: () => { setForm(emptyForm); onClose(); } });
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
			<DialogTitle sx={{ fontWeight: 800 }}>New Cultural Project</DialogTitle>
			<Divider />
			<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
				<TextField label="Name *" size="small" value={form.name} onChange={e => set('name', e.target.value)} fullWidth />
				<TextField label="Description" size="small" multiline minRows={3} value={form.description} onChange={e => set('description', e.target.value)} fullWidth />
				<TextField label="Poster description" size="small" value={form.poster_description} onChange={e => set('poster_description', e.target.value)} fullWidth />

				<FormControl size="small" fullWidth>
					<InputLabel>Project Type *</InputLabel>
					<Select value={form.cultural_project_type_id} label="Project Type *" onChange={e => set('cultural_project_type_id', Number(e.target.value))}>
						<MenuItem value={0}><em>Select a type…</em></MenuItem>
						{projectTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
					</Select>
				</FormControl>

				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField label="Start Date *" type="date" size="small" value={form.start_date} onChange={e => set('start_date', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
					<TextField label="End Date" type="date" size="small" value={form.end_date} onChange={e => set('end_date', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
				</Box>

				<TextField label="Publishing Date" type="date" size="small" value={form.publishing_date} onChange={e => set('publishing_date', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />

				<TextField
					label="Tags (comma-separated)" size="small" value={form.tags}
					onChange={e => set('tags', e.target.value)} fullWidth
					helperText="e.g., culture, heritage, festival"
				/>
			</DialogContent>
			<Divider />
			<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
				<Button onClick={onClose} variant="outlined" disabled={isPending}>Cancel</Button>
				<Button
					onClick={handleSubmit} variant="contained" color="secondary"
					disabled={!canSubmit || isPending}
					startIcon={isPending ? <CircularProgress size={14} /> : <FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
				>
					{isPending ? 'Creating…' : 'Create Project'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// ─── Main view ────────────────────────────────────────────────────────────────

const cardContainer = { show: { transition: { staggerChildren: 0.05 } } };
const cardItem = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function CulturalProjectsView() {
	const { data: projects = [], isLoading } = useCulturalProjects();
	const { mutate: deleteProject } = useDeleteCulturalProject();

	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [createOpen, setCreateOpen] = useState(false);
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const onScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const progress = Math.min(1, Math.max(0, (scrollY - FADE_START) / (FADE_END - FADE_START)));
	const heroOpacity = 1 - progress;
	const heroTranslateY = -(progress * 24);

	const projectTypes = useMemo(() => [...new Set(projects.map(p => p.cultural_project_type?.name).filter(Boolean))], [projects]);

	const filtered = useMemo(() => projects.filter(p => {
		const matchSearch =
			p.name.toLowerCase().includes(search.toLowerCase()) ||
			p.description.toLowerCase().includes(search.toLowerCase());
		const badge = statusBadge(p);
		const matchStatus = statusFilter === 'all' || badge.label.toLowerCase() === statusFilter;
		const matchType = typeFilter === 'all' || p.cultural_project_type?.name === typeFilter;
		return matchSearch && matchStatus && matchType;
	}), [projects, search, statusFilter, typeFilter]);

	const stats = useMemo(() => ({
		total: projects.length,
		published: projects.filter(p => p.is_published).length,
		approved: projects.filter(p => p.is_approved_content && !p.is_published).length,
		draft: projects.filter(p => !p.is_approved_content && !p.is_published).length
	}), [projects]);

	if (isLoading) return <FuseLoading />;

	return (
		<>
			<Root
				scroll="page"
				header={
					<div
						style={{
							position: 'relative',
							width: '100%',
							overflow: 'hidden',
							background: 'linear-gradient(160deg, #1c2537 0%, #1e2d45 50%, #192132 100%)',
							paddingTop: '56px',
							paddingBottom: '64px',
							opacity: heroOpacity,
							transform: `translateY(${heroTranslateY}px)`,
							pointerEvents: 'none',
							willChange: 'opacity, transform',
						}}
					>
						{/* Background grid */}
						<div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(148,163,184,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.045) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
						{/* Radial glow */}
						<div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,116,139,0.15) 0%, transparent 65%)' }} />

						<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
								
							</motion.div>

							<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
								<Typography
									component="h1"
									sx={{
										fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' },
										fontWeight: 800,
										color: '#dde6f0',
										textShadow: '0 2px 32px rgba(0,0,0,0.45)',
									}}
								>
									Cultural Projects
								</Typography>
							</motion.div>

							<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
								<Typography sx={{ fontSize: { xs: '0.875rem', sm: '0.975rem' }, color: 'rgba(148,163,184,0.7)', lineHeight: 1.75 }}>
									Manage and track all cultural projects for your organisation.
								</Typography>
							</motion.div>

							
						</div>
					</div>
				}
				content={
					<div className="mx-auto flex w-full flex-1 flex-col p-4 pt-6">
						{/* Toolbar */}
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="flex flex-wrap items-center gap-2 mb-6">
							<TextField
								size="small" placeholder="Search for a project…" value={search}
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

							{projectTypes.length > 0 && (
								<FormControl size="small" sx={{ minWidth: 140 }}>
									<InputLabel>Type</InputLabel>
									<Select value={typeFilter} label="Type" onChange={e => setTypeFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
										<MenuItem value="all"><em>All types</em></MenuItem>
										{projectTypes.map(t => <MenuItem key={t} value={t!}>{t}</MenuItem>)}
									</Select>
								</FormControl>
							)}

							{filtered.length > 0 && (
								<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
									{filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
								</Typography>
							)}

							<Button
								onClick={() => setCreateOpen(true)}
								variant="contained"
								size="small"
								startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
								sx={(theme) => ({
									ml: 'auto',
									borderRadius: '10px',
									textTransform: 'none',
									fontWeight: 700,
									background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
									boxShadow: theme.palette.mode === 'dark' ? '0 0 14px rgba(59,130,246,0.45)' : '0 0 12px rgba(59,130,246,0.3)',
									'&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' },
								})}
							>
								New project
							</Button>
						</motion.div>

						{/* Status chips */}
						<div className="flex flex-wrap gap-2 mb-6">
							{(['published', 'approved', 'draft'] as const).map(s => {
								const count = projects.filter(p => statusBadge(p).label.toLowerCase() === s).length;
								const meta = s === 'published'
									? { color: '#15803d', bg: '#dcfce7' }
									: s === 'approved'
									? { color: '#1d4ed8', bg: '#dbeafe' }
									: { color: '#b45309', bg: '#fef9c3' };
								return (
									<Chip
										key={s}
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
						</div>

						{/* Grid */}
						{filtered.length > 0 ? (
							<motion.div
								className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
								variants={cardContainer} initial="hidden" animate="show"
							>
								{filtered.map(project => (
									<motion.div variants={cardItem} key={project.id}>
										<ProjectCard project={project} onDelete={deleteProject} />
									</motion.div>
								))}
							</motion.div>
						) : (
							<div className="flex flex-1 items-center justify-center py-20">
								<div className="flex flex-col items-center gap-3">
									<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:folder-open</FuseSvgIcon>
									<Typography color="text.secondary" variant="h6">No projects found</Typography>
									<Typography color="text.disabled" variant="body2">Modify your filters or create a new project</Typography>
									<Button onClick={() => setCreateOpen(true)} variant="outlined" color="secondary" startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}>
										Create a project
									</Button>
								</div>
							</div>
						)}
					</div>
				}
			/>

			<CreateProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} />
		</>
	);
}