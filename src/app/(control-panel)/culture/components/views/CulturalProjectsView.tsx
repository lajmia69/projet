'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
	Box, Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions,
	DialogContent, DialogTitle, Divider, FormControl, Grid, InputAdornment,
	InputLabel, MenuItem, Select, TextField, Typography, CircularProgress,
	LinearProgress, Tooltip, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import Link from '@fuse/core/Link';
import {
	useCulturalProjects,
	useCreateCulturalProject,
	useDeleteCulturalProject
} from '../../api/hooks/useCultureProjectsActivities';
import { CulturalProject, CulturalProjectStatus } from '../../api/types/projectsAndActivities';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.primary.dark,
		color: theme.palette.getContrastText(theme.palette.primary.main)
	}
}));

const STATUS_META: Record<
	CulturalProjectStatus,
	{ label: string; color: string; bg: string; icon: string }
> = {
	planning:    { label: 'Planification',  color: '#b45309', bg: '#fef9c3', icon: 'lucide:calendar-clock' },
	in_progress: { label: 'En cours',       color: '#1d4ed8', bg: '#dbeafe', icon: 'lucide:play-circle' },
	completed:   { label: 'Terminé',        color: '#15803d', bg: '#dcfce7', icon: 'lucide:check-circle' },
	cancelled:   { label: 'Annulé',         color: '#b91c1c', bg: '#fee2e2', icon: 'lucide:x-circle' }
};

const CATEGORY_OPTIONS = [
	'art', 'festival', 'musique', 'theatre', 'cinema', 'numerique', 'litterature',
	'artisanat', 'patrimoine', 'danse', 'autre'
];

function safeFormat(dateStr?: string) {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'd MMM yyyy', { locale: fr }) : '—';
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function ProjectCard({
	project,
	onDelete
}: {
	project: CulturalProject;
	onDelete: (id: string) => void;
}) {
	const meta = STATUS_META[project.status];
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<>
			<Card
				className="flex flex-col h-full shadow-sm"
				sx={{ borderRadius: '14px', overflow: 'hidden', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
			>
				{/* status stripe */}
				<div style={{ height: 4, backgroundColor: meta.color }} />

				<CardContent className="flex flex-col flex-1 p-4 gap-2">
					{/* Status + category row */}
					<div className="flex items-center gap-1.5 flex-wrap">
						<Chip
							size="small"
							icon={<FuseSvgIcon size={12}>{meta.icon}</FuseSvgIcon>}
							label={meta.label}
							sx={{ fontSize: '0.68rem', fontWeight: 700, height: 22, color: meta.color, backgroundColor: meta.bg }}
						/>
						{project.category && (
							<Chip
								size="small"
								label={project.category}
								sx={{ fontSize: '0.68rem', height: 22 }}
								variant="outlined"
							/>
						)}
					</div>

					{/* Title */}
					<Typography className="font-bold line-clamp-2" sx={{ fontSize: '1rem' }}>
						{project.title}
					</Typography>

					{/* Description */}
					<Typography
						className="line-clamp-2 text-sm flex-1"
						color="text.secondary"
					>
						{project.description}
					</Typography>

					<Divider sx={{ my: 1 }} />

					{/* Meta */}
					<div className="flex flex-col gap-1">
						{project.location && (
							<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
								<FuseSvgIcon size={13}>lucide:map-pin</FuseSvgIcon>
								<span className="truncate">{project.location}</span>
							</div>
						)}
						<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
							<FuseSvgIcon size={13}>lucide:calendar</FuseSvgIcon>
							<span>{safeFormat(project.startDate)}{project.endDate ? ` → ${safeFormat(project.endDate)}` : ''}</span>
						</div>
						{project.teamSize && (
							<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
								<FuseSvgIcon size={13}>lucide:users</FuseSvgIcon>
								<span>{project.teamSize} membres</span>
							</div>
						)}
						{project.budget != null && (
							<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
								<FuseSvgIcon size={13}>lucide:wallet</FuseSvgIcon>
								<span>{project.budget.toLocaleString('fr-FR')} DT</span>
							</div>
						)}
					</div>
				</CardContent>

				<CardActions
					className="px-4 py-3 flex items-center justify-between"
					sx={{ borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}
				>
					<Tooltip title="Supprimer">
						<IconButton
							size="small"
							color="error"
							onClick={() => setConfirmOpen(true)}
						>
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
						Voir le projet
					</Button>
				</CardActions>
			</Card>

			{/* Confirm delete */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Supprimer le projet ?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						<strong>{project.title}</strong> sera définitivement supprimé. Cette action est irréversible.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined">Annuler</Button>
					<Button
						onClick={() => { onDelete(project.id); setConfirmOpen(false); }}
						variant="contained"
						color="error"
					>
						Supprimer
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

// ─── Create dialog ────────────────────────────────────────────────────────────

type CreateForm = {
	title: string; description: string; category: string; status: CulturalProjectStatus;
	startDate: string; endDate: string; location: string; budget: string; teamSize: string; tags: string;
};

const emptyForm: CreateForm = {
	title: '', description: '', category: '', status: 'planning',
	startDate: '', endDate: '', location: '', budget: '', teamSize: '', tags: ''
};

function CreateProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { mutate: create, isPending } = useCreateCulturalProject();
	const [form, setForm] = useState<CreateForm>(emptyForm);

	const setField = (k: keyof CreateForm, v: string) => setForm((p) => ({ ...p, [k]: v }));
	const canSubmit = !!form.title.trim() && !!form.startDate;

	const handleSubmit = () => {
		create(
			{
				title: form.title.trim(),
				slug: form.title.toLowerCase().replace(/\s+/g, '-'),
				description: form.description.trim(),
				category: form.category,
				status: form.status,
				startDate: form.startDate,
				endDate: form.endDate || undefined,
				location: form.location || undefined,
				budget: form.budget ? Number(form.budget) : undefined,
				teamSize: form.teamSize ? Number(form.teamSize) : undefined,
				tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
			},
			{ onSuccess: () => { setForm(emptyForm); onClose(); } }
		);
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
			<DialogTitle sx={{ fontWeight: 800 }}>Nouveau projet culturel</DialogTitle>
			<Divider />
			<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
				<TextField label="Titre *" size="small" value={form.title} onChange={(e) => setField('title', e.target.value)} fullWidth />
				<TextField label="Description" size="small" multiline minRows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} fullWidth />

				<Box sx={{ display: 'flex', gap: 2 }}>
					<FormControl size="small" fullWidth>
						<InputLabel>Catégorie</InputLabel>
						<Select value={form.category} label="Catégorie" onChange={(e) => setField('category', e.target.value)}>
							{CATEGORY_OPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
						</Select>
					</FormControl>
					<FormControl size="small" fullWidth>
						<InputLabel>Statut</InputLabel>
						<Select value={form.status} label="Statut" onChange={(e) => setField('status', e.target.value as CulturalProjectStatus)}>
							{Object.entries(STATUS_META).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
						</Select>
					</FormControl>
				</Box>

				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField label="Date de début *" type="date" size="small" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
					<TextField label="Date de fin" type="date" size="small" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
				</Box>

				<TextField label="Lieu" size="small" value={form.location} onChange={(e) => setField('location', e.target.value)} fullWidth />

				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField
						label="Budget (DT)" type="number" size="small" value={form.budget}
						onChange={(e) => setField('budget', e.target.value)}
						InputProps={{ startAdornment: <InputAdornment position="start">DT</InputAdornment> }}
						fullWidth
					/>
					<TextField
						label="Équipe" type="number" size="small" value={form.teamSize}
						onChange={(e) => setField('teamSize', e.target.value)}
						InputProps={{ endAdornment: <InputAdornment position="end">pers.</InputAdornment> }}
						fullWidth
					/>
				</Box>

				<TextField
					label="Tags (séparés par des virgules)"
					size="small"
					value={form.tags}
					onChange={(e) => setField('tags', e.target.value)}
					fullWidth
					helperText="ex: culture, patrimoine, festival"
				/>
			</DialogContent>
			<Divider />
			<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
				<Button onClick={onClose} variant="outlined" disabled={isPending}>Annuler</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="secondary"
					disabled={!canSubmit || isPending}
					startIcon={isPending ? <CircularProgress size={14} /> : <FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
				>
					{isPending ? 'Création…' : 'Créer le projet'}
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
	const [categoryFilter, setCategoryFilter] = useState<string>('all');
	const [createOpen, setCreateOpen] = useState(false);

	const filtered = useMemo(() => {
		return projects.filter((p) => {
			const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
				p.description.toLowerCase().includes(search.toLowerCase());
			const matchStatus = statusFilter === 'all' || p.status === statusFilter;
			const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
			return matchSearch && matchStatus && matchCategory;
		});
	}, [projects, search, statusFilter, categoryFilter]);

	const categories = useMemo(() => [...new Set(projects.map((p) => p.category).filter(Boolean))], [projects]);

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
								<Typography
									color="inherit"
									className="text-center text-4xl font-extrabold tracking-tight sm:text-6xl"
								>
									Projets Culturels
								</Typography>
							</motion.div>
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
								<Typography
									color="inherit"
									className="mt-3 max-w-xl text-center text-lg opacity-75"
								>
									Gérez et suivez l'ensemble des projets culturels de votre organisation.
								</Typography>
							</motion.div>
						</div>

						{/* decorative circles */}
						<svg className="pointer-events-none absolute inset-0" viewBox="0 0 960 540" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
							<g className="opacity-5" fill="none" stroke="currentColor" strokeWidth="100">
								<circle r="234" cx="196" cy="23" />
								<circle r="234" cx="790" cy="491" />
							</g>
						</svg>
					</Box>
				}
				content={
					<div className="mx-auto flex w-full flex-1 flex-col p-4">
						{/* Toolbar */}
						<div className="flex flex-wrap items-center gap-2 mb-6">
							<TextField
								size="small"
								placeholder="Rechercher un projet…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								InputProps={{ startAdornment: <InputAdornment position="start"><FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon></InputAdornment> }}
								sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
							/>

							<FormControl size="small" sx={{ minWidth: 130 }}>
								<InputLabel>Statut</InputLabel>
								<Select value={statusFilter} label="Statut" onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
									<MenuItem value="all"><em>Tous</em></MenuItem>
									{Object.entries(STATUS_META).map(([k, v]) => (
										<MenuItem key={k} value={k}>{v.label}</MenuItem>
									))}
								</Select>
							</FormControl>

							<FormControl size="small" sx={{ minWidth: 130 }}>
								<InputLabel>Catégorie</InputLabel>
								<Select value={categoryFilter} label="Catégorie" onChange={(e) => setCategoryFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
									<MenuItem value="all"><em>Toutes</em></MenuItem>
									{categories.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
								</Select>
							</FormControl>

							{filtered.length > 0 && (
								<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
									{filtered.length} projet{filtered.length > 1 ? 's' : ''}
								</Typography>
							)}

							<Button
								onClick={() => setCreateOpen(true)}
								variant="contained"
								color="secondary"
								size="small"
								startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
								sx={{ ml: 'auto', textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
							>
								Nouveau projet
							</Button>
						</div>

						{/* Status summary bar */}
						<div className="flex flex-wrap gap-2 mb-6">
							{Object.entries(STATUS_META).map(([status, meta]) => {
								const count = projects.filter((p) => p.status === status).length;
								return (
									<Chip
										key={status}
										icon={<FuseSvgIcon size={13}>{meta.icon}</FuseSvgIcon>}
										label={`${meta.label} (${count})`}
										size="small"
										clickable
										onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
										sx={{
											fontWeight: 600,
											color: statusFilter === status ? meta.color : 'text.secondary',
											backgroundColor: statusFilter === status ? meta.bg : 'action.hover',
											border: statusFilter === status ? `1.5px solid ${meta.color}` : '1.5px solid transparent'
										}}
									/>
								);
							})}
						</div>

						{/* Grid */}
						{filtered.length > 0 ? (
							<motion.div
								className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
								variants={cardContainer}
								initial="hidden"
								animate="show"
							>
								{filtered.map((project) => (
									<motion.div variants={cardItem} key={project.id}>
										<ProjectCard project={project} onDelete={deleteProject} />
									</motion.div>
								))}
							</motion.div>
						) : (
							<div className="flex flex-1 items-center justify-center py-20">
								<div className="flex flex-col items-center gap-3">
									<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:folder-open</FuseSvgIcon>
									<Typography color="text.secondary" variant="h6">Aucun projet trouvé</Typography>
									<Typography color="text.disabled" variant="body2">Modifiez vos filtres ou créez un nouveau projet</Typography>
									<Button
										onClick={() => setCreateOpen(true)}
										variant="outlined"
										color="secondary"
										startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
									>
										Créer un projet
									</Button>
								</div>
							</div>
						)}
					</div>
				}
				scroll="page"
			/>

			<CreateProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} />
		</>
	);
}