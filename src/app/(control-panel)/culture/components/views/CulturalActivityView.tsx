'use client';

import { useState } from 'react';
import {
	Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
	DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem,
	Paper, Select, TextField, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, parseISO, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useParams from '@fuse/hooks/useParams';
import useNavigate from '@fuse/hooks/useNavigate';
import {
	useCulturalActivity,
	useUpdateCulturalActivity,
	useDeleteCulturalActivity,
	useCulturalActivityTypes
} from '../../api/hooks/useCultureProjectsActivities';
import { UpdateCulturalActivityPayload } from '../../api/types/projectsAndActivities';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.vars.palette.divider
	}
}));

function safeFormat(dateStr?: string) {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'd MMMM yyyy – HH:mm', { locale: enUS }) : '—';
}

function safeFormatDate(dateStr?: string) {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'd MMMM yyyy', { locale: enUS }) : '—';
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

const today = new Date().toISOString().split('T')[0];

export default function CulturalActivityView() {
	const { activityId } = useParams<{ activityId: string }>();
	const id = Number(activityId);
	const { data: activity, isLoading } = useCulturalActivity(id);
	const { mutate: update, isPending: isUpdating } = useUpdateCulturalActivity();
	const { mutate: deleteActivity } = useDeleteCulturalActivity();
	const { data: activityTypes = [] } = useCulturalActivityTypes();
	const navigate = useNavigate();

	const [editOpen, setEditOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [editForm, setEditForm] = useState<{
		name: string; description: string; poster_description: string;
		date: string; publishing_date: string;
		language_id: number; cultural_activity_type_id: number; tags: string;
	} | null>(null);

	const openEdit = () => {
		if (!activity) return;
		// date from backend is ISO datetime e.g. "2025-05-15T09:00:00"
		const dateLocal = activity.date?.substring(0, 16) ?? `${today}T09:00`;
		setEditForm({
			name: activity.name,
			description: activity.description,
			poster_description: activity.poster_description,
			date: dateLocal,
			publishing_date: activity.publishing_date ?? today,
			language_id: activity.language?.id ?? 1,
			cultural_activity_type_id: activity.cultural_activity_type?.id ?? 0,
			tags: activity.tags.map(t => t.name).join(', ')
		});
		setEditOpen(true);
	};

	const handleUpdate = () => {
		if (!editForm || !activity) return;
		const newTags = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
		const oldTags = activity.tags.map(t => t.name);
		const add_tags = newTags.filter(t => !oldTags.includes(t));
		const remove_tags = oldTags.filter(t => !newTags.includes(t));

		const payload: UpdateCulturalActivityPayload = {
			id: activity.id,
			name: editForm.name,
			slug: editForm.name.toLowerCase().replace(/\s+/g, '-'),
			description: editForm.description,
			poster_description: editForm.poster_description || editForm.name,
			date: editForm.date.includes('T') ? `${editForm.date}:00` : `${editForm.date}T09:00:00`,
			publishing_date: editForm.publishing_date,
			language_id: editForm.language_id,
			cultural_activity_type_id: editForm.cultural_activity_type_id,
			add_tags,
			remove_tags
		};
		update(payload, { onSuccess: () => setEditOpen(false) });
	};

	const handleDelete = () => {
		deleteActivity(id, { onSuccess: () => navigate('/culture/activities') });
	};

	if (isLoading) return <FuseLoading />;
	if (!activity) return (
		<div className="flex flex-1 items-center justify-center">
			<Typography color="text.secondary">Activity not found.</Typography>
		</div>
	);

	const publishBadge = activity.is_published
		? { label: 'Published', color: '#15803d', bg: '#dcfce7' }
		: activity.is_approved_content
		? { label: 'Approved', color: '#1d4ed8', bg: '#dbeafe' }
		: { label: 'Draft', color: '#b45309', bg: '#fef9c3' };

	return (
		<>
			<Root
				header={
					<div className="flex items-center gap-3 px-6 py-4">
						<IconButton component={NavLinkAdapter} to="/culture/activities" size="small">
							<FuseSvgIcon>lucide:arrow-left</FuseSvgIcon>
						</IconButton>
						<div className="flex flex-col min-w-0 flex-1">
							<Typography variant="h5" className="font-bold truncate">{activity.name}</Typography>
							<div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
								<Chip size="small" label={publishBadge.label}
									sx={{ fontWeight: 700, fontSize: '0.7rem', color: publishBadge.color, backgroundColor: publishBadge.bg }} />
								{activity.cultural_activity_type && (
									<Chip size="small" label={activity.cultural_activity_type.name} variant="outlined" sx={{ fontSize: '0.7rem' }} />
								)}
								{activity.language && (
									<Chip size="small" label={activity.language.name} sx={{ fontSize: '0.7rem' }} />
								)}
							</div>
						</div>
						<Button variant="outlined" color="secondary" size="small"
							startIcon={<FuseSvgIcon size={15}>lucide:pencil</FuseSvgIcon>}
							onClick={openEdit} sx={{ textTransform: 'none', fontWeight: 700 }}>
							Edit
						</Button>
						<Button variant="outlined" color="error" size="small"
							startIcon={<FuseSvgIcon size={15}>lucide:trash-2</FuseSvgIcon>}
							onClick={() => setConfirmDelete(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>
							Delete
						</Button>
					</div>
				}
				content={
					<div className="mx-auto w-full max-w-3xl p-6 flex flex-col gap-6">
						<Paper sx={{ p: 3, borderRadius: '14px' }}>
							<Typography variant="h6" className="font-bold mb-2">Description</Typography>
							<Typography color="text.secondary">{activity.description || '—'}</Typography>
						</Paper>

						<Paper sx={{ p: 3, borderRadius: '14px' }}>
							<Typography variant="h6" className="font-bold mb-2">Details</Typography>
							<InfoRow icon="lucide:layers" label="Type" value={activity.cultural_activity_type?.name || '—'} />
							<InfoRow icon="lucide:globe" label="Language" value={activity.language?.name || '—'} />
							<InfoRow icon="lucide:calendar" label="Date" value={safeFormat(activity.date)} />
							<InfoRow icon="lucide:send" label="Publishing date" value={safeFormatDate(activity.publishing_date)} />
							<InfoRow icon="lucide:eye" label="Views" value={`${activity.view_number}`} />
							<InfoRow icon="lucide:user" label="Created by" value={activity.created_by?.full_name || '—'} />
							{activity.approved_by && (
								<InfoRow icon="lucide:shield-check" label="Approved by" value={activity.approved_by.full_name} />
							)}
							<InfoRow icon="lucide:check-circle" label="Status"
								value={
									<div className="flex gap-1.5 flex-wrap mt-0.5">
										<Chip size="small" label={publishBadge.label}
											sx={{ fontWeight: 700, fontSize: '0.68rem', color: publishBadge.color, backgroundColor: publishBadge.bg }} />
										{activity.is_pubic_content && (
											<Chip size="small" label="Public" sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#374151', backgroundColor: '#f3f4f6' }} />
										)}
									</div>
								}
							/>
						</Paper>

						{activity.tags?.length > 0 && (
							<Paper sx={{ p: 3, borderRadius: '14px' }}>
								<Typography variant="h6" className="font-bold mb-3">Tags</Typography>
								<div className="flex flex-wrap gap-1.5">
									{activity.tags.map(tag => (
										<Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
									))}
								</div>
							</Paper>
						)}
					</div>
				}
			/>

			{/* Edit dialog */}
			{editForm && (
				<Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
					<DialogTitle sx={{ fontWeight: 800 }}>Edit Activity</DialogTitle>
					<Divider />
					<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
						<TextField label="Name" size="small" value={editForm.name}
							onChange={e => setEditForm(p => p && ({ ...p, name: e.target.value }))} fullWidth />
						<TextField label="Description" size="small" multiline minRows={3} value={editForm.description}
							onChange={e => setEditForm(p => p && ({ ...p, description: e.target.value }))} fullWidth />
						<TextField label="Poster description" size="small" value={editForm.poster_description}
							onChange={e => setEditForm(p => p && ({ ...p, poster_description: e.target.value }))} fullWidth />

						<FormControl size="small" fullWidth>
							<InputLabel>Activity Type</InputLabel>
							<Select value={editForm.cultural_activity_type_id} label="Activity Type"
								onChange={e => setEditForm(p => p && ({ ...p, cultural_activity_type_id: Number(e.target.value) }))}>
								{activityTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
							</Select>
						</FormControl>

						<TextField label="Date & Time" type="datetime-local" size="small"
							value={editForm.date.substring(0, 16)}
							onChange={e => setEditForm(p => p && ({ ...p, date: `${e.target.value}:00` }))}
							InputLabelProps={{ shrink: true }} fullWidth />

						<TextField label="Publishing Date" type="date" size="small" value={editForm.publishing_date}
							onChange={e => setEditForm(p => p && ({ ...p, publishing_date: e.target.value }))}
							InputLabelProps={{ shrink: true }} fullWidth />

						<TextField label="Tags (comma-separated)" size="small" value={editForm.tags}
							onChange={e => setEditForm(p => p && ({ ...p, tags: e.target.value }))} fullWidth />
					</DialogContent>
					<Divider />
					<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
						<Button onClick={() => setEditOpen(false)} variant="outlined" disabled={isUpdating}>Cancel</Button>
						<Button onClick={handleUpdate} variant="contained" color="secondary" disabled={isUpdating}
							startIcon={isUpdating ? <CircularProgress size={14} /> : undefined}>
							{isUpdating ? 'Saving…' : 'Save'}
						</Button>
					</DialogActions>
				</Dialog>
			)}

			{/* Confirm delete */}
			<Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Delete Activity?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						<strong>{activity.name}</strong> will be permanently deleted. This action is irreversible.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmDelete(false)} variant="outlined">Cancel</Button>
					<Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}