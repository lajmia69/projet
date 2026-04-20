'use client';

import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useGetProjectAudios } from '../api/hooks/audio/useGetProjectAudios';
import { useDeleteAudioFile } from '../api/hooks/audio/useAudioMutations';
import { useGetAudioFormats } from '../api/hooks/audio/Usegetaudioformats';
import { useStudioAuth } from '../api/hooks/useStudioauth';
import { AudioFile } from '../api/types';
import { formatIsoDuration, isoDurationToSeconds, secondsToIsoDuration } from '../api/services/studioApiService';

// ─── Simple audio row for the list page ──────────────────────────────────────

function AudioListRow({ audio, onDelete }: { audio: AudioFile; onDelete: (a: AudioFile) => void }) {
	const [playing, setPlaying] = useState(false);
	const audioRef = useState<HTMLAudioElement | null>(null);

	return (
		<div
			className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:shadow-sm transition-shadow"
			style={{ borderColor: 'var(--mui-palette-divider)' }}
		>
			{/* Icon */}
			<div
				className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg"
				style={{ backgroundColor: 'rgba(var(--mui-palette-secondary-mainChannel) / 0.12)' }}
			>
				<FuseSvgIcon size={18} style={{ color: 'var(--mui-palette-secondary-main)' }}>
					lucide:music
				</FuseSvgIcon>
			</div>

			{/* Info */}
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

			{/* Actions */}
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
				<Button
					size="small"
					color="error"
					onClick={() => onDelete(audio)}
					sx={{ minWidth: 0, px: 1 }}
				>
					<FuseSvgIcon size={16}>lucide:trash-2</FuseSvgIcon>
				</Button>
			</div>
		</div>
	);
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AudioPage() {
	useStudioAuth();

	const [search, setSearch] = useState('');
	const { data: audios = [], isLoading } = useGetProjectAudios();
	const { data: formats = [] } = useGetAudioFormats();
	const { mutateAsync: deleteAudio } = useDeleteAudioFile();

	const filtered = audios.filter(
		(a) =>
			a.name.toLowerCase().includes(search.toLowerCase()) ||
			(a.description ?? '').toLowerCase().includes(search.toLowerCase())
	);

	const totalSec = audios.reduce((s, a) => s + isoDurationToSeconds(a.duration), 0);

	async function handleDelete(audio: AudioFile) {
		if (!audio.id) return;
		if (!window.confirm(`Delete "${audio.name}"?`)) return;
		await deleteAudio(audio.id);
	}

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
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
				</div>
			</div>

			<Divider />

			{/* Formats quick-info */}
			{formats.length > 0 && (
				<div className="px-6 py-3 flex gap-2 flex-wrap border-b" style={{ borderColor: 'var(--mui-palette-divider)' }}>
					<Typography variant="caption" color="text.secondary" className="self-center">
						Available formats:
					</Typography>
					{formats.map((f) => (
						<Chip key={f.id} label={`${f.name} (${f.extension.toUpperCase()})`} size="small" />
					))}
				</div>
			)}

			{/* Search */}
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

			{/* List */}
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
						<Typography variant="caption" color="text.disabled">
							Upload audio files from a project board via the Audio button.
						</Typography>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{filtered.map((audio) => (
							<AudioListRow key={audio.id} audio={audio} onDelete={handleDelete} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}