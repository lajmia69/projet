'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Slider from '@mui/material/Slider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { formatDistanceToNow, format } from 'date-fns';
import { useGetProjectAudios } from '../../../../api/hooks/audio/useGetProjectAudios';
import { useUploadProjectAudio, useUpdateAudioFile, useDeleteAudioFile } from '../../../../api/hooks/audio/useAudioMutations';
import { AudioFile } from '../../../../api/types';
import { studioApiService } from '../../../../api/services/studioApiService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number | null): string {
	if (!bytes) return '—';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds: number | null): string {
	if (!seconds) return '—';
	const m = Math.floor(seconds / 60);
	const s = Math.floor(seconds % 60);
	return `${m}:${s.toString().padStart(2, '0')}`;
}

const ACCEPTED_AUDIO_TYPES = 'audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.wma';

// ─── Mini Audio Player ────────────────────────────────────────────────────────

function AudioPlayer({ src, title }: { src: string; title: string }) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playing, setPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	function togglePlay() {
		if (!audioRef.current) return;
		if (playing) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
		setPlaying(!playing);
	}

	function handleTimeUpdate() {
		if (!audioRef.current) return;
		setCurrentTime(audioRef.current.currentTime);
		setProgress((audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100);
	}

	function handleLoadedMetadata() {
		if (audioRef.current) setDuration(audioRef.current.duration);
	}

	function handleEnded() {
		setPlaying(false);
		setProgress(0);
		setCurrentTime(0);
	}

	function handleSeek(_: Event, value: number | number[]) {
		if (!audioRef.current || typeof value !== 'number') return;
		const time = (value / 100) * (audioRef.current.duration || 0);
		audioRef.current.currentTime = time;
		setProgress(value);
	}

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			audioRef.current?.pause();
		};
	}, []);

	return (
		<div className="flex flex-col gap-1 w-full">
			<audio
				ref={audioRef}
				src={src}
				onTimeUpdate={handleTimeUpdate}
				onLoadedMetadata={handleLoadedMetadata}
				onEnded={handleEnded}
				preload="metadata"
			/>
			<div className="flex items-center gap-2">
				<IconButton
					size="small"
					onClick={togglePlay}
					sx={{ color: 'secondary.main' }}
				>
					<FuseSvgIcon size={20}>
						{playing ? 'lucide:pause' : 'lucide:play'}
					</FuseSvgIcon>
				</IconButton>

				<Slider
					size="small"
					value={progress}
					onChange={handleSeek}
					aria-label={`Seek ${title}`}
					sx={{
						flex: 1,
						'& .MuiSlider-thumb': { width: 10, height: 10 },
						'& .MuiSlider-track': { height: 3 },
						'& .MuiSlider-rail': { height: 3 }
					}}
				/>

				<Typography variant="caption" color="text.secondary" className="shrink-0 tabular-nums">
					{formatDuration(currentTime)} / {formatDuration(duration || null)}
				</Typography>
			</div>
		</div>
	);
}

// ─── Single Audio Row ─────────────────────────────────────────────────────────

function AudioRow({
	audio,
	projectId,
	onDelete
}: {
	audio: AudioFile;
	projectId: string | number;
	onDelete: (audio: AudioFile) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const [editing, setEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(audio.title);
	const [editDesc, setEditDesc] = useState(audio.description ?? '');
	const { mutateAsync: update, isPending: isSaving } = useUpdateAudioFile(projectId);

	const src = studioApiService.getAudioUrl(audio.file);

	async function handleSave() {
		if (!audio.id) return;
		await update({ id: audio.id, title: editTitle.trim() || audio.title, description: editDesc.trim() || null });
		setEditing(false);
	}

	return (
		<div className="rounded-xl border transition-all duration-150"
			style={{ borderColor: 'var(--mui-palette-divider)' }}
		>
			{/* Header row */}
			<div className="flex items-center gap-2 px-3 py-2">
				{/* Waveform icon */}
				<div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg"
					style={{ backgroundColor: 'rgba(var(--mui-palette-secondary-mainChannel) / 0.12)' }}
				>
					<FuseSvgIcon size={16} style={{ color: 'var(--mui-palette-secondary-main)' }}>
						lucide:music
					</FuseSvgIcon>
				</div>

				{editing ? (
					<div className="flex flex-1 flex-col gap-1">
						<TextField
							size="small"
							value={editTitle}
							onChange={(e) => setEditTitle(e.target.value)}
							autoFocus
							fullWidth
							label="Title"
						/>
						<TextField
							size="small"
							value={editDesc}
							onChange={(e) => setEditDesc(e.target.value)}
							fullWidth
							label="Description"
							multiline
							maxRows={2}
						/>
						<div className="flex gap-1 justify-end">
							<Button size="small" onClick={() => setEditing(false)}>Cancel</Button>
							<Button
								size="small"
								variant="contained"
								color="secondary"
								disabled={isSaving}
								onClick={handleSave}
							>
								{isSaving ? 'Saving…' : 'Save'}
							</Button>
						</div>
					</div>
				) : (
					<div className="flex flex-1 min-w-0 flex-col">
						<Typography className="text-sm font-semibold truncate">{audio.title}</Typography>
						<div className="flex items-center gap-2 flex-wrap">
							{audio.format && (
								<Chip label={audio.format.toUpperCase()} size="small"
									sx={{ height: 18, fontSize: '0.65rem' }} />
							)}
							<Typography variant="caption" color="text.secondary">
								{formatDuration(audio.duration)} · {formatBytes(audio.size)}
							</Typography>
						</div>
					</div>
				)}

				{!editing && (
					<div className="flex items-center shrink-0">
						<Tooltip title="Expand / play">
							<IconButton size="small" onClick={() => setExpanded((v) => !v)}>
								<FuseSvgIcon size={16}>
									{expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'}
								</FuseSvgIcon>
							</IconButton>
						</Tooltip>
						<Tooltip title="Edit">
							<IconButton size="small" onClick={() => setEditing(true)}>
								<FuseSvgIcon size={16}>lucide:pencil</FuseSvgIcon>
							</IconButton>
						</Tooltip>
						<Tooltip title="Download">
							<IconButton size="small" component="a" href={src} download={audio.title} target="_blank">
								<FuseSvgIcon size={16}>lucide:download</FuseSvgIcon>
							</IconButton>
						</Tooltip>
						<Tooltip title="Delete">
							<IconButton size="small" color="error" onClick={() => onDelete(audio)}>
								<FuseSvgIcon size={16}>lucide:trash-2</FuseSvgIcon>
							</IconButton>
						</Tooltip>
					</div>
				)}
			</div>

			{/* Expanded player */}
			{expanded && !editing && (
				<div className="px-3 pb-3 pt-1">
					{audio.description && (
						<Typography className="text-xs mb-2" color="text.secondary">
							{audio.description}
						</Typography>
					)}
					<AudioPlayer src={src} title={audio.title} />
					{audio.created_at && (
						<Typography variant="caption" color="text.disabled" className="mt-1 block">
							Uploaded {formatDistanceToNow(new Date(audio.created_at), { addSuffix: true })}
							{audio.created_by?.full_name ? ` by ${audio.created_by.full_name}` : ''}
						</Typography>
					)}
				</div>
			)}
		</div>
	);
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({
	projectId,
	onUploaded
}: {
	projectId: string | number;
	onUploaded: () => void;
}) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const { mutateAsync: upload, isPending } = useUploadProjectAudio(projectId);

	function handleFileChange(files: FileList | null) {
		if (!files || files.length === 0) return;
		const file = files[0];
		setSelectedFile(file);
		// Pre-fill title from filename (strip extension)
		setTitle(file.name.replace(/\.[^/.]+$/, ''));
	}

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
		handleFileChange(e.dataTransfer.files);
	}, []);

	async function handleSubmit() {
		if (!selectedFile || !title.trim()) return;
		await upload({
			title: title.trim(),
			description: description.trim() || null,
			production_project_id: Number(projectId),
			file: selectedFile
		});
		setSelectedFile(null);
		setTitle('');
		setDescription('');
		onUploaded();
	}

	return (
		<div className="flex flex-col gap-3">
			{/* Drop zone */}
			<div
				className={clsx(
					'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors duration-150',
					dragging ? 'border-secondary-main bg-secondary-main/10' : 'border-divider'
				)}
				style={{
					borderColor: dragging ? 'var(--mui-palette-secondary-main)' : undefined,
					backgroundColor: dragging ? 'rgba(var(--mui-palette-secondary-mainChannel) / 0.08)' : undefined
				}}
				onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
				onDragLeave={() => setDragging(false)}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
			>
				<FuseSvgIcon size={32} color="disabled">lucide:upload-cloud</FuseSvgIcon>
				<Typography className="mt-2 text-sm font-medium" color="text.secondary">
					{selectedFile ? selectedFile.name : 'Drop audio file here or click to browse'}
				</Typography>
				{selectedFile && (
					<Typography variant="caption" color="text.disabled">
						{formatBytes(selectedFile.size)}
					</Typography>
				)}
				<input
					ref={fileInputRef}
					type="file"
					accept={ACCEPTED_AUDIO_TYPES}
					className="hidden"
					onChange={(e) => handleFileChange(e.target.files)}
				/>
			</div>

			{selectedFile && (
				<>
					<TextField
						size="small"
						fullWidth
						label="Title *"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<TextField
						size="small"
						fullWidth
						label="Description (optional)"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						multiline
						rows={2}
					/>

					{isPending && <LinearProgress color="secondary" />}

					<div className="flex gap-2">
						<Button
							variant="contained"
							color="secondary"
							disabled={!title.trim() || isPending}
							onClick={handleSubmit}
							startIcon={isPending
								? <CircularProgress size={14} color="inherit" />
								: <FuseSvgIcon size={16}>lucide:upload</FuseSvgIcon>
							}
						>
							{isPending ? 'Uploading…' : 'Upload'}
						</Button>
						<Button onClick={() => { setSelectedFile(null); setTitle(''); setDescription(''); }}>
							Cancel
						</Button>
					</div>
				</>
			)}
		</div>
	);
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({
	audio,
	onConfirm,
	onClose,
	isDeleting
}: {
	audio: AudioFile | null;
	onConfirm: () => void;
	onClose: () => void;
	isDeleting: boolean;
}) {
	return (
		<Dialog open={Boolean(audio)} onClose={onClose} maxWidth="xs" fullWidth>
			<DialogTitle>Delete audio file?</DialogTitle>
			<DialogContent>
				<Typography>
					Are you sure you want to delete <strong>{audio?.title}</strong>? This cannot be undone.
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} disabled={isDeleting}>Cancel</Button>
				<Button color="error" variant="contained" onClick={onConfirm} disabled={isDeleting}>
					{isDeleting ? 'Deleting…' : 'Delete'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// ─── AudioPanel (Drawer) ──────────────────────────────────────────────────────

type AudioPanelProps = {
	open: boolean;
	onClose: () => void;
	projectId: string | number;
	projectName?: string;
};

export function AudioPanel({ open, onClose, projectId, projectName }: AudioPanelProps) {
	const [showUpload, setShowUpload] = useState(false);
	const [audioToDelete, setAudioToDelete] = useState<AudioFile | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const { data: audios = [], isLoading } = useGetProjectAudios(projectId);
	const { mutateAsync: deleteAudio, isPending: isDeleting } = useDeleteAudioFile(projectId);

	const filtered = audios.filter((a) =>
		a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(a.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
	);

	async function handleConfirmDelete() {
		if (!audioToDelete?.id) return;
		await deleteAudio(audioToDelete.id);
		setAudioToDelete(null);
	}

	const totalDuration = audios.reduce((acc, a) => acc + (a.duration ?? 0), 0);
	const totalSize = audios.reduce((acc, a) => acc + (a.size ?? 0), 0);

	return (
		<>
			<Drawer
				anchor="right"
				open={open}
				onClose={onClose}
				PaperProps={{ sx: { width: { xs: '100vw', sm: 440 } } }}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b"
					style={{ borderColor: 'var(--mui-palette-divider)' }}
				>
					<div className="flex items-center gap-2">
						<div className="flex items-center justify-center w-8 h-8 rounded-lg"
							style={{ backgroundColor: 'rgba(var(--mui-palette-secondary-mainChannel) / 0.12)' }}
						>
							<FuseSvgIcon size={18} style={{ color: 'var(--mui-palette-secondary-main)' }}>
								lucide:headphones
							</FuseSvgIcon>
						</div>
						<div>
							<Typography className="font-bold text-base leading-tight">Audio Files</Typography>
							{projectName && (
								<Typography variant="caption" color="text.secondary" className="block leading-tight">
									{projectName}
								</Typography>
							)}
						</div>
					</div>
					<IconButton onClick={onClose} size="small">
						<FuseSvgIcon>lucide:x</FuseSvgIcon>
					</IconButton>
				</div>

				{/* Stats bar */}
				{audios.length > 0 && (
					<div className="flex items-center gap-4 px-4 py-2 border-b"
						style={{
							borderColor: 'var(--mui-palette-divider)',
							backgroundColor: 'rgba(var(--mui-palette-secondary-mainChannel) / 0.04)'
						}}
					>
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={14} color="disabled">lucide:music</FuseSvgIcon>
							<Typography variant="caption" color="text.secondary">
								{audios.length} file{audios.length !== 1 ? 's' : ''}
							</Typography>
						</div>
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={14} color="disabled">lucide:clock</FuseSvgIcon>
							<Typography variant="caption" color="text.secondary">
								{formatDuration(totalDuration)}
							</Typography>
						</div>
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={14} color="disabled">lucide:hard-drive</FuseSvgIcon>
							<Typography variant="caption" color="text.secondary">
								{formatBytes(totalSize)}
							</Typography>
						</div>
					</div>
				)}

				{/* Body */}
				<div className="flex flex-col flex-1 overflow-hidden">
					{/* Toolbar */}
					<div className="flex items-center gap-2 px-4 pt-3 pb-2">
						<TextField
							size="small"
							placeholder="Search audio…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							sx={{ flex: 1 }}
							slotProps={{
								input: {
									startAdornment: (
										<FuseSvgIcon size={16} color="disabled" className="mr-1">
											lucide:search
										</FuseSvgIcon>
									)
								}
							}}
						/>
						<Button
							variant={showUpload ? 'outlined' : 'contained'}
							color="secondary"
							size="small"
							startIcon={
								<FuseSvgIcon size={16}>
									{showUpload ? 'lucide:x' : 'lucide:plus'}
								</FuseSvgIcon>
							}
							onClick={() => setShowUpload((v) => !v)}
						>
							{showUpload ? 'Cancel' : 'Upload'}
						</Button>
					</div>

					{/* Upload zone */}
					{showUpload && (
						<div className="px-4 pb-3">
							<UploadZone
								projectId={projectId}
								onUploaded={() => setShowUpload(false)}
							/>
							<Divider className="mt-3" />
						</div>
					)}

					{/* Audio list */}
					<div className="flex-1 overflow-y-auto px-4 pb-4">
						{isLoading ? (
							<div className="flex items-center justify-center py-12">
								<CircularProgress color="secondary" size={32} />
							</div>
						) : filtered.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 gap-3">
								<div className="flex items-center justify-center w-16 h-16 rounded-full"
									style={{ backgroundColor: 'var(--mui-palette-action-hover)' }}
								>
									<FuseSvgIcon size={32} color="disabled">lucide:music-off</FuseSvgIcon>
								</div>
								<Typography color="text.secondary" className="text-sm text-center">
									{searchQuery
										? 'No audio files match your search'
										: 'No audio files yet.\nUpload your first file above.'
									}
								</Typography>
								{!searchQuery && !showUpload && (
									<Button
										size="small"
										variant="outlined"
										color="secondary"
										startIcon={<FuseSvgIcon size={16}>lucide:upload-cloud</FuseSvgIcon>}
										onClick={() => setShowUpload(true)}
									>
										Upload audio
									</Button>
								)}
							</div>
						) : (
							<div className="flex flex-col gap-2 pt-1">
								{filtered.map((audio) => (
									<AudioRow
										key={audio.id}
										audio={audio}
										projectId={projectId}
										onDelete={setAudioToDelete}
									/>
								))}
							</div>
						)}
					</div>
				</div>
			</Drawer>

			<DeleteConfirmDialog
				audio={audioToDelete}
				onConfirm={handleConfirmDelete}
				onClose={() => setAudioToDelete(null)}
				isDeleting={isDeleting}
			/>
		</>
	);
}