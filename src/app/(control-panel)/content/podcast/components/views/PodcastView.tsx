'use client';

import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import useParams from '@fuse/hooks/useParams';
import useUser from '@auth/useUser';
import FuseLoading from '@fuse/core/FuseLoading';
import Player from '@/components/Player';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import DurationDisplay from '../ui/Durationdisplay';
import { usePodcast } from '../../api/hooks/usePodcast';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.vars.palette.divider
	}
}));

function CourseView() {
	const params = useParams();

	// catch-all route [...courseParams] gives an array — grab the first element (the podcast ID)
	const courseParams = params.courseParams as string[];
	const podcastId = Array.isArray(courseParams) ? courseParams[0] : courseParams;

	const { data: account } = useUser();
	const { data: podcast, isLoading } = usePodcast(account.id, podcastId, account.token.access);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	if (isLoading) return <FuseLoading />;
	if (!podcast) return null;

	function getSteps() {
		return (podcast.transcription?.content ?? []).map((content) => ({
			index: content.index - 1,
			languageOrientation: podcast.transcription.language_orientation,
			speaker: content.speaker,
			time: content.time,
			timestamp: content.timestamp,
			text: content.text
		}));
	}

	return (
		<Root
			scroll={isMobile ? 'page' : 'content'}
			header={
				<div
					dir={podcast.transcription?.language_orientation}
					className="p-6 flex flex-col gap-2"
				>
					{/* Category + status chips */}
					<div className="flex items-center gap-2 flex-wrap">
						{podcast.podcast_category?.name && (
							<Chip
								label={podcast.podcast_category.name}
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
						{podcast.is_published && (
							<Chip
								label="Published"
								size="small"
								color="success"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
							/>
						)}
						{podcast.is_approved_content && (
							<Chip
								label="Approved"
								size="small"
								color="info"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
							/>
						)}
					</div>

					{/* Title */}
					<Typography
						variant="h4"
						className="font-semibold"
					>
						{podcast.name}
					</Typography>

					{/* Author */}
					{podcast.transcription?.author && (
						<Typography
							color="text.secondary"
							className="text-md"
						>
							{podcast.transcription.author}
						</Typography>
					)}

					{/* Meta row */}
					<div className="flex items-center gap-4 mt-1 flex-wrap">
						{(podcast.streaming_version?.duration || podcast.hd_version?.duration) && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon
									size={14}
									color="disabled"
								>
									lucide:clock
								</FuseSvgIcon>
								<Typography
									className="text-sm"
									color="text.secondary"
								>
									<DurationDisplay
										isoDuration={
											podcast.streaming_version?.duration || podcast.hd_version?.duration
										}
										format="long"
									/>
								</Typography>
							</div>
						)}
						{podcast.language?.name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon
									size={14}
									color="disabled"
								>
									lucide:globe
								</FuseSvgIcon>
								<Typography
									className="text-sm"
									color="text.secondary"
								>
									{podcast.language.name}
								</Typography>
							</div>
						)}
						{podcast.created_by?.full_name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon
									size={14}
									color="disabled"
								>
									lucide:mic-2
								</FuseSvgIcon>
								<Typography
									className="text-sm"
									color="text.secondary"
								>
									{podcast.created_by.full_name}
								</Typography>
							</div>
						)}
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4">
					{podcast.description && (
						<>
							<Typography
								color="text.secondary"
								className="text-sm mb-4"
							>
								{podcast.description}
							</Typography>
							<Divider className="mb-4" />
						</>
					)}

					{podcast.hd_version?.src || podcast.streaming_version?.src ? (
						<Player
							steps={getSteps()}
							playlist={[
								{
									src: podcast.hd_version?.src || podcast.streaming_version?.src,
									timestamp: podcast.hd_version?.timestamp || 0
								}
							]}
							transcription={podcast.transcription}
						/>
					) : (
						<div className="flex flex-1 items-center justify-center py-16">
							<Typography color="text.disabled">No audio available for this episode.</Typography>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default CourseView;