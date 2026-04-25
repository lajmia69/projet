'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import useUser from '@auth/useUser';
import FuseLoading from '@fuse/core/FuseLoading';
import Player from '@/components/Player';
import useThemeMediaQuery from '../../../../../../@fuse/hooks/useThemeMediaQuery';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DurationDisplay from '../ui/Durationdisplay';
import { useEpisode } from '../../api/hooks/Radiohooks';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.vars.palette.divider,
	},
}));

function safeTranscription(raw: unknown) {
	if (!raw || typeof raw !== 'object') return { language_orientation: 'ltr', content: [] };
	const t = raw as Record<string, unknown>;
	return {
		...t,
		language_orientation: typeof t.language_orientation === 'string' ? t.language_orientation : 'ltr',
		content: Array.isArray(t.content) ? t.content : [],
	} as {
		title?: string; author?: string; source?: string;
		language_orientation: string; is_original?: boolean; type?: string;
		content: Array<{ index: number; type: string; paragraph: number;
			is_new_paragraph: boolean; text: string; speaker: string;
			time: string; timestamp: number }>;
	};
}

type Props = { episodeId: string };

function EpisodeDetailView({ episodeId }: Props) {
	const { data: account } = useUser();
	const accessToken = account?.token?.access ?? '';

	const { data: episode, isLoading } = useEpisode(
		account?.id ?? '',
		accessToken,
		episodeId,
	);

	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	if (!account || isLoading) return <FuseLoading />;

	if (!episode) {
		return (
			<Root
				scroll={isMobile ? 'page' : 'content'}
				header={<div className="p-6"><Typography variant="h6">Episode not found</Typography></div>}
				content={
					<div className="flex flex-1 items-center justify-center py-16">
						<Typography color="text.disabled">This episode could not be loaded.</Typography>
					</div>
				}
			/>
		);
	}

	const transcription = safeTranscription(episode.transcription);
	const langOrientation = transcription.language_orientation;
	const hasContent = transcription.content.length > 0;

	const audioSrc = episode.hd_version?.src || episode.streaming_version?.src || null;
	const audioDuration = episode.streaming_version?.duration || episode.hd_version?.duration || null;

	function getSteps() {
		const content = episode?.transcription?.content;
		if (!content || !Array.isArray(content) || content.length === 0) return [];
		return content.map((c: any) => ({
			index: (c?.index ?? 1) - 1,
			languageOrientation: episode?.transcription?.language_orientation ?? 'ltr',
			speaker: c?.speaker ?? '',
			time: c?.time ?? '',
			timestamp: c?.timestamp ?? 0,
			text: c?.text ?? '',
		}));
	}

	return (
		<Root
			scroll={isMobile ? 'page' : 'content'}
			header={
				<div dir={langOrientation} className="p-6 flex flex-col gap-2">
					<div className="flex items-center gap-2 flex-wrap">
						{episode.emission_type?.name && (
							<Chip label={episode.emission_type.name} size="small"
								sx={(theme) => ({
									fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
									textTransform: 'uppercase', height: 20,
									color: theme.palette.mode === 'dark' ? '#5eead4' : '#134e4a',
									backgroundColor: theme.palette.mode === 'dark' ? 'rgba(20,184,166,0.18)' : 'rgba(20,184,166,0.1)',
									border: '1px solid rgba(20,184,166,0.3)',
								})}
							/>
						)}
						{episode.season?.name && <Chip label={episode.season.name} size="small" />}
						{episode.episode_number != null && (
							<Chip label={`Ep. ${episode.episode_number}`} size="small"
								sx={(theme) => ({
									fontSize: '0.68rem', fontWeight: 700, height: 20,
									color: theme.palette.mode === 'dark' ? '#5eead4' : '#0f766e',
									backgroundColor: theme.palette.mode === 'dark' ? 'rgba(20,184,166,0.12)' : 'rgba(20,184,166,0.08)',
									border: '1px solid rgba(20,184,166,0.25)',
								})}
							/>
						)}
						{episode.is_published && (
							<Chip label="On Air" size="small" color="success"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
						)}
						{episode.is_approved_content && (
							<Chip label="Approved" size="small" color="info"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
						)}
					</div>

					<Typography variant="h4" className="font-semibold">{episode.name}</Typography>

					{transcription.author && (
						<Typography color="text.secondary" className="text-md">{transcription.author}</Typography>
					)}

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
								<Typography className="text-sm" color="text.secondary">{episode.language.name}</Typography>
							</div>
						)}
						{episode.emission?.name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:radio</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">{episode.emission.name}</Typography>
							</div>
						)}
						{episode.created_by?.full_name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:mic-2</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">{episode.created_by.full_name}</Typography>
							</div>
						)}
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4">
					{episode.description && (
						<>
							<Typography color="text.secondary" className="text-sm mb-4">{episode.description}</Typography>
							<Divider className="mb-4" />
						</>
					)}

					{audioSrc ? (
						<Player
							steps={getSteps()}
							playlist={[{ src: audioSrc, timestamp: episode.hd_version?.timestamp ?? 0 }]}
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
								<div dir={langOrientation}
									className="mt-6 w-full max-w-2xl space-y-3 rounded-xl border border-dashed p-6"
									style={{ borderColor: 'rgba(0,0,0,0.12)' }}
								>
									<Typography variant="subtitle2" color="text.secondary"
										className="mb-4 font-semibold uppercase tracking-widest">
										Transcription
									</Typography>
									{transcription.content.map((item, idx) => (
										<p key={idx} className="text-sm leading-relaxed"
											style={{ color: 'var(--mui-palette-text-secondary)' }}>
											{item.speaker && (
												<span className="mr-2 font-semibold"
													style={{ color: 'var(--mui-palette-text-primary)' }}>
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
				</div>
			}
		/>
	);
}

export default EpisodeDetailView;