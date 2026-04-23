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
import Player from '@/components/Player';
import { useStudioAuth } from '../../../../studio/api/hooks/useStudioauth'; // ✅ Fix: import added
import { useLinkedStudioProject } from '../../../../studio/api/hooks/useLinkedStudioProject'; // ✅ Fix: import added
import { useGetProjectAudios } from '../../../../studio/api/hooks/audio/useGetProjectAudios'; // ✅ Fix: import added

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

function ReportageDetailView({ reportageId }: ReportageDetailViewProps) {
	const { data: account, isLoading: accountLoading } = useUser();
	const { data: reportage, isLoading: reportageLoading, isError } = useReportage(
		account?.id,
		account?.token?.access,
		reportageId,
	);

	// ── Studio audio fallback ─────────────────────────────────────────────────
	useStudioAuth(); // ✅ Fix: inject auth token so Studio API calls don't get 401
	const { data: linkedProject } = useLinkedStudioProject('radio_reportage', Number(reportageId)); // ✅ Fix: added
	const { data: studioAudios = [] } = useGetProjectAudios(linkedProject?.id); // ✅ Fix: added

	if (!account || accountLoading || reportageLoading) return <FuseLoading />;
	if (!reportage || isError) {
		return (
			<div className="flex flex-1 items-center justify-center py-32">
				<div className="flex flex-col items-center gap-3">
					<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:newspaper</FuseSvgIcon>
					<Typography color="text.secondary" className="text-xl font-semibold">Reportage not found</Typography>
					<Button component={Link} to="/content/radio/reportages" variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none' }}>
						Back to Reportages
					</Button>
				</div>
			</div>
		);
	}

	// ── Safe transcription ────────────────────────────────────────────────────
	const transcription = safeTranscription(reportage.transcription);
	const langOrientation = transcription.language_orientation;
	const hasContent = transcription.content.length > 0;

	function getSteps() {
		const content = reportage?.transcription?.content;
		if (!content || !Array.isArray(content) || content.length === 0) return [];
		return content.map((c: any) => ({
			index: (c?.index ?? 1) - 1,
			languageOrientation: reportage?.transcription?.language_orientation ?? 'ltr',
			speaker: c?.speaker ?? '',
			time: c?.time ?? '',
			timestamp: c?.timestamp ?? 0,
			text: c?.text ?? '',
		}));
	}

	// Radio API versions take priority; fall back to Studio audio ✅ Fix
	const radioAudioSrc = reportage.hd_version?.src || reportage.streaming_version?.src || null;
	const studioAudioSrc = studioAudios[0]?.src || null;
	const audioSrc = radioAudioSrc || studioAudioSrc; // ✅ Fix

	const radioAudioDuration = reportage.streaming_version?.duration || reportage.hd_version?.duration || null;
	const studioAudioDuration = studioAudios[0]?.duration || null;
	const audioDuration = radioAudioDuration || studioAudioDuration; // ✅ Fix

	const hasRadioVersions = !!(reportage.streaming_version || reportage.hd_version || reportage.teaser_version); // ✅ Fix

	return (
		<Root
			scroll="page"
			header={
				<div
					style={{
						position: 'relative', width: '100%', overflow: 'hidden',
						background: 'linear-gradient(160deg, #0d0a1a 0%, #1a0e35 50%, #100a20 100%)',
						paddingTop: '56px', paddingBottom: '64px',
					}}
				>
					<div
						style={{
							position: 'absolute', inset: 0,
							backgroundImage: `linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
							                  linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)`,
							backgroundSize: '52px 52px',
						}}
					/>
					<div
						style={{
							position: 'absolute', top: '-80px', right: '-100px',
							width: '420px', height: '420px', borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(109,40,217,0.22) 0%, transparent 65%)',
							pointerEvents: 'none',
						}}
					/>

					<div className="relative mx-auto max-w-5xl px-6" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.35 } }}>
							<Button
								component={Link} to="/content/radio/reportages" size="small"
								startIcon={<FuseSvgIcon size={14}>lucide:arrow-left</FuseSvgIcon>}
								sx={{ color: 'rgba(221,214,254,0.55)', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', mb: 3, '&:hover': { color: '#c4b5fd' } }}
							>
								All Reportages
							</Button>
						</motion.div>

						<div className="flex flex-col gap-4">
							<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.4 } }} className="flex flex-wrap gap-2">
								{reportage.reportage_type?.name && (
									<Chip label={reportage.reportage_type.name} size="small"
										sx={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', height: 22, color: '#c4b5fd', backgroundColor: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)' }}
									/>
								)}
								{reportage.season?.name && (
									<Chip label={reportage.season.name} size="small"
										sx={{ fontSize: '0.7rem', fontWeight: 600, height: 22, color: 'rgba(221,214,254,0.6)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
									/>
								)}
								{reportage.is_published && (
									<Chip label="On Air" size="small"
										sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, color: '#c4b5fd', backgroundColor: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)' }}
									/>
								)}
							</motion.div>

							<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.45 } }}>
								<Typography component="h1" dir={langOrientation}
									sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }, fontWeight: 800, color: '#ede9fe', textShadow: '0 2px 32px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>
									{reportage.name}
								</Typography>
							</motion.div>

							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.16, duration: 0.4 } }} className="flex flex-wrap items-center gap-4">
								{transcription.author && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(221,214,254,0.5)' }}>lucide:user</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(221,214,254,0.6)' }}>{transcription.author}</Typography>
									</div>
								)}
								{reportage.language?.name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(221,214,254,0.5)' }}>lucide:globe</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(221,214,254,0.6)' }}>{reportage.language.name}</Typography>
									</div>
								)}
								{reportage.created_by?.full_name && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: 'rgba(221,214,254,0.5)' }}>lucide:newspaper</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', color: 'rgba(221,214,254,0.6)' }}>{reportage.created_by.full_name}</Typography>
									</div>
								)}
								{audioDuration && (
									<div className="flex items-center gap-1.5">
										<FuseSvgIcon size={14} sx={{ color: VIOLET }}>lucide:clock</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: VIOLET }}>
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
					{reportage.description && (
						<motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4 } }}>
							<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: VIOLET, mb: 1.5 }}>
								About
							</Typography>
							<Typography dir={langOrientation} sx={{ fontSize: '0.975rem', color: 'text.secondary', lineHeight: 1.85, maxWidth: '72ch' }}>
								{reportage.description}
							</Typography>
						</motion.section>
					)}

					<Divider sx={{ borderColor: 'rgba(139,92,246,0.12)' }} />

					{/* Player — Radio API audio first, then Studio audio fallback */}
					<motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.4 } }}>
						{audioSrc ? (
							<Player
								steps={getSteps()}
								playlist={[{ src: audioSrc, timestamp: reportage.hd_version?.timestamp ?? 0 }]}
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
										style={{ borderColor: 'rgba(139,92,246,0.2)' }}
									>
										<Typography variant="subtitle2" sx={{ color: VIOLET, mb: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
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
					<Divider sx={{ borderColor: 'rgba(139,92,246,0.12)' }} />
					<motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }}>
						<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: VIOLET, mb: 2 }}>
							Media Versions
						</Typography>

						{/* Radio API versions */}
						{hasRadioVersions && (
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								<AudioBlock label="Streaming" audio={reportage.streaming_version} accentColor={VIOLET} />
								<AudioBlock label="HD" audio={reportage.hd_version} accentColor={VIOLET_DEEP} />
								<AudioBlock label="Teaser" audio={reportage.teaser_version} accentColor="#c4b5fd" />
							</div>
						)}

						{/* Studio audio files (shown when no Radio API versions exist) ✅ Fix */}
						{!hasRadioVersions && studioAudios.length > 0 && (
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{studioAudios.map((audio) => (
									<AudioBlock
										key={audio.id}
										label={audio.type_label || 'Studio'}
										audio={{ name: audio.name, duration: audio.duration, format: audio.format }}
										accentColor={VIOLET}
									/>
								))}
							</div>
						)}

						{/* No versions at all ✅ Fix */}
						{!hasRadioVersions && studioAudios.length === 0 && (
							<Typography color="text.disabled" variant="body2">
								No audio versions available.
							</Typography>
						)}
					</motion.section>

					{/* Tags */}
					{reportage.tags && reportage.tags.length > 0 && (
						<>
							<Divider sx={{ borderColor: 'rgba(139,92,246,0.12)' }} />
							<motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.4 } }}>
								<Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: VIOLET, mb: 1.5 }}>
									Tags
								</Typography>
								<div className="flex flex-wrap gap-2">
									{reportage.tags.map((tag) => (
										<Chip key={tag} label={tag} size="small"
											sx={(theme) => ({
												fontSize: '0.75rem', fontWeight: 500, borderRadius: '8px',
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

					{/* Publishing footer */}
					{(reportage.publishing_date || reportage.view_number != null) && (
						<>
							<Divider sx={{ borderColor: 'rgba(139,92,246,0.12)' }} />
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }} className="flex flex-wrap gap-6">
								{reportage.publishing_date && (
									<MetaBadge icon="lucide:calendar" label={new Date(reportage.publishing_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })} />
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