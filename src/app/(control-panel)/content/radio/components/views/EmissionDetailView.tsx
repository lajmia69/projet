'use client';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import { styled } from '@mui/material/styles';
import useUser from '@auth/useUser';
import { useEmission } from '../../api/hooks/Radiohooks';
import DurationDisplay from '../ui/Durationdisplay';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 },
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' },
}));

const AMBER = '#f59e0b';
const AMBER_DEEP = '#b45309';

interface EmissionDetailViewProps {
	emissionId: string;
}

function MetaBadge({ icon, label }: { icon: string; label: string }) {
	return (
		<div className="flex items-center gap-1.5">
			<FuseSvgIcon size={14} sx={{ color: AMBER }}>{icon}</FuseSvgIcon>
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
			style={{
				border: `1px solid ${accentColor}33`,
				background: `${accentColor}0a`,
			}}
		>
			<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accentColor }}>
				{label}
			</Typography>
			<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary' }}>
				{audio.name || '—'}
			</Typography>
			<div className="flex flex-wrap gap-3 mt-0.5">
				{audio.duration && (
					<MetaBadge icon="lucide:clock" label={<DurationDisplay isoDuration={audio.duration} format="short" /> as unknown as string} />
				)}
				{audio.format?.name && <MetaBadge icon="lucide:file-audio" label={audio.format.name} />}
				{audio.format?.bit_rates && <MetaBadge icon="lucide:activity" label={`${audio.format.bit_rates} kbps`} />}
			</div>
		</div>
	);
}

function EmissionDetailView({ emissionId }: EmissionDetailViewProps) {
	const { data: account, isLoading: accountLoading } = useUser();
	const { data: emission, isLoading: emissionLoading, isError, fetchStatus } = useEmission(
		account?.id,
		account?.token?.access,
		emissionId,
	);

	// Show loading while account resolves OR while the query is actively fetching
	if (accountLoading || emissionLoading || fetchStatus === 'fetching') return <FuseLoading />;
	if (!emission || isError) {
		return (
			<div className="flex flex-1 items-center justify-center py-32">
				<div className="flex flex-col items-center gap-3">
					<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:radio</FuseSvgIcon>
					<Typography color="text.secondary" className="text-xl font-semibold">
						Emission not found
					</Typography>
					<Button component={Link} to="/content/radio/emissions" variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none' }}>
						Back to Emissions
					</Button>
				</div>
			</div>
		);
	}

	const dir = emission.transcription?.language_orientation ?? 'ltr';

	return (
		<Root
			scroll="page"
			header={
				<div
					style={{
						position: 'relative',
						width: '100%',
						overflow: 'hidden',
						background: 'linear-gradient(160deg, #1c1a0f 0%, #2d2408 50%, #1a1505 100%)',
						paddingTop: '56px',
						paddingBottom: '64px',
					}}
				>
					{/* Grid overlay */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundImage: `linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),
							                  linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)`,
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
							background: 'radial-gradient(circle, rgba(180,83,9,0.2) 0%, transparent 65%)',
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
								to="/content/radio/emissions"
								size="small"
								startIcon={<FuseSvgIcon size={14}>lucide:arrow-left</FuseSvgIcon>}
								sx={{
									color: 'rgba(253,230,138,0.55)',
									textTransform: 'none',
									fontWeight: 600,
									fontSize: '0.8rem',
									mb: 3,
									'&:hover': { color: '#fcd34d' },
								}}
							>
								All Emissions
							</Button>
						</motion.div>

						<div className="flex flex-col gap-4">
							{/* Type + Season */}
							<motion.div
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.4 } }}
								className="flex flex-wrap gap-2"
							>
								{emission.emission_type?.name && (
									<Chip
										label={emission.emission_type.name}
										size="small"
										sx={{
											fontSize: '0.7rem',
											fontWeight: 700,
											letterSpacing: '0.05em',
											textTransform: 'uppercase',
											height: 22,
											color: '#fcd34d',
											backgroundColor: 'rgba(245,158,11,0.18)',
											border: '1px solid rgba(245,158,11,0.35)',
										}}
									/>
								)}
								{emission.season?.name && (
									<Chip
										label={emission.season.name}
										size="small"
										sx={{
											fontSize: '0.7rem',
											fontWeight: 600,
											height: 22,
											color: 'rgba(253,230,138,0.6)',
											backgroundColor: 'rgba(255,255,255,0.06)',
											border: '1px solid rgba(255,255,255,0.1)',
										}}
									/>
								)}
								{emission.is_published && (
									<Chip
										label="On Air"
										size="small"
										sx={{
											height: 22,
											fontSize: '0.7rem',
											fontWeight: 700,
											color: '#fcd34d',
											backgroundColor: 'rgba(245,158,11,0.15)',
											border: '1px solid rgba(245,158,11,0.4)',
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
										color: '#fef3c7',
										textShadow: '0 2px 32px rgba(0,0,0,0.5)',
										lineHeight: 1.2,
									}}
								>
									{emission.name}
								</Typography>
							</motion.div>

							{/* Author + meta row */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.16, duration: 0.4 } }}
								className="flex flex-wrap items-center gap-4"
							>
								{emission.transcription?.author && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,230,138,0.5)' }}>lucide:user</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,230,138,0.6)' }}>
											{emission.transcription.author}
										</Typography>
									</div>
								)}
								{emission.language?.name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,230,138,0.5)' }}>lucide:globe</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,230,138,0.6)' }}>
											{emission.language.name}
										</Typography>
									</div>
								)}
								{emission.created_by?.full_name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,230,138,0.5)' }}>lucide:radio</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,230,138,0.6)' }}>
											{emission.created_by.full_name}
										</Typography>
									</div>
								)}
								{(emission.streaming_version?.duration || emission.hd_version?.duration) && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: AMBER }}>lucide:clock</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: AMBER }}>
											<DurationDisplay
												isoDuration={emission.streaming_version?.duration || emission.hd_version?.duration}
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
					{emission.description && (
						<motion.section
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } }}
						>
							<Typography
								sx={{
									fontSize: '0.72rem',
									fontWeight: 700,
									letterSpacing: '0.08em',
									textTransform: 'uppercase',
									color: AMBER,
									mb: 1.5,
								}}
							>
								About
							</Typography>
							<Typography
								dir={dir}
								sx={{
									fontSize: '0.975rem',
									color: 'text.secondary',
									lineHeight: 1.85,
									maxWidth: '72ch',
								}}
							>
								{emission.description}
							</Typography>
						</motion.section>
					)}

					<Divider sx={{ borderColor: 'rgba(245,158,11,0.12)' }} />

					{/* Audio versions */}
					<motion.section
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.4 } }}
					>
						<Typography
							sx={{
								fontSize: '0.72rem',
								fontWeight: 700,
								letterSpacing: '0.08em',
								textTransform: 'uppercase',
								color: AMBER,
								mb: 2,
							}}
						>
							Audio Versions
						</Typography>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<AudioBlock label="Streaming" audio={emission.streaming_version} accentColor={AMBER} />
							<AudioBlock label="HD" audio={emission.hd_version} accentColor={AMBER_DEEP} />
							<AudioBlock label="Teaser" audio={emission.teaser_version} accentColor="#fcd34d" />
						</div>
					</motion.section>

					{/* Tags */}
					{emission.tags && emission.tags.length > 0 && (
						<>
							<Divider sx={{ borderColor: 'rgba(245,158,11,0.12)' }} />
							<motion.section
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }}
							>
								<Typography
									sx={{
										fontSize: '0.72rem',
										fontWeight: 700,
										letterSpacing: '0.08em',
										textTransform: 'uppercase',
										color: AMBER,
										mb: 1.5,
									}}
								>
									Tags
								</Typography>
								<div className="flex flex-wrap gap-2">
									{emission.tags.map((tag) => (
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
												border: '1px solid rgba(245,158,11,0.18)',
											})}
										/>
									))}
								</div>
							</motion.section>
						</>
					)}

					{/* Transcription excerpt */}
					{emission.transcription?.content && emission.transcription.content.length > 0 && (
						<>
							<Divider sx={{ borderColor: 'rgba(245,158,11,0.12)' }} />
							<motion.section
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.4 } }}
							>
								<Typography
									sx={{
										fontSize: '0.72rem',
										fontWeight: 700,
										letterSpacing: '0.08em',
										textTransform: 'uppercase',
										color: AMBER,
										mb: 2,
									}}
								>
									Transcription
								</Typography>
								<div
									className="flex flex-col gap-3 max-w-3xl"
									dir={dir}
								>
									{emission.transcription.content.slice(0, 12).map((block, i) => (
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
														color: AMBER,
														minWidth: 48,
														mt: '2px',
														flexShrink: 0,
														fontVariantNumeric: 'tabular-nums',
													}}
												>
													{block.time}
												</Typography>
											)}
											<Typography
												sx={{
													fontSize: '0.9rem',
													color: 'text.secondary',
													lineHeight: 1.75,
												}}
											>
												{block.speaker && (
													<span style={{ fontWeight: 700, color: AMBER, marginRight: 6 }}>
														{block.speaker}:
													</span>
												)}
												{block.text}
											</Typography>
										</div>
									))}
									{emission.transcription.content.length > 12 && (
										<Typography
											sx={{ fontSize: '0.8rem', color: 'text.disabled', mt: 1 }}
										>
											+ {emission.transcription.content.length - 12} more segments
										</Typography>
									)}
								</div>
							</motion.section>
						</>
					)}

					{/* Publishing info footer */}
					{(emission.publishing_date || emission.view_number != null) && (
						<>
							<Divider sx={{ borderColor: 'rgba(245,158,11,0.12)' }} />
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, transition: { delay: 0.3 } }}
								className="flex flex-wrap gap-6"
							>
								{emission.publishing_date && (
									<MetaBadge
										icon="lucide:calendar"
										label={new Date(emission.publishing_date).toLocaleDateString(undefined, {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									/>
								)}
								{emission.view_number != null && (
									<MetaBadge icon="lucide:eye" label={`${emission.view_number.toLocaleString()} views`} />
								)}
								{emission.is_approved_content && (
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

export default EmissionDetailView;