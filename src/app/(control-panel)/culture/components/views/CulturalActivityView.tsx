'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
	Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
	DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem,
	Paper, Select, TextField, Tooltip, Typography, Badge,
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
	useValidateCulturalActivity,
	usePublishCulturalActivity,
	useDeleteCulturalActivity,
	useCulturalActivityTypes,
	useAccountId,
} from '../../api/hooks/useCultureProjectsActivities';
import { UpdateCulturalActivityPayload } from '../../api/types/projectsAndActivities';
import { AudioPanel } from '@/app/(control-panel)/studio/components/ui/board/audio/AudioPanel';
import { useLinkedStudioProject, useLinkedStudioProjectTasks } from '@/app/(control-panel)/studio/api/hooks/useLinkedStudioProject';
import { useStudioAuth } from '@/app/(control-panel)/studio/api/hooks/useStudioauth';
import { createStudioProjectForContent } from '@/app/(control-panel)/studio/api/utils/autoCreateStudioProject';
import { getAccessTokenAsync } from '../../api/utils/authTokenUtils';
import { useGetProjectAudios } from '@/app/(control-panel)/studio/api/hooks/audio/useGetProjectAudios';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1, borderStyle: 'solid', borderColor: theme.vars.palette.divider,
	},
	'& .FusePageSimple-root': { overflow: 'hidden' },
	'& .FusePageSimple-wrapper': { overflow: 'hidden' },
	'& .FusePageSimple-contentWrapper': { overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
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
				<Typography variant="body2" sx={{ fontWeight: 500, mt: 0.25 }} component="div">{value}</Typography>
			</div>
		</div>
	);
}

const today = new Date().toISOString().split('T')[0];

export default function CulturalActivityView() {
	const { activityId } = useParams<{ activityId: string }>();
	const id = Number(activityId);

	// Studio auth - must be called to set token in studioApiService
	useStudioAuth();

	const { data: activity, isLoading } = useCulturalActivity(id);
	const { mutate: update, isPending: isUpdating } = useUpdateCulturalActivity();
	const { mutate: validate, isPending: isValidating } = useValidateCulturalActivity();
	const { mutate: publish, isPending: isPublishing } = usePublishCulturalActivity();
	const { mutate: deleteActivity } = useDeleteCulturalActivity();
	const { data: activityTypes = [] } = useCulturalActivityTypes();
	const navigate = useNavigate();
	const accountId = useAccountId();

	// Studio project link
	const { data: studioProject, refetch: refetchStudioProject } = useLinkedStudioProject('cultural_activity', id);
	const { data: studioTasks = [] } = useLinkedStudioProjectTasks(studioProject?.id);
	const { data: allAudios = [] } = useGetProjectAudios(studioProject?.id);

	const [audioOpen, setAudioOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [confirmValidate, setConfirmValidate] = useState(false);
	const [confirmPublish, setConfirmPublish] = useState(false);
	const [creatingStudio, setCreatingStudio] = useState(false);

	const [editForm, setEditForm] = useState<{
		name: string; description: string; poster_description: string;
		date: string; publishing_date: string;
		language_id: number; cultural_activity_type_id: number; tags: string;
	} | null>(null);

	const openEdit = () => {
		if (!activity) return;
		const dateLocal = activity.date?.substring(0, 16) ?? `${today}T09:00`;
		setEditForm({
			name: activity.name, description: activity.description,
			poster_description: activity.poster_description, date: dateLocal,
			publishing_date: activity.publishing_date ?? today,
			language_id: activity.language?.id ?? 1,
			cultural_activity_type_id: activity.cultural_activity_type?.id ?? 0,
			tags: activity.tags.map(t => t.name).join(', '),
		});
		setEditOpen(true);
	};

	const handleUpdate = () => {
		if (!editForm || !activity) return;
		const newTags = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
		const oldTags = activity.tags.map(t => t.name);
		const payload: UpdateCulturalActivityPayload = {
			id: activity.id, name: editForm.name,
			slug: editForm.name.toLowerCase().replace(/\s+/g, '-'),
			description: editForm.description,
			poster_description: editForm.poster_description || editForm.name,
			date: editForm.date.includes('T') ? `${editForm.date}:00` : `${editForm.date}T09:00:00`,
			publishing_date: editForm.publishing_date, language_id: editForm.language_id,
			cultural_activity_type_id: editForm.cultural_activity_type_id,
			add_tags: newTags.filter(t => !oldTags.includes(t)),
			remove_tags: oldTags.filter(t => !newTags.includes(t)),
		};
		update(payload, { onSuccess: () => setEditOpen(false) });
	};

	const handleDelete = () =>
		deleteActivity(id, { onSuccess: () => navigate('/culture/activities') });

	/** Open audio panel, creating studio project first if needed */
	const handleOpenAudio = async () => {
		if (!studioProject && activity?.id && activity?.name && accountId > 0) {
			setCreatingStudio(true);
			try {
				const token = await getAccessTokenAsync();
				if (token) {
					await createStudioProjectForContent(
						accountId, token, 'cultural_activity', activity.id, activity.name,
					);
					await refetchStudioProject();
				}
			} finally {
				setCreatingStudio(false);
			}
		}
		setAudioOpen(true);
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

	const canValidate = !activity.is_approved_content && !activity.is_published;
	const canPublish  = activity.is_approved_content && !activity.is_published;

	return (
		<>
			<Root
				scroll="content"
				header={
					<div className="flex items-center gap-2 px-6 py-4 flex-wrap">
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

						<div className="flex items-center gap-2 flex-wrap">
							{/* ── Audio button ── */}
							<Tooltip title={studioProject ? 'View studio audio files' : 'Create studio board & add audio'}>
								<Badge badgeContent={allAudios.length} color="secondary" max={99} invisible={allAudios.length === 0}>
									<Button variant="outlined" size="small" onClick={handleOpenAudio} disabled={creatingStudio}
										startIcon={creatingStudio ? <CircularProgress size={14} /> : <FuseSvgIcon size={15}>lucide:headphones</FuseSvgIcon>}
										sx={{ textTransform: 'none', fontWeight: 700 }}>
										{creatingStudio ? 'Setting up…' : 'Audio'}
									</Button>
								</Badge>
							</Tooltip>

							{canValidate && (
								<Button variant="contained" size="small" onClick={() => setConfirmValidate(true)} disabled={isValidating}
									startIcon={isValidating ? <CircularProgress size={14} /> : <FuseSvgIcon size={15}>lucide:shield-check</FuseSvgIcon>}
									sx={{ textTransform: 'none', fontWeight: 700, backgroundColor: '#1d4ed8', '&:hover': { backgroundColor: '#1e40af' } }}>
									{isValidating ? 'Validating…' : 'Validate'}
								</Button>
							)}
							{canPublish && (
								<Button variant="contained" size="small" onClick={() => setConfirmPublish(true)} disabled={isPublishing}
									startIcon={isPublishing ? <CircularProgress size={14} /> : <FuseSvgIcon size={15}>lucide:send</FuseSvgIcon>}
									sx={{ textTransform: 'none', fontWeight: 700, backgroundColor: '#15803d', '&:hover': { backgroundColor: '#166534' } }}>
									{isPublishing ? 'Publishing…' : 'Publish'}
								</Button>
							)}
							{activity.is_published && (
								<Chip icon={<FuseSvgIcon size={13}>lucide:check-circle</FuseSvgIcon>}
									label="Published" size="small"
									sx={{ fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', fontSize: '0.75rem' }} />
							)}
							<Button variant="outlined" color="secondary" size="small"
								startIcon={<FuseSvgIcon size={15}>lucide:pencil</FuseSvgIcon>}
								onClick={openEdit} sx={{ textTransform: 'none', fontWeight: 700 }}>Edit</Button>
							<Button variant="outlined" color="error" size="small"
								startIcon={<FuseSvgIcon size={15}>lucide:trash-2</FuseSvgIcon>}
								onClick={() => setConfirmDelete(true)} sx={{ textTransform: 'none', fontWeight: 700 }}>Delete</Button>
						</div>
					</div>
				}
				content={
					<div className="mx-auto w-full max-w-3xl p-6 flex flex-col gap-6">
						{canValidate && (
							<Paper sx={{ p: 2, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, backgroundColor: '#fefce8', border: '1px solid #fde047' }}>
								<FuseSvgIcon size={20} sx={{ color: '#b45309', flexShrink: 0 }}>lucide:info</FuseSvgIcon>
								<div className="flex-1 min-w-0">
									<Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#92400e' }}>This activity is a draft</Typography>
									<Typography sx={{ fontSize: '0.78rem', color: '#b45309' }}>
										Click <strong>Validate</strong> then <strong>Publish</strong> to make it public.
									</Typography>
								</div>
								<Button size="small" variant="contained" onClick={() => setConfirmValidate(true)} disabled={isValidating}
									startIcon={isValidating ? <CircularProgress size={13} /> : <FuseSvgIcon size={14}>lucide:shield-check</FuseSvgIcon>}
									sx={{ textTransform: 'none', fontWeight: 700, backgroundColor: '#1d4ed8', whiteSpace: 'nowrap' }}>
									{isValidating ? 'Validating…' : 'Validate now'}
								</Button>
							</Paper>
						)}
						{canPublish && (
							<Paper sx={{ p: 2, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, backgroundColor: '#eff6ff', border: '1px solid #93c5fd' }}>
								<FuseSvgIcon size={20} sx={{ color: '#1d4ed8', flexShrink: 0 }}>lucide:shield-check</FuseSvgIcon>
								<div className="flex-1 min-w-0">
									<Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e3a8a' }}>Validated — ready to publish</Typography>
									<Typography sx={{ fontSize: '0.78rem', color: '#1d4ed8' }}>
										Click <strong>Publish</strong> to make it visible to the public.
									</Typography>
								</div>
								<Button size="small" variant="contained" onClick={() => setConfirmPublish(true)} disabled={isPublishing}
									startIcon={isPublishing ? <CircularProgress size={13} /> : <FuseSvgIcon size={14}>lucide:send</FuseSvgIcon>}
									sx={{ textTransform: 'none', fontWeight: 700, backgroundColor: '#15803d', whiteSpace: 'nowrap' }}>
									{isPublishing ? 'Publishing…' : 'Publish now'}
								</Button>
							</Paper>
						)}

						<Paper sx={{ p: 3, borderRadius: '14px' }}>
							<Typography variant="h6" className="font-bold mb-2">Description</Typography>
							<Typography color="text.secondary">{activity.description || '—'}</Typography>
						</Paper>

						<Paper sx={{ p: 3, borderRadius: '14px' }}>
							<Typography variant="h6" className="font-bold mb-2">Details</Typography>
							<InfoRow icon="lucide:layers"        label="Type"       value={activity.cultural_activity_type?.name || '—'} />
							<InfoRow icon="lucide:globe"         label="Language"   value={activity.language?.name || '—'} />
							<InfoRow icon="lucide:calendar"      label="Date"       value={safeFormat(activity.date)} />
							<InfoRow icon="lucide:send"          label="Publishing" value={safeFormatDate(activity.publishing_date)} />
							<InfoRow icon="lucide:eye"           label="Views"      value={`${activity.view_number}`} />
							<InfoRow icon="lucide:user"          label="Created by" value={activity.created_by?.full_name || '—'} />
							{activity.approved_by && (
								<InfoRow icon="lucide:shield-check" label="Approved by" value={activity.approved_by.full_name} />
							)}
							<InfoRow icon="lucide:check-circle" label="Status"
								value={
									<div className="flex gap-1.5 flex-wrap mt-0.5">
										<Chip size="small" label={publishBadge.label}
											sx={{ fontWeight: 700, fontSize: '0.68rem', color: publishBadge.color, backgroundColor: publishBadge.bg }} />
										{activity.is_pubic_content && (
											<Chip size="small" label="Public"
												sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#374151', backgroundColor: '#f3f4f6' }} />
										)}
									</div>
								}
							/>
						</Paper>

						{/* ── Studio Audio Section ── */}
						<Paper sx={{ p: 3, borderRadius: '14px' }}>
							<div className="flex items-center justify-between mb-3">
								<Typography variant="h6" className="font-bold">Studio Audio Files</Typography>
								<Badge badgeContent={allAudios.length} color="secondary" max={99} invisible={allAudios.length === 0}>
									<Button size="small" variant="contained" color="secondary"
										onClick={handleOpenAudio} disabled={creatingStudio}
										startIcon={creatingStudio ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={14}>lucide:plus</FuseSvgIcon>}
										sx={{ textTransform: 'none', fontWeight: 700 }}>
										{creatingStudio ? 'Setting up…' : allAudios.length > 0 ? 'Manage audio' : 'Add audio'}
									</Button>
								</Badge>
							</div>

							{allAudios.length === 0 ? (
								<div className="flex flex-col items-center gap-2 py-6">
									<FuseSvgIcon size={32} sx={{ color: 'text.disabled' }}>lucide:music-off</FuseSvgIcon>
									<Typography color="text.secondary" variant="body2">No audio files yet</Typography>
									<Typography color="text.disabled" variant="caption">
										{studioProject
											? 'Click "Add audio" to upload audio files to this activity.'
											: 'Click "Add audio" to create a Studio board and start uploading.'}
									</Typography>
								</div>
							) : (
								<div className="flex flex-col gap-2">
									{allAudios.map((audio) => (
										<div key={audio.id} className="flex items-center gap-3 rounded-lg border px-3 py-2"
											style={{ borderColor: 'var(--mui-palette-divider)' }}>
											<FuseSvgIcon size={16} sx={{ color: 'secondary.main', flexShrink: 0 }}>lucide:music</FuseSvgIcon>
											<div className="flex-1 min-w-0">
												<Typography className="text-sm font-semibold truncate">{audio.name}</Typography>
												{audio.description && (
													<Typography className="text-xs truncate" color="text.secondary">{audio.description}</Typography>
												)}
											</div>
											{audio.format?.extension && (
												<Chip label={audio.format.extension.toUpperCase()} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
											)}
										</div>
									))}
									<Button size="small" onClick={handleOpenAudio}
										startIcon={<FuseSvgIcon size={14}>lucide:headphones</FuseSvgIcon>}
										sx={{ mt: 1, textTransform: 'none' }}>
										Open full audio panel
									</Button>
								</div>
							)}
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

			{/* ── Audio Panel ── */}
			<AudioPanel
				open={audioOpen}
				onClose={() => setAudioOpen(false)}
				projectId={String(studioProject?.id ?? '')}
				projectName={activity.name}
				tasks={studioTasks}
			/>

			{/* ── Edit dialog ── */}
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

			<Dialog open={confirmValidate} onClose={() => setConfirmValidate(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Validate Activity?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">Mark <strong>{activity.name}</strong> as validated. It still needs publishing to become public.</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmValidate(false)} variant="outlined">Cancel</Button>
					<Button onClick={() => { validate(id); setConfirmValidate(false); }} variant="contained"
						sx={{ textTransform: 'none', fontWeight: 700, backgroundColor: '#1d4ed8' }}>Validate</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={confirmPublish} onClose={() => setConfirmPublish(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Publish Activity?</DialogTitle>
				<DialogContent>
					<Typography variant="body2"><strong>{activity.name}</strong> will be made publicly visible.</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmPublish(false)} variant="outlined">Cancel</Button>
					<Button onClick={() => { publish(id); setConfirmPublish(false); }} variant="contained"
						sx={{ textTransform: 'none', fontWeight: 700, backgroundColor: '#15803d' }}>Publish</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Delete Activity?</DialogTitle>
				<DialogContent>
					<Typography variant="body2"><strong>{activity.name}</strong> will be permanently deleted.</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmDelete(false)} variant="outlined">Cancel</Button>
					<Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}