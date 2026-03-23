'use client';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Chip from '@mui/material/Chip';
import { Radio } from '../../api/types';
import DurationDisplay from '../ui/DurationDisplay';

type RadioCardProps = {
	radio: Radio;
};

function RadioCard({ radio }: RadioCardProps) {
	return (
		<Card
			sx={(theme) => ({
				display: 'flex',
				flexDirection: 'column',
				borderRadius: '18px',
				overflow: 'hidden',
				height: '100%',
				position: 'relative',
				border:
					theme.palette.mode === 'dark'
						? '1px solid rgba(99,179,237,0.18)'
						: '1px solid rgba(59,130,246,0.14)',
				background:
					theme.palette.mode === 'dark'
						? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(23,37,64,0.98) 100%)'
						: 'linear-gradient(145deg, #ffffff 0%, #f0f6ff 100%)',
				boxShadow:
					theme.palette.mode === 'dark'
						? '0 0 0 1px rgba(99,179,237,0.08), 0 4px 24px rgba(59,130,246,0.12), 0 1px 4px rgba(0,0,0,0.4)'
						: '0 0 0 1px rgba(59,130,246,0.06), 0 4px 20px rgba(59,130,246,0.08), 0 1px 4px rgba(0,0,0,0.04)',
				transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
				'&:hover': {
					transform: 'translateY(-5px)',
					borderColor:
						theme.palette.mode === 'dark' ? 'rgba(99,179,237,0.4)' : 'rgba(59,130,246,0.35)',
					boxShadow:
						theme.palette.mode === 'dark'
							? '0 0 0 1px rgba(99,179,237,0.2), 0 8px 40px rgba(59,130,246,0.28), 0 0 60px rgba(59,130,246,0.12), 0 2px 8px rgba(0,0,0,0.4)'
							: '0 0 0 1px rgba(59,130,246,0.18), 0 8px 40px rgba(59,130,246,0.18), 0 0 60px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.06)'
				},
				'&::before': {
					content: '""',
					position: 'absolute',
					top: '-30px',
					right: '-30px',
					width: '120px',
					height: '120px',
					borderRadius: '50%',
					background:
						theme.palette.mode === 'dark'
							? 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)'
							: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
					pointerEvents: 'none',
					zIndex: 0
				}
			})}
		>
			{/* Top accent bar — amber/orange tint to distinguish from podcast */}
			<div
				style={{
					height: 3,
					width: '100%',
					background: 'linear-gradient(90deg, #b45309, #f59e0b, #fcd34d)',
					position: 'relative',
					zIndex: 1
				}}
			/>

			{/* Card body */}
			<div
				className="flex flex-col flex-1 p-5 gap-3"
				style={{ position: 'relative', zIndex: 1 }}
			>
				{/* Category chip */}
				{radio.category?.name && (
					<div>
						<Chip
							label={radio.category.name}
							size="small"
							sx={(theme) => ({
								fontSize: '0.68rem',
								fontWeight: 700,
								letterSpacing: '0.04em',
								textTransform: 'uppercase',
								height: 20,
								color: theme.palette.mode === 'dark' ? '#fcd34d' : '#92400e',
								backgroundColor:
									theme.palette.mode === 'dark'
										? 'rgba(245,158,11,0.18)'
										: 'rgba(245,158,11,0.1)',
								border:
									theme.palette.mode === 'dark'
										? '1px solid rgba(245,158,11,0.3)'
										: '1px solid rgba(245,158,11,0.3)',
								boxShadow:
									theme.palette.mode === 'dark'
										? '0 0 8px rgba(245,158,11,0.2)'
										: '0 0 6px rgba(245,158,11,0.12)'
							})}
						/>
					</div>
				)}

				{/* Title */}
				<Typography
					className="font-semibold line-clamp-2 leading-snug"
					dir={radio.transcription?.language_orientation}
					sx={(theme) => ({
						fontSize: '0.975rem',
						color: theme.palette.mode === 'dark' ? '#f0f6ff' : '#0f172a',
						lineHeight: 1.45
					})}
				>
					{radio.name}
				</Typography>

				{/* Author */}
				{radio.transcription?.author && (
					<Typography
						className="line-clamp-1"
						dir={radio.transcription?.language_orientation}
						sx={(theme) => ({
							color:
								theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)',
							fontSize: '0.82rem'
						})}
					>
						{radio.transcription.author}
					</Typography>
				)}

				{/* Spacer */}
				<div className="flex-1" />

				{/* Divider */}
				<div
					style={{
						height: 1,
						background:
							'linear-gradient(90deg, transparent, rgba(245,158,11,0.25), transparent)'
					}}
				/>

				{/* Meta row */}
				<div className="flex items-center gap-3 flex-wrap">
					{(radio.streaming_version?.duration || radio.hd_version?.duration) && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon
								size={12}
								sx={{ color: '#f59e0b' }}
							>
								lucide:clock
							</FuseSvgIcon>
							<Typography
								className="text-xs font-medium"
								sx={{ color: '#f59e0b' }}
							>
								<DurationDisplay
									isoDuration={radio.streaming_version?.duration || radio.hd_version?.duration}
									format="short"
								/>
							</Typography>
						</div>
					)}
					{radio.language?.name && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon
								size={12}
								sx={(theme) => ({
									color:
										theme.palette.mode === 'dark'
											? 'rgba(255,255,255,0.35)'
											: 'rgba(0,0,0,0.35)'
								})}
							>
								lucide:globe
							</FuseSvgIcon>
							<Typography
								className="text-xs"
								sx={(theme) => ({
									fontWeight: 500,
									color:
										theme.palette.mode === 'dark'
											? 'rgba(255,255,255,0.35)'
											: 'rgba(0,0,0,0.4)'
								})}
							>
								{radio.language.name}
							</Typography>
						</div>
					)}

					{radio.is_published && (
						<Chip
							label="On Air"
							size="small"
							sx={(theme) => ({
								ml: 'auto',
								height: 18,
								fontSize: '0.65rem',
								fontWeight: 700,
								color: theme.palette.mode === 'dark' ? '#fcd34d' : '#92400e',
								backgroundColor:
									theme.palette.mode === 'dark'
										? 'rgba(245,158,11,0.12)'
										: 'rgba(245,158,11,0.15)',
								border:
									theme.palette.mode === 'dark'
										? '1px solid rgba(245,158,11,0.3)'
										: '1px solid rgba(245,158,11,0.35)'
							})}
						/>
					)}
				</div>

				{/* Creator + CTA */}
				<div className="flex items-center justify-between gap-2 pt-0.5">
					{radio.created_by?.full_name && (
						<div className="flex items-center gap-1.5 min-w-0">
							<FuseSvgIcon
								size={13}
								sx={(theme) => ({
									color:
										theme.palette.mode === 'dark'
											? 'rgba(255,255,255,0.3)'
											: 'rgba(0,0,0,0.35)',
									flexShrink: 0
								})}
							>
								lucide:radio
							</FuseSvgIcon>
							<Typography
								className="text-xs truncate"
								sx={(theme) => ({
									fontWeight: 500,
									color:
										theme.palette.mode === 'dark'
											? 'rgba(255,255,255,0.35)'
											: 'rgba(0,0,0,0.4)'
								})}
							>
								{radio.created_by.full_name}
							</Typography>
						</div>
					)}

					<Button
						component={Link}
						to={`/content/radio/courses/${radio.id}`}
						size="small"
						variant="contained"
						sx={(theme) => ({
							borderRadius: '9px',
							fontSize: '0.73rem',
							fontWeight: 700,
							textTransform: 'none',
							paddingX: '14px',
							paddingY: '5px',
							flexShrink: 0,
							minWidth: 'unset',
							letterSpacing: '0.02em',
							background: 'linear-gradient(135deg, #b45309, #f59e0b)',
							color: '#fff',
							boxShadow:
								theme.palette.mode === 'dark'
									? '0 0 14px rgba(245,158,11,0.45), 0 2px 6px rgba(0,0,0,0.3)'
									: '0 0 12px rgba(245,158,11,0.3), 0 2px 6px rgba(180,83,9,0.2)',
							transition: 'box-shadow 0.2s ease, transform 0.15s ease',
							'&:hover': {
								background: 'linear-gradient(135deg, #92400e, #b45309)',
								boxShadow:
									theme.palette.mode === 'dark'
										? '0 0 24px rgba(245,158,11,0.6), 0 4px 10px rgba(0,0,0,0.3)'
										: '0 0 22px rgba(245,158,11,0.5), 0 4px 10px rgba(180,83,9,0.25)',
								transform: 'scale(1.04)'
							}
						})}
						endIcon={
							<FuseSvgIcon size={13}>
								{radio.transcription?.language_orientation === 'rtl'
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

export default RadioCard;