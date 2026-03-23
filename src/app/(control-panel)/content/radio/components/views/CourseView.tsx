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
import { useRadio } from '../../api/hooks/radio/useRadios';

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
	const [radioId] = params.courseParams as string;
	const { data: account } = useUser();
	const { data: radio, isLoading } = useRadio(account.id, radioId, account.token.access);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	if (isLoading) return <FuseLoading />;
	if (!radio) return null;

	function getSteps() {
		return (radio.transcription?.content ?? []).map((content) => ({
			index: content.index - 1,
			languageOrientation: radio.transcription.language_orientation,
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
					dir={radio.transcription?.language_orientation}
					className="p-6 flex flex-col gap-2"
				>
					{/* Category + status chips */}
					<div className="flex items-center gap-2 flex-wrap">
						{radio.category?.name && (
							<Chip
								label={radio.category.name}
								size="small"
								sx={(theme) => ({
									fontSize: '0.68rem',
									fontWeight: 700,
									letterSpacing: '0.04em',
									textTransform: 'uppercase',
									height: 20,
									color: theme.palette.mode === 'dark' ? '#fcd34d' : '#92400e',
									backgroundColor:
										theme.palette.mode === 'dark'
											? 'rgba(245,158,11,0.18)'
											: 'rgba(245,158,11,0.1)',
									border:
										theme.palette.mode === 'dark'
											? '1px solid rgba(245,158,11,0.3)'
											: '1px solid rgba(245,158,11,0.3)'
								})}
							/>
						)}
						{radio.is_published && (
							<Chip
								label="On Air"
								size="small"
								color="warning"
								sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
							/>
						)}
						{radio.is_approved_content && (
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
						{radio.name}
					</Typography>

					{/* Author */}
					{radio.transcription?.author && (
						<Typography
							color="text.secondary"
							className="text-md"
						>
							{radio.transcription.author}
						</Typography>
					)}

					{/* Meta */}
					<div className="flex items-center gap-4 mt-1 flex-wrap">
						{(radio.streaming_version?.duration || radio.hd_version?.duration) && (
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
											radio.streaming_version?.duration || radio.hd_version?.duration
										}
										format="long"
									/>
								</Typography>
							</div>
						)}
						{radio.language?.name && (
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
									{radio.language.name}
								</Typography>
							</div>
						)}
						{radio.created_by?.full_name && (
							<div className="flex items-center gap-1.5">
								<FuseSvgIcon
									size={14}
									color="disabled"
								>
									lucide:radio
								</FuseSvgIcon>
								<Typography
									className="text-sm"
									color="text.secondary"
								>
									{radio.created_by.full_name}
								</Typography>
							</div>
						)}
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4">
					{radio.description && (
						<>
							<Typography
								color="text.secondary"
								className="text-sm mb-4"
							>
								{radio.description}
							</Typography>
							<Divider className="mb-4" />
						</>
					)}

					{radio.hd_version?.src || radio.streaming_version?.src ? (
						<Player
							steps={getSteps()}
							playlist={[
								{
									src: radio.hd_version?.src || radio.streaming_version?.src,
									timestamp: radio.hd_version?.timestamp || 0
								}
							]}
							transcription={radio.transcription}
						/>
					) : (
						<div className="flex flex-1 items-center justify-center py-16">
							<Typography color="text.disabled">No audio available for this program.</Typography>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default CourseView;