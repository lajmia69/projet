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
import { useEmission } from '../../api/hooks/Radiohooks';
import DurationDisplay from '../ui/Durationdisplay';
import Player from '@/components/Player';
import { useStudioAuth } from '../../../../studio/api/hooks/useStudioauth';
import { useLinkedStudioProject, useLinkedStudioProjectTasks } from '../../../../studio/api/hooks/useLinkedStudioProject';
import { useGetTaskAudio } from '../../../../studio/api/hooks/audio/usegettaskaudio';

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

function MetaBadge({ icon, label }: { icon: string; label: React.ReactNode }) {
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
			style={{ border: `1px solid ${accentColor}33`, background: `${accentColor}0a` }}
		>
			<Typography sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accentColor }}>
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

function EmissionDetailView({ emissionId }: EmissionDetailViewProps) {
	const { data: account, isLoading: accountLoading } = useUser();
	const { data: emission, isLoading: emissionLoading, isError } = useEmission(
		account?.id,
		account?.token?.access,
		emissionId,
	);

	// ── Studio audio fallback ─────────────────────────────────────────────────
	// ── Studio audio ─ scoped to the task linked to this specific emission ────────
	// Mirrors Lesson: resolve the one audio attached to the content item's
	// own studio task, never [0] from a shared project-wide list.
	useStudioAuth(); // inject auth token so Studio API calls don't get 401
	const { data: linkedProject } = useLinkedStudioProject('radio_emission', Number(emissionId));
	const { data: linkedTasks = [] } = useLinkedStudioProjectTasks(linkedProject?.id);
	const linkedTaskId = linkedTasks[0]?.id ?? null;
	const { data: taskAudio } = useGetTaskAudio(linkedProject?.id, linkedTaskId);

	if (!account || accountLoading || emissionLoading) return <FuseLoading />;
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

	// ── Safe transcription ────────────────────────────────────────────────────
	const transcription = safeTranscription(emission.transcription);
	const langOrientation = transcription.language_orientation;
	const hasContent = transcription.content.length > 0;

	function getSteps() {
		const content = emission?.transcription?.content;
		if (!content || !Array.isArray(content) || content.length === 0) return [];
		return content
			.filter((c): c is NonNullable<typeof c> => c != null)
			.map((c) => ({
				index: Math.max(0, (c.index ?? 1) - 1),
				languageOrientation: emission?.transcription?.language_orientation ?? 'ltr',
				speaker: c.speaker ?? '',
				time: c.time ?? '',
				timestamp: c.timestamp ?? 0,
				text: c.text ?? '',
			}));
	}

	// Radio API versions take priority; fall back to Studio audio ✅ Fix
	const radioAudioSrc = emission.hd_version?.src || emission.streaming_version?.src || null;
	// Use the task-linked studio audio only — never [0] from the full list
	const studioAudioSrc = taskAudio?.src ?? null;
	const audioSrc = radioAudioSrc || studioAudioSrc;

	const radioAudioDuration = emission.streaming_version?.duration || emission.hd_version?.duration || null;
	const studioAudioDuration = taskAudio?.duration ?? null;
	const audioDuration = radioAudioDuration || studioAudioDuration;

	const hasRadioVersions = !!(emission.streaming_version || emission.hd_version || emission.teaser_version);

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
					<div
						style={{
							position: 'absolute', inset: 0,
							backgroundImage: `linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),
							                  linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)`,
							backgroundSize: '52px 52px',
						}}
					/>
					<div
						style={{
							position: 'absolute', top: '-80px', right: '-100px',
							width: '420px', height: '420px', borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(180,83,9,0.2) 0%, transparent 65%)',
							pointerEvents: 'none',
						}}
					/>

					<div className="relative mx-auto max-w-5xl px-6" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.35 } }}>
							<Button
								component={Link}
								to="/content/radio/emissions"
								size="small"
								startIcon={<FuseSvgIcon size={14}>lucide:arrow-left</FuseSvgIcon>}
								sx={{ color: 'rgba(253,230,138,0.55)', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', mb: 3, '&:hover': { color: '#fcd34d' } }}
							>
								All Emissions
							</Button>
						</motion.div>

						<div className="flex flex-col gap-4">
							<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.4 } }} className="flex flex-wrap gap-2">
								{emission.emission_type?.name && (
									<Chip label={emission.emission_type.name} size="small"
										sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', height: 22, color: '#fcd34d', backgroundColor: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)' }}
									/>
								)}
								{emission.season?.name && (
									<Chip label={emission.season.name} size="small"
										sx={{ fontSize: '0.7rem', fontWeight: 600, height: 22, color: 'rgba(253,230,138,0.6)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
									/>
								)}
								{emission.is_published && (
									<Chip label="On Air" size="small"
										sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, color: '#fcd34d', backgroundColor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)' }}
									/>
								)}
							</motion.div>

							<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.45 } }}>
								<Typography component="h1" dir={langOrientation}
									sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }, fontWeight: 800, color: '#fef3c7', textShadow: '0 2px 32px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>
									{emission.name}
								</Typography>
							</motion.div>

							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.16, duration: 0.4 } }} className="flex flex-wrap items-center gap-4">
								{transcription.author && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,230,138,0.5)' }}>lucide:user</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,230,138,0.6)' }}>{transcription.author}</Typography>
									</div>
								)}
								{emission.language?.name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,230,138,0.5)' }}>lucide:globe</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,230,138,0.6)' }}>{emission.language.name}</Typography>
									</div>
								)}
								{emission.created_by?.full_name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(253,230,138,0.5)' }}>lucide:radio</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(253,230,138,0.6)' }}>{emission.created_by.full_name}</Typography>
									</div>
								)}
								{audioDuration && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: AMBER }}>lucide:clock</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: AMBER }}>
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
					{/* Description */}
					{emission.description && (
						<motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } }}>
							<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: AMBER, mb: 1.5 }}>
								About
							</Typography>
							<Typography dir={langOrientation} sx={{ fontSize: '0.975rem', color: 'text.secondary', lineHeight: 1.85, maxWidth: '72ch' }}>
								{emission.description}
							</Typography>
						</motion.section>
					)}

					<Divider sx={{ borderColor: 'rgba(245,158,11,0.12)' }} />

					{/* Player — Radio API audio first, then Studio audio fallback */}
					<motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.4 } }}>
						{audioSrc ? (
							<Player
								steps={getSteps()}
								playlist={[{ src: audioSrc, timestamp: emission.hd_version?.timestamp ?? 0 }]}
								transcription={transcription as any}
							/>
						) : (
							<div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
								<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:audio-lines</FuseSvgIcon>
								<Typography color="text.secondary" variant="h6">No audio available yet</Typography>
								<Typography color="text.disabled" variant="body2">
									Audio will appear here once it has been uploaded and processed.
								</Typography>

								{hasContent && (
									<div
										dir={langOrientation}
										className="mt-6 w-full max-w-2xl space-y-3 rounded-xl border border-dashed p-6"
										style={{ borderColor: 'rgba(245,158,11,0.2)' }}
									>
										<Typography variant="subtitle2" sx={{ color: AMBER, mb: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
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
					</motion.section>

					{/* Audio version info cards */}
					<Divider sx={{ borderColor: 'rgba(245,158,11,0.12)' }} />
					<motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }}>
						<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: AMBER, mb: 2 }}>
							Audio Versions
						</Typography>

						{/* Radio API versions */}
						{hasRadioVersions && (
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								<AudioBlock label="Streaming" audio={emission.streaming_version} accentColor={AMBER} />
								<AudioBlock label="HD" audio={emission.hd_version} accentColor={AMBER_DEEP} />
								<AudioBlock label="Teaser" audio={emission.teaser_version} accentColor="#fcd34d" />
							</div>
						)}

						{/* Studio audio files (shown when no Radio API versions exist) ✅ Fix */}
						{!hasRadioVersions && taskAudio && (
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{[taskAudio].map((audio) => (
									<AudioBlock
										key={audio.id}
										label={audio.type_label || 'Studio'}
										audio={{ name: audio.name, duration: audio.duration, format: audio.format }}
										accentColor={AMBER}
									/>
								))}
							</div>
						)}

						{/* No versions at all ✅ Fix */}
						{!hasRadioVersions && !taskAudio && (
							<Typography color="text.disabled" variant="body2">
								No audio versions available.
							</Typography>
						)}
					</motion.section>

					{/* Tags */}
					{emission.tags && emission.tags.length > 0 && (
						<>
							<Divider sx={{ borderColor: 'rgba(245,158,11,0.12)' }} />
							<motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.4 } }}>
								<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: AMBER, mb: 1.5 }}>
									Tags
								</Typography>
								<div className="flex flex-wrap gap-2">
									{emission.tags.map((tag) => (
										<Chip key={tag} label={tag} size="small"
											sx={(theme) => ({
												fontSize: '0.75rem', fontWeight: 500, borderRadius: '8px',
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

					{/* Publishing info footer */}
					{(emission.publishing_date || emission.view_number != null) && (
						<>
							<Divider sx={{ borderColor: 'rgba(245,158,11,0.12)' }} />
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }} className="flex flex-wrap gap-6">
								{emission.publishing_date && (
									<MetaBadge icon="lucide:calendar" label={new Date(emission.publishing_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
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