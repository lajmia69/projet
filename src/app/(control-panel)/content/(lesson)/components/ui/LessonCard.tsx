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
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Chip from '@mui/material/Chip';
import { useState } from 'react';
import { Lesson } from '../../api/types';
import DurationDisplay from './DurationDisplay';
import { useDeleteLesson, useUpdateLesson } from '../../api/hooks/lessons/Lessonmutations';
import { useLanguages } from '../../api/hooks/languages/useLanguages';
import { useLessonTypes, useModules } from '../../api/hooks/lessons/Lessonmetahooks';
import useUser from '@auth/useUser';

type LessonCardProps = {
	lesson: Lesson;
};

type EditForm = {
	name: string;
	description: string;
	language: string;
	lesson_type: string;
	module: string;
};

type FormErrors = Partial<Record<keyof EditForm, string>>;

function LessonCard({ lesson }: LessonCardProps) {
	const { data: account } = useUser();

	// ── Mutations ─────────────────────────────────────────────────────────────
	const { mutate: deleteLesson, isPending: isDeleting } = useDeleteLesson(account.id, account.token.access);
	const { mutate: updateLesson, isPending: isUpdating } = useUpdateLesson(account.id, account.token.access);

	// ── Reference data for dropdowns ─────────────────────────────────────────
	const { data: languages } = useLanguages(account.id, account.token.access);
	const { data: lessonTypes } = useLessonTypes(account.id, account.token.access);
	const { data: modules } = useModules(account.id, account.token.access);

	// ── Dialog state ──────────────────────────────────────────────────────────
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState<EditForm>({ name: '', description: '', language: '', lesson_type: '', module: '' });
	const [formErrors, setFormErrors] = useState<FormErrors>({});

	// ── Handlers ──────────────────────────────────────────────────────────────
	const handleOpenEdit = () => {
		setForm({
			name: lesson.name ?? '',
			description: lesson.description ?? '',
			language: lesson.language?.id ? String(lesson.language.id) : '',
			lesson_type: lesson.lesson_type?.id ? String(lesson.lesson_type.id) : '',
			module: lesson.module?.id ? String(lesson.module.id) : '',
		});
		setFormErrors({});
		setEditOpen(true);
	};

	const handleCloseEdit = () => {
		if (isUpdating) return;
		setEditOpen(false);
	};

	const setField = (field: keyof EditForm, value: string) =>
		setForm((prev) => ({ ...prev, [field]: value }));

	const validate = (): boolean => {
		const errors: FormErrors = {};
		if (!form.name.trim()) errors.name = 'Name is required';
		if (!form.language) errors.language = 'Language is required';
		if (!form.lesson_type) errors.lesson_type = 'Lesson type is required';
		if (!form.module) errors.module = 'Module is required';
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmitEdit = () => {
		if (!validate()) return;
		updateLesson(
			{
				id: lesson.id,
				name: form.name.trim(),
				description: form.description.trim(),
				language: Number(form.language),
				lesson_type: Number(form.lesson_type),
				module: Number(form.module),
			} as any,
			{ onSuccess: () => setEditOpen(false) }
		);
	};

	const handleDeleteConfirm = () => {
		deleteLesson(lesson.id, { onSuccess: () => setConfirmOpen(false) });
	};

	return (
		<>
			<Card
				sx={(theme) => ({
					display: 'flex',
					flexDirection: 'column',
					borderRadius: '18px',
					overflow: 'hidden',
					height: '100%',
					position: 'relative',
					border: theme.palette.mode === 'dark'
						? '1px solid rgba(99,179,237,0.18)'
						: '1px solid rgba(59,130,246,0.14)',
					background: theme.palette.mode === 'dark'
						? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(23,37,64,0.98) 100%)'
						: 'linear-gradient(145deg, #ffffff 0%, #f0f6ff 100%)',
					boxShadow: theme.palette.mode === 'dark'
						? '0 0 0 1px rgba(99,179,237,0.08), 0 4px 24px rgba(59,130,246,0.12), 0 1px 4px rgba(0,0,0,0.4)'
						: '0 0 0 1px rgba(59,130,246,0.06), 0 4px 20px rgba(59,130,246,0.08), 0 1px 4px rgba(0,0,0,0.04)',
					transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
					'&:hover': {
						transform: 'translateY(-5px)',
						borderColor: theme.palette.mode === 'dark' ? 'rgba(99,179,237,0.4)' : 'rgba(59,130,246,0.35)',
						boxShadow: theme.palette.mode === 'dark'
							? '0 0 0 1px rgba(99,179,237,0.2), 0 8px 40px rgba(59,130,246,0.28), 0 0 60px rgba(59,130,246,0.12), 0 2px 8px rgba(0,0,0,0.4)'
							: '0 0 0 1px rgba(59,130,246,0.18), 0 8px 40px rgba(59,130,246,0.18), 0 0 60px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.06)',
					},
					'&::before': {
						content: '""',
						position: 'absolute',
						top: '-30px',
						right: '-30px',
						width: '120px',
						height: '120px',
						borderRadius: '50%',
						background: theme.palette.mode === 'dark'
							? 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)'
							: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
						pointerEvents: 'none',
						zIndex: 0,
					},
				})}
			>
				{/* Top accent bar */}
				<div style={{ height: 3, width: '100%', background: 'linear-gradient(90deg, #1d4ed8, #60a5fa, #93c5fd)', position: 'relative', zIndex: 1 }} />

				{/* Action buttons — top-right corner */}
				<div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, display: 'flex', gap: 4 }}>
					{/* Edit */}
					<Tooltip title="Edit lesson" placement="top">
						<IconButton
							size="small"
							onClick={handleOpenEdit}
							sx={(theme) => ({
								color: theme.palette.mode === 'dark' ? 'rgba(96,165,250,0.8)' : 'rgba(37,99,235,0.7)',
								backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.07)',
								border: theme.palette.mode === 'dark' ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(59,130,246,0.2)',
								width: 28,
								height: 28,
								'&:hover': {
									backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.22)' : 'rgba(59,130,246,0.14)',
									color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1d4ed8',
								},
							})}
						>
							<FuseSvgIcon size={14}>lucide:pencil</FuseSvgIcon>
						</IconButton>
					</Tooltip>

					{/* Delete */}
					<Tooltip title="Delete lesson" placement="top">
						<IconButton
							size="small"
							onClick={() => setConfirmOpen(true)}
							sx={(theme) => ({
								color: theme.palette.mode === 'dark' ? 'rgba(248,113,113,0.7)' : 'rgba(220,38,38,0.6)',
								backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)',
								border: theme.palette.mode === 'dark' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(239,68,68,0.15)',
								width: 28,
								height: 28,
								'&:hover': {
									backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)',
									color: theme.palette.mode === 'dark' ? '#f87171' : '#dc2626',
								},
							})}
						>
							<FuseSvgIcon size={14}>lucide:trash-2</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</div>

				{/* Card body */}
				<div className="flex flex-col flex-1 p-5 gap-3" style={{ position: 'relative', zIndex: 1 }}>

					{/* Module chips */}
					<div dir={lesson.transcription?.language_orientation} className="flex flex-wrap gap-1.5 pr-16">
						{lesson.module?.subject?.name && (
							<Chip
								label={lesson.module.subject.name}
								size="small"
								sx={(theme) => ({
									fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', height: 20,
									color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1d4ed8',
									backgroundColor: theme.palette.mode === 'dark' ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.1)',
									border: theme.palette.mode === 'dark' ? '1px solid rgba(99,179,237,0.3)' : '1px solid rgba(59,130,246,0.25)',
									boxShadow: theme.palette.mode === 'dark' ? '0 0 8px rgba(59,130,246,0.2)' : '0 0 6px rgba(59,130,246,0.12)',
								})}
							/>
						)}
						{lesson.module?.name && (
							<Chip
								label={lesson.module.name}
								size="small"
								sx={(theme) => ({
									fontSize: '0.68rem', fontWeight: 600, height: 20,
									color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
									backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
									border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
								})}
							/>
						)}
					</div>

					{/* Title */}
					<Typography
						className="font-semibold line-clamp-2 leading-snug"
						dir={lesson.transcription?.language_orientation}
						sx={(theme) => ({ fontSize: '0.975rem', color: theme.palette.mode === 'dark' ? '#f0f6ff' : '#0f172a', lineHeight: 1.45 })}
					>
						{lesson.name}
					</Typography>

					{/* Author */}
					{lesson.transcription?.author && (
						<Typography
							className="line-clamp-1"
							dir={lesson.transcription?.language_orientation}
							sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: '0.82rem' })}
						>
							{lesson.transcription.author}
						</Typography>
					)}

					<div className="flex-1" />

					{/* Divider */}
					<div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,179,237,0.25), transparent)' }} />

					{/* Meta row */}
					<div className="flex items-center gap-3 flex-wrap">
						{(lesson.streaming_version?.duration || lesson.hd_version?.duration) && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={{ color: '#60a5fa' }}>lucide:clock</FuseSvgIcon>
								<Typography className="text-xs font-medium" sx={{ color: '#60a5fa' }}>
									<DurationDisplay isoDuration={lesson.streaming_version?.duration || lesson.hd_version?.duration} format="short" />
								</Typography>
							</div>
						)}
						{lesson.language?.name && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' })}>lucide:globe</FuseSvgIcon>
								<Typography className="text-xs" sx={(theme) => ({ fontWeight: 500, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' })}>
									{lesson.language.name}
								</Typography>
							</div>
						)}
						{lesson.lesson_type?.name && (
							<Typography
								className="text-xs ml-auto"
								sx={(theme) => ({
									fontWeight: 600, paddingX: '7px', paddingY: '2px', borderRadius: '6px',
									color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
									background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
									border: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.07)',
								})}
							>
								{lesson.lesson_type.name}
							</Typography>
						)}
					</div>

					{/* Creator + CTA */}
					<div className="flex items-center justify-between gap-2 pt-0.5">
						{lesson.created_by?.full_name && (
							<div className="flex items-center gap-1.5 min-w-0">
								<FuseSvgIcon size={13} sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', flexShrink: 0 })}>
									lucide:graduation-cap
								</FuseSvgIcon>
								<Typography className="text-xs truncate" sx={(theme) => ({ fontWeight: 500, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' })}>
									{lesson.created_by.full_name}
								</Typography>
							</div>
						)}
						<Button
							component={Link}
							to={`/lessons/${lesson.id}`}
							size="small"
							variant="contained"
							sx={(theme) => ({
								borderRadius: '9px', fontSize: '0.73rem', fontWeight: 700, textTransform: 'none',
								paddingX: '14px', paddingY: '5px', flexShrink: 0, minWidth: 'unset', letterSpacing: '0.02em',
								background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff',
								boxShadow: theme.palette.mode === 'dark' ? '0 0 14px rgba(59,130,246,0.5), 0 2px 6px rgba(0,0,0,0.3)' : '0 0 12px rgba(59,130,246,0.35), 0 2px 6px rgba(37,99,235,0.25)',
								transition: 'box-shadow 0.2s ease, transform 0.15s ease',
								'&:hover': {
									background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
									boxShadow: theme.palette.mode === 'dark' ? '0 0 24px rgba(59,130,246,0.7), 0 4px 10px rgba(0,0,0,0.3)' : '0 0 22px rgba(59,130,246,0.55), 0 4px 10px rgba(37,99,235,0.3)',
									transform: 'scale(1.04)',
								},
							})}
							endIcon={<FuseSvgIcon size={13}>{lesson.transcription?.language_orientation === 'rtl' ? 'lucide:arrow-left' : 'lucide:arrow-right'}</FuseSvgIcon>}
						>
							Listen
						</Button>
					</div>
				</div>
			</Card>

			{/* ══════════════════════════════════════════
			    Edit Dialog
			══════════════════════════════════════════ */}
			<Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px' } }}>
				<DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<FuseSvgIcon size={20} sx={{ color: '#3b82f6' }}>lucide:pencil</FuseSvgIcon>
					Edit Lesson
				</DialogTitle>

				<Divider />

				<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>

					{/* Name */}
					<TextField
						label="Lesson name"
						value={form.name}
						onChange={(e) => setField('name', e.target.value)}
						error={!!formErrors.name}
						helperText={formErrors.name}
						fullWidth
						required
						autoFocus
						size="small"
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
					/>

					{/* Description */}
					<TextField
						label="Description"
						value={form.description}
						onChange={(e) => setField('description', e.target.value)}
						fullWidth
						multiline
						minRows={3}
						size="small"
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
					/>

					{/* Language */}
					<FormControl size="small" fullWidth required error={!!formErrors.language}>
						<InputLabel id="edit-lang-label">Language</InputLabel>
						<Select
							labelId="edit-lang-label"
							value={form.language}
							label="Language"
							onChange={(e: SelectChangeEvent) => setField('language', e.target.value)}
							sx={{ borderRadius: '10px' }}
						>
							{languages?.items.map((lang) => (
								<MenuItem value={String(lang.id)} key={lang.id}>{lang.name}</MenuItem>
							))}
						</Select>
						{formErrors.language && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.language}</Typography>}
					</FormControl>

					{/* Lesson Type */}
					<FormControl size="small" fullWidth required error={!!formErrors.lesson_type}>
						<InputLabel id="edit-type-label">Lesson Type</InputLabel>
						<Select
							labelId="edit-type-label"
							value={form.lesson_type}
							label="Lesson Type"
							onChange={(e: SelectChangeEvent) => setField('lesson_type', e.target.value)}
							sx={{ borderRadius: '10px' }}
						>
							{lessonTypes?.items.map((type) => (
								<MenuItem value={String(type.id)} key={type.id}>{type.name}</MenuItem>
							))}
						</Select>
						{formErrors.lesson_type && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.lesson_type}</Typography>}
					</FormControl>

					{/* Module */}
					<FormControl size="small" fullWidth required error={!!formErrors.module}>
						<InputLabel id="edit-mod-label">Module</InputLabel>
						<Select
							labelId="edit-mod-label"
							value={form.module}
							label="Module"
							onChange={(e: SelectChangeEvent) => setField('module', e.target.value)}
							sx={{ borderRadius: '10px' }}
						>
							{modules?.items.map((mod) => (
								<MenuItem value={String(mod.id)} key={mod.id}>
									{mod.name}
									{mod.subject?.name && (
										<Typography component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
											— {mod.subject.name}
										</Typography>
									)}
								</MenuItem>
							))}
						</Select>
						{formErrors.module && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.module}</Typography>}
					</FormControl>

				</DialogContent>

				<Divider />

				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={handleCloseEdit} variant="outlined" size="small" disabled={isUpdating} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmitEdit}
						variant="contained"
						size="small"
						disabled={isUpdating}
						startIcon={isUpdating ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={15}>lucide:check</FuseSvgIcon>}
						sx={(theme) => ({
							borderRadius: '10px', textTransform: 'none', fontWeight: 700,
							background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff',
							boxShadow: theme.palette.mode === 'dark' ? '0 0 14px rgba(59,130,246,0.4)' : '0 0 12px rgba(59,130,246,0.3)',
							'&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' },
						})}
					>
						{isUpdating ? 'Saving…' : 'Save Changes'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* ══════════════════════════════════════════
			    Delete Confirmation Dialog
			══════════════════════════════════════════ */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: 320 } }}>
				<DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
					Delete lesson?
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ fontSize: '0.875rem' }}>
						<strong>{lesson.name}</strong> will be permanently removed. This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined" size="small" sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 600 }}>
						Cancel
					</Button>
					<Button onClick={handleDeleteConfirm} variant="contained" color="error" size="small" disabled={isDeleting} sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 600 }}>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default LessonCard;