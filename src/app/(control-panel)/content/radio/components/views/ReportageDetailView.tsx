'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import useParams from '@fuse/hooks/useParams';
import { useLesson } from '@/app/(control-panel)/(platform)/(lesson)/api/hooks/lessons/useLesson';
import useUser from '@auth/useUser';
import FuseLoading from '@fuse/core/FuseLoading';
import Player from '@/components/Player';
import useThemeMediaQuery from '../../../../../../@fuse/hooks/useThemeMediaQuery';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DurationDisplay from '../ui/DurationDisplay';
import ReportageDetailView from '@/app/(control-panel)/(platform)/(radio)/components/views/ReportageDetailView';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.vars.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

// ─── Safe transcription helpers ───────────────────────────────────────────────

/**
 * Returns a safe transcription object — never null/undefined.
 * New lessons often have transcription = null or {} with no content array.
 */
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
	if (!raw || typeof raw !== 'object') {
		return { language_orientation: 'ltr', content: [] };
	}

	const t = raw as Record<string, unknown>;

	return {
		...t,
		language_orientation:
			typeof t.language_orientation === 'string' ? t.language_orientation : 'ltr',
		content: Array.isArray(t.content) ? t.content : [],
	} as ReturnType<typeof safeTranscription>;
}

// ─── Component ────────────────────────────────────────────────────────────────

function LessonView() {
	const params = useParams();
	const [lessonId] = params.lessonParams as string;
	const { data: account } = useUser();

	const accountId = account?.id ?? '';
	const accessToken = account?.token?.access ?? '';

	const { data: lesson, isLoading } = useLesson(accountId, lessonId, accessToken);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	if (!account || isLoading) {
		return <FuseLoading />;
	}

	if (!lesson) {
		return (
			<Root
				scroll={isMobile ? 'page' : 'content'}
				header={
					<div className="p-6">
						<Typography variant="h6">Lesson not found</Typography>
					</div>
				}
				content={
					<div className="flex flex-1 items-center justify-center py-16">
						<Typography color="text.disabled">
							This lesson could not be loaded.
						</Typography>
					</div>
				}
			/>
		);
	}

	// ── Safe transcription (handles null / missing content array) ────────────
	const transcription = safeTranscription(lesson.transcription);
	const langOrientation = transcription.language_orientation;
	const hasContent = transcription.content.length > 0;

	function getSteps() {
    console.log('=== transcription raw ===', JSON.stringify(lesson?.transcription));
    console.log('=== content raw ===', lesson?.transcription?.content);
    const content = lesson?.transcription?.content;
    if (!content || !Array.isArray(content) || content.length === 0) return [];
    return content.map((c: any) => ({
        index: (c?.index ?? 1) - 1,
        languageOrientation: lesson?.transcription?.language_orientation ?? 'ltr',
        speaker: c?.speaker ?? '',
        time: c?.time ?? '',
        timestamp: c?.timestamp ?? 0,
        text: c?.text ?? '',
    }));
}

	const audioSrc = lesson.hd_version?.src || lesson.streaming_version?.src || null;
	const audioTimestamp = lesson.hd_version?.timestamp ?? lesson.streaming_version?.timestamp ?? 0;
	const audioDuration = lesson.streaming_version?.duration || lesson.hd_version?.duration || null;

	return (
		<Root
			scroll={isMobile ? 'page' : 'content'}
			header={
				<div
					dir={langOrientation}
					className="p-6 flex flex-col gap-2"
				>
					{/* Status / meta chips */}
					<div className="flex items-center gap-2 flex-wrap">
						{lesson.lesson_type?.name && (
							<Chip
								label={lesson.lesson_type.name}
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
						{lesson.module?.subject?.name && (
							<Chip
								label={lesson.module.subject.name}
								size="small"
								sx={{
									fontSize: '0.68rem',
									fontWeight: 700,
									height: 20,
									backgroundColor: lesson.module.subject.color
										? `${lesson.module.subject.color}22`
										: undefined,
									color: lesson.module.subject.color ?? undefined,
									border: lesson.module.subject.color
										? `1px solid ${lesson.module.subject.color}55`
										: undefined,
								}}
							/>
						)}
						{lesson.is_published && (
							<Chip
								label="Published"
								size="small"
								color="success"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
							/>
						)}
						{lesson.is_approved_content && (
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
						{lesson.name}
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
								<FuseSvgIcon size={14} color="disabled">
									lucide:clock
								</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									<DurationDisplay isoDuration={audioDuration} format="long" />
								</Typography>
							</div>
						)}
						{lesson.language?.name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">
									lucide:globe
								</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{lesson.language.name}
								</Typography>
							</div>
						)}
						{lesson.module?.name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">
									lucide:book-open
								</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{lesson.module.name}
								</Typography>
							</div>
						)}
						{lesson.created_by?.full_name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">
									lucide:mic-2
								</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{lesson.created_by.full_name}
								</Typography>
							</div>
						)}
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4">
					{/* Description */}
					{lesson.description && (
						<>
							<Typography color="text.secondary" className="text-sm mb-4">
								{lesson.description}
							</Typography>
							<Divider className="mb-4" />
						</>
					)}

					{/* Player — only when audio is available */}
					{audioSrc ? (
						<Player
    steps={getSteps()}
    playlist={[{ src: lesson.hd_version?.src || lesson.streaming_version?.src, timestamp: lesson.hd_version?.timestamp ?? 0 }]}
transcription={transcription as any}/>
					) : (
						<div className="flex flex-1 flex-col items-center justify-center gap-3 py-20">
							<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>
								lucide:audio-lines
							</FuseSvgIcon>
							<Typography color="text.secondary" variant="h6">
								No audio available yet
							</Typography>
							<Typography color="text.disabled" variant="body2">
								Audio will appear here once it has been uploaded and processed.
							</Typography>

							{/* Still show transcription text if present, no audio */}
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
										<p
											key={idx}
											className="text-sm leading-relaxed"
											style={{ color: 'var(--mui-palette-text-secondary)' }}
										>
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
				</div>
			}
		/>
	);
}

export default ReportageDetailView;