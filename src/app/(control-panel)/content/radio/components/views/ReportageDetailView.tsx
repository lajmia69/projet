'use client';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import { styled } from '@mui/material/styles';
import useUser from '@auth/useUser';
import { useReportage } from '../../api/hooks/Radiohooks';
import DurationDisplay from '../ui/Durationdisplay';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 },
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' },
}));

const VIOLET = '#8b5cf6';
const VIOLET_DEEP = '#6d28d9';

interface ReportageDetailViewProps {
	reportageId: string;
}

function MetaBadge({ icon, label }: { icon: string; label: React.ReactNode }) {
	return (
		<div className="flex items-center gap-1.5">
			<FuseSvgIcon size={14} sx={{ color: VIOLET }}>{icon}</FuseSvgIcon>
			<Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: 'text.secondary' }}>
				{label}
			</Typography>
		</div>
	);
}

function AudioBlock({
	label,
	audio,
	accentColor,
}: {
	label: string;
	audio: { name?: string; duration?: string; format?: { name?: string; bit_rates?: string } } | null | undefined;
	accentColor: string;
}) {
	if (!audio) return null;
	return (
		<div
			className="flex flex-col gap-1 rounded-xl p-3"
			style={{ border: `1px solid ${accentColor}33`, background: `${accentColor}0a` }}
		>
			<Typography
				sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accentColor }}
			>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
				{audio.name || '—'}
			</Typography>
			<div className="flex flex-wrap gap-3 mt-0.5">
				{audio.duration && (
					<MetaBadge icon="lucide:clock" label={<DurationDisplay isoDuration={audio.duration} format="short" />} />
				)}
				{audio.format?.name && <MetaBadge icon="lucide:file-audio" label={audio.format.name} />}
				{audio.format?.bit_rates && <MetaBadge icon="lucide:activity" label={`${audio.format.bit_rates} kbps`} />}
			</div>
		</div>
	);
}

function ReportageDetailView({ reportageId }: ReportageDetailViewProps) {
	const { data: account, isLoading: accountLoading } = useUser();
	const { data: reportage, isLoading: reportageLoading, isError, fetchStatus } = useReportage(
		account?.id,
		account?.token?.access,
		reportageId,
	);

	// Show loading while account resolves OR while the query is actively fetching
	if (accountLoading || reportageLoading || fetchStatus === 'fetching') return <FuseLoading />;
	if (!reportage || isError) {
		return (
			<div className="flex flex-1 items-center justify-center py-32">
				<div className="flex flex-col items-center gap-3">
					<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:newspaper</FuseSvgIcon>
					<Typography color="text.secondary" className="text-xl font-semibold">
						Reportage not found
					</Typography>
					<Button
						component={Link}
						to="/content/radio/reportages"
						variant="outlined"
						sx={{ borderRadius: '10px', textTransform: 'none' }}
					>
						Back to Reportages
					</Button>
				</div>
			</div>
		);
	}

	const dir = reportage.transcription?.language_orientation ?? 'ltr';

	return (
		<Root
			scroll="page"
			header={
				<div
					style={{
						position: 'relative',
						width: '100%',
						overflow: 'hidden',
						background: 'linear-gradient(160deg, #0d0a1a 0%, #1a0e35 50%, #100a20 100%)',
						paddingTop: '56px',
						paddingBottom: '64px',
					}}
				>
					{/* Grid overlay */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundImage: `linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
							                  linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)`,
							backgroundSize: '52px 52px',
						}}
					/>
					{/* Glow orb */}
					<div
						style={{
							position: 'absolute',
							top: '-80px',
							right: '-100px',
							width: '420px',
							height: '420px',
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(109,40,217,0.22) 0%, transparent 65%)',
							pointerEvents: 'none',
						}}
					/>

					<div className="relative mx-auto max-w-5xl px-6" style={{ zIndex: 1 }}>
						{/* Back link */}
						<motion.div
							initial={{ opacity: 0, x: -12 }}
							animate={{ opacity: 1, x: 0, transition: { duration: 0.35 } }}
						>
							<Button
								component={Link}
								to="/content/radio/reportages"
								size="small"
								startIcon={<FuseSvgIcon size={14}>lucide:arrow-left</FuseSvgIcon>}
								sx={{
									color: 'rgba(221,214,254,0.55)',
									textTransform: 'none',
									fontWeight: 600,
									fontSize: '0.8rem',
									mb: 3,
									'&:hover': { color: '#c4b5fd' },
								}}
							>
								All Reportages
							</Button>
						</motion.div>

						<div className="flex flex-col gap-4">
							{/* Chips */}
							<motion.div
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.4 } }}
								className="flex flex-wrap gap-2"
							>
								{reportage.reportage_type?.name && (
									<Chip
										label={reportage.reportage_type.name}
										size="small"
										sx={{
											fontSize: '0.7rem',
											fontWeight: 700,
											letterSpacing: '0.05em',
											textTransform: 'uppercase',
											height: 22,
											color: '#c4b5fd',
											backgroundColor: 'rgba(139,92,246,0.18)',
											border: '1px solid rgba(139,92,246,0.35)',
										}}
									/>
								)}
								{reportage.season?.name && (
									<Chip
										label={reportage.season.name}
										size="small"
										sx={{
											fontSize: '0.7rem',
											fontWeight: 600,
											height: 22,
											color: 'rgba(221,214,254,0.6)',
											backgroundColor: 'rgba(255,255,255,0.06)',
											border: '1px solid rgba(255,255,255,0.1)',
										}}
									/>
								)}
								{reportage.is_published && (
									<Chip
										label="On Air"
										size="small"
										sx={{
											height: 22,
											fontSize: '0.7rem',
											fontWeight: 700,
											color: '#c4b5fd',
											backgroundColor: 'rgba(139,92,246,0.15)',
											border: '1px solid rgba(139,92,246,0.4)',
										}}
									/>
								)}
							</motion.div>

							{/* Title */}
							<motion.div
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.45 } }}
							>
								<Typography
									component="h1"
									dir={dir}
									sx={{
										fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
										fontWeight: 800,
										color: '#ede9fe',
										textShadow: '0 2px 32px rgba(0,0,0,0.5)',
										lineHeight: 1.2,
									}}
								>
									{reportage.name}
								</Typography>
							</motion.div>

							{/* Meta row */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.16, duration: 0.4 } }}
								className="flex flex-wrap items-center gap-4"
							>
								{reportage.transcription?.author && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(221,214,254,0.5)' }}>lucide:user</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(221,214,254,0.6)' }}>
											{reportage.transcription.author}
										</Typography>
									</div>
								)}
								{reportage.language?.name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(221,214,254,0.5)' }}>lucide:globe</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(221,214,254,0.6)' }}>
											{reportage.language.name}
										</Typography>
									</div>
								)}
								{reportage.created_by?.full_name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(221,214,254,0.5)' }}>lucide:newspaper</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(221,214,254,0.6)' }}>
											{reportage.created_by.full_name}
										</Typography>
									</div>
								)}
								{(reportage.streaming_version?.duration || reportage.hd_version?.duration) && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: VIOLET }}>lucide:clock</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: VIOLET }}>
											<DurationDisplay
												isoDuration={reportage.streaming_version?.duration || reportage.hd_version?.duration}
												format="short"
											/>
										</Typography>
									</div>
								)}
							</motion.div>
						</div>
					</div>
				</div>
			}
			content={
				<div className="mx-auto w-full max-w-5xl p-4 pt-8 pb-16 flex flex-col gap-8">
					{/* Description */}
					{reportage.description && (
						<motion.section
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } }}
						>
							<Typography
								sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: VIOLET, mb: 1.5 }}
							>
								About
							</Typography>
							<Typography dir={dir} sx={{ fontSize: '0.975rem', color: 'text.secondary', lineHeight: 1.85, maxWidth: '72ch' }}>
								{reportage.description}
							</Typography>
						</motion.section>
					)}

					<Divider sx={{ borderColor: 'rgba(139,92,246,0.12)' }} />

					{/* Audio versions */}
					<motion.section
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.4 } }}
					>
						<Typography
							sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: VIOLET, mb: 2 }}
						>
							Media Versions
						</Typography>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<AudioBlock label="Streaming" audio={reportage.streaming_version} accentColor={VIOLET} />
							<AudioBlock label="HD" audio={reportage.hd_version} accentColor={VIOLET_DEEP} />
							<AudioBlock label="Teaser" audio={reportage.teaser_version} accentColor="#c4b5fd" />
						</div>
					</motion.section>

					{/* Tags */}
					{reportage.tags && reportage.tags.length > 0 && (
						<>
							<Divider sx={{ borderColor: 'rgba(139,92,246,0.12)' }} />
							<motion.section
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }}
							>
								<Typography
									sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: VIOLET, mb: 1.5 }}
								>
									Tags
								</Typography>
								<div className="flex flex-wrap gap-2">
									{reportage.tags.map((tag) => (
										<Chip
											key={tag}
											label={tag}
											size="small"
											sx={(theme) => ({
												fontSize: '0.75rem',
												fontWeight: 500,
												borderRadius: '8px',
												color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
												backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
												border: '1px solid rgba(139,92,246,0.18)',
											})}
										/>
									))}
								</div>
							</motion.section>
						</>
					)}

					{/* Transcription */}
					{reportage.transcription?.content && reportage.transcription.content.length > 0 && (
						<>
							<Divider sx={{ borderColor: 'rgba(139,92,246,0.12)' }} />
							<motion.section
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.4 } }}
							>
								<Typography
									sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: VIOLET, mb: 2 }}
								>
									Transcription
								</Typography>
								<div className="flex flex-col gap-3 max-w-3xl" dir={dir}>
									{reportage.transcription.content.slice(0, 12).map((block, i) => (
										<div
											key={i}
											className="flex gap-3"
											style={{ paddingTop: block.is_new_paragraph ? '8px' : 0 }}
										>
											{block.time && (
												<Typography
													sx={{
														fontSize: '0.7rem',
														fontWeight: 700,
														color: VIOLET,
														minWidth: 48,
														mt: '2px',
														flexShrink: 0,
														fontVariantNumeric: 'tabular-nums',
													}}
												>
													{block.time}
												</Typography>
											)}
											<Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.75 }}>
												{block.speaker && (
													<span style={{ fontWeight: 700, color: VIOLET, marginRight: 6 }}>
														{block.speaker}:
													</span>
												)}
												{block.text}
											</Typography>
										</div>
									))}
									{reportage.transcription.content.length > 12 && (
										<Typography sx={{ fontSize: '0.8rem', color: 'text.disabled', mt: 1 }}>
											+ {reportage.transcription.content.length - 12} more segments
										</Typography>
									)}
								</div>
							</motion.section>
						</>
					)}

					{/* Publishing footer */}
					{(reportage.publishing_date || reportage.view_number != null) && (
						<>
							<Divider sx={{ borderColor: 'rgba(139,92,246,0.12)' }} />
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, transition: { delay: 0.3 } }}
								className="flex flex-wrap gap-6"
							>
								{reportage.publishing_date && (
									<MetaBadge
										icon="lucide:calendar"
										label={new Date(reportage.publishing_date).toLocaleDateString(undefined, {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									/>
								)}
								{reportage.view_number != null && (
									<MetaBadge icon="lucide:eye" label={`${reportage.view_number.toLocaleString()} views`} />
								)}
								{reportage.is_approved_content && (
									<MetaBadge icon="lucide:shield-check" label="Approved" />
								)}
							</motion.div>
						</>
					)}
				</div>
			}
		/>
	);
}

export default ReportageDetailView;