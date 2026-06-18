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
			sx={{
				display: 'flex',
				flexDirection: 'column',
				borderRadius: '18px',
				overflow: 'hidden',
				height: '100%',
				position: 'relative',
				border: '1px solid rgba(45,139,124,0.18)',
				background: '#F2F0EF',
				boxShadow: '0 2px 12px rgba(26,46,56,0.08)',
				transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
				'&:hover': {
					transform: 'translateY(-5px)',
					borderColor: 'rgba(45,139,124,0.4)',
					boxShadow: '0 8px 32px rgba(45,139,124,0.2)',
				},
			}}
		>
			{/* Top accent bar — Navy → Teal */}
			<div style={{ height: 6, width: '100%', background: 'linear-gradient(90deg, #1A2E38, #2D8B7C)' }} />

			{/* Card body */}
			<div className="flex flex-col flex-1 p-5 gap-3" style={{ position: 'relative', zIndex: 1 }}>

				{/* Module chips */}
				<div dir={lesson.transcription?.language_orientation} className="flex flex-wrap gap-1.5">
					{lesson.module?.subject?.name && (
						<Chip
							label={lesson.module.subject.name}
							size="small"
							sx={{
								fontSize: '0.72rem',
								fontWeight: 700,
								letterSpacing: '0.04em',
								textTransform: 'uppercase',
								height: 22,
								color: '#1A2E38',
								backgroundColor: 'rgba(45,139,124,0.15)',
								border: '1px solid rgba(45,139,124,0.35)',
								'& .MuiChip-label': { color: '#1A2E38' },
							}}
						/>
					)}
					{lesson.module?.name && (
						<Chip
							label={lesson.module.name}
							size="small"
							sx={{
								fontSize: '0.68rem',
								fontWeight: 600,
								height: 20,
								color: 'rgba(26,46,56,0.6)',
								backgroundColor: 'rgba(26,46,56,0.07)',
								border: '1px solid rgba(26,46,56,0.12)',
							}}
						/>
					)}
				</div>

				{/* Title */}
				<Typography
					className="font-semibold line-clamp-2 leading-snug"
					dir={lesson.transcription?.language_orientation}
					sx={{
						fontSize: '1.05rem',
						fontWeight: 800,
						color: '#1A2E38',
						lineHeight: 1.25,
					}}
				>
					{lesson.name}
				</Typography>

				{/* Author */}
				{lesson.transcription?.author && (
					<Typography
						className="line-clamp-1"
						dir={lesson.transcription?.language_orientation}
						sx={{
							color: 'rgba(26,46,56,0.55)',
							fontSize: '0.82rem',
						}}
					>
						{lesson.transcription.author}
					</Typography>
				)}

				<div className="flex-1" />

				{/* Divider */}
				<div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(45,139,124,0.35), transparent)' }} />

				{/* Meta row */}
				<div className="flex items-center gap-3 flex-wrap">
					{(lesson.streaming_version?.duration || lesson.hd_version?.duration) && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={12} sx={{ color: '#2D8B7C' }}>lucide:clock</FuseSvgIcon>
							<Typography className="text-xs font-medium" sx={{ color: '#2D8B7C' }}>
								<DurationDisplay
									isoDuration={lesson.streaming_version?.duration || lesson.hd_version?.duration}
									format="short"
								/>
							</Typography>
						</div>
					)}
					{lesson.language?.name && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={12} sx={{ color: 'rgba(26,46,56,0.35)' }}>lucide:globe</FuseSvgIcon>
							<Typography className="text-xs" sx={{ fontWeight: 500, color: 'rgba(26,46,56,0.45)' }}>
								{lesson.language.name}
							</Typography>
						</div>
					)}
					{lesson.lesson_type?.name && (
						<Typography
							className="text-xs ml-auto"
							sx={{
								fontWeight: 700,
								paddingX: '7px',
								paddingY: '2px',
								borderRadius: '6px',
								color: '#1C4A52',
								background: 'rgba(45,139,124,0.12)',
								border: '1px solid rgba(45,139,124,0.3)',
							}}
						>
							{lesson.lesson_type.name}
						</Typography>
					)}
				</div>

				{/* Creator + CTA */}
				<div className="flex items-center justify-between gap-2 pt-0.5">
					{lesson.created_by?.full_name && (
						<div className="flex items-center gap-1.5 min-w-0">
							<FuseSvgIcon size={13} sx={{ color: 'rgba(26,46,56,0.3)', flexShrink: 0 }}>
								lucide:graduation-cap
							</FuseSvgIcon>
							<Typography className="text-xs truncate" sx={{ fontWeight: 500, color: 'rgba(26,46,56,0.45)' }}>
								{lesson.created_by.full_name}
							</Typography>
						</div>
					)}
					<Button
						component={Link}
						to={`/platform/lesson/routes/lessons/${lesson.id}`}
						size="small"
						variant="contained"
						sx={{
							borderRadius: '9px',
							fontSize: '0.73rem',
							fontWeight: 700,
							textTransform: 'none',
							paddingX: '14px',
							paddingY: '5px',
							flexShrink: 0,
							minWidth: 'unset',
							letterSpacing: '0.02em',
							background: 'linear-gradient(135deg, #1A2E38, #2D8B7C)',
							color: '#E8E4DA',
							boxShadow: '0 0 14px rgba(45,139,124,0.35)',
							transition: 'box-shadow 0.2s ease, transform 0.15s ease',
							'&:hover': {
								background: 'linear-gradient(135deg, #2D8B7C, #1A2E38)',
								boxShadow: '0 0 20px rgba(45,139,124,0.5)',
								transform: 'scale(1.04)',
							},
						}}
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