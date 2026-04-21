'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Collapse from '@mui/material/Collapse';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { useGetProjectAudios } from '../api/hooks/audio/useGetProjectAudios';
import { useDeleteAudioFile, useUploadProjectAudio } from '../api/hooks/audio/useAudioMutations';
import { useGetAudioFormats } from '../api/hooks/audio/Usegetaudioformats';
import { useGetStudioBoards } from '../api/hooks/boards/useGetStudioBoards';
import { useCurrentAccountId } from '../api/useCurrentAccountId';
import { useStudioAuth } from '../api/hooks/useStudioauth';
import { studioApiService, formatIsoDuration, isoDurationToSeconds, secondsToIsoDuration } from '../api/services/studioApiService';
import { AudioFile, CreateAudioFile, AudioFormat } from '../api/types';

const AUDIO_TYPES = [
	{ value: 1, label: 'Music' },
	{ value: 2, label: 'Jingle' },
	{ value: 3, label: 'Voice Over' },
	{ value: 4, label: 'SFX' },
	{ value: 5, label: 'Interview' },
];

const ACCEPTED_AUDIO = 'audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.wma';
const MAX_NAME_LENGTH = 50;

type UploadPanelProps = {
	onUploaded: () => void;
	projects: ReturnType<typeof useGetStudioBoards>['data'];
	formats: ReturnType<typeof useGetAudioFormats>['data'];
	projectsLoading: boolean;
	formatsLoading: boolean;
};

function UploadPanel({ onUploaded, projects = [], formats = [], projectsLoading, formatsLoading }: UploadPanelProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const accountId = useCurrentAccountId();

	const [dragging, setDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [detectedDuration, setDetectedDuration] = useState(0);
	const [uploadError, setUploadError] = useState<string | null>(null);

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [projectId, setProjectId] = useState<number>(0);
	const [taskId, setTaskId] = useState<number>(0);
	const [formatId, setFormatId] = useState<number>(0);
	const [audioType, setAudioType] = useState<number>(1);

	const {
		data: tasks = [],
		isLoading: tasksLoading,
		isError: tasksError,
		refetch: refetchTasks,
	} = useQuery({
		queryKey: ['studio', 'tasks-for-upload', accountId, projectId],
		queryFn: async () => {
			const { items } = await studioApiService.getTasks(accountId);
			return items.filter((t) => Number(t.production_project?.id) === Number(projectId));
		},
		enabled: !!accountId && !!projectId,
		retry: 2,
		staleTime: 0,
	});

	const { mutateAsync: upload, isPending } = useUploadProjectAudio(projectId);

	useEffect(() => {
		if (formats.length > 0 && !formatId) setFormatId(formats[0]?.id ?? 0);
	}, [formats]);

	useEffect(() => { setTaskId(0); }, [projectId]);

	function loadFileMeta(file: File) {
		setSelectedFile(file);
		const rawName = file.name.replace(/\.[^/.]+$/, '');
		setName(rawName.slice(0, MAX_NAME_LENGTH));
		setDetectedDuration(0);
		setUploadError(null);
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

	function resetForm() {
		setSelectedFile(null);
		setName('');
		setDescription('');
		setProjectId(0);
		setTaskId(0);
		setDetectedDuration(0);
		setUploadError(null);
	}

	async function handleSubmit() {
	if (!selectedFile || !name.trim() || !taskId || !formatId) return;
	setUploadError(null);

	const duration = secondsToIsoDuration(detectedDuration || 0);
	const timestamp = selectedFile.lastModified
		? selectedFile.lastModified / 1000
		: Date.now() / 1000;

	const payload: CreateAudioFile = {
		name: name.trim().slice(0, MAX_NAME_LENGTH),
		description: description.trim(),
		duration,
		timestamp,
		format_id: formatId,
		type: audioType,
		production_task_id: taskId,
	};

	try {
		await upload({ payload, file: selectedFile });
		resetForm();
		onUploaded();
	} catch (err) {
		const msg = err instanceof Error ? err.message : '';

		// Backend uploads the file successfully but returns 404 when serializing
		// the response because it can't resolve a related object (e.g. "No Lesson
		// matches the given query"). The file IS created — treat this as success.
		if (msg.includes('404') && msg.includes('No Lesson matches')) {
			resetForm();
			onUploaded();
			return;
		}

		if (msg.includes('UniqueViolation') || msg.includes('duplicate key') || msg.includes('unique constraint')) {
			setUploadError('This task already has an audio file linked to it. Please select a different task, or delete the existing audio file for this task first.');
		} else if (msg.includes('string_too_long') || msg.includes('max_length')) {
			setUploadError('The name is too long. Please shorten it to 50 characters or less.');
		} else {
			setUploadError('Upload failed. Please try again.');
		}
	}
}

	const canSubmit = !!selectedFile && !!name.trim() && name.length <= MAX_NAME_LENGTH && !!projectId && !!taskId && !!formatId && !isPending;

	return (
		<div className="flex flex-col gap-4">
			<div
				className={clsx(
					'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-150',
				)}
				style={{
					borderColor: dragging
						? 'var(--mui-palette-secondary-main)'
						: selectedFile
						? 'var(--mui-palette-secondary-light)'
						: 'var(--mui-palette-divider)',
					backgroundColor: dragging
						? 'rgba(var(--mui-palette-secondary-mainChannel) / 0.08)'
						: selectedFile
						? 'rgba(var(--mui-palette-secondary-mainChannel) / 0.04)'
						: undefined,
				}}
				onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
				onDragLeave={() => setDragging(false)}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
			>
				<FuseSvgIcon
					size={36}
					style={{ color: selectedFile ? 'var(--mui-palette-secondary-main)' : undefined }}
					color={selectedFile ? undefined : 'disabled'}
				>
					{selectedFile ? 'lucide:file-audio' : 'lucide:upload-cloud'}
				</FuseSvgIcon>
				<Typography className="mt-2 text-sm font-medium" color={selectedFile ? 'secondary' : 'text.secondary'}>
					{selectedFile ? selectedFile.name : 'Drop audio file here or click to browse'}
				</Typography>
				{selectedFile && detectedDuration > 0 && (
					<Typography variant="caption" color="text.disabled">
						Detected duration: {formatIsoDuration(secondsToIsoDuration(detectedDuration))}
					</Typography>
				)}
				{!selectedFile && (
					<Typography variant="caption" color="text.disabled" className="mt-1">
						MP3, WAV, OGG, FLAC, AAC, M4A, OPUS and more
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

			<Collapse in={!!selectedFile}>
				<div className="flex flex-col gap-3">

					{uploadError && (
						<Alert severity="error" onClose={() => setUploadError(null)}>
							{uploadError}
						</Alert>
					)}

					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<TextField
							size="small"
							fullWidth
							label="Name *"
							value={name}
							onChange={(e) => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
							inputProps={{ maxLength: MAX_NAME_LENGTH }}
							helperText={`${name.length}/${MAX_NAME_LENGTH}`}
							error={name.length >= MAX_NAME_LENGTH}
						/>
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
					</div>

					<TextField
						size="small"
						fullWidth
						label="Description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						multiline
						rows={2}
					/>

					<Divider>
						<Typography variant="caption" color="text.disabled">Link to project</Typography>
					</Divider>

					<TextField
						select
						size="small"
						fullWidth
						label="Project *"
						value={projectId || ''}
						onChange={(e) => setProjectId(Number(e.target.value))}
						disabled={projectsLoading}
						helperText="Select the production project this audio belongs to"
					>
						{projects.map((p) => (
							<MenuItem key={p.id} value={p.id ?? 0}>
								<span className="flex items-center gap-2">
									<span>{p.name}</span>
									{p.status?.name && (
										<Chip label={p.status.name} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
									)}
								</span>
							</MenuItem>
						))}
					</TextField>

					<TextField
						select
						size="small"
						fullWidth
						label="Task *"
						value={taskId || ''}
						onChange={(e) => { setTaskId(Number(e.target.value)); setUploadError(null); }}
						disabled={!projectId || tasksLoading || tasksError}
						helperText={
							!projectId
								? 'Select a project first'
								: tasksLoading
								? 'Loading tasks…'
								: tasksError
								? 'Failed to load tasks — check console'
								: tasks.length === 0
								? 'No tasks in this project yet'
								: 'Each task can only have one audio file'
						}
						error={tasksError}
					>
						{tasks.map((t) => (
							<MenuItem key={t.id} value={t.id ?? 0}>
								{t.name}
							</MenuItem>
						))}
					</TextField>

					{projectId > 0 && !tasksLoading && !tasksError && tasks.length === 0 && (
						<Alert
							severity="info"
							className="text-xs"
							action={
								<Button
									size="small"
									color="inherit"
									href={`/studio/boards/${projectId}`}
									component="a"
								>
									Open board
								</Button>
							}
						>
							This project has no tasks. Add a task on its board, then come back to upload.
						</Alert>
					)}

					{tasksError && (
						<Alert
							severity="error"
							className="text-xs"
							action={
								<Button size="small" color="inherit" onClick={() => refetchTasks()}>
									Retry
								</Button>
							}
						>
							Could not load tasks for this project.
						</Alert>
					)}

					<TextField
						select
						size="small"
						fullWidth
						label="Audio Format *"
						value={formatId || ''}
						onChange={(e) => setFormatId(Number(e.target.value))}
						disabled={formatsLoading || formats.length === 0}
					>
						{formats.map((f) => (
							<MenuItem key={f.id} value={f.id ?? 0}>
								{f.name} ({f.extension.toUpperCase()}, {f.bit_rates} kbps)
							</MenuItem>
						))}
					</TextField>

					{formats.length === 0 && !formatsLoading && (
						<Alert severity="warning" className="text-xs">
							No audio formats configured. Go to Studio › Formats to add one.
						</Alert>
					)}

					{isPending && <LinearProgress color="secondary" />}

					<div className="flex gap-2">
						<Button
							variant="contained"
							color="secondary"
							disabled={!canSubmit}
							onClick={handleSubmit}
							startIcon={
								isPending
									? <CircularProgress size={14} color="inherit" />
									: <FuseSvgIcon size={16}>lucide:upload</FuseSvgIcon>
							}
						>
							{isPending ? 'Uploading…' : 'Upload'}
						</Button>
						<Button onClick={resetForm}>Clear</Button>
					</div>
				</div>
			</Collapse>
		</div>
	);
}

function AudioListRow({ audio, onDelete }: { audio: AudioFile; onDelete: (a: AudioFile) => void }) {
	return (
		<div
			className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:shadow-sm transition-shadow"
			style={{ borderColor: 'var(--mui-palette-divider)' }}
		>
			<div
				className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg"
				style={{ backgroundColor: 'rgba(var(--mui-palette-secondary-mainChannel) / 0.12)' }}
			>
				<FuseSvgIcon size={18} style={{ color: 'var(--mui-palette-secondary-main)' }}>
					lucide:music
				</FuseSvgIcon>
			</div>

			<div className="flex-1 min-w-0">
				<Typography className="text-sm font-semibold truncate">{audio.name}</Typography>
				{audio.description && (
					<Typography className="text-xs truncate" color="text.secondary">
						{audio.description}
					</Typography>
				)}
				<div className="flex items-center gap-2 mt-0.5 flex-wrap">
					{audio.format?.extension && (
						<Chip label={audio.format.extension.toUpperCase()} size="small" sx={{ height: 16, fontSize: '0.6rem' }} />
					)}
					{audio.type_label && (
						<Chip label={audio.type_label} size="small" variant="outlined" sx={{ height: 16, fontSize: '0.6rem' }} />
					)}
					<Typography variant="caption" color="text.disabled">
						{formatIsoDuration(audio.duration)}
					</Typography>
				</div>
			</div>

			<div className="flex items-center gap-1 shrink-0">
				{audio.src && (
					<>
						<audio id={`audio-${audio.id}`} src={audio.src} preload="none" />
						<Button
							size="small"
							variant="outlined"
							color="secondary"
							startIcon={<FuseSvgIcon size={14}>lucide:play</FuseSvgIcon>}
							onClick={() => {
								const el = document.getElementById(`audio-${audio.id}`) as HTMLAudioElement | null;
								if (!el) return;
								if (el.paused) el.play();
								else el.pause();
							}}
							sx={{ minWidth: 0, px: 1.5 }}
						>
							Play
						</Button>
						<Button
							size="small"
							component="a"
							href={audio.src}
							download={audio.name}
							target="_blank"
							sx={{ minWidth: 0, px: 1 }}
						>
							<FuseSvgIcon size={16}>lucide:download</FuseSvgIcon>
						</Button>
					</>
				)}
				<Button size="small" color="error" onClick={() => onDelete(audio)} sx={{ minWidth: 0, px: 1 }}>
					<FuseSvgIcon size={16}>lucide:trash-2</FuseSvgIcon>
				</Button>
			</div>
		</div>
	);
}

export default function AudioPage() {
	useStudioAuth();

	const [search, setSearch] = useState('');
	const [showUpload, setShowUpload] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<AudioFile | null>(null);

	const { data: audios = [], isLoading } = useGetProjectAudios();
	const { mutateAsync: deleteAudio, isPending: isDeleting } = useDeleteAudioFile();

	const { data: projects = [], isLoading: projectsLoading } = useGetStudioBoards();
	const { data: formats = [], isLoading: formatsLoading } = useGetAudioFormats();

	const filtered = audios.filter(
		(a) =>
			a.name.toLowerCase().includes(search.toLowerCase()) ||
			(a.description ?? '').toLowerCase().includes(search.toLowerCase())
	);

	const totalSec = audios.reduce((s, a) => s + isoDurationToSeconds(a.duration), 0);

	async function handleConfirmDelete() {
		if (!deleteTarget?.id) return;
		await deleteAudio(deleteTarget.id);
		setDeleteTarget(null);
	}

	return (
		<div className="flex flex-col h-full">
			<div className="px-6 pt-6 pb-4 shrink-0">
				<PageBreadcrumb className="mb-3" />
				<div className="flex items-center justify-between flex-wrap gap-3">
					<div>
						<Typography className="text-3xl font-extrabold tracking-tight leading-none">
							Audio Library
						</Typography>
						<Typography className="text-sm mt-1" color="text.secondary">
							{audios.length} file{audios.length !== 1 ? 's' : ''} · Total duration:{' '}
							{formatIsoDuration(secondsToIsoDuration(totalSec))}
						</Typography>
					</div>
					<Button
						variant={showUpload ? 'outlined' : 'contained'}
						color="secondary"
						startIcon={
							<FuseSvgIcon size={18}>
								{showUpload ? 'lucide:x' : 'lucide:upload-cloud'}
							</FuseSvgIcon>
						}
						onClick={() => setShowUpload((v) => !v)}
					>
						{showUpload ? 'Cancel' : 'Upload Audio'}
					</Button>
				</div>
			</div>

			<Divider />

			<Collapse in={showUpload} unmountOnExit>
				<div className="px-6 py-5 border-b" style={{ borderColor: 'var(--mui-palette-divider)', backgroundColor: 'rgba(var(--mui-palette-secondary-mainChannel) / 0.03)' }}>
					<Typography className="text-base font-bold mb-4">Upload New Audio File</Typography>
					<UploadPanel
						onUploaded={() => setShowUpload(false)}
						projects={projects}
						formats={formats}
						projectsLoading={projectsLoading}
						formatsLoading={formatsLoading}
					/>
				</div>
			</Collapse>

			<div className="px-6 py-4 shrink-0">
				<TextField
					size="small"
					placeholder="Search audio files…"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					sx={{ width: 320 }}
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
			</div>

			<div className="flex-1 overflow-y-auto px-6 pb-8">
				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<CircularProgress color="secondary" />
					</div>
				) : filtered.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 gap-3">
						<FuseSvgIcon size={48} color="disabled">lucide:music-off</FuseSvgIcon>
						<Typography color="text.secondary">
							{search ? 'No files match your search.' : 'No audio files in the library yet.'}
						</Typography>
						{!search && (
							<Button
								size="small"
								variant="outlined"
								color="secondary"
								startIcon={<FuseSvgIcon size={16}>lucide:upload-cloud</FuseSvgIcon>}
								onClick={() => setShowUpload(true)}
							>
								Upload your first file
							</Button>
						)}
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{filtered.map((audio) => (
							<AudioListRow key={audio.id} audio={audio} onDelete={setDeleteTarget} />
						))}
					</div>
				)}
			</div>

			<Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
				<DialogTitle>Delete audio file?</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
					<Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={isDeleting}>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}