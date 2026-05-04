'use client';

import { useState, useEffect, useRef, JSX } from 'react';
import { styled, Typography, Slider, Paper, Stack, Box, Divider } from '@mui/material';

// #region ------------ ICONS ---------
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import PauseIcon from '@mui/icons-material/Pause';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { LessonTranscription } from '@/app/(control-panel)/(platform)/(lesson)/api/types';
import clsx from 'clsx';
// #endregion ------------ ICONS ---------

// #region -------- Styled Components -----------------------------------------

/** Transport bar — white card matching LessonView's paper surfaces */
const TransportPaper = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.vars.palette.background.paper,
	border: `1px solid ${theme.vars.palette.divider}`,
	borderRadius: 12,
	padding: theme.spacing(2, 2.5),
	boxShadow: theme.shadows[1],
}));

/** Progress slider — lime accent, no pointer on track */
const PSlider = styled(Slider)(() => ({
	color: '#84cc16',           // Tailwind lime-400
	height: 3,
	'&:hover': { cursor: 'auto' },
	'& .MuiSlider-thumb': {
		width: 12,
		height: 12,
		'&:hover, &.Mui-focusVisible': {
			boxShadow: '0 0 0 6px rgba(132,204,22,0.18)',
		},
	},
	'& .MuiSlider-rail': { opacity: 0.22 },
}));

/** Volume slider — thinner, subdued */
const VSlider = styled(Slider)(() => ({
	color: '#84cc16',
	height: 2,
	width: 72,
	'&:hover': { cursor: 'pointer' },
	'& .MuiSlider-thumb': { width: 10, height: 10 },
	'& .MuiSlider-rail': { opacity: 0.22 },
}));

/** Lime-400 index badge — mirrors the lesson list badges */
const IndexBadge = styled('div')({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	minWidth: 28,
	height: 28,
	borderRadius: 6,
	backgroundColor: '#84cc16',
	color: '#fff',
	fontWeight: 700,
	fontSize: '0.78rem',
	padding: '0 6px',
	lineHeight: 1,
	flexShrink: 0,
});

/** Sky-100 speaker pill */
const SpeakerBadge = styled('div')(({ theme }) => ({
	display: 'inline-flex',
	alignItems: 'center',
	padding: '2px 8px',
	borderRadius: 6,
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(186,230,253,0.12)' : '#e0f2fe',
	color: theme.palette.mode === 'dark' ? '#7dd3fc' : '#0369a1',
	fontSize: '0.72rem',
	fontWeight: 600,
	whiteSpace: 'nowrap',
	flexShrink: 0,
}));

/** Icon button wrapper */
const IconBtn = styled('button')(({ theme }) => ({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: 4,
	borderRadius: 8,
	border: 'none',
	background: 'transparent',
	cursor: 'pointer',
	color: theme.palette.text.secondary,
	transition: 'color 0.15s, background 0.15s',
	'&:hover': {
		color: '#84cc16',
		backgroundColor:
			theme.palette.mode === 'dark'
				? 'rgba(132,204,22,0.12)'
				: 'rgba(132,204,22,0.08)',
	},
}));

/** The large play/pause icon button */
const PlayBtn = styled('button')(({ theme }) => ({
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 44,
	height: 44,
	borderRadius: '50%',
	border: 'none',
	cursor: 'pointer',
	backgroundColor: '#84cc16',
	color: '#fff',
	transition: 'background 0.15s, transform 0.1s',
	'&:hover': { backgroundColor: '#65a30d', transform: 'scale(1.06)' },
	'&:active': { transform: 'scale(0.96)' },
}));

// #endregion ---------------------------------------------------------------

export interface Step {
	index: number;
	languageOrientation: string;
	speaker: string;
	time: string;
	timestamp: number;
	text: string;
}
export interface Playlist {
	src: string;
	timestamp: number;
}
export interface PlayerProps {
	playlist: Playlist[];
	steps: Step[];
	transcription: LessonTranscription;
}

export default function Player(props: PlayerProps): JSX.Element {
	const { playlist, steps, transcription } = props;
	const audioPlayer = useRef<HTMLAudioElement>(null);

	const [playlistIndex, setPlaylistIndex] = useState(0);
	const [currentSong] = useState(playlist[0]?.src ?? '');
	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolume] = useState(30);
	const [mute, setMute] = useState(false);
	const [elapsed, setElapsed] = useState<number>(0);
	const [duration, setDuration] = useState<number>(0);

	const theme = useTheme();

	const [activeStep, setActiveStep] = React.useState(0);
	const maxSteps = steps.length;
	const currentStep = steps[activeStep] ?? null;

	// ── Wire up audio events ──────────────────────────────────────────────────
	useEffect(() => {
		const audio = audioPlayer.current;
		if (!audio) return;
		audio.volume = volume / 100;
	}, [volume]);

	useEffect(() => {
		const audio = audioPlayer.current;
		if (!audio) return;

		const onLoaded = () => {
			if (!isNaN(audio.duration)) setDuration(Math.floor(audio.duration));
		};

		const onTimeUpdate = () => {
			const _elapsed = Math.floor(audio.currentTime);
			setElapsed(_elapsed);
			if (!isNaN(audio.duration)) setDuration(Math.floor(audio.duration));
			if (maxSteps > 0) {
				const stepPos = steps.findIndex((s) => s.timestamp === _elapsed);
				if (stepPos !== -1) setActiveStep(stepPos);
			}
		};

		const onEnded = () => setIsPlaying(false);

		audio.addEventListener('loadedmetadata', onLoaded);
		audio.addEventListener('timeupdate', onTimeUpdate);
		audio.addEventListener('ended', onEnded);
		if (!isNaN(audio.duration)) setDuration(Math.floor(audio.duration));

		return () => {
			audio.removeEventListener('loadedmetadata', onLoaded);
			audio.removeEventListener('timeupdate', onTimeUpdate);
			audio.removeEventListener('ended', onEnded);
		};
	}, [steps, maxSteps]);

	// ── Helpers ───────────────────────────────────────────────────────────────
	function formatTime(time: number) {
		if (time && !isNaN(time)) {
			const minutes = Math.floor(time / 60);
			const seconds = Math.floor(time % 60);
			return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		}
		return '00:00';
	}

	function playTime(time: number) {
		const audio = audioPlayer.current;
		if (audio && time && !isNaN(time)) audio.currentTime = time;
	}

	function playStep(arrayPos: number) {
		const step = steps[arrayPos];
		const audio = audioPlayer.current;
		if (!step || !audio) return;
		setIsPlaying(false);
		audio.pause();
		audio.currentTime = step.timestamp;
		setActiveStep(arrayPos);
		audio.play();
		setIsPlaying(true);
	}

	// ── Navigation ────────────────────────────────────────────────────────────
	const handleNext = () => {
		const audio = audioPlayer.current;
		if (!audio || activeStep >= maxSteps - 1) return;
		const nextPos = activeStep + 1;
		const nextStep = steps[nextPos];
		if (!nextStep) return;
		setActiveStep(nextPos);
		audio.currentTime = nextStep.timestamp;
		setElapsed(nextStep.timestamp);
		setDuration(Math.floor(audio.duration));
	};

	const handleBack = () => {
		const audio = audioPlayer.current;
		if (!audio || activeStep <= 0) return;
		const prevPos = activeStep - 1;
		const prevStep = steps[prevPos];
		if (!prevStep) return;
		setActiveStep(prevPos);
		audio.currentTime = prevStep.timestamp;
		setElapsed(prevStep.timestamp);
		setDuration(Math.floor(audio.duration));
	};

	const togglePlay = () => {
		const audio = audioPlayer.current;
		if (!audio) return;
		if (!isPlaying) { audio.play(); } else { audio.pause(); }
		setIsPlaying((prev) => !prev);
	};

	const toggleForward = () => { if (audioPlayer.current) audioPlayer.current.currentTime += 10; };
	const toggleBackward = () => { if (audioPlayer.current) audioPlayer.current.currentTime -= 10; };

	const toggleSkipForward = () => {
		const audio = audioPlayer.current;
		if (!audio) return;
		const nextIdx = playlistIndex >= playlist.length - 1 ? 0 : playlistIndex + 1;
		setPlaylistIndex(nextIdx);
		audio.src = playlist[nextIdx].src;
		audio.play();
		setIsPlaying(true);
	};

	const toggleSkipBackward = () => {
		const audio = audioPlayer.current;
		if (!audio) return;
		const prevIdx = playlistIndex > 0 ? playlistIndex - 1 : playlist.length - 1;
		setPlaylistIndex(prevIdx);
		audio.src = playlist[prevIdx].src;
		audio.play();
		setIsPlaying(true);
	};

	function VolumeBtns() {
		const onClick = () => setMute((m) => !m);
		const sx = { fontSize: 18, display: 'block' };
		if (mute) return <IconBtn onClick={onClick}><VolumeOffIcon sx={sx} /></IconBtn>;
		if (volume <= 20) return <IconBtn onClick={onClick}><VolumeMuteIcon sx={sx} /></IconBtn>;
		if (volume <= 75) return <IconBtn onClick={onClick}><VolumeDownIcon sx={sx} /></IconBtn>;
		return <IconBtn onClick={onClick}><VolumeUpIcon sx={sx} /></IconBtn>;
	}

	const hasSteps = maxSteps > 0 && currentStep !== null;
	const hasContent = Array.isArray(transcription?.content) && transcription.content.length > 0;

	// ── Section label shared style ─────────────────────────────────────────
	const sectionLabel = (
		<Typography
			variant="overline"
			sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'text.disabled', mb: 1.5, display: 'block' }}
		/>
	);

	return (
		<div className="flex flex-col space-y-4">
			<audio src={currentSong} ref={audioPlayer} muted={mute} />

			{/* ── Transport controls ── */}
			<TransportPaper elevation={0}>
				{/* Volume row */}
				<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
					<VolumeBtns />
					<VSlider
						min={0}
						max={100}
						value={volume}
						onChange={(_, v) => setVolume(Number(v))}
					/>
					<Typography variant="caption" sx={{ color: 'text.disabled', minWidth: 28 }}>
						{volume}%
					</Typography>
				</Stack>

				<Divider sx={{ mb: 1.5 }} />

				{/* Playback buttons */}
				<Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1.5 }}>
					<IconBtn onClick={toggleSkipBackward} title="Previous track">
						<SkipPreviousIcon sx={{ fontSize: 20 }} />
					</IconBtn>
					<IconBtn onClick={toggleBackward} title="Rewind 10s">
						<FastRewindIcon sx={{ fontSize: 20 }} />
					</IconBtn>

					<PlayBtn onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
						{!isPlaying
							? <PlayArrowIcon sx={{ fontSize: 26 }} />
							: <PauseIcon sx={{ fontSize: 26 }} />
						}
					</PlayBtn>

					<IconBtn onClick={toggleForward} title="Forward 10s">
						<FastForwardIcon sx={{ fontSize: 20 }} />
					</IconBtn>
					<IconBtn onClick={toggleSkipForward} title="Next track">
						<SkipNextIcon sx={{ fontSize: 20 }} />
					</IconBtn>
				</Stack>

				{/* Progress bar */}
				<Stack spacing={1} direction="row" alignItems="center">
					<Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 38, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
						{formatTime(elapsed)}
					</Typography>
					<PSlider
						value={isNaN(elapsed) ? 0 : elapsed}
						max={isNaN(duration) ? Math.floor(audioPlayer?.current?.duration ?? 0) : duration}
						onChange={(_, value) => playTime(Number(value))}
					/>
					<Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 38, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
						−{formatTime(duration - elapsed)}
					</Typography>
				</Stack>
			</TransportPaper>

			{/* ── Active step display ── */}
			<Box
				sx={(theme) => ({
					width: '100%',
					borderRadius: 3,
					border: `1px solid ${theme.vars.palette.divider}`,
					borderLeft: '4px solid #84cc16',
					backgroundColor: theme.vars.palette.background.paper,
					boxShadow: theme.shadows[1],
					overflow: 'hidden',
				})}
			>
				{/* Header label */}
				<Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
					<Typography
						variant="overline"
						sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'text.disabled' }}
					>
						Now Playing
					</Typography>
				</Box>

				<Box sx={{ px: 2.5, pb: 1.5 }}>
					{hasSteps ? (
						<div dir={transcription.language_orientation}>
							<Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ py: 1 }}>
								<Stack direction="column" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
									<IndexBadge>{currentStep.index + 1}</IndexBadge>
									<Typography variant="caption" sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums', fontSize: '0.65rem' }}>
										{currentStep.time?.slice(3, 9)}
									</Typography>
								</Stack>
								<Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
									<SpeakerBadge>{currentStep.speaker}</SpeakerBadge>
									<Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.primary' }}>
										{currentStep.text}
									</Typography>
								</Stack>
							</Stack>
						</div>
					) : (
						<Typography color="text.disabled" variant="body2" sx={{ py: 2 }}>
							No transcription available for this lesson.
						</Typography>
					)}
				</Box>

				{hasSteps && (
					<>
						<Divider />
						<MobileStepper
							variant="progress"
							steps={maxSteps}
							position="static"
							activeStep={activeStep}
							sx={{
								backgroundColor: 'transparent',
								'& .MuiLinearProgress-root': { backgroundColor: 'rgba(132,204,22,0.15)' },
								'& .MuiLinearProgress-bar': { backgroundColor: '#84cc16' },
							}}
							nextButton={
								<Button
									size="small"
									onClick={handleNext}
									disabled={activeStep === maxSteps - 1}
									sx={{ color: '#65a30d', '&:hover': { backgroundColor: 'rgba(132,204,22,0.08)' } }}
								>
									Next
									{theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
								</Button>
							}
							backButton={
								<Button
									size="small"
									onClick={handleBack}
									disabled={activeStep === 0}
									sx={{ color: '#65a30d', '&:hover': { backgroundColor: 'rgba(132,204,22,0.08)' } }}
								>
									{theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
									Back
								</Button>
							}
						/>
					</>
				)}
			</Box>

			{/* ── Full transcription list ── */}
			<Box
				sx={(theme) => ({
					width: '100%',
					borderRadius: 3,
					border: `1px solid ${theme.vars.palette.divider}`,
					borderLeft: '4px solid #84cc16',
					backgroundColor: theme.vars.palette.background.paper,
					boxShadow: theme.shadows[1],
					overflow: 'hidden',
				})}
			>
				<Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
					<Typography
						variant="overline"
						sx={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: 'text.disabled' }}
					>
						Transcription
					</Typography>
					{(transcription?.title || transcription?.author) && (
						<Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 0.25 }}>
							{transcription?.title}
							{transcription?.title && transcription?.author && ' — '}
							{transcription?.author}
						</Typography>
					)}
				</Box>

				<Divider />

				<Box sx={{ px: 2.5, py: 1.5 }}>
					{hasContent ? (
						<div dir={transcription?.language_orientation}>
							{transcription.content.map((content) => {
								const contentArrayPos = content.index - 1;
								const isActive = hasSteps && currentStep.index === contentArrayPos;

								return (
									<div
										key={content.index}
										className={clsx(
											'grid grid-cols-12 gap-x-2 rounded-lg transition-colors',
											isActive && 'bg-lime-50'
										)}
										style={{
											backgroundColor: isActive
												? 'rgba(132,204,22,0.07)'
												: undefined,
										}}
									>
										{/* Index + time column */}
										<button
											className="col-span-1 flex flex-col items-center justify-center gap-0.5 py-2 hover:cursor-pointer group"
											onClick={() => playStep(contentArrayPos)}
											title={`Jump to ${content.time}`}
										>
											<IndexBadge
												style={{
													backgroundColor: isActive ? '#65a30d' : '#84cc16',
													opacity: isActive ? 1 : 0.75,
													transition: 'background 0.15s, opacity 0.15s',
												}}
											>
												{content.index}
											</IndexBadge>
											<Typography
												variant="caption"
												sx={{ color: 'text.disabled', fontSize: '0.6rem', fontVariantNumeric: 'tabular-nums' }}
											>
												{content.time?.slice(3, 9)}
											</Typography>
										</button>

										{/* Speaker column */}
										<div className="col-span-1 flex items-center justify-start py-2">
											<SpeakerBadge>{content.speaker}</SpeakerBadge>
										</div>

										{/* Text column */}
										<div className="col-span-10 flex items-center py-2">
											<Typography
												variant="body2"
												sx={{
													color: isActive ? 'text.primary' : 'text.secondary',
													fontWeight: isActive ? 500 : 400,
													lineHeight: 1.65,
													transition: 'color 0.15s, font-weight 0.15s',
												}}
											>
												{content.type !== 'جملة' && (
													<span style={{ marginInlineEnd: 4, opacity: 0.4 }}>:</span>
												)}
												{content.text}
											</Typography>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<Typography color="text.disabled" variant="body2" sx={{ py: 3, textAlign: 'center' }}>
							No transcription content available.
						</Typography>
					)}
				</Box>
			</Box>
		</div>
	);
}