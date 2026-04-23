'use client';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import { styled } from '@mui/material/styles';
import useUser from '@auth/useUser';
import { useEpisode } from '../../api/hooks/Radiohooks';
import DurationDisplay from '../ui/Durationdisplay';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 },
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' },
}));

const TEAL = '#14b8a6';
const TEAL_DEEP = '#0d9488';

interface EpisodeDetailViewProps {
	episodeId: string;
}

function MetaBadge({ icon, label }: { icon: string; label: React.ReactNode }) {
	return (
		<div className="flex items-center gap-1.5">
			<FuseSvgIcon size={14} sx={{ color: TEAL }}>{icon}</FuseSvgIcon>
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

function EpisodeDetailView({ episodeId }: EpisodeDetailViewProps) {
	const { data: account, isLoading: accountLoading } = useUser();
	const { data: episode, isLoading: episodeLoading, isError, fetchStatus } = useEpisode(
		account?.id,
		account?.token?.access,
		episodeId,
	);

	// Show loading while account resolves OR while the query is actively fetching
	if (accountLoading || episodeLoading || fetchStatus === 'fetching') return <FuseLoading />;
	if (!episode || isError) {
		return (
			<div className="flex flex-1 items-center justify-center py-32">
				<div className="flex flex-col items-center gap-3">
					<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:mic-2</FuseSvgIcon>
					<Typography color="text.secondary" className="text-xl font-semibold">
						Episode not found
					</Typography>
					<Button
						component={Link}
						to="/content/radio/episodes"
						variant="outlined"
						sx={{ borderRadius: '10px', textTransform: 'none' }}
					>
						Back to Episodes
					</Button>
				</div>
			</div>
		);
	}

	const dir = episode.transcription?.language_orientation ?? 'ltr';

	return (
		<Root
			scroll="page"
			header={
				<div
					style={{
						position: 'relative',
						width: '100%',
						overflow: 'hidden',
						background: 'linear-gradient(160deg, #0a1512 0%, #082b25 50%, #071a16 100%)',
						paddingTop: '56px',
						paddingBottom: '64px',
					}}
				>
					{/* Grid overlay */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundImage: `linear-gradient(rgba(20,184,166,0.04) 1px, transparent 1px),
							                  linear-gradient(90deg, rgba(20,184,166,0.04) 1px, transparent 1px)`,
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
							background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, transparent 65%)',
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
								to="/content/radio/episodes"
								size="small"
								startIcon={<FuseSvgIcon size={14}>lucide:arrow-left</FuseSvgIcon>}
								sx={{
									color: 'rgba(153,246,228,0.55)',
									textTransform: 'none',
									fontWeight: 600,
									fontSize: '0.8rem',
									mb: 3,
									'&:hover': { color: '#5eead4' },
								}}
							>
								All Episodes
							</Button>
						</motion.div>

						<div className="flex flex-col gap-4">
							{/* Chips */}
							<motion.div
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.4 } }}
								className="flex flex-wrap gap-2"
							>
								{episode.emission_type?.name && (
									<Chip
										label={episode.emission_type.name}
										size="small"
										sx={{
											fontSize: '0.7rem',
											fontWeight: 700,
											letterSpacing: '0.05em',
											textTransform: 'uppercase',
											height: 22,
											color: '#5eead4',
											backgroundColor: 'rgba(20,184,166,0.18)',
											border: '1px solid rgba(20,184,166,0.35)',
										}}
									/>
								)}
								{episode.season?.name && (
									<Chip
										label={episode.season.name}
										size="small"
										sx={{
											fontSize: '0.7rem',
											fontWeight: 600,
											height: 22,
											color: 'rgba(153,246,228,0.6)',
											backgroundColor: 'rgba(255,255,255,0.06)',
											border: '1px solid rgba(255,255,255,0.1)',
										}}
									/>
								)}
								{episode.episode_number != null && (
									<Chip
										label={`Episode ${episode.episode_number}`}
										size="small"
										sx={{
											fontSize: '0.7rem',
											fontWeight: 700,
											height: 22,
											color: '#5eead4',
											backgroundColor: 'rgba(20,184,166,0.12)',
											border: '1px solid rgba(20,184,166,0.3)',
										}}
									/>
								)}
								{episode.is_published && (
									<Chip
										label="On Air"
										size="small"
										sx={{
											height: 22,
											fontSize: '0.7rem',
											fontWeight: 700,
											color: '#5eead4',
											backgroundColor: 'rgba(20,184,166,0.15)',
											border: '1px solid rgba(20,184,166,0.4)',
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
										color: '#ccfbf1',
										textShadow: '0 2px 32px rgba(0,0,0,0.5)',
										lineHeight: 1.2,
									}}
								>
									{episode.name}
								</Typography>
							</motion.div>

							{/* Meta row */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.16, duration: 0.4 } }}
								className="flex flex-wrap items-center gap-4"
							>
								{episode.transcription?.author && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(153,246,228,0.5)' }}>lucide:user</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(153,246,228,0.6)' }}>
											{episode.transcription.author}
										</Typography>
									</div>
								)}
								{episode.language?.name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(153,246,228,0.5)' }}>lucide:globe</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(153,246,228,0.6)' }}>
											{episode.language.name}
										</Typography>
									</div>
								)}
								{episode.created_by?.full_name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(153,246,228,0.5)' }}>lucide:mic-2</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(153,246,228,0.6)' }}>
											{episode.created_by.full_name}
										</Typography>
									</div>
								)}
								{(episode.streaming_version?.duration || episode.hd_version?.duration) && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: TEAL }}>lucide:clock</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: TEAL }}>
											<DurationDisplay
												isoDuration={episode.streaming_version?.duration || episode.hd_version?.duration}
												format="short"
											/>
										</Typography>
									</div>
								)}
							</motion.div>

							{/* Parent Emission link */}
							{episode.emission?.name && (
								<motion.div
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.35 } }}
								>
									<Button
										component={Link}
										to={`/content/radio/emissions/${episode.emission.id}`}
										size="small"
										startIcon={<FuseSvgIcon size={13}>lucide:radio</FuseSvgIcon>}
										sx={{
											color: 'rgba(153,246,228,0.55)',
											textTransform: 'none',
											fontSize: '0.8rem',
											fontWeight: 600,
											'&:hover': { color: '#5eead4' },
										}}
									>
										Emission: {episode.emission.name}
									</Button>
								</motion.div>
							)}
						</div>
					</div>
				</div>
			}
			content={
				<div className="mx-auto w-full max-w-5xl p-4 pt-8 pb-16 flex flex-col gap-8">
					{/* Description */}
					{episode.description && (
						<motion.section
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } }}
						>
							<Typography
								sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEAL, mb: 1.5 }}
							>
								About
							</Typography>
							<Typography dir={dir} sx={{ fontSize: '0.975rem', color: 'text.secondary', lineHeight: 1.85, maxWidth: '72ch' }}>
								{episode.description}
							</Typography>
						</motion.section>
					)}

					<Divider sx={{ borderColor: 'rgba(20,184,166,0.12)' }} />

					{/* Audio versions */}
					<motion.section
						initial={{ opacity: 0, y: 14 }}
						animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.4 } }}
					>
						<Typography
							sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEAL, mb: 2 }}
						>
							Audio Versions
						</Typography>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<AudioBlock label="Streaming" audio={episode.streaming_version} accentColor={TEAL} />
							<AudioBlock label="HD" audio={episode.hd_version} accentColor={TEAL_DEEP} />
							<AudioBlock label="Teaser" audio={episode.teaser_version} accentColor="#5eead4" />
						</div>
					</motion.section>

					{/* Guests */}
					{episode.guests && episode.guests.length > 0 && (
						<>
							<Divider sx={{ borderColor: 'rgba(20,184,166,0.12)' }} />
							<motion.section
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }}
							>
								<Typography
									sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEAL, mb: 2 }}
								>
									Guests
								</Typography>
								<div className="flex flex-col gap-3 max-w-xl">
									{episode.guests.map((guest) => (
										<div
											key={guest.id}
											className="flex items-start gap-3 rounded-xl p-3"
											style={{
												border: '1px solid rgba(20,184,166,0.2)',
												background: 'rgba(20,184,166,0.04)',
											}}
										>
											<Avatar
												sx={{
													width: 36,
													height: 36,
													fontSize: '0.85rem',
													fontWeight: 700,
													bgcolor: 'rgba(20,184,166,0.2)',
													color: TEAL,
												}}
											>
												{guest.full_name?.charAt(0) ?? '?'}
											</Avatar>
											<div className="flex flex-col gap-0.5 min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'text.primary' }}>
														{guest.full_name}
													</Typography>
													{guest.guest_type?.name && (
														<Chip
															label={guest.guest_type.name}
															size="small"
															sx={{
																height: 18,
																fontSize: '0.65rem',
																fontWeight: 700,
																color: TEAL,
																backgroundColor: 'rgba(20,184,166,0.1)',
																border: '1px solid rgba(20,184,166,0.25)',
															}}
														/>
													)}
												</div>
												{guest.biography && (
													<Typography
														sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}
														className="line-clamp-2"
													>
														{guest.biography}
													</Typography>
												)}
											</div>
										</div>
									))}
								</div>
							</motion.section>
						</>
					)}

					{/* Tags */}
					{episode.tags && episode.tags.length > 0 && (
						<>
							<Divider sx={{ borderColor: 'rgba(20,184,166,0.12)' }} />
							<motion.section
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.22, duration: 0.4 } }}
							>
								<Typography
									sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEAL, mb: 1.5 }}
								>
									Tags
								</Typography>
								<div className="flex flex-wrap gap-2">
									{episode.tags.map((tag) => (
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
												border: '1px solid rgba(20,184,166,0.18)',
											})}
										/>
									))}
								</div>
							</motion.section>
						</>
					)}

					{/* Transcription */}
					{episode.transcription?.content && episode.transcription.content.length > 0 && (
						<>
							<Divider sx={{ borderColor: 'rgba(20,184,166,0.12)' }} />
							<motion.section
								initial={{ opacity: 0, y: 14 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.4 } }}
							>
								<Typography
									sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEAL, mb: 2 }}
								>
									Transcription
								</Typography>
								<div className="flex flex-col gap-3 max-w-3xl" dir={dir}>
									{episode.transcription.content.slice(0, 12).map((block, i) => (
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
														color: TEAL,
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
													<span style={{ fontWeight: 700, color: TEAL, marginRight: 6 }}>
														{block.speaker}:
													</span>
												)}
												{block.text}
											</Typography>
										</div>
									))}
									{episode.transcription.content.length > 12 && (
										<Typography sx={{ fontSize: '0.8rem', color: 'text.disabled', mt: 1 }}>
											+ {episode.transcription.content.length - 12} more segments
										</Typography>
									)}
								</div>
							</motion.section>
						</>
					)}

					{/* Publishing footer */}
					{(episode.publishing_date || episode.view_number != null) && (
						<>
							<Divider sx={{ borderColor: 'rgba(20,184,166,0.12)' }} />
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, transition: { delay: 0.3 } }}
								className="flex flex-wrap gap-6"
							>
								{episode.publishing_date && (
									<MetaBadge
										icon="lucide:calendar"
										label={new Date(episode.publishing_date).toLocaleDateString(undefined, {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})}
									/>
								)}
								{episode.view_number != null && (
									<MetaBadge icon="lucide:eye" label={`${episode.view_number.toLocaleString()} views`} />
								)}
								{episode.is_approved_content && (
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

export default EpisodeDetailView;