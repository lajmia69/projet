'use client';

import { useState } from 'react';
import {
	Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
	DialogTitle, Divider, FormControl, FormControlLabel, IconButton, InputAdornment,
	InputLabel, MenuItem, Paper, Select, Switch, TextField, Typography
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
	useCulturalActivity,
	useUpdateCulturalActivity,
	useDeleteCulturalActivity
} from '../../api/hooks/useCultureProjectsActivities';
import { CulturalActivity, CulturalActivityType } from '../../api/types/projectsAndActivities';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.vars.palette.divider
	}
}));

const TYPE_META: Record<CulturalActivityType, { label: string; icon: string; color: string }> = {
	workshop:    { label: 'Atelier',      icon: 'lucide:pencil-ruler', color: '#7c3aed' },
	exhibition:  { label: 'Exposition',   icon: 'lucide:image',        color: '#0284c7' },
	concert:     { label: 'Concert',      icon: 'lucide:music-2',      color: '#be185d' },
	conference:  { label: 'Conférence',   icon: 'lucide:presentation', color: '#047857' },
	festival:    { label: 'Festival',     icon: 'lucide:party-popper', color: '#b45309' },
	other:       { label: 'Autre',        icon: 'lucide:sparkles',     color: '#374151' }
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

export default function CulturalActivityView() {
	const { activityId } = useParams<{ activityId: string }>();
	const { data: activity, isLoading } = useCulturalActivity(activityId);
	const { mutate: update, isPending: isUpdating } = useUpdateCulturalActivity();
	const { mutate: deleteActivity } = useDeleteCulturalActivity();
	const navigate = useNavigate();

	const [editOpen, setEditOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [editForm, setEditForm] = useState<Partial<CulturalActivity>>({});

	const openEdit = () => {
		if (!activity) return;
		setEditForm({ ...activity });
		setEditOpen(true);
	};

	const handleUpdate = () => {
		update({ id: activityId, data: editForm }, { onSuccess: () => setEditOpen(false) });
	};

	const handleDelete = () => {
		deleteActivity(activityId, { onSuccess: () => navigate('/culture/activities') });
	};

	if (isLoading) return <FuseLoading />;
	if (!activity) return (
		<div className="flex flex-1 items-center justify-center">
			<Typography color="text.secondary">Activité introuvable.</Typography>
		</div>
	);

	const meta = TYPE_META[activity.type];

	return (
		<>
			<Root
				header={
					<div className="flex items-center gap-3 px-6 py-4">
						<IconButton component={NavLinkAdapter} to="/culture/activities" size="small">
							<FuseSvgIcon>lucide:arrow-left</FuseSvgIcon>
						</IconButton>
						<div className="flex flex-col min-w-0 flex-1">
							<Typography variant="h5" className="font-bold truncate">{activity.title}</Typography>
							<div className="flex items-center gap-1.5 mt-0.5">
								<Chip
									size="small"
									icon={<FuseSvgIcon size={12}>{meta.icon}</FuseSvgIcon>}
									label={meta.label}
									sx={{ fontSize: '0.7rem', fontWeight: 700, color: meta.color, backgroundColor: `${meta.color}18` }}
								/>
								{activity.isFree && <Chip size="small" label="Gratuit" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7' }} />}
								{activity.isOnline && <Chip size="small" label="En ligne" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#1d4ed8', backgroundColor: '#dbeafe' }} />}
							</div>
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
						<Paper sx={{ p: 3, borderRadius: '14px' }}>
							<Typography variant="h6" className="font-bold mb-2">Description</Typography>
							<Typography color="text.secondary">{activity.description || '—'}</Typography>
						</Paper>

						{/* Details */}
						<Paper sx={{ p: 3, borderRadius: '14px' }}>
							<Typography variant="h6" className="font-bold mb-2">Informations</Typography>
							<InfoRow icon="lucide:calendar" label="Date" value={`${safeFormat(activity.date)}${activity.endDate ? ` → ${safeFormat(activity.endDate)}` : ''}`} />
							<InfoRow icon="lucide:map-pin" label="Lieu" value={activity.location} />
							{activity.capacity && <InfoRow icon="lucide:users" label="Capacité" value={`${activity.capacity} personnes`} />}
							<InfoRow
								icon="lucide:ticket"
								label="Tarif"
								value={activity.isFree ? <Chip label="Gratuit" size="small" sx={{ color: '#15803d', backgroundColor: '#dcfce7', fontWeight: 700 }} /> : `${activity.price ?? 0} DT`}
							/>
							<InfoRow
								icon="lucide:globe"
								label="Format"
								value={activity.isOnline ? <Chip label="En ligne" size="small" sx={{ color: '#1d4ed8', backgroundColor: '#dbeafe', fontWeight: 700 }} /> : 'Présentiel'}
							/>
							<InfoRow icon="lucide:tag" label="Catégorie" value={activity.category || '—'} />
						</Paper>

						{/* Tags */}
						{activity.tags?.length > 0 && (
							<Paper sx={{ p: 3, borderRadius: '14px' }}>
								<Typography variant="h6" className="font-bold mb-3">Tags</Typography>
								<div className="flex flex-wrap gap-1.5">
									{activity.tags.map((tag) => (
										<Chip key={tag} label={tag} size="small" variant="outlined" />
									))}
								</div>
							</Paper>
						)}
					</div>
				}
			/>

			{/* Edit dialog */}
			<Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
				<DialogTitle sx={{ fontWeight: 800 }}>Modifier l'activité</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
					<TextField label="Titre" size="small" value={editForm.title ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} fullWidth />
					<TextField label="Description" size="small" multiline minRows={3} value={editForm.description ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} fullWidth />

					<Box sx={{ display: 'flex', gap: 2 }}>
						<FormControl size="small" fullWidth>
							<InputLabel>Type</InputLabel>
							<Select value={editForm.type ?? 'workshop'} label="Type" onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value as CulturalActivityType }))}>
								{Object.entries(TYPE_META).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
							</Select>
						</FormControl>
						<TextField label="Catégorie" size="small" value={editForm.category ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))} fullWidth />
					</Box>

					<Box sx={{ display: 'flex', gap: 2 }}>
						<TextField label="Date" type="date" size="small" value={editForm.date ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
						<TextField label="Date de fin" type="date" size="small" value={editForm.endDate ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
					</Box>

					<TextField label="Lieu" size="small" value={editForm.location ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))} fullWidth />

					<Box sx={{ display: 'flex', gap: 2 }}>
						<TextField
							label="Capacité" type="number" size="small" value={editForm.capacity ?? ''}
							onChange={(e) => setEditForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
							InputProps={{ endAdornment: <InputAdornment position="end">pers.</InputAdornment> }}
							fullWidth
						/>
						<TextField
							label="Prix" type="number" size="small" value={editForm.price ?? ''}
							onChange={(e) => setEditForm((p) => ({ ...p, price: Number(e.target.value) }))}
							disabled={editForm.isFree}
							InputProps={{ endAdornment: <InputAdornment position="end">DT</InputAdornment> }}
							fullWidth
						/>
					</Box>

					<Box sx={{ display: 'flex', gap: 3 }}>
						<FormControlLabel
							control={<Switch size="small" checked={editForm.isFree ?? true} onChange={(e) => setEditForm((p) => ({ ...p, isFree: e.target.checked }))} color="success" />}
							label="Gratuit"
						/>
						<FormControlLabel
							control={<Switch size="small" checked={editForm.isOnline ?? false} onChange={(e) => setEditForm((p) => ({ ...p, isOnline: e.target.checked }))} color="info" />}
							label="En ligne"
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
				<DialogTitle sx={{ fontWeight: 700 }}>Supprimer l'activité ?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						<strong>{activity.title}</strong> sera définitivement supprimée. Cette action est irréversible.
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