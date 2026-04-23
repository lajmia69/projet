'use client';
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
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { useEpisode } from '../../api/hooks/Radiohooks';
import DurationDisplay from '../ui/Durationdisplay';
import Player from '@/components/Player';
import { useLinkedStudioProject } from '../../../../studio/api/hooks/useLinkedStudioProject';
import { useGetProjectAudios } from '../../../../studio/api/hooks/audio/useGetProjectAudios';
import { useStudioAuth } from '../../../../studio/api/hooks/useStudioauth'; // ✅ Fix 1: import added

// ─── Safe transcription helper ────────────────────────────────────────────────

function safeTranscription(raw: unknown): {
	title?: string;
	author?: string;
	source?: string;
	language_orientation: string;
	is_original?: boolean;
	type?: string;
	content: Array<{
		index: number;
		type: string;
		paragraph: number;
		is_new_paragraph: boolean;
		text: string;
		speaker: string;
		time: string;
		timestamp: number;
	}>;
} {
	if (!raw || typeof raw !== 'object') return { language_orientation: 'ltr', content: [] };
	const t = raw as Record<string, unknown>;
	return {
		...t,
		language_orientation: typeof t.language_orientation === 'string' ? t.language_orientation : 'ltr',
		content: Array.isArray(t.content) ? t.content : [],
	} as ReturnType<typeof safeTranscription>;
}

// ─────────────────────────────────────────────────────────────────────────────

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.vars.palette.divider,
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {},
}));

interface EpisodeDetailViewProps {
	episodeId: string;
}

function EpisodeDetailView({ episodeId }: EpisodeDetailViewProps) {
	const { data: account, isLoading: accountLoading } = useUser();
	const { data: episode, isLoading: episodeLoading, isError } = useEpisode(
		account?.id,
		account?.token?.access,
		episodeId,
	);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	// ── Studio audio fallback ─────────────────────────────────────────────────
	useStudioAuth(); // ✅ Fix 1: inject auth token so Studio API calls don't get 401
	const { data: linkedProject } = useLinkedStudioProject('radio_episode', Number(episodeId));
	const { data: studioAudios = [] } = useGetProjectAudios(linkedProject?.id);

	if (!account || accountLoading || episodeLoading) return <FuseLoading />;

	if (!episode || isError) {
		return (
			<Root
				scroll={isMobile ? 'page' : 'content'}
				header={
					<div className="p-6">
						<Typography variant="h6">Episode not found</Typography>
					</div>
				}
				content={
					<div className="flex flex-1 items-center justify-center py-16">
						<div className="flex flex-col items-center gap-3">
							<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:mic-2</FuseSvgIcon>
							<Typography color="text.disabled">This episode could not be loaded.</Typography>
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
				}
			/>
		);
	}

	// ── Safe transcription ────────────────────────────────────────────────────
	const transcription = safeTranscription(episode.transcription);
	const langOrientation = transcription.language_orientation;
	const hasContent = transcription.content.length > 0;

	function getSteps() {
		const content = episode?.transcription?.content;
		if (!content || !Array.isArray(content) || content.length === 0) return [];
		return content
			.filter((c): c is NonNullable<typeof c> => c != null)
			.map((c) => ({
				index: Math.max(0, (c?.index ?? 1) - 1),
				languageOrientation: episode?.transcription?.language_orientation ?? 'ltr',
				speaker: c?.speaker ?? '',
				time: c?.time ?? '',
				timestamp: c?.timestamp ?? 0,
				text: c?.text ?? '',
			}));
	}

	// Radio API versions take priority; fall back to Studio audio
	const radioAudioSrc = episode.hd_version?.src || episode.streaming_version?.src || null;
	const studioAudioSrc = studioAudios[0]?.src || null;
	const audioSrc = radioAudioSrc || studioAudioSrc;

	const radioAudioDuration = episode.streaming_version?.duration || episode.hd_version?.duration || null;
	const studioAudioDuration = studioAudios[0]?.duration || null;
	const audioDuration = radioAudioDuration || studioAudioDuration;

	const hasRadioVersions = !!(episode.streaming_version || episode.hd_version || episode.teaser_version);

	return (
		<Root
			scroll={isMobile ? 'page' : 'content'}
			header={
				<div dir={langOrientation} className="p-6 flex flex-col gap-2">
					{/* Back link */}
					<div className="mb-1">
						<Button
							component={Link}
							to="/content/radio/episodes"
							size="small"
							startIcon={<FuseSvgIcon size={14}>lucide:arrow-left</FuseSvgIcon>}
							sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: 'text.secondary' }}
						>
							All Episodes
						</Button>
					</div>

					{/* Status / meta chips */}
					<div className="flex items-center gap-2 flex-wrap">
						{episode.emission_type?.name && (
							<Chip
								label={episode.emission_type.name}
								size="small"
								sx={(theme) => ({
									fontSize: '0.68rem',
									fontWeight: 700,
									letterSpacing: '0.04em',
									textTransform: 'uppercase',
									height: 20,
									color: theme.palette.mode === 'dark' ? '#93c5fd' : '#1d4ed8',
									backgroundColor:
										theme.palette.mode === 'dark'
											? 'rgba(59,130,246,0.18)'
											: 'rgba(59,130,246,0.1)',
									border:
										theme.palette.mode === 'dark'
											? '1px solid rgba(99,179,237,0.3)'
											: '1px solid rgba(59,130,246,0.25)',
								})}
							/>
						)}
						{episode.season?.name && (
							<Chip
								label={episode.season.name}
								size="small"
								sx={{ fontSize: '0.68rem', fontWeight: 600, height: 20 }}
							/>
						)}
						{episode.episode_number != null && (
							<Chip
								label={`Episode ${episode.episode_number}`}
								size="small"
								sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20 }}
							/>
						)}
						{episode.is_published && (
							<Chip
								label="On Air"
								size="small"
								color="success"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
							/>
						)}
						{episode.is_approved_content && (
							<Chip
								label="Approved"
								size="small"
								color="info"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
							/>
						)}
					</div>

					{/* Title */}
					<Typography variant="h4" className="font-semibold">
						{episode.name}
					</Typography>

					{/* Author from transcription (optional) */}
					{transcription.author && (
						<Typography color="text.secondary" className="text-md">
							{transcription.author}
						</Typography>
					)}

					{/* Meta row */}
					<div className="flex items-center gap-4 mt-1 flex-wrap">
						{audioDuration && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:clock</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									<DurationDisplay isoDuration={audioDuration} format="long" />
								</Typography>
							</div>
						)}
						{episode.language?.name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:globe</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{episode.language.name}
								</Typography>
							</div>
						)}
						{episode.emission?.name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:radio</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{episode.emission.name}
								</Typography>
							</div>
						)}
						{episode.created_by?.full_name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:mic-2</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{episode.created_by.full_name}
								</Typography>
							</div>
						)}
						{episode.publishing_date && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:calendar</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{new Date(episode.publishing_date).toLocaleDateString(undefined, {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</Typography>
							</div>
						)}
						{episode.view_number != null && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:eye</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{episode.view_number.toLocaleString()} views
								</Typography>
							</div>
						)}
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4">
					{/* Description */}
					{episode.description && (
						<>
							<Typography dir={langOrientation} color="text.secondary" className="text-sm mb-4">
								{episode.description}
							</Typography>
							<Divider className="mb-4" />
						</>
					)}

					{/* Player — Radio API audio first, then Studio audio fallback */}
					{audioSrc ? (
						<Player
							steps={getSteps()}
							playlist={[{
								src: audioSrc,
								timestamp: episode.hd_version?.timestamp ?? 0, // ✅ Fix 2: removed studioAudios[0]?.timestamp (AudioFile has no timestamp field)
							}]}
							transcription={transcription as any}
						/>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
							<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:audio-lines</FuseSvgIcon>
							<Typography color="text.secondary" variant="h6">No audio available yet</Typography>
							<Typography color="text.disabled" variant="body2">
								Audio will appear here once it has been uploaded and processed.
							</Typography>

							{hasContent && (
								<div
									dir={langOrientation}
									className="mt-6 w-full max-w-2xl space-y-3 rounded-xl border border-dashed p-6"
									style={{ borderColor: 'rgba(0,0,0,0.12)' }}
								>
									<Typography
										variant="subtitle2"
										color="text.secondary"
										className="mb-4 font-semibold uppercase tracking-widest"
									>
										Transcription
									</Typography>
									{transcription.content.map((item, idx) => (
										<p key={idx} className="text-sm leading-relaxed" style={{ color: 'var(--mui-palette-text-secondary)' }}>
											{item.speaker && (
												<span className="mr-2 font-semibold" style={{ color: 'var(--mui-palette-text-primary)' }}>
													{item.speaker}:
												</span>
											)}
											{item.text}
										</p>
									))}
								</div>
							)}
						</div>
					)}

					{/* Audio Versions */}
					<Divider className="my-4" />
					<Typography
						variant="subtitle2"
						color="text.secondary"
						className="mb-3 font-semibold uppercase tracking-widest text-xs"
					>
						Audio Versions
					</Typography>

					{/* Radio API versions (hd / streaming / teaser) */}
					{hasRadioVersions && (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
							{[
								{ label: 'Streaming', audio: episode.streaming_version },
								{ label: 'HD', audio: episode.hd_version },
								{ label: 'Teaser', audio: episode.teaser_version },
							].map(({ label, audio }) =>
								audio ? (
									<div
										key={label}
										className="flex flex-col gap-1 rounded-xl p-3"
										style={{ border: '1px solid var(--mui-palette-divider)', background: 'var(--mui-palette-background-paper)' }}
									>
										<Typography
											variant="caption"
											sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled' }}
										>
											{label}
										</Typography>
										<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }} color="text.primary">
											{audio.name || '—'}
										</Typography>
										<div className="flex flex-wrap gap-3 mt-0.5">
											{audio.duration && (
												<div className="flex items-center gap-1.5">
													<FuseSvgIcon size={13} color="disabled">lucide:clock</FuseSvgIcon>
													<Typography className="text-xs" color="text.secondary">
														<DurationDisplay isoDuration={audio.duration} format="short" />
													</Typography>
												</div>
											)}
											{audio.format?.name && (
												<div className="flex items-center gap-1.5">
													<FuseSvgIcon size={13} color="disabled">lucide:file-audio</FuseSvgIcon>
													<Typography className="text-xs" color="text.secondary">{audio.format.name}</Typography>
												</div>
											)}
											{audio.format?.bit_rates && (
												<div className="flex items-center gap-1.5">
													<FuseSvgIcon size={13} color="disabled">lucide:activity</FuseSvgIcon>
													<Typography className="text-xs" color="text.secondary">{audio.format.bit_rates} kbps</Typography>
												</div>
											)}
										</div>
									</div>
								) : null
							)}
						</div>
					)}

					{/* Studio audio files (shown when no Radio API versions exist) */}
					{!hasRadioVersions && studioAudios.length > 0 && (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
							{studioAudios.map((audio) => (
								<div
									key={audio.id}
									className="flex flex-col gap-1 rounded-xl p-3"
									style={{ border: '1px solid var(--mui-palette-divider)', background: 'var(--mui-palette-background-paper)' }}
								>
									<Typography
										variant="caption"
										sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled' }}
									>
										{audio.type_label || 'Studio'}
									</Typography>
									<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }} color="text.primary">
										{audio.name || '—'}
									</Typography>
									<div className="flex flex-wrap gap-3 mt-0.5">
										{audio.duration && (
											<div className="flex items-center gap-1.5">
												<FuseSvgIcon size={13} color="disabled">lucide:clock</FuseSvgIcon>
												<Typography className="text-xs" color="text.secondary">
													<DurationDisplay isoDuration={audio.duration} format="short" />
												</Typography>
											</div>
										)}
										{audio.format?.name && (
											<div className="flex items-center gap-1.5">
												<FuseSvgIcon size={13} color="disabled">lucide:file-audio</FuseSvgIcon>
												<Typography className="text-xs" color="text.secondary">{audio.format.name}</Typography>
											</div>
										)}
										{audio.format?.bit_rates && (
											<div className="flex items-center gap-1.5">
												<FuseSvgIcon size={13} color="disabled">lucide:activity</FuseSvgIcon>
												<Typography className="text-xs" color="text.secondary">{audio.format.bit_rates} kbps</Typography>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{/* No versions at all */}
					{!hasRadioVersions && studioAudios.length === 0 && (
						<Typography color="text.disabled" variant="body2" className="mb-4">
							No audio versions available.
						</Typography>
					)}

					{/* Guests */}
					{episode.guests && episode.guests.length > 0 && (
						<>
							<Divider className="my-4" />
							<Typography
								variant="subtitle2"
								color="text.secondary"
								className="mb-3 font-semibold uppercase tracking-widest text-xs"
							>
								Guests
							</Typography>
							<div className="flex flex-col gap-3 max-w-xl mb-4">
								{episode.guests.map((guest) => (
									<div
										key={guest.id}
										className="flex items-start gap-3 rounded-xl p-3"
										style={{ border: '1px solid var(--mui-palette-divider)', background: 'var(--mui-palette-background-paper)' }}
									>
										<Avatar sx={{ width: 36, height: 36, fontSize: '0.85rem', fontWeight: 700 }}>
											{guest.full_name?.charAt(0) ?? '?'}
										</Avatar>
										<div className="flex flex-col gap-0.5 min-w-0">
											<div className="flex items-center gap-2 flex-wrap">
												<Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }} color="text.primary">
													{guest.full_name}
												</Typography>
												{guest.guest_type?.name && (
													<Chip
														label={guest.guest_type.name}
														size="small"
														sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
													/>
												)}
											</div>
											{guest.biography && (
												<Typography sx={{ fontSize: '0.8rem', lineHeight: 1.6 }} color="text.secondary" className="line-clamp-2">
													{guest.biography}
												</Typography>
											)}
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{/* Tags */}
					{episode.tags && episode.tags.length > 0 && (
						<>
							<Divider className="my-4" />
							<Typography
								variant="subtitle2"
								color="text.secondary"
								className="mb-2 font-semibold uppercase tracking-widest text-xs"
							>
								Tags
							</Typography>
							<div className="flex flex-wrap gap-2">
								{episode.tags.map((tag) => (
									<Chip
										key={tag}
										label={tag}
										size="small"
										sx={{ fontSize: '0.75rem', fontWeight: 500, borderRadius: '8px' }}
									/>
								))}
							</div>
						</>
					)}
				</div>
			}
		/>
	);
}

export default EpisodeDetailView;