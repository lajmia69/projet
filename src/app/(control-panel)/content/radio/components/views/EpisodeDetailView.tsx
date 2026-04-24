'use client';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import useUser from '@auth/useUser';
import { useEpisode } from '../../api/hooks/Radiohooks';
import DurationDisplay from '../ui/Durationdisplay';
import UnifiedAudioPlayer from '../../../../studio/utils/UnifiedAudioPlayer';
import { useStudioAuth } from '../../../../studio/api/hooks/useStudioauth';
import { useLinkedStudioProjectForRadio, useLinkedStudioProjectTasksForRadio } from '../../api/hooks/useLinkedStudioProjectForRadio';
import { useGetTaskAudio } from '../../../../studio/api/hooks/audio/usegettaskaudio';
import { createStudioProjectForContent } from '../../../../studio/api/utils/autoCreateStudioProject';
import { useQueryClient } from '@tanstack/react-query';

// Radio content is always stored under studio account 1
const RADIO_STUDIO_ACCOUNT_ID = 1;

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

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 },
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' },
}));

const CRIMSON = '#f43f5e';

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

	useStudioAuth();

	// Linked studio project is always in account 1 for radio content
	const { data: linkedProject } = useLinkedStudioProjectForRadio('radio_episode', Number(episodeId));
	const queryClient = useQueryClient();
	const [autoLinked, setAutoLinked] = useState(false);
	const [linkingInProgress, setLinkingInProgress] = useState(false);

	async function handleLinkStudio() {
		if (!episode) return;
		const token = account?.token?.access ?? '';
		try {
			setLinkingInProgress(true);
			const res = await createStudioProjectForContent(
				RADIO_STUDIO_ACCOUNT_ID,
				token,
				'radio_episode',
				Number(episodeId),
				episode.name ?? `Radio Episode ${episodeId}`,
			);
			if (res?.id) {
				queryClient.invalidateQueries({
					queryKey: ['studio', 'linked-project-radio', 'radio_episode', Number(episodeId)],
				});
			}
		} catch (e) {
			console.error('[Studio] Failed to link Studio project for episode', e);
		} finally {
			setLinkingInProgress(false);
		}
	}

	// Auto-link on first load if not linked yet
	useEffect(() => {
		if (episode && !linkedProject && !autoLinked && !linkingInProgress) {
			handleLinkStudio();
			setAutoLinked(true);
		}
	}, [episode, linkedProject, autoLinked]); // eslint-disable-line react-hooks/exhaustive-deps

	const { data: tasks = [] } = useLinkedStudioProjectTasksForRadio(linkedProject?.id);
	const taskId = tasks[0]?.id;

	// ✅ Pass RADIO_STUDIO_ACCOUNT_ID so audio is fetched from account 1,
	//    not the currently logged-in user's account.
	const { data: taskAudio } = useGetTaskAudio(linkedProject?.id, taskId, RADIO_STUDIO_ACCOUNT_ID);

	if (!account || accountLoading || episodeLoading) return <FuseLoading />;

	if (!episode || isError) {
		return (
			<Root
				scroll="page"
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

	// Prefer audio directly attached to the radio episode; fall back to studio task audio
	const radioAudioSrc = episode.hd_version?.src || episode.streaming_version?.src || null;
	const studioAudioSrc = taskAudio?.src ?? null;
	const finalSrc = radioAudioSrc ?? studioAudioSrc;

	const radioTimestamp = episode.hd_version?.timestamp ?? episode.streaming_version?.timestamp ?? 0;
	const finalTimestamp = radioTimestamp;

	const radioDuration = episode.streaming_version?.duration ?? episode.hd_version?.duration ?? null;
	const studioDuration = taskAudio?.duration ?? null;
	const audioDuration = (radioDuration ?? studioDuration) as string | null;

	const hasRadioVersions = !!(episode.streaming_version || episode.hd_version || episode.teaser_version);

	return (
		<Root
			scroll="page"
			header={
				<div
					style={{
						position: 'relative',
						width: '100%',
						overflow: 'hidden',
						background: 'linear-gradient(160deg, #1a0a0e 0%, #2d0b15 50%, #1a0509 100%)',
						paddingTop: '56px',
						paddingBottom: '64px',
					}}
				>
					<div
						style={{
							position: 'absolute', inset: 0,
							backgroundImage: `linear-gradient(rgba(244,63,94,0.04) 1px, transparent 1px),
							                  linear-gradient(90deg, rgba(244,63,94,0.04) 1px, transparent 1px)`,
							backgroundSize: '52px 52px',
						}}
					/>
					<div
						style={{
							position: 'absolute', top: '-80px', right: '-100px',
							width: '420px', height: '420px', borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(190,18,60,0.22) 0%, transparent 65%)',
							pointerEvents: 'none',
						}}
					/>

					<div className="relative mx-auto max-w-5xl px-6" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.35 } }}>
							<Button
								component={Link}
								to="/content/radio/episodes"
								size="small"
								startIcon={<FuseSvgIcon size={14}>lucide:arrow-left</FuseSvgIcon>}
								sx={{ color: 'rgba(253,205,215,0.55)', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', mb: 3, '&:hover': { color: '#fda4af' } }}
							>
								All Episodes
							</Button>
						</motion.div>

						<div className="flex flex-col gap-4">
							<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.4 } }} className="flex flex-wrap gap-2">
								{episode.emission_type?.name && (
									<Chip label={episode.emission_type.name} size="small"
										sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', height: 22, color: '#fda4af', backgroundColor: 'rgba(244,63,94,0.18)', border: '1px solid rgba(244,63,94,0.35)' }}
									/>
								)}
								{episode.season?.name && (
									<Chip label={episode.season.name} size="small"
										sx={{ fontSize: '0.7rem', fontWeight: 600, height: 22, color: 'rgba(253,205,215,0.6)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
									/>
								)}
								{episode.episode_number != null && (
									<Chip label={`Episode ${episode.episode_number}`} size="small"
										sx={{ fontSize: '0.7rem', fontWeight: 700, height: 22, color: 'rgba(253,205,215,0.6)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
									/>
								)}
								{episode.is_published && (
									<Chip label="On Air" size="small"
										sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, color: '#fda4af', backgroundColor: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.4)' }}
									/>
								)}
								{episode.is_approved_content && (
									<Chip label="Approved" size="small"
										sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, color: '#fda4af', backgroundColor: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)' }}
									/>
								)}
							</motion.div>

							{!linkedProject && (
								<div className="flex items-center gap-2 mt-2 p-2 border border-dashed rounded" style={{ borderColor: 'var(--mui-palette-divider)' }}>
									<FuseSvgIcon size={16} sx={{ color: 'var(--mui-palette-warning-main)' }}>lucide:alert-circle</FuseSvgIcon>
									<Typography variant="caption" color="text.secondary">
										Studio project not linked. Audio from Studio can be surfaced once linked.
									</Typography>
									{linkingInProgress ? (
										<><CircularProgress size={20} sx={{ color: 'var(--mui-palette-warning-main)' }} /><Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>Auto-linking...</Typography></>
									) : (
										<Button variant="outlined" size="small" onClick={handleLinkStudio} sx={{ textTransform: 'none' }}>
											Link Studio Project
										</Button>
									)}
								</div>
							)}

							<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.45 } }}>
								<Typography component="h1" dir={langOrientation}
									sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }, fontWeight: 800, color: '#ffe4e8', textShadow: '0 2px 32px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>
									{episode.name}
								</Typography>
							</motion.div>

							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.16, duration: 0.4 } }} className="flex flex-wrap items-center gap-4">
								{transcription.author && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,205,215,0.5)' }}>lucide:user</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,205,215,0.6)' }}>{transcription.author}</Typography>
									</div>
								)}
								{episode.language?.name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,205,215,0.5)' }}>lucide:globe</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,205,215,0.6)' }}>{episode.language.name}</Typography>
									</div>
								)}
								{episode.emission?.name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,205,215,0.5)' }}>lucide:radio</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,205,215,0.6)' }}>{episode.emission.name}</Typography>
									</div>
								)}
								{episode.created_by?.full_name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,205,215,0.5)' }}>lucide:mic-2</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,205,215,0.6)' }}>{episode.created_by.full_name}</Typography>
									</div>
								)}
								{episode.publishing_date && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,205,215,0.5)' }}>lucide:calendar</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,205,215,0.6)' }}>
											{new Date(episode.publishing_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
										</Typography>
									</div>
								)}
								{episode.view_number != null && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,205,215,0.5)' }}>lucide:eye</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,205,215,0.6)' }}>{episode.view_number.toLocaleString()} views</Typography>
									</div>
								)}
								{audioDuration && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: CRIMSON }}>lucide:clock</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: CRIMSON }}>
											<DurationDisplay isoDuration={audioDuration} format="short" />
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
					{episode.description && (
						<>
							<Typography dir={langOrientation} color="text.secondary" className="text-sm mb-4">
								{episode.description}
							</Typography>
							<Divider className="mb-4" />
						</>
					)}

					{finalSrc ? (
						<UnifiedAudioPlayer
							src={finalSrc}
							timestamp={finalTimestamp}
							transcription={transcription as any}
							steps={getSteps()}
						/>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
							<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:audio-lines</FuseSvgIcon>
							<Typography color="text.secondary" variant="h6">No audio available yet</Typography>
							<Typography color="text.disabled" variant="body2">
								Audio will appear here once it has been uploaded and linked to this episode.
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

					<Divider className="my-4" />

					<Typography
						variant="subtitle2"
						color="text.secondary"
						className="mb-3 font-semibold uppercase tracking-widest text-xs"
					>
						Audio Versions
					</Typography>

					{hasRadioVersions && (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
							{[
								{ label: 'Streaming', ver: episode.streaming_version },
								{ label: 'HD', ver: episode.hd_version },
								{ label: 'Teaser', ver: episode.teaser_version },
							].map(({ label, ver }) =>
								ver ? (
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
											{ver.name || '—'}
										</Typography>
										<audio controls src={ver.src ?? ''} style={{ width: '100%' }} preload="metadata" />
										<div className="flex flex-wrap gap-3 mt-0.5">
											{ver.duration && (
												<div className="flex items-center gap-1.5">
													<FuseSvgIcon size={13} color="disabled">lucide:clock</FuseSvgIcon>
													<Typography className="text-xs" color="text.secondary">
														<DurationDisplay isoDuration={ver.duration} format="short" />
													</Typography>
												</div>
											)}
											{ver.format?.name && (
												<div className="flex items-center gap-1.5">
													<FuseSvgIcon size={13} color="disabled">lucide:file-audio</FuseSvgIcon>
													<Typography className="text-xs" color="text.secondary">{ver.format.name}</Typography>
												</div>
											)}
											{ver.format?.bit_rates && (
												<div className="flex items-center gap-1.5">
													<FuseSvgIcon size={13} color="disabled">lucide:activity</FuseSvgIcon>
													<Typography className="text-xs" color="text.secondary">{ver.format.bit_rates} kbps</Typography>
												</div>
											)}
										</div>
									</div>
								) : null,
							)}
						</div>
					)}

					{taskAudio && !hasRadioVersions && (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
							<div
								className="flex flex-col gap-1 rounded-xl p-3"
								style={{ border: '1px solid var(--mui-palette-divider)', background: 'var(--mui-palette-background-paper)' }}
							>
								<Typography
									variant="caption"
									sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled' }}
								>
									{taskAudio.type_label || 'Studio'}
								</Typography>
								<Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }} color="text.primary">
									{taskAudio.name || '—'}
								</Typography>
								{taskAudio.duration && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={13} color="disabled">lucide:clock</FuseSvgIcon>
										<Typography className="text-xs" color="text.secondary">
											<DurationDisplay isoDuration={taskAudio.duration} format="short" />
										</Typography>
									</div>
								)}
							</div>
						</div>
					)}

					{!finalSrc && !hasRadioVersions && !taskAudio && (
						<Typography color="text.disabled" variant="body2" className="mb-4">
							No audio versions available.
						</Typography>
					)}

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
													<Chip label={guest.guest_type.name} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
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
									<Chip key={tag} label={tag} size="small" sx={{ fontSize: '0.75rem', fontWeight: 500, borderRadius: '8px' }} />
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