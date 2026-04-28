'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Chip from '@mui/material/Chip';
import { Lesson } from '../../api/types';
import DurationDisplay from './DurationDisplay';

type LessonCardProps = {
	lesson: Lesson;
};

function LessonCard({ lesson }: LessonCardProps) {
	return (
		<Card
			sx={(theme) => ({
				display: 'flex',
				flexDirection: 'column',
				borderRadius: '18px',
				overflow: 'hidden',
				height: '100%',
				position: 'relative',
				border: theme.palette.mode === 'dark'
					? '1px solid rgba(14,168,176,0.25)'
					: '1px solid rgba(14,168,176,0.22)',
				background: theme.palette.mode === 'dark'
					? 'linear-gradient(145deg, #0D1A47 0%, #112468 100%)'
					: 'linear-gradient(145deg, #112468 0%, #1764C0 100%)',
				boxShadow: theme.palette.mode === 'dark'
					? '0 0 0 1px rgba(14,168,176,0.1), 0 4px 24px rgba(13,26,71,0.4)'
					: '0 0 0 1px rgba(14,168,176,0.1), 0 4px 20px rgba(17,36,104,0.3)',
				transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
				'&:hover': {
					transform: 'translateY(-5px)',
					borderColor: theme.palette.mode === 'dark'
						? 'rgba(14,168,176,0.5)'
						: 'rgba(14,168,176,0.5)',
					boxShadow: theme.palette.mode === 'dark'
						? '0 0 0 1px rgba(14,168,176,0.22), 0 8px 40px rgba(14,168,176,0.3)'
						: '0 0 0 1px rgba(14,168,176,0.22), 0 8px 40px rgba(14,168,176,0.35)',
				},
			})}
		>
			{/* Top accent bar — Ocean teal → Seafoam */}
			<div style={{ height: 3, width: '100%', background: 'linear-gradient(90deg, #0EA8B0, #1DC98A)' }} />

			{/* Card body */}
			<div className="flex flex-col flex-1 p-5 gap-3" style={{ position: 'relative', zIndex: 1 }}>

				{/* Module chips */}
				<div dir={lesson.transcription?.language_orientation} className="flex flex-wrap gap-1.5">
					{lesson.module?.subject?.name && (
						<Chip
							label={lesson.module.subject.name}
							size="small"
							sx={() => ({
								fontSize: '0.72rem',
								fontWeight: 700,
								letterSpacing: '0.04em',
								textTransform: 'uppercase',
								height: 22,
								color: '#fff',
								backgroundColor: 'rgba(14,168,176,0.22)',
								border: '1px solid rgba(14,168,176,0.45)',
								boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
								'& .MuiChip-label': { color: '#fff' },
							})}
						/>
					)}
					{lesson.module?.name && (
						<Chip
							label={lesson.module.name}
							size="small"
							sx={() => ({
								fontSize: '0.68rem',
								fontWeight: 600,
								height: 20,
								color: 'rgba(255,255,255,0.55)',
								backgroundColor: 'rgba(255,255,255,0.08)',
								border: '1px solid rgba(255,255,255,0.14)',
							})}
						/>
					)}
				</div>

				{/* Title */}
				<Typography
					className="font-semibold line-clamp-2 leading-snug"
					dir={lesson.transcription?.language_orientation}
					sx={() => ({
						fontSize: '1.05rem',
						fontWeight: 800,
						color: '#ffffff',
						lineHeight: 1.25,
					})}
				>
					{lesson.name}
				</Typography>

				{/* Author */}
				{lesson.transcription?.author && (
					<Typography
						className="line-clamp-1"
						dir={lesson.transcription?.language_orientation}
						sx={() => ({
							color: 'rgba(255,255,255,0.55)',
							fontSize: '0.82rem',
						})}
					>
						{lesson.transcription.author}
					</Typography>
				)}

				<div className="flex-1" />

				{/* Divider */}
				<div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(14,168,176,0.45), transparent)' }} />

				{/* Meta row */}
				<div className="flex items-center gap-3 flex-wrap">
					{(lesson.streaming_version?.duration || lesson.hd_version?.duration) && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={12} sx={{ color: '#0EA8B0' }}>lucide:clock</FuseSvgIcon>
							<Typography className="text-xs font-medium" sx={{ color: '#0EA8B0' }}>
								<DurationDisplay
									isoDuration={lesson.streaming_version?.duration || lesson.hd_version?.duration}
									format="short"
								/>
							</Typography>
						</div>
					)}
					{lesson.language?.name && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={12} sx={{ color: 'rgba(255,255,255,0.4)' }}>lucide:globe</FuseSvgIcon>
							<Typography className="text-xs" sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>
								{lesson.language.name}
							</Typography>
						</div>
					)}
					{lesson.lesson_type?.name && (
						<Typography
							className="text-xs ml-auto"
							sx={() => ({
								fontWeight: 700,
								paddingX: '7px',
								paddingY: '2px',
								borderRadius: '6px',
								color: '#fff',
								background: 'rgba(14,168,176,0.22)',
								border: '1px solid rgba(14,168,176,0.4)',
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
							<FuseSvgIcon size={13} sx={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
								lucide:graduation-cap
							</FuseSvgIcon>
							<Typography className="text-xs truncate" sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.38)' }}>
								{lesson.created_by.full_name}
							</Typography>
						</div>
					)}
					<Button
						component={Link}
						to={`/lessons/${lesson.id}`}
						size="small"
						variant="contained"
						sx={() => ({
							borderRadius: '9px',
							fontSize: '0.73rem',
							fontWeight: 700,
							textTransform: 'none',
							paddingX: '14px',
							paddingY: '5px',
							flexShrink: 0,
							minWidth: 'unset',
							letterSpacing: '0.02em',
							background: 'linear-gradient(135deg, #0EA8B0, #1DC98A)',
							color: '#0D1A47',
							boxShadow: '0 0 14px rgba(14,168,176,0.5)',
							transition: 'box-shadow 0.2s ease, transform 0.15s ease',
							'&:hover': {
								background: 'linear-gradient(135deg, #1DC98A, #0EA8B0)',
								boxShadow: '0 0 20px rgba(14,168,176,0.65)',
								transform: 'scale(1.04)',
							},
						})}
						endIcon={
							<FuseSvgIcon size={13}>
								{lesson.transcription?.language_orientation === 'rtl'
									? 'lucide:arrow-left'
									: 'lucide:arrow-right'}
							</FuseSvgIcon>
						}
					>
						Listen
					</Button>
				</div>
			</div>
		</Card>
	);
}

export default LessonCard;