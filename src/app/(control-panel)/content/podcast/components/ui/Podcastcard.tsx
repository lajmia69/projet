'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Chip from '@mui/material/Chip';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Podcast, UpdatePodcastPayload } from '../../api/types';
import DurationDisplay from '../ui/Durationdisplay';
import { useDeletePodcast, useUpdatePodcast } from '../../api/hooks/Podcastmutations';
import { usePodcastCategories } from '../../api/hooks/categories/Podcastcategoryhooks';
import { podcastApi } from '../../api/services/podcastApiService';
import useUser from '@auth/useUser';

function usePodcastLanguages(currentAccountId: string, accessToken: string) {
	return useQuery({
		queryKey: ['podcast', 'languages', currentAccountId],
		queryFn: () => podcastApi.getLanguages(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});
}

type PodcastCardProps = { podcast: Podcast };
type EditForm = { name: string; description: string; language_id: string; podcast_category_id: string; };
type FormErrors = Partial<Record<keyof EditForm, string>>;

function PodcastCard({ podcast }: PodcastCardProps) {
	const { data: account } = useUser();

	const { mutate: deletePodcast, isPending: isDeleting } = useDeletePodcast(account.id, account.token.access);
	const { mutate: updatePodcast, isPending: isUpdating } = useUpdatePodcast(account.id, account.token.access);
	const { data: categories } = usePodcastCategories(account.id, account.token.access);
	const { data: languages } = usePodcastLanguages(account.id, account.token.access);

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState<EditForm>({ name: '', description: '', language_id: '', podcast_category_id: '' });
	const [formErrors, setFormErrors] = useState<FormErrors>({});

	const handleOpenEdit = () => {
		setForm({
			name: podcast.name ?? '',
			description: podcast.description ?? '',
			language_id: podcast.language?.id ? String(podcast.language.id) : '',
			podcast_category_id: podcast.podcast_category?.id ? String(podcast.podcast_category.id) : ''
		});
		setFormErrors({});
		setEditOpen(true);
	};

	const handleCloseEdit = () => { if (isUpdating) return; setEditOpen(false); };
	const setField = (field: keyof EditForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

	const validate = (): boolean => {
		const errors: FormErrors = {};
		if (!form.name.trim()) errors.name = 'Name is required';
		if (!form.language_id) errors.language_id = 'Language is required';
		if (!form.podcast_category_id) errors.podcast_category_id = 'Category is required';
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmitEdit = () => {
		if (!validate()) return;

		const payload: UpdatePodcastPayload = {
			id: podcast.id,
			name: form.name.trim(),
			slug: podcast.slug,
			description: form.description.trim() || ' ',  // API rejects empty string
			transcription: {},  // always send empty — transcription is managed separately
			language_id: Number(form.language_id),
			podcast_category_id: Number(form.podcast_category_id),
			add_tags: [],
			remove_tags: []
		};

		updatePodcast(payload, { onSuccess: () => setEditOpen(false) });
	};

	const handleDelete = () => deletePodcast(podcast.id, { onSuccess: () => setConfirmOpen(false) });

	return (
		<>
			<Card sx={(theme) => ({
				display: 'flex', flexDirection: 'column', borderRadius: '18px', overflow: 'hidden', height: '100%', position: 'relative',
				border: theme.palette.mode === 'dark' ? '1px solid rgba(99,179,237,0.18)' : '1px solid rgba(59,130,246,0.14)',
				background: theme.palette.mode === 'dark' ? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(23,37,64,0.98) 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f0f6ff 100%)',
				boxShadow: theme.palette.mode === 'dark' ? '0 0 0 1px rgba(99,179,237,0.08), 0 4px 24px rgba(59,130,246,0.12), 0 1px 4px rgba(0,0,0,0.4)' : '0 0 0 1px rgba(59,130,246,0.06), 0 4px 20px rgba(59,130,246,0.08), 0 1px 4px rgba(0,0,0,0.04)',
				transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
				'&:hover': { transform: 'translateY(-5px)', borderColor: theme.palette.mode === 'dark' ? 'rgba(99,179,237,0.4)' : 'rgba(59,130,246,0.35)', boxShadow: theme.palette.mode === 'dark' ? '0 0 0 1px rgba(99,179,237,0.2), 0 8px 40px rgba(59,130,246,0.28)' : '0 0 0 1px rgba(59,130,246,0.18), 0 8px 40px rgba(59,130,246,0.18)' },
				'&::before': { content: '""', position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: theme.palette.mode === 'dark' ? 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }
			})}>
				{/* Accent bar */}
				<div style={{ height: 3, width: '100%', background: 'linear-gradient(90deg, #1d4ed8, #60a5fa, #93c5fd)', position: 'relative', zIndex: 1 }} />

				{/* Body */}
				<div className="flex flex-col flex-1 p-5 gap-3" style={{ position: 'relative', zIndex: 1 }}>

					{/* Category chip + action buttons */}
					<div className="flex items-start justify-between gap-2">
						{podcast.podcast_category?.name
							? <Chip label={podcast.podcast_category.name} size="small" sx={(theme) => ({ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', height: 20, color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1d4ed8', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.1)', border: theme.palette.mode === 'dark' ? '1px solid rgba(99,179,237,0.3)' : '1px solid rgba(59,130,246,0.25)' })} />
							: <div />
						}
						<div className="flex items-center gap-0.5 shrink-0">
							<Tooltip title="Edit">
								<IconButton size="small" onClick={handleOpenEdit} sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.6)' : 'rgba(100,116,139,0.7)', '&:hover': { color: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)' } })}>
									<FuseSvgIcon size={15}>lucide:pencil</FuseSvgIcon>
								</IconButton>
							</Tooltip>
							<Tooltip title="Delete">
								<IconButton size="small" onClick={() => setConfirmOpen(true)} sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.6)' : 'rgba(100,116,139,0.7)', '&:hover': { color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' } })}>
									<FuseSvgIcon size={15}>lucide:trash-2</FuseSvgIcon>
								</IconButton>
							</Tooltip>
						</div>
					</div>

					{/* Title */}
					<Typography className="font-semibold line-clamp-2 leading-snug" dir={podcast.transcription?.language_orientation}
						sx={(theme) => ({ fontSize: '0.975rem', color: theme.palette.mode === 'dark' ? '#f0f6ff' : '#0f172a', lineHeight: 1.45 })}>
						{podcast.name}
					</Typography>

					{/* Author */}
					{podcast.transcription?.author && (
						<Typography className="line-clamp-1" dir={podcast.transcription?.language_orientation}
							sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: '0.82rem' })}>
							{podcast.transcription.author}
						</Typography>
					)}

					<div className="flex-1" />
					<div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,179,237,0.25), transparent)' }} />

					{/* Meta */}
					<div className="flex items-center gap-3 flex-wrap">
						{(podcast.streaming_version?.duration || podcast.hd_version?.duration) && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={{ color: '#60a5fa' }}>lucide:clock</FuseSvgIcon>
								<Typography className="text-xs font-medium" sx={{ color: '#60a5fa' }}>
									<DurationDisplay isoDuration={podcast.streaming_version?.duration || podcast.hd_version?.duration} format="short" />
								</Typography>
							</div>
						)}
						{podcast.language?.name && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' })}>lucide:globe</FuseSvgIcon>
								<Typography className="text-xs" sx={(theme) => ({ fontWeight: 500, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' })}>
									{podcast.language.name}
								</Typography>
							</div>
						)}
						{podcast.is_published && (
							<Chip label="Published" size="small" sx={(theme) => ({ ml: 'auto', height: 18, fontSize: '0.65rem', fontWeight: 700, color: theme.palette.mode === 'dark' ? '#86efac' : '#15803d', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(134,239,172,0.12)' : 'rgba(134,239,172,0.2)', border: theme.palette.mode === 'dark' ? '1px solid rgba(134,239,172,0.25)' : '1px solid rgba(134,239,172,0.4)' })} />
						)}
					</div>

					{/* Creator + Listen button */}
					<div className="flex items-center justify-between gap-2 pt-0.5">
						{podcast.created_by?.full_name && (
							<div className="flex items-center gap-1.5 min-w-0">
								<FuseSvgIcon size={13} sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', flexShrink: 0 })}>lucide:mic-2</FuseSvgIcon>
								<Typography className="text-xs truncate" sx={(theme) => ({ fontWeight: 500, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' })}>
									{podcast.created_by.full_name}
								</Typography>
							</div>
						)}
						<Button component={Link} to={`/content/podcast/courses/${podcast.id}`} size="small" variant="contained"
							sx={(theme) => ({ borderRadius: '9px', fontSize: '0.73rem', fontWeight: 700, textTransform: 'none', paddingX: '14px', paddingY: '5px', flexShrink: 0, minWidth: 'unset', letterSpacing: '0.02em', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', boxShadow: theme.palette.mode === 'dark' ? '0 0 14px rgba(59,130,246,0.5)' : '0 0 12px rgba(59,130,246,0.35)', transition: 'box-shadow 0.2s ease, transform 0.15s ease', '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', transform: 'scale(1.04)' } })}
							endIcon={<FuseSvgIcon size={13}>{podcast.transcription?.language_orientation === 'rtl' ? 'lucide:arrow-left' : 'lucide:arrow-right'}</FuseSvgIcon>}>
							Listen
						</Button>
					</div>
				</div>
			</Card>

			{/* ── Edit Dialog ── */}
			<Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px' } }}>
				<DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<FuseSvgIcon size={20} sx={{ color: '#3b82f6' }}>lucide:pencil</FuseSvgIcon>
					Edit Podcast
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '24px !important', display: 'flex', flexDirection: 'column', gap: 3 }}>
					<TextField label="Podcast name" value={form.name} onChange={(e) => setField('name', e.target.value)}
						error={!!formErrors.name} helperText={formErrors.name} fullWidth required size="small"
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />

					<TextField label="Description" value={form.description} onChange={(e) => setField('description', e.target.value)}
						fullWidth multiline minRows={3} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />

					<div className="flex gap-3">
						<FormControl size="small" fullWidth required error={!!formErrors.language_id}>
							<InputLabel>Language</InputLabel>
							<Select value={form.language_id} label="Language" onChange={(e) => setField('language_id', e.target.value)} sx={{ borderRadius: '10px' }}>
								{languages?.items.map((lang) => <MenuItem value={String(lang.id)} key={lang.id}>{lang.name}</MenuItem>)}
							</Select>
							{formErrors.language_id && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.language_id}</Typography>}
						</FormControl>

						<FormControl size="small" fullWidth required error={!!formErrors.podcast_category_id}>
							<InputLabel>Category</InputLabel>
							<Select value={form.podcast_category_id} label="Category" onChange={(e) => setField('podcast_category_id', e.target.value)} sx={{ borderRadius: '10px' }}>
								{categories?.items.map((cat) => <MenuItem value={String(cat.id)} key={cat.id}>{cat.name}</MenuItem>)}
							</Select>
							{formErrors.podcast_category_id && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.podcast_category_id}</Typography>}
						</FormControl>
					</div>
				</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={handleCloseEdit} variant="outlined" disabled={isUpdating} sx={{ borderRadius: '10px', textTransform: 'none' }}>Cancel</Button>
					<Button onClick={handleSubmitEdit} variant="contained" disabled={isUpdating}
						startIcon={isUpdating ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={15}>lucide:check</FuseSvgIcon>}
						sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
						{isUpdating ? 'Saving…' : 'Save Changes'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* ── Delete Dialog ── */}
			<Dialog open={confirmOpen} onClose={() => !isDeleting && setConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
				<DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<FuseSvgIcon size={20} sx={{ color: '#ef4444' }}>lucide:trash-2</FuseSvgIcon>
					Delete Podcast
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '16px !important' }}>
					<DialogContentText>
						Are you sure you want to delete <strong>&quot;{podcast.name}&quot;</strong>? This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined" disabled={isDeleting} sx={{ borderRadius: '10px', textTransform: 'none' }}>Cancel</Button>
					<Button onClick={handleDelete} variant="contained" color="error" disabled={isDeleting}
						startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={15}>lucide:trash-2</FuseSvgIcon>}
						sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default PodcastCard;
