'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
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
import Alert from '@mui/material/Alert';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { useGetProjectAudios } from '../../../../api/hooks/audio/useGetProjectAudios';
import {
	useUploadProjectAudio,
	useUpdateAudioFile,
	useDeleteAudioFile
} from '../../../../api/hooks/audio/useAudioMutations';
import { useGetAudioFormats } from '../../../../api/hooks/audio/Usegetaudioformats';
import { AudioFile, AudioFormat, CreateAudioFile, UpdateAudioFile } from '../../../../api/types';
import {
	isoDurationToSeconds,
	secondsToIsoDuration,
	formatIsoDuration
} from '../../../../api/services/studioApiService';
import { useCurrentAccountId } from '../../../../api/useCurrentAccountId';
import { studioApiService } from '../../../../api/services/studioApiService';

// ─── Audio type options (backend integer enum — 1 = default) ────────────────
const AUDIO_TYPES = [
	{ value: 1, label: 'Music' },
	{ value: 2, label: 'Jingle' },
	{ value: 3, label: 'Voice Over' },
	{ value: 4, label: 'SFX' },
	{ value: 5, label: 'Interview' },
];

const ACCEPTED_AUDIO = 'audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.wma';

// ─── Mini Audio Player ────────────────────────────────────────────────────────

function AudioPlayer({ src, title }: { src: string; title: string }) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [playing, setPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	function togglePlay() {
		if (!audioRef.current) return;
		if (playing) audioRef.current.pause();
		else audioRef.current.play();
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
		audioRef.current.currentTime = (value / 100) * (audioRef.current.duration || 0);
		setProgress(value);
	}

	useEffect(() => () => { audioRef.current?.pause(); }, []);

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
				<IconButton size="small" onClick={togglePlay} sx={{ color: 'secondary.main' }}>
					<FuseSvgIcon size={20}>{playing ? 'lucide:pause' : 'lucide:play'}</FuseSvgIcon>
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
					{formatIsoDuration(secondsToIsoDuration(currentTime))} /{' '}
					{formatIsoDuration(secondsToIsoDuration(duration))}
				</Typography>
			</div>
		</div>
	);
}

// ─── Single Audio Row ─────────────────────────────────────────────────────────

function AudioRow({
    audio,
    onDelete
}: {
    audio: AudioFile;
    onDelete: (audio: AudioFile) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const [editing, setEditing] = useState(false);
	const [editName, setEditName] = useState(audio.name);
	const [editDesc, setEditDesc] = useState(audio.description ?? '');
	const { mutateAsync: update, isPending: isSaving } = useUpdateAudioFile();

	async function handleSave() {
		if (!audio.id) return;
		const updatePayload: UpdateAudioFile = {
			id: audio.id,
			name: editName.trim() || audio.name,
			description: editDesc.trim(),
			duration: audio.duration,
			timestamp: Date.now() / 1000,
			format_id: audio.format?.id ?? 0,
			type: audio.type ?? 1
		};
		await update(updatePayload);
		setEditing(false);
	}

    // Determine playback URL via proxy when possible
    const accountId = useCurrentAccountId();
    const proxiedSrc = audio.id && accountId > 0
        ? `/api/studio/audio/play/${accountId}/${audio.id}`
        : audio.src;

	return (
		<div
			className="rounded-xl border transition-all duration-150"
			style={{ borderColor: 'var(--mui-palette-divider)' }}
		>
			{/* Header row */}
			<div className="flex items-center gap-2 px-3 py-2">
				<div
					className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg"
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
							value={editName}
							onChange={(e) => setEditName(e.target.value)}
							autoFocus
							fullWidth
							label="Name"
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
						<Typography className="text-sm font-semibold truncate">{audio.name}</Typography>
						<div className="flex items-center gap-2 flex-wrap">
							{audio.format?.extension && (
								<Chip
									label={audio.format.extension.toUpperCase()}
									size="small"
									sx={{ height: 18, fontSize: '0.65rem' }}
								/>
							)}
							{audio.type_label && (
								<Chip
									label={audio.type_label}
									size="small"
									variant="outlined"
									sx={{ height: 18, fontSize: '0.65rem' }}
								/>
							)}
							<Typography variant="caption" color="text.secondary">
								{formatIsoDuration(audio.duration)}
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
                {(proxiedSrc || audio.src) && (
							<Tooltip title="Download">
								<IconButton
									size="small"
									component="a"
                                href={audio.src}
									download={audio.name}
									target="_blank"
								>
									<FuseSvgIcon size={16}>lucide:download</FuseSvgIcon>
								</IconButton>
							</Tooltip>
						)}
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
                    {proxiedSrc ? (
                        <AudioPlayer src={proxiedSrc} title={audio.name} />
                    ) : (
						<Typography variant="caption" color="error">No playback URL available</Typography>
					)}
					{audio.format && (
						<Typography variant="caption" color="text.disabled" className="mt-2 block">
							{audio.format.name} · {audio.format.bit_rates} kbps · {audio.format.frequency} kHz
						</Typography>
					)}
				</div>
			)}
		</div>
	);
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

type UploadZoneProps = {
	projectId: string | number;
	/** Tasks belonging to this project so the user can pick production_task_id */
	tasks: Array<{ id: number; name: string }>;
	formats: AudioFormat[];
	onUploaded: () => void;
};

function UploadZone({ projectId, tasks, formats, onUploaded }: UploadZoneProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const detectAudioRef = useRef<HTMLAudioElement>(null);

	const [dragging, setDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [detectedDuration, setDetectedDuration] = useState<number>(0); // seconds

	// Form fields
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [taskId, setTaskId] = useState<number>(0);
	const [formatId, setFormatId] = useState<number>(formats[0]?.id ?? 0);
	const [audioType, setAudioType] = useState<number>(1);

	const { mutateAsync: upload, isPending } = useUploadProjectAudio(projectId);

	// Pre-fill formatId when formats load
	useEffect(() => {
		if (formats.length > 0 && !formatId) setFormatId(formats[0]?.id ?? 0);
	}, [formats]);

	function loadFileMeta(file: File) {
		setSelectedFile(file);
		setName(file.name.replace(/\.[^/.]+$/, ''));
		setDetectedDuration(0);

		// Detect duration via a hidden <audio> element
		const url = URL.createObjectURL(file);
		const audio = new Audio(url);
		audio.addEventListener('loadedmetadata', () => {
			setDetectedDuration(audio.duration || 0);
			URL.revokeObjectURL(url);
		});
		audio.addEventListener('error', () => URL.revokeObjectURL(url));
	}

	function handleFileChange(files: FileList | null) {
		if (!files || files.length === 0) return;
		loadFileMeta(files[0]);
	}

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
		handleFileChange(e.dataTransfer.files);
	}, []);

	async function handleSubmit() {
		if (!selectedFile || !name.trim()) return;
		if (!taskId) return;
		if (!formatId) return;

		const duration = secondsToIsoDuration(detectedDuration || 0);
		const timestamp = selectedFile.lastModified
			? selectedFile.lastModified / 1000
			: Date.now() / 1000;

		const payload: CreateAudioFile = {
			name: name.trim(),
			description: description.trim(),
			duration,
			timestamp,
			format_id: formatId,
			type: audioType,
			production_task_id: taskId
		};

		await upload({ payload, file: selectedFile });

		// Reset
		setSelectedFile(null);
		setName('');
		setDescription('');
		setTaskId(0);
		setDetectedDuration(0);
		onUploaded();
	}

	function reset() {
		setSelectedFile(null);
		setName('');
		setDescription('');
		setTaskId(0);
		setDetectedDuration(0);
	}

	const noTasks = tasks.length === 0;
	const noFormats = formats.length === 0;

	return (
		<div className="flex flex-col gap-3">
			{noFormats && (
				<Alert severity="warning" className="text-xs">
					No audio formats configured. Please add a format in Studio › Formats before uploading.
				</Alert>
			)}
			{noTasks && (
				<Alert severity="info" className="text-xs">
					This project has no tasks yet. Create a task first — audio files must be linked to a task.
				</Alert>
			)}

			{/* Drop zone */}
			<div
				className={clsx(
					'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-colors duration-150',
				)}
				style={{
					borderColor: dragging
						? 'var(--mui-palette-secondary-main)'
						: 'var(--mui-palette-divider)',
					backgroundColor: dragging
						? 'rgba(var(--mui-palette-secondary-mainChannel) / 0.08)'
						: undefined
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
				{selectedFile && detectedDuration > 0 && (
					<Typography variant="caption" color="text.disabled">
						Duration detected: {formatIsoDuration(secondsToIsoDuration(detectedDuration))}
					</Typography>
				)}
				<input
					ref={fileInputRef}
					type="file"
					accept={ACCEPTED_AUDIO}
					className="hidden"
					onChange={(e) => handleFileChange(e.target.files)}
				/>
			</div>

			{selectedFile && (
				<>
					<TextField
						size="small"
						fullWidth
						label="Name *"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>

					<TextField
						size="small"
						fullWidth
						label="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						multiline
						rows={2}
					/>

					{/* Task selector (required — links audio to a production task) */}
					<TextField
						select
						size="small"
						fullWidth
						label="Linked Task *"
						value={taskId || ''}
						onChange={(e) => setTaskId(Number(e.target.value))}
						disabled={noTasks}
						helperText="Audio must be linked to a production task"
					>
						{tasks.map((t) => (
							<MenuItem key={t.id} value={t.id}>
								{t.name}
							</MenuItem>
						))}
					</TextField>

					{/* Format selector */}
					<TextField
						select
						size="small"
						fullWidth
						label="Audio Format *"
						value={formatId || ''}
						onChange={(e) => setFormatId(Number(e.target.value))}
						disabled={noFormats}
					>
						{formats.map((f) => (
							<MenuItem key={f.id} value={f.id ?? 0}>
								{f.name} ({f.extension.toUpperCase()}, {f.bit_rates} kbps)
							</MenuItem>
						))}
					</TextField>

					{/* Audio type */}
					<TextField
						select
						size="small"
						fullWidth
						label="Type"
						value={audioType}
						onChange={(e) => setAudioType(Number(e.target.value))}
					>
						{AUDIO_TYPES.map((t) => (
							<MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
						))}
					</TextField>

					{isPending && <LinearProgress color="secondary" />}

					<div className="flex gap-2">
						<Button
							variant="contained"
							color="secondary"
							disabled={!name.trim() || !taskId || !formatId || isPending}
							onClick={handleSubmit}
							startIcon={
								isPending
									? <CircularProgress size={14} color="inherit" />
									: <FuseSvgIcon size={16}>lucide:upload</FuseSvgIcon>
							}
						>
							{isPending ? 'Uploading…' : 'Upload'}
						</Button>
						<Button onClick={reset}>Cancel</Button>
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
					Are you sure you want to delete <strong>{audio?.name}</strong>? This cannot be undone.
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
	/** Tasks for this project, needed to satisfy production_task_id on upload */
	tasks?: Array<{ id: number; name: string }>;
};

export function AudioPanel({ open, onClose, projectId, projectName, tasks = [] }: AudioPanelProps) {
	const [showUpload, setShowUpload] = useState(false);
	const [audioToDelete, setAudioToDelete] = useState<AudioFile | null>(null);
	const [searchQuery, setSearchQuery] = useState('');

	const { data: audios = [], isLoading } = useGetProjectAudios(projectId);
	const { data: formats = [] } = useGetAudioFormats();
	const { mutateAsync: deleteAudio, isPending: isDeleting } = useDeleteAudioFile(projectId);

	const filtered = audios.filter((a) =>
		a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(a.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
	);

	async function handleConfirmDelete() {
		if (!audioToDelete?.id) return;
		await deleteAudio(audioToDelete.id);
		setAudioToDelete(null);
	}

	// Total duration in seconds
	const totalDurationSec = audios.reduce(
		(acc, a) => acc + isoDurationToSeconds(a.duration),
		0
	);

	return (
		<>
			<Drawer
				anchor="right"
				open={open}
				onClose={onClose}
				PaperProps={{ sx: { width: { xs: '100vw', sm: 460 } } }}
			>
				{/* Header */}
				<div
					className="flex items-center justify-between px-4 py-3 border-b"
					style={{ borderColor: 'var(--mui-palette-divider)' }}
				>
					<div className="flex items-center gap-2">
						<div
							className="flex items-center justify-center w-8 h-8 rounded-lg"
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
					<div
						className="flex items-center gap-4 px-4 py-2 border-b"
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
								{formatIsoDuration(secondsToIsoDuration(totalDurationSec))}
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
						<div className="px-4 pb-3 overflow-y-auto max-h-[60vh]">
							<UploadZone
								projectId={projectId}
								tasks={tasks}
								formats={formats}
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
								<div
									className="flex items-center justify-center w-16 h-16 rounded-full"
									style={{ backgroundColor: 'var(--mui-palette-action-hover)' }}
								>
									<FuseSvgIcon size={32} color="disabled">lucide:music-off</FuseSvgIcon>
								</div>
								<Typography color="text.secondary" className="text-sm text-center">
									{searchQuery
										? 'No audio files match your search'
										: 'No audio files yet.\nUpload your first file above.'}
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
