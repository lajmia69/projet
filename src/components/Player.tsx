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

// #region ------- Tracts -------------------------------------------------------
// import fade from './music/As You Fade Away - NEFFEX.mp3';
// import enough from './music/Enough - NEFFEX.mp3';
// import immortal from './music/Immortal - NEFFEX.mp3';
// import playDead from './music/Play Dead - NEFFEX.mp3';
// import winning from './music/Winning - NEFFEX.mp3';
// #endregion ---------------------------------------------------------------

// #region -------- Styled Components -----------------------------------------
const CustomPaper = styled(Paper)(({ theme }) => ({
	backgroundColor: '#bfc3cd',
	padding: theme.spacing(2)
}));

const PSlider = styled(Slider)(() => ({
	color: '#000000de',
	height: 2,
	'&:hover': {
		cursor: 'auto'
	},
	'& .MuiSlider-thumb': {
		width: '13px',
		height: '13px',
		size: 'small'
	}
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
// const playlist = [fade, enough, immortal, playDead, winning];

export default function Player(props: PlayerProps): JSX.Element {
	const { playlist, steps, transcription } = props;
	const audioPlayer = useRef<HTMLAudioElement>(null);

	const [index, setIndex] = useState(0);

	const [currentSong] = useState(playlist[index].src);

	const [isPlaying, setIsPlaying] = useState(false);
	const [volume, setVolume] = useState(30);
	const [mute, setMute] = useState(false);

	// const [playValue, setPlayValue] = useState(0);

	const [elapsed, setElapsed] = useState<number>(0);
	const [duration, setDuration] = useState<number>(Math.floor(playlist[index].timestamp));

	const theme = useTheme();
	const [activeStep, setActiveStep] = React.useState(0);
	const maxSteps = steps.length;

	useEffect(() => {
		if (audioPlayer) {
			audioPlayer.current.volume = volume / 100;
		}

		if (isPlaying) {
			setInterval(() => {
				const _duration = Math.floor(audioPlayer?.current?.duration);
				const _elapsed = Math.floor(audioPlayer?.current?.currentTime);
				// console.log(`${Math.floor(audioPlayer.current.currentTime)}===${steps[activeStep + 1].timestamp}`);

				// if (Math.floor(audioPlayer.current.currentTime) === steps[activeStep + 1].timestamp) {
				// 	setActiveStep(steps[activeStep+1].index);
				// }
				// console.log(`ActiveStep ${activeStep}  ${maxSteps}`);

				const step = steps.find((step) => step.timestamp === _elapsed);

				if (step) setActiveStep(step.index);

				// console.log(step.index);
				setDuration(_duration);
				setElapsed(_elapsed);
			}, 100);
		}
	}, [volume, isPlaying, steps, activeStep]);

	function formatTime(time: number) {
		if (time && !isNaN(time)) {
			const minutes = Math.floor(time / 60) < 10 ? `0${Math.floor(time / 60)}` : Math.floor(time / 60);
			const seconds = Math.floor(time % 60) < 10 ? `0${Math.floor(time % 60)}` : Math.floor(time % 60);

			return `${minutes}:${seconds}`;
		}

		return '00:00';
	}

	function playTime(time: number) {
		if (time && !isNaN(time)) {
			audioPlayer.current.currentTime = time;
		}
	}

	function playStep(index: number) {
		// console.log(index);
		const step = steps[index];

		if (step) {
			setIsPlaying(false);
			audioPlayer.current.pause();
			// console.log(step.timestamp);
			audioPlayer.current.currentTime = step.timestamp;
			// console.log(audioPlayer.current.currentTime);
			setActiveStep(step.index);
			audioPlayer.current.play();
			setIsPlaying(true);
		}
	}

	const handleNext = () => {
		const _duration = Math.floor(audioPlayer?.current?.duration);
		// const _elapsed = Math.floor(audioPlayer?.current?.currentTime);
		// console.log(activeStep);
		setActiveStep(steps[activeStep + 1].index);
		// console.log(activeStep);
		audioPlayer.current.currentTime = steps[activeStep + 1].timestamp;
		setElapsed(steps[activeStep + 1].timestamp);
		setDuration(_duration);
	};

	const handleBack = () => {
		const _duration = Math.floor(audioPlayer?.current?.duration);
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
		audioPlayer.current.currentTime = steps[activeStep - 1].timestamp;
		setElapsed(steps[activeStep - 1].timestamp);
		setDuration(_duration);
	};

	const togglePlay = () => {
		if (!isPlaying) {
			audioPlayer.current.play();
		} else {
			audioPlayer.current.pause();
		}

		setIsPlaying((prev) => !prev);
	};

	const toggleForward = () => {
		audioPlayer.current.currentTime += 10;
	};

	const toggleBackward = () => {
		audioPlayer.current.currentTime -= 10;
	};

	const toggleSkipForward = () => {
		if (index >= playlist.length - 1) {
			setIndex(0);
			audioPlayer.current.src = playlist[0].src;
			audioPlayer.current.play();
			setIsPlaying(true);
		} else {
			setIndex((prev) => prev + 1);
			audioPlayer.current.src = playlist[index + 1].src;
			audioPlayer.current.play();
			setIsPlaying(true);
		}
	};

	const toggleSkipBackward = () => {
		if (index > 0) {
			setIndex((prev) => prev - 1);
			audioPlayer.current.src = playlist[index - 1].src;
			audioPlayer.current.play();
			setIsPlaying(true);
		} else {
			setIndex(playlist.length - 1);
			audioPlayer.current.src = playlist[index].src;
			audioPlayer.current.play();
			setIsPlaying(true);
		}
	};

	function VolumeBtns() {
		return mute ? (
			<VolumeOffIcon
				sx={{ color: '#000000de', '&:hover': { color: 'white' } }}
				onClick={() => setMute(!mute)}
			/>
		) : volume <= 20 ? (
			<VolumeMuteIcon
				sx={{ color: '#000000de', '&:hover': { color: 'white' } }}
				onClick={() => setMute(!mute)}
			/>
		) : volume <= 75 ? (
			<VolumeDownIcon
				sx={{ color: '#000000de', '&:hover': { color: 'white' } }}
				onClick={() => setMute(!mute)}
			/>
		) : (
			<VolumeUpIcon
				sx={{ color: '#000000de', '&:hover': { color: 'white' } }}
				onClick={() => setMute(!mute)}
			/>
		);
	}

	return (
		<div className={'flex flex-col space-y-4'}>
			<audio
				src={currentSong}
				ref={audioPlayer}
				muted={mute}
			/>
			<CustomPaper>
				<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
					<Stack
						direction="row"
						spacing={1}
						sx={{
							display: 'flex',
							justifyContent: 'flex-start',
							width: '25%',
							alignItems: 'center'
						}}
					>
						<VolumeBtns />

						<PSlider
							min={0}
							max={100}
							value={volume}
							onChange={(e, v) => setVolume(Number(v))}
						/>
					</Stack>

					<Stack
						direction="row"
						spacing={1}
						sx={{
							display: 'flex',
							width: '40%',
							alignItems: 'center'
						}}
					>
						<SkipPreviousIcon
							sx={{
								color: '#000000de',
								'&:hover': { color: 'white' }
							}}
							onClick={toggleSkipBackward}
							// disabled={true}
						/>
						<FastRewindIcon
							sx={{ color: '#000000de', '&:hover': { color: 'white' } }}
							onClick={toggleBackward}
						/>

						{!isPlaying ? (
							<PlayArrowIcon
								fontSize={'large'}
								sx={{ color: '#000000de', '&:hover': { color: 'white' } }}
								onClick={togglePlay}
							/>
						) : (
							<PauseIcon
								fontSize={'large'}
								sx={{ color: '#000000de', '&:hover': { color: 'white' } }}
								onClick={togglePlay}
							/>
						)}

						<FastForwardIcon
							sx={{ color: '#000000de', '&:hover': { color: 'white' } }}
							onClick={toggleForward}
						/>
						<SkipNextIcon
							sx={{ color: '#000000de', '&:hover': { color: 'white' } }}
							onClick={toggleSkipForward}
						/>
					</Stack>

					<Stack
						sx={{
							display: 'flex',
							justifyContent: 'flex-end'
						}}
					/>
				</Box>
				<Stack
					spacing={1}
					direction="row"
					sx={{
						display: 'flex',
						alignItems: 'center'
					}}
				>
					<Typography sx={{ color: '#000000de', width: '10%', textAlign: 'center' }}>
						{formatTime(elapsed)}
					</Typography>
					<PSlider
						value={isNaN(elapsed) ? 0 : Number(elapsed)}
						max={isNaN(duration) ? Math.floor(audioPlayer?.current?.duration) : Number(duration)}
						onChange={(_, value) => playTime(Number(value))}
					/>
					<Typography sx={{ color: '#000000de', width: '10%', textAlign: 'center' }}>
						{formatTime(duration - elapsed)}
					</Typography>
				</Stack>
			</CustomPaper>
			<Box
				sx={{ width: '100%', p: 2 }}
				className={'rounded-xl border-x-4 border-x-lime-400 bg-white shadow-lime-400'}
			>
				<Paper
					square
					elevation={0}
					sx={{
						display: 'flex',
						alignItems: 'center',
						minHeight: 50,
						pl: 2
						// bgcolor: 'background.default'
					}}
				>
					<div
						dir={transcription.language_orientation}
						className={'grid w-full grid-cols-12 gap-1 text-xl'}
					>
						<div className={'grid grid-cols-3 gap-1'}>
							<div className={'col-span-1 flex items-center justify-center'}>
								<div
									className={
										'flex w-full items-center justify-center bg-lime-400 p-1 font-bold text-white'
									}
								>
									{steps[activeStep].index + 1}
								</div>
							</div>
							<div className={'col-span-2 flex items-center justify-center'}>
								{steps[activeStep].time.slice(3, 9)}
							</div>
						</div>

						<div className={'col-span-1 flex items-center justify-start p-1'}>
							<div className={'w-full bg-sky-100 p-1'}>{steps[activeStep].speaker}</div>
						</div>
						<div className={'col-span-10 flex items-center justify-start p-1'}>
							{steps[activeStep].text}
						</div>
					</div>
				</Paper>
				{/*<Box sx={{ width: '100%', p: 2 }}>{steps[activeStep].text}</Box>*/}
				<MobileStepper
					variant="progress"
					steps={maxSteps}
					position="static"
					activeStep={activeStep}
					nextButton={
						<Button
							size="small"
							onClick={handleNext}
							disabled={activeStep === maxSteps - 1}
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
						>
							{theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
							Back
						</Button>
					}
				/>
			</Box>
			<Box
				sx={{ width: '100%', p: 2 }}
				className={'rounded-xl border-x-4 border-x-lime-400 bg-white text-xl shadow-lime-400'}
			>
				<Paper
					square
					elevation={0}
					sx={{
						display: 'flex',
						alignItems: 'center',
						pl: 2
						// bgcolor: 'background.default'
					}}
				>
					<div
						dir={transcription.language_orientation}
						className={'w-full'}
					>
						<Typography>
							{transcription.title} - {transcription.author}
						</Typography>
						<div>
							{transcription.content.map((content) => {
								return (
									<div
										key={content.index}
										className={'grid grid-cols-12 gap-x-2'}
									>
										<button
											className={
												'col-span-1 flex items-center justify-between py-1 hover:cursor-pointer'
											}
											onClick={() => playStep(content.index - 1)}
										>
											<div
												className={
													'flex w-6 justify-center bg-lime-400 p-1 font-bold text-white'
												}
											>
												{content.index}
											</div>
											<div>{content.time.slice(3, 9)}</div>
										</button>
										<div className={'col-span-1 flex items-center justify-center py-1'}>
											<div className={'flex w-full bg-sky-100 p-1'}>{content.speaker}</div>
										</div>
										<div className={'col-span-10 py-1'}>
											<div
												className={clsx('flex space-x-1 p-1', {
													'bg-red-100': steps[activeStep].index === content.index - 1,
													'bg-white': steps[activeStep].index !== content.index - 1
												})}
											>
												{content.type === 'جملة' ? <div></div> : <div>:</div>}
												<div>{content.text}</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</Paper>
				{/*<Box sx={{ width: '100%', p: 2 }}>{steps[activeStep].text}</Box>*/}
			</Box>
		</div>
	);
}
