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

function LessonView() {
	const params = useParams();
	const [lessonId] = params.lessonParams as string;
	const { data: account } = useUser();
	const { data: lesson, isLoading } = useLesson(account.id, lessonId, account.token.access);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	if (isLoading) {
		return <FuseLoading />;
	}

	if (!lesson) {
		return (
			<Root
				scroll={isMobile ? 'page' : 'content'}
				header={<div className="p-6"><Typography variant="h6">Lesson not found</Typography></div>}
				content={
					<div className="flex flex-1 items-center justify-center py-16">
						<Typography color="text.disabled">This lesson could not be loaded.</Typography>
					</div>
				}
			/>
		);
	}

	const transcriptionContent = lesson.transcription != null && Array.isArray(lesson.transcription.content)
		? lesson.transcription.content
		: [];

	const langOrientation = lesson.transcription?.language_orientation ?? 'ltr';

	function getSteps() {
    if (!lesson?.transcription?.content || !Array.isArray(lesson.transcription.content)) {
        return [];
    }
    return lesson.transcription.content.map((content) => ({
        index: content.index - 1,
        languageOrientation: lesson.transcription.language_orientation,
        speaker: content.speaker,
        time: content.time,
        timestamp: content.timestamp,
        text: content.text
    }));
}

	const audioSrc = lesson.hd_version?.src || lesson.streaming_version?.src;
	const audioTimestamp = lesson.hd_version?.timestamp ?? lesson.streaming_version?.timestamp ?? 0;
	const audioDuration = lesson.streaming_version?.duration || lesson.hd_version?.duration;

	return (
		<Root
			scroll={isMobile ? 'page' : 'content'}
			header={
				<div
					dir={langOrientation}
					className="p-6 flex flex-col gap-2"
				>
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
											: '1px solid rgba(59,130,246,0.25)'
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
										: undefined
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

					<Typography variant="h4" className="font-semibold">
						{lesson.name}
					</Typography>

					{lesson.transcription?.author && (
						<Typography color="text.secondary" className="text-md">
							{lesson.transcription.author}
						</Typography>
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
						{lesson.language?.name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:globe</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{lesson.language.name}
								</Typography>
							</div>
						)}
						{lesson.module?.name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:book-open</FuseSvgIcon>
								<Typography className="text-sm" color="text.secondary">
									{lesson.module.name}
								</Typography>
							</div>
						)}
						{lesson.created_by?.full_name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon size={14} color="disabled">lucide:mic-2</FuseSvgIcon>
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
					{lesson.description && (
						<>
							<Typography color="text.secondary" className="text-sm mb-4">
								{lesson.description}
							</Typography>
							<Divider className="mb-4" />
						</>
					)}

					{(lesson.hd_version?.src || lesson.streaming_version?.src) ? (
    <Player
        steps={getSteps()}
        playlist={[{ src: lesson.hd_version?.src || lesson.streaming_version?.src, timestamp: lesson.hd_version?.timestamp ?? 0 }]}
        transcription={lesson.transcription}
    />
) : (
    <Typography color="text.disabled">No audio available for this lesson.</Typography>
)}
				</div>
			}
		/>
	);
}

export default LessonView;