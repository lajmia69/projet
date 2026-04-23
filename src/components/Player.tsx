'use client';

import { useState, useEffect, useRef, JSX } from 'react';
import { styled, Typography, Slider, Paper, Stack, Box } from '@mui/material';

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
const CustomPaper = styled(Paper)(({ theme }) => ({
	backgroundColor: '#bfc3cd',
	padding: theme.spacing(2)
}));

const PSlider = styled(Slider)(() => ({
	color: '#000000de',
	height: 2,
	'&:hover': { cursor: 'auto' },
	'& .MuiSlider-thumb': { width: '13px', height: '13px', size: 'small' }
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
	// Initialize to 0 — the real duration is read from the audio element
	// once it fires `loadedmetadata`. playlist[index].timestamp is a Unix
	// epoch value (ms since 1970), NOT the audio length in seconds.
	const [duration, setDuration] = useState<number>(0);

	const theme = useTheme();

	// activeStep is always a pure ARRAY POSITION into `steps[]`, never a content index value.
	const [activeStep, setActiveStep] = React.useState(0);
	const maxSteps = steps.length;

	// Derived: the step object currently shown (undefined-safe)
	const currentStep = steps[activeStep] ?? null;

	// ── Wire up audio events ──────────────────────────────────────────────────
	useEffect(() => {
		const audio = audioPlayer.current;
		if (!audio) return;

		// Set volume whenever it changes
		audio.volume = volume / 100;
	}, [volume]);

	useEffect(() => {
		const audio = audioPlayer.current;
		if (!audio) return;

		// Once the browser knows the audio length, store it (in seconds)
		const onLoaded = () => {
			if (!isNaN(audio.duration)) setDuration(Math.floor(audio.duration));
		};

		// Update elapsed time & highlight the matching transcription step
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

		// If metadata already loaded before the effect ran
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
		if (audio && time && !isNaN(time)) {
			audio.currentTime = time;
		}
	}

	// Jump to a step by its ARRAY POSITION
	function playStep(arrayPos: number) {
		const step = steps[arrayPos];
		const audio = audioPlayer.current;
		if (!step || !audio) return;

		setIsPlaying(false);
		audio.pause();
		audio.currentTime = step.timestamp;
		setActiveStep(arrayPos); // ← store array position, not step.index
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

	const toggleForward = () => {
		if (audioPlayer.current) audioPlayer.current.currentTime += 10;
	};

	const toggleBackward = () => {
		if (audioPlayer.current) audioPlayer.current.currentTime -= 10;
	};

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
		if (mute) return <VolumeOffIcon sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={onClick} />;
		if (volume <= 20) return <VolumeMuteIcon sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={onClick} />;
		if (volume <= 75) return <VolumeDownIcon sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={onClick} />;
		return <VolumeUpIcon sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={onClick} />;
	}

	// ── No transcription content guard ────────────────────────────────────────
	const hasSteps = maxSteps > 0 && currentStep !== null;
	const hasContent = Array.isArray(transcription?.content) && transcription.content.length > 0;

	return (
		<div className={'flex flex-col space-y-4'}>
			<audio src={currentSong} ref={audioPlayer} muted={mute} />

			{/* ── Transport controls ── */}
			<CustomPaper>
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Stack direction="row" spacing={1} sx={{ display: 'flex', justifyContent: 'flex-start', width: '25%', alignItems: 'center' }}>
						<VolumeBtns />
						<PSlider min={0} max={100} value={volume} onChange={(_, v) => setVolume(Number(v))} />
					</Stack>

					<Stack direction="row" spacing={1} sx={{ display: 'flex', width: '40%', alignItems: 'center' }}>
						<SkipPreviousIcon sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={toggleSkipBackward} />
						<FastRewindIcon sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={toggleBackward} />
						{!isPlaying ? (
							<PlayArrowIcon fontSize={'large'} sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={togglePlay} />
						) : (
							<PauseIcon fontSize={'large'} sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={togglePlay} />
						)}
						<FastForwardIcon sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={toggleForward} />
						<SkipNextIcon sx={{ color: '#000000de', '&:hover': { color: 'white' } }} onClick={toggleSkipForward} />
					</Stack>

					<Stack sx={{ display: 'flex', justifyContent: 'flex-end' }} />
				</Box>

				<Stack spacing={1} direction="row" sx={{ display: 'flex', alignItems: 'center' }}>
					<Typography sx={{ color: '#000000de', width: '10%', textAlign: 'center' }}>
						{formatTime(elapsed)}
					</Typography>
					<PSlider
						value={isNaN(elapsed) ? 0 : elapsed}
						max={isNaN(duration) ? Math.floor(audioPlayer?.current?.duration ?? 0) : duration}
						onChange={(_, value) => playTime(Number(value))}
					/>
					<Typography sx={{ color: '#000000de', width: '10%', textAlign: 'center' }}>
						{formatTime(duration - elapsed)}
					</Typography>
				</Stack>
			</CustomPaper>

			{/* ── Active step display ── */}
			<Box sx={{ width: '100%', p: 2 }} className={'rounded-xl border-x-4 border-x-lime-400 bg-white shadow-lime-400'}>
				<Paper square elevation={0} sx={{ display: 'flex', alignItems: 'center', minHeight: 50, pl: 2 }}>
					{hasSteps ? (
						<div dir={transcription.language_orientation} className={'grid w-full grid-cols-12 gap-1 text-xl'}>
							<div className={'grid grid-cols-3 gap-1'}>
								<div className={'col-span-1 flex items-center justify-center'}>
									<div className={'flex w-full items-center justify-center bg-lime-400 p-1 font-bold text-white'}>
										{/* Display 1-based number for the user */}
										{currentStep.index + 1}
									</div>
								</div>
								<div className={'col-span-2 flex items-center justify-center'}>
									{currentStep.time?.slice(3, 9)}
								</div>
							</div>
							<div className={'col-span-1 flex items-center justify-start p-1'}>
								<div className={'w-full bg-sky-100 p-1'}>{currentStep.speaker}</div>
							</div>
							<div className={'col-span-10 flex items-center justify-start p-1'}>
								{currentStep.text}
							</div>
						</div>
					) : (
						<Typography color="text.secondary" className="pl-2">
							No transcription available for this lesson.
						</Typography>
					)}
				</Paper>

				{hasSteps && (
					<MobileStepper
						variant="progress"
						steps={maxSteps}
						position="static"
						activeStep={activeStep}
						nextButton={
							<Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1}>
								Next
								{theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
							</Button>
						}
						backButton={
							<Button size="small" onClick={handleBack} disabled={activeStep === 0}>
								{theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
								Back
							</Button>
						}
					/>
				)}
			</Box>

			{/* ── Full transcription list ── */}
			<Box sx={{ width: '100%', p: 2 }} className={'rounded-xl border-x-4 border-x-lime-400 bg-white text-xl shadow-lime-400'}>
				<Paper square elevation={0} sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
					<div dir={transcription?.language_orientation} className={'w-full'}>
						<Typography>
							{transcription?.title} - {transcription?.author}
						</Typography>

						{hasContent ? (
							<div>
								{transcription.content.map((content) => {
									// The array position for this content item is content.index - 1
									const contentArrayPos = content.index - 1;
									// Highlight when the active step's content index matches
									const isActive = hasSteps && currentStep.index === contentArrayPos;

									return (
										<div key={content.index} className={'grid grid-cols-12 gap-x-2'}>
											<button
												className={'col-span-1 flex items-center justify-between py-1 hover:cursor-pointer'}
												onClick={() => playStep(contentArrayPos)}
											>
												<div className={'flex w-6 justify-center bg-lime-400 p-1 font-bold text-white'}>
													{content.index}
												</div>
												<div>{content.time?.slice(3, 9)}</div>
											</button>

											<div className={'col-span-1 flex items-center justify-center py-1'}>
												<div className={'flex w-full bg-sky-100 p-1'}>{content.speaker}</div>
											</div>

											<div className={'col-span-10 py-1'}>
												<div className={clsx('flex space-x-1 p-1', {
													'bg-red-100': isActive,
													'bg-white': !isActive
												})}>
													{content.type === 'جملة' ? <div /> : <div>:</div>}
													<div>{content.text}</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<Typography color="text.secondary" className="py-4">
								No transcription content available.
							</Typography>
						)}
					</div>
				</Paper>
			</Box>
		</div>
	);
}