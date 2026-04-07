'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
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
	useCulturalProject,
	useUpdateCulturalProject,
	useDeleteCulturalProject,
	useCulturalProjectTypes
} from '../../api/hooks/useCultureProjectsActivities';
import { UpdateCulturalProjectPayload } from '../../api/types/projectsAndActivities';

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

export default function CulturalProjectView() {
	const { projectId } = useParams<{ projectId: string }>();
	const id = Number(projectId);
	const { data: project, isLoading } = useCulturalProject(id);
	const { mutate: update, isPending: isUpdating } = useUpdateCulturalProject();
	const { mutate: deleteProject } = useDeleteCulturalProject();
	const { data: projectTypes = [] } = useCulturalProjectTypes();
	const navigate = useNavigate();

	const [editOpen, setEditOpen] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const [editForm, setEditForm] = useState<{
		name: string; description: string; poster_description: string;
		start_date: string; end_date: string; publishing_date: string;
		language_id: number; cultural_project_type_id: number; tags: string;
	} | null>(null);

	const openEdit = () => {
		if (!project) return;
		setEditForm({
			name: project.name,
			description: project.description,
			poster_description: project.poster_description,
			start_date: project.start_date,
			end_date: project.end_date ?? today,
			publishing_date: project.publishing_date ?? today,
			language_id: project.language?.id ?? 1,
			cultural_project_type_id: project.cultural_project_type?.id ?? 0,
			tags: project.tags.map(t => t.name).join(', ')
		});
		setEditOpen(true);
	};

	const handleUpdate = () => {
		if (!editForm || !project) return;
		const newTags = editForm.tags.split(',').map(t => t.trim()).filter(Boolean);
		const oldTags = project.tags.map(t => t.name);
		const add_tags = newTags.filter(t => !oldTags.includes(t));
		const remove_tags = oldTags.filter(t => !newTags.includes(t));

		const payload: UpdateCulturalProjectPayload = {
			id: project.id,
			name: editForm.name,
			slug: editForm.name.toLowerCase().replace(/\s+/g, '-'),
			description: editForm.description,
			poster_description: editForm.poster_description || editForm.name,
			start_date: editForm.start_date,
			end_date: editForm.end_date,
			publishing_date: editForm.publishing_date,
			language_id: editForm.language_id,
			cultural_project_type_id: editForm.cultural_project_type_id,
			add_tags,
			remove_tags
		};
		update(payload, { onSuccess: () => setEditOpen(false) });
	};

	const handleDelete = () => {
		deleteProject(id, { onSuccess: () => navigate('/culture/projects') });
	};

	if (isLoading) return <FuseLoading />;
	if (!project) return (
		<div className="flex flex-1 items-center justify-center">
			<Typography color="text.secondary">Project not found.</Typography>
		</div>
	);

	const publishBadge = project.is_published
		? { label: 'Published', color: '#15803d', bg: '#dcfce7' }
		: project.is_approved_content
		? { label: 'Approved', color: '#1d4ed8', bg: '#dbeafe' }
		: { label: 'Draft', color: '#b45309', bg: '#fef9c3' };

	return (
		<>
			<Root
				header={
					<div className="flex items-center gap-3 px-6 py-4">
						<IconButton component={NavLinkAdapter} to="/culture/projects" size="small">
							<FuseSvgIcon>lucide:arrow-left</FuseSvgIcon>
						</IconButton>
						<div className="flex flex-col min-w-0 flex-1">
							<Typography variant="h5" className="font-bold truncate">{project.name}</Typography>
							<div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
								<Chip size="small" label={publishBadge.label}
									sx={{ fontWeight: 700, fontSize: '0.7rem', color: publishBadge.color, backgroundColor: publishBadge.bg }} />
								{project.cultural_project_type && (
									<Chip size="small" label={project.cultural_project_type.name} variant="outlined" sx={{ fontSize: '0.7rem' }} />
								)}
								{project.language && (
									<Chip size="small" label={project.language.name} sx={{ fontSize: '0.7rem' }} />
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
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
							<Paper sx={{ p: 3, borderRadius: '14px' }}>
								<Typography variant="h6" className="font-bold mb-2">Description</Typography>
								<Typography color="text.secondary">{project.description || '—'}</Typography>
							</Paper>
						</motion.div>

						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
							<Paper sx={{ p: 3, borderRadius: '14px' }}>
								<Typography variant="h6" className="font-bold mb-2">Details</Typography>
								<InfoRow icon="lucide:layers" label="Type" value={project.cultural_project_type?.name || '—'} />
								<InfoRow icon="lucide:globe" label="Language" value={project.language?.name || '—'} />
								<InfoRow icon="lucide:calendar" label="Dates"
									value={`${safeFormat(project.start_date)}${project.end_date ? ` → ${safeFormat(project.end_date)}` : ''}`} />
								<InfoRow icon="lucide:send" label="Publishing date" value={safeFormat(project.publishing_date)} />
								<InfoRow icon="lucide:eye" label="Views" value={`${project.view_number}`} />
								<InfoRow icon="lucide:user" label="Created by" value={project.created_by?.full_name || '—'} />
								{project.approved_by && (
									<InfoRow icon="lucide:shield-check" label="Approved by" value={project.approved_by.full_name} />
								)}
							</Paper>
						</motion.div>

						{project.tags?.length > 0 && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}>
								<Paper sx={{ p: 3, borderRadius: '14px' }}>
									<Typography variant="h6" className="font-bold mb-3">Tags</Typography>
									<div className="flex flex-wrap gap-1.5">
										{project.tags.map(tag => (
											<Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
										))}
									</div>
								</Paper>
							</motion.div>
						)}
					</div>
				}
			/>

			{/* Edit dialog */}
			{editForm && (
				<Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
					<DialogTitle sx={{ fontWeight: 800 }}>Edit Project</DialogTitle>
					<Divider />
					<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
						<TextField label="Name" size="small" value={editForm.name} onChange={e => setEditForm(p => p && ({ ...p, name: e.target.value }))} fullWidth />
						<TextField label="Description" size="small" multiline minRows={3} value={editForm.description} onChange={e => setEditForm(p => p && ({ ...p, description: e.target.value }))} fullWidth />
						<TextField label="Poster description" size="small" value={editForm.poster_description} onChange={e => setEditForm(p => p && ({ ...p, poster_description: e.target.value }))} fullWidth />

						<FormControl size="small" fullWidth>
							<InputLabel>Project Type</InputLabel>
							<Select value={editForm.cultural_project_type_id} label="Project Type"
								onChange={e => setEditForm(p => p && ({ ...p, cultural_project_type_id: Number(e.target.value) }))}>
								{projectTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
							</Select>
						</FormControl>

						<Box sx={{ display: 'flex', gap: 2 }}>
							<TextField label="Start Date" type="date" size="small" value={editForm.start_date}
								onChange={e => setEditForm(p => p && ({ ...p, start_date: e.target.value }))}
								InputLabelProps={{ shrink: true }} fullWidth />
							<TextField label="End Date" type="date" size="small" value={editForm.end_date}
								onChange={e => setEditForm(p => p && ({ ...p, end_date: e.target.value }))}
								InputLabelProps={{ shrink: true }} fullWidth />
						</Box>

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
				<DialogTitle sx={{ fontWeight: 700 }}>Delete Project?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						<strong>{project.name}</strong> will be permanently deleted. This action is irreversible.
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