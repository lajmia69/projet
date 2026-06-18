import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import LessonModule from './LessonModule';
import { Lesson } from '../../api/types';
import DurationDisplay from './DurationDisplay';

type CourseInfoProps = {
	lesson: Lesson;
	className?: string;
};

/**
 * The CourseInfo component.
 */
function LessonInfo(props: CourseInfoProps) {
	const { lesson, className } = props;

	if (!lesson) {
		return null;
	}

	return (
		<div
			dir={lesson.transcription.language_orientation}
			className={clsx('w-full', className)}
		>
			<div className="mb-4 flex items-center justify-between">
				<LessonModule lesson={lesson} />

				{/*{course.progress.completed > 0 && (*/}
				{/*	<FuseSvgIcon className="text-green-600">lucide:badge-check</FuseSvgIcon>*/}
				{/*)}*/}
			</div>

			<Typography className="text-lg font-medium">{lesson.name}</Typography>

			<Typography
				className="text-md mt-0.5 line-clamp-2"
				color="text.secondary"
			>
				{lesson.transcription.author}
			</Typography>

			<Divider
				className="mx-0 my-6 w-12"
				sx={{ opacity: 0.6 }}
				variant="middle"
			/>

			<Typography
				className="text-md flex items-center gap-1.5"
				color="text.secondary"
			>
				<FuseSvgIcon color="disabled">lucide:clock</FuseSvgIcon>
				<DurationDisplay
					isoDuration={lesson.streaming_version?.duration || lesson.hd_version?.duration}
					format="long"
				/>
			</Typography>
			<Typography
				className="text-md mt-2 flex items-center gap-1.5"
				color="text.secondary"
			>
				<FuseSvgIcon color="disabled">lucide:graduation-cap</FuseSvgIcon>

				<span className="leading-none whitespace-nowrap">{lesson.created_by.full_name}</span>
				{/*	{course.progress.completed === 1 && 'Completed once'}*/}
				{/*	{course.progress.completed === 2 && 'Completed twice'}*/}
				{/*	{course.progress.completed > 2 && `Completed ${course.progress.completed} times`}*/}
				{/*	{course.progress.completed <= 0 && 'Never completed'}*/}
				{/*</span>*/}
			</Typography>
		</div>
	);
}

export default LessonInfo;
