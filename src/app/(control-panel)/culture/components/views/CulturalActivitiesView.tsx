'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
	Box, Button, Card, CardActions, CardContent, Chip, CircularProgress,
	Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl,
	FormControlLabel, InputAdornment, InputLabel, MenuItem, Select, Switch,
	TextField, Tooltip, Typography, IconButton
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
	useCulturalActivities,
	useCreateCulturalActivity,
	useDeleteCulturalActivity
} from '../../api/hooks/useCultureProjectsActivities';
import { CulturalActivity, CulturalActivityType } from '../../api/types/projectsAndActivities';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.primary.dark,
		color: theme.palette.getContrastText(theme.palette.primary.main)
	}
}));

const TYPE_META: Record<CulturalActivityType, { label: string; icon: string; color: string }> = {
	workshop:    { label: 'Atelier',       icon: 'lucide:pencil-ruler',  color: '#7c3aed' },
	exhibition:  { label: 'Exposition',    icon: 'lucide:image',         color: '#0284c7' },
	concert:     { label: 'Concert',       icon: 'lucide:music-2',       color: '#be185d' },
	conference:  { label: 'Conférence',    icon: 'lucide:presentation',  color: '#047857' },
	festival:    { label: 'Festival',      icon: 'lucide:party-popper',  color: '#b45309' },
	other:       { label: 'Autre',         icon: 'lucide:sparkles',      color: '#374151' }
};

function safeFormat(dateStr?: string) {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'd MMM yyyy', { locale: fr }) : '—';
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({
	activity,
	onDelete
}: {
	activity: CulturalActivity;
	onDelete: (id: string) => void;
}) {
	const typeMeta = TYPE_META[activity.type];
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<>
			<Card
				className="flex flex-col h-full shadow-sm"
				sx={{ borderRadius: '14px', overflow: 'hidden', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}
			>
				{/* Type colour stripe */}
				<div style={{ height: 4, backgroundColor: typeMeta.color }} />

				<CardContent className="flex flex-col flex-1 p-4 gap-2">
					{/* Type + free/online badges */}
					<div className="flex items-center gap-1.5 flex-wrap">
						<Chip
							size="small"
							icon={<FuseSvgIcon size={12}>{typeMeta.icon}</FuseSvgIcon>}
							label={typeMeta.label}
							sx={{ fontSize: '0.68rem', fontWeight: 700, height: 22, color: typeMeta.color, backgroundColor: `${typeMeta.color}18` }}
						/>
						{activity.isFree && (
							<Chip size="small" label="Gratuit" sx={{ fontSize: '0.65rem', fontWeight: 700, height: 20, color: '#15803d', backgroundColor: '#dcfce7' }} />
						)}
						{activity.isOnline && (
							<Chip size="small" icon={<FuseSvgIcon size={11}>lucide:globe</FuseSvgIcon>} label="En ligne" sx={{ fontSize: '0.65rem', fontWeight: 700, height: 20, color: '#1d4ed8', backgroundColor: '#dbeafe' }} />
						)}
					</div>

					{/* Title */}
					<Typography className="font-bold line-clamp-2" sx={{ fontSize: '1rem' }}>
						{activity.title}
					</Typography>

					{/* Description */}
					<Typography className="line-clamp-2 text-sm flex-1" color="text.secondary">
						{activity.description}
					</Typography>

					<Divider sx={{ my: 1 }} />

					{/* Meta */}
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
							<FuseSvgIcon size={13}>lucide:calendar</FuseSvgIcon>
							<span>{safeFormat(activity.date)}{activity.endDate ? ` → ${safeFormat(activity.endDate)}` : ''}</span>
						</div>
						<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
							<FuseSvgIcon size={13}>lucide:map-pin</FuseSvgIcon>
							<span className="truncate">{activity.location}</span>
						</div>
						{activity.capacity && (
							<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
								<FuseSvgIcon size={13}>lucide:users</FuseSvgIcon>
								<span>Capacité : {activity.capacity} pers.</span>
							</div>
						)}
						{!activity.isFree && activity.price != null && (
							<div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--mui-palette-text-secondary)' }}>
								<FuseSvgIcon size={13}>lucide:ticket</FuseSvgIcon>
								<span>{activity.price} DT / personne</span>
							</div>
						)}
					</div>
				</CardContent>

				<CardActions
					className="px-4 py-3 flex items-center justify-between"
					sx={{ borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.default' }}
				>
					<Tooltip title="Supprimer">
						<IconButton size="small" color="error" onClick={() => setConfirmOpen(true)}>
							<FuseSvgIcon size={16}>lucide:trash-2</FuseSvgIcon>
						</IconButton>
					</Tooltip>

					<Button
						component={Link}
						to={`/culture/activities/${activity.id}`}
						size="small"
						variant="contained"
						color="secondary"
						endIcon={<FuseSvgIcon size={14}>lucide:arrow-right</FuseSvgIcon>}
						sx={{ textTransform: 'none', fontWeight: 700 }}
					>
						Voir les détails
					</Button>
				</CardActions>
			</Card>

			{/* Confirm delete */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Supprimer l'activité ?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						<strong>{activity.title}</strong> sera définitivement supprimée. Cette action est irréversible.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined">Annuler</Button>
					<Button onClick={() => { onDelete(activity.id); setConfirmOpen(false); }} variant="contained" color="error">
						Supprimer
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

// ─── Create dialog ────────────────────────────────────────────────────────────

type CreateForm = {
	title: string; description: string; type: CulturalActivityType; category: string;
	date: string; endDate: string; location: string; capacity: string; price: string;
	isFree: boolean; isOnline: boolean; tags: string;
};

const emptyForm: CreateForm = {
	title: '', description: '', type: 'workshop', category: '',
	date: '', endDate: '', location: '', capacity: '', price: '',
	isFree: true, isOnline: false, tags: ''
};

function CreateActivityDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
	const { mutate: create, isPending } = useCreateCulturalActivity();
	const [form, setForm] = useState<CreateForm>(emptyForm);

	const setField = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) =>
		setForm((p) => ({ ...p, [k]: v }));

	const canSubmit = !!form.title.trim() && !!form.date && !!form.location.trim();

	const handleSubmit = () => {
		create(
			{
				title: form.title.trim(),
				slug: form.title.toLowerCase().replace(/\s+/g, '-'),
				description: form.description.trim(),
				type: form.type,
				category: form.category,
				date: form.date,
				endDate: form.endDate || undefined,
				location: form.location.trim(),
				capacity: form.capacity ? Number(form.capacity) : undefined,
				price: form.isFree ? 0 : (form.price ? Number(form.price) : 0),
				isFree: form.isFree,
				isOnline: form.isOnline,
				tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
			},
			{ onSuccess: () => { setForm(emptyForm); onClose(); } }
		);
	};

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
			<DialogTitle sx={{ fontWeight: 800 }}>Nouvelle activité culturelle</DialogTitle>
			<Divider />
			<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
				<TextField label="Titre *" size="small" value={form.title} onChange={(e) => setField('title', e.target.value)} fullWidth />
				<TextField label="Description" size="small" multiline minRows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} fullWidth />

				<Box sx={{ display: 'flex', gap: 2 }}>
					<FormControl size="small" fullWidth>
						<InputLabel>Type *</InputLabel>
						<Select value={form.type} label="Type *" onChange={(e) => setField('type', e.target.value as CulturalActivityType)}>
							{Object.entries(TYPE_META).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
						</Select>
					</FormControl>
					<TextField label="Catégorie" size="small" value={form.category} onChange={(e) => setField('category', e.target.value)} fullWidth />
				</Box>

				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField label="Date *" type="date" size="small" value={form.date} onChange={(e) => setField('date', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
					<TextField label="Date de fin" type="date" size="small" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
				</Box>

				<TextField label="Lieu *" size="small" value={form.location} onChange={(e) => setField('location', e.target.value)} fullWidth />

				<Box sx={{ display: 'flex', gap: 2 }}>
					<TextField
						label="Capacité" type="number" size="small" value={form.capacity}
						onChange={(e) => setField('capacity', e.target.value)}
						InputProps={{ endAdornment: <InputAdornment position="end">pers.</InputAdornment> }}
						fullWidth
					/>
					<TextField
						label="Prix"
						type="number"
						size="small"
						value={form.price}
						onChange={(e) => setField('price', e.target.value)}
						disabled={form.isFree}
						InputProps={{ endAdornment: <InputAdornment position="end">DT</InputAdornment> }}
						fullWidth
					/>
				</Box>

				<Box sx={{ display: 'flex', gap: 3 }}>
					<FormControlLabel
						control={<Switch checked={form.isFree} onChange={(e) => setField('isFree', e.target.checked)} color="success" />}
						label="Gratuit"
					/>
					<FormControlLabel
						control={<Switch checked={form.isOnline} onChange={(e) => setField('isOnline', e.target.checked)} color="info" />}
						label="En ligne"
					/>
				</Box>

				<TextField
					label="Tags (séparés par des virgules)"
					size="small"
					value={form.tags}
					onChange={(e) => setField('tags', e.target.value)}
					fullWidth
					helperText="ex: culture, jeunesse, art"
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
					{isPending ? 'Création…' : "Créer l'activité"}
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
	const [typeFilter, setTypeFilter] = useState<string>('all');
	const [freeOnly, setFreeOnly] = useState(false);
	const [createOpen, setCreateOpen] = useState(false);

	const filtered = useMemo(() => {
		return activities.filter((a) => {
			const matchSearch =
				a.title.toLowerCase().includes(search.toLowerCase()) ||
				a.description.toLowerCase().includes(search.toLowerCase());
			const matchType = typeFilter === 'all' || a.type === typeFilter;
			const matchFree = !freeOnly || a.isFree;
			return matchSearch && matchType && matchFree;
		});
	}, [activities, search, typeFilter, freeOnly]);

	const stats = useMemo(
		() => ({
			total: activities.length,
			free: activities.filter((a) => a.isFree).length,
			online: activities.filter((a) => a.isOnline).length
		}),
		[activities]
	);

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
									Activités Culturelles
								</Typography>
							</motion.div>
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
								<Typography color="inherit" className="mt-3 max-w-xl text-center text-lg opacity-75">
									Explorez et gérez tous les ateliers, expositions, concerts et événements culturels.
								</Typography>
							</motion.div>

							{/* quick stats */}
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} className="mt-6 flex gap-4 flex-wrap justify-center">
								{[
									{ label: `${stats.total} activités`, icon: 'lucide:calendar' },
									{ label: `${stats.free} gratuites`, icon: 'lucide:ticket' },
									{ label: `${stats.online} en ligne`, icon: 'lucide:globe' }
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
								placeholder="Rechercher une activité…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								InputProps={{ startAdornment: <InputAdornment position="start"><FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon></InputAdornment> }}
								sx={{ minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
							/>

							<FormControl size="small" sx={{ minWidth: 140 }}>
								<InputLabel>Type</InputLabel>
								<Select value={typeFilter} label="Type" onChange={(e) => setTypeFilter(e.target.value)} sx={{ borderRadius: '10px' }}>
									<MenuItem value="all"><em>Tous</em></MenuItem>
									{Object.entries(TYPE_META).map(([k, v]) => (
										<MenuItem key={k} value={k}>
											<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
												<FuseSvgIcon size={14} sx={{ color: v.color }}>{v.icon}</FuseSvgIcon>
												{v.label}
											</Box>
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<FormControlLabel
								control={<Switch size="small" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} color="success" />}
								label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Gratuit seulement</Typography>}
								sx={{ ml: 0 }}
							/>

							{filtered.length > 0 && (
								<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
									{filtered.length} activité{filtered.length > 1 ? 's' : ''}
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
								Nouvelle activité
							</Button>
						</div>

						{/* Type filter chips */}
						<div className="flex flex-wrap gap-2 mb-6">
							{Object.entries(TYPE_META).map(([type, meta]) => {
								const count = activities.filter((a) => a.type === type).length;
								if (count === 0) return null;
								return (
									<Chip
										key={type}
										icon={<FuseSvgIcon size={13}>{meta.icon}</FuseSvgIcon>}
										label={`${meta.label} (${count})`}
										size="small"
										clickable
										onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
										sx={{
											fontWeight: 600,
											color: typeFilter === type ? meta.color : 'text.secondary',
											backgroundColor: typeFilter === type ? `${meta.color}18` : 'action.hover',
											border: typeFilter === type ? `1.5px solid ${meta.color}` : '1.5px solid transparent'
										}}
									/>
								);
							})}
						</div>

						{/* Grid */}
						{filtered.length > 0 ? (
							<motion.div
								className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
								variants={cardContainer}
								initial="hidden"
								animate="show"
							>
								{filtered.map((activity) => (
									<motion.div variants={cardItem} key={activity.id}>
										<ActivityCard activity={activity} onDelete={deleteActivity} />
									</motion.div>
								))}
							</motion.div>
						) : (
							<div className="flex flex-1 items-center justify-center py-20">
								<div className="flex flex-col items-center gap-3">
									<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:calendar-x</FuseSvgIcon>
									<Typography color="text.secondary" variant="h6">Aucune activité trouvée</Typography>
									<Typography color="text.disabled" variant="body2">Modifiez vos filtres ou créez une nouvelle activité</Typography>
									<Button
										onClick={() => setCreateOpen(true)}
										variant="outlined"
										color="secondary"
										startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
									>
										Créer une activité
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