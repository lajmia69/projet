'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
	Box, Button, Chip, Divider, IconButton, Paper, TextField,
	Typography, CircularProgress, Dialog, DialogActions, DialogContent,
	DialogTitle, FormControl, InputAdornment, InputLabel, MenuItem, Select
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useParams from '@fuse/hooks/useParams';
import useNavigate from '@fuse/hooks/useNavigate';
import {
	useCulturalProject,
	useUpdateCulturalProject,
	useDeleteCulturalProject
} from '../../api/hooks/useCultureProjectsActivities';
import { CulturalProject, CulturalProjectStatus } from '../../api/types/projectsAndActivities';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.vars.palette.divider
	}
}));

const STATUS_META: Record<CulturalProjectStatus, { label: string; color: string; bg: string }> = {
	planning:    { label: 'Planification', color: '#b45309', bg: '#fef9c3' },
	in_progress: { label: 'En cours',      color: '#1d4ed8', bg: '#dbeafe' },
	completed:   { label: 'Terminé',       color: '#15803d', bg: '#dcfce7' },
	cancelled:   { label: 'Annulé',        color: '#b91c1c', bg: '#fee2e2' }
};

function safeFormat(dateStr?: string) {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'd MMMM yyyy', { locale: fr }) : '—';
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
	return (
		<div className="flex gap-3 py-3 items-start" style={{ borderBottom: '1px solid var(--mui-palette-divider)' }}>
			<Box sx={{ width: 34, height: 34, borderRadius: '8px', backgroundColor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
				<FuseSvgIcon size={16} color="action">{icon}</FuseSvgIcon>
			</Box>
			<div>
				<Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700, color: 'text.disabled', letterSpacing: '0.06em' }}>
					{label}
				</Typography>
				<Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25 }} component="div">
					{value}
				</Typography>
			</div>
		</div>
	);
}

export default function CulturalProjectView() {
	const { projectId } = useParams<{ projectId: string }>();
	const { data: project, isLoading } = useCulturalProject(projectId);
	const { mutate: update, isPending: isUpdating } = useUpdateCulturalProject();
	const { mutate: deleteProject } = useDeleteCulturalProject();
	const navigate = useNavigate();

	const [editOpen, setEditOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [editForm, setEditForm] = useState<Partial<CulturalProject>>({});

	const openEdit = () => {
		if (!project) return;
		setEditForm({
			title: project.title,
			description: project.description,
			category: project.category,
			status: project.status,
			startDate: project.startDate,
			endDate: project.endDate ?? '',
			location: project.location ?? '',
			budget: project.budget,
			teamSize: project.teamSize,
			tags: project.tags
		});
		setEditOpen(true);
	};

	const handleUpdate = () => {
		update(
			{ id: projectId, data: editForm },
			{ onSuccess: () => setEditOpen(false) }
		);
	};

	const handleDelete = () => {
		deleteProject(projectId, {
			onSuccess: () => navigate('/culture/projects')
		});
	};

	if (isLoading) return <FuseLoading />;
	if (!project) return (
		<div className="flex flex-1 items-center justify-center">
			<Typography color="text.secondary">Projet introuvable.</Typography>
		</div>
	);

	const meta = STATUS_META[project.status];

	return (
		<>
			<Root
				header={
					<div className="flex items-center gap-3 px-6 py-4">
						<IconButton component={NavLinkAdapter} to="/culture/projects" size="small">
							<FuseSvgIcon>lucide:arrow-left</FuseSvgIcon>
						</IconButton>
						<div className="flex flex-col min-w-0 flex-1">
							<Typography variant="h5" className="font-bold truncate">{project.title}</Typography>
							<Chip
								size="small"
								label={meta.label}
								sx={{ mt: 0.5, alignSelf: 'flex-start', fontWeight: 700, fontSize: '0.7rem', color: meta.color, backgroundColor: meta.bg }}
							/>
						</div>
						<Button
							variant="outlined"
							color="secondary"
							size="small"
							startIcon={<FuseSvgIcon size={15}>lucide:pencil</FuseSvgIcon>}
							onClick={openEdit}
							sx={{ textTransform: 'none', fontWeight: 700 }}
						>
							Modifier
						</Button>
						<Button
							variant="outlined"
							color="error"
							size="small"
							startIcon={<FuseSvgIcon size={15}>lucide:trash-2</FuseSvgIcon>}
							onClick={() => setConfirmDelete(true)}
							sx={{ textTransform: 'none', fontWeight: 700 }}
						>
							Supprimer
						</Button>
					</div>
				}
				content={
					<div className="mx-auto w-full max-w-3xl p-6 flex flex-col gap-6">
						{/* Description */}
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
							<Paper sx={{ p: 3, borderRadius: '14px' }}>
								<Typography variant="h6" className="font-bold mb-2">Description</Typography>
								<Typography color="text.secondary">{project.description || '—'}</Typography>
							</Paper>
						</motion.div>

						{/* Details */}
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
							<Paper sx={{ p: 3, borderRadius: '14px' }}>
								<Typography variant="h6" className="font-bold mb-2">Informations</Typography>
								<InfoRow icon="lucide:tag" label="Catégorie" value={project.category || '—'} />
								<InfoRow icon="lucide:map-pin" label="Lieu" value={project.location || '—'} />
								<InfoRow
									icon="lucide:calendar"
									label="Dates"
									value={`${safeFormat(project.startDate)}${project.endDate ? ` → ${safeFormat(project.endDate)}` : ''}`}
								/>
								<InfoRow icon="lucide:users" label="Taille de l'équipe" value={project.teamSize ? `${project.teamSize} personnes` : '—'} />
								<InfoRow
									icon="lucide:wallet"
									label="Budget"
									value={project.budget != null ? `${project.budget.toLocaleString('fr-FR')} DT` : '—'}
								/>
								<InfoRow
									icon="lucide:calendar-check"
									label="Créé le"
									value={safeFormat(project.createdAt)}
								/>
							</Paper>
						</motion.div>

						{/* Tags */}
						{project.tags?.length > 0 && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
								<Paper sx={{ p: 3, borderRadius: '14px' }}>
									<Typography variant="h6" className="font-bold mb-3">Tags</Typography>
									<div className="flex flex-wrap gap-1.5">
										{project.tags.map((tag) => (
											<Chip key={tag} label={tag} size="small" variant="outlined" />
										))}
									</div>
								</Paper>
							</motion.div>
						)}
					</div>
				}
			/>

			{/* Edit dialog */}
			<Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
				<DialogTitle sx={{ fontWeight: 800 }}>Modifier le projet</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
					<TextField label="Titre" size="small" value={editForm.title ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
					<TextField label="Description" size="small" multiline minRows={3} value={editForm.description ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} fullWidth />

					<Box sx={{ display: 'flex', gap: 2 }}>
						<FormControl size="small" fullWidth>
							<InputLabel>Catégorie</InputLabel>
							<Select value={editForm.category ?? ''} label="Catégorie" onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}>
								{['art','festival','musique','theatre','cinema','numerique','litterature','artisanat','patrimoine','danse','autre'].map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
							</Select>
						</FormControl>
						<FormControl size="small" fullWidth>
							<InputLabel>Statut</InputLabel>
							<Select value={editForm.status ?? 'planning'} label="Statut" onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as CulturalProjectStatus }))}>
								{Object.entries(STATUS_META).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
							</Select>
						</FormControl>
					</Box>

					<Box sx={{ display: 'flex', gap: 2 }}>
						<TextField label="Date de début" type="date" size="small" value={editForm.startDate ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
						<TextField label="Date de fin" type="date" size="small" value={editForm.endDate ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
					</Box>

					<TextField label="Lieu" size="small" value={editForm.location ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))} fullWidth />

					<Box sx={{ display: 'flex', gap: 2 }}>
						<TextField
							label="Budget (DT)" type="number" size="small" value={editForm.budget ?? ''}
							onChange={(e) => setEditForm((p) => ({ ...p, budget: Number(e.target.value) }))}
							InputProps={{ startAdornment: <InputAdornment position="start">DT</InputAdornment> }}
							fullWidth
						/>
						<TextField
							label="Équipe" type="number" size="small" value={editForm.teamSize ?? ''}
							onChange={(e) => setEditForm((p) => ({ ...p, teamSize: Number(e.target.value) }))}
							InputProps={{ endAdornment: <InputAdornment position="end">pers.</InputAdornment> }}
							fullWidth
						/>
					</Box>

					<TextField
						label="Tags (séparés par des virgules)"
						size="small"
						value={(editForm.tags ?? []).join(', ')}
						onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
						fullWidth
					/>
				</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setEditOpen(false)} variant="outlined" disabled={isUpdating}>Annuler</Button>
					<Button
						onClick={handleUpdate}
						variant="contained"
						color="secondary"
						disabled={isUpdating}
						startIcon={isUpdating ? <CircularProgress size={14} /> : undefined}
					>
						{isUpdating ? 'Enregistrement…' : 'Enregistrer'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Confirm delete */}
			<Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Supprimer le projet ?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						<strong>{project.title}</strong> sera définitivement supprimé. Cette action est irréversible.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmDelete(false)} variant="outlined">Annuler</Button>
					<Button onClick={handleDelete} variant="contained" color="error">Supprimer</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}