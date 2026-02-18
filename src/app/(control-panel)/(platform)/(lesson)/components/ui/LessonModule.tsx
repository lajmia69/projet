import { darken, lighten } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import { Lesson } from '../../api/types';

type CourseCategoryProps = {
	lesson: Lesson;
};

/**
 * The CourseCategory component.
 */
function LessonModule(props: CourseCategoryProps) {
	const { lesson } = props;

	// const { data: categories } = useCategories();

	// const category = _.find(categories, { slug });

	if (!module) {
		return null;
	}

	return (
		<div
			dir={lesson.transcription.language_orientation}
			className={'flex w-full flex-wrap space-y-2 space-x-2'}
		>
			<Chip
				className="text-md font-semibold"
				label={lesson.module?.subject.name}
				sx={(theme) => ({
					color: lighten(lesson.module?.subject.color, 0.8),
					backgroundColor: darken(lesson.module?.subject.color, 0.1),
					...theme.applyStyles('light', {
						color: darken(lesson.module?.subject.color, 0.4),
						backgroundColor: lighten(lesson.module?.subject.color, 0.8)
					})
				})}
				size="small"
			/>
			<Chip
				className="text-md font-semibold"
				label={lesson.module?.name}
				sx={(theme) => ({
					color: lighten(lesson.module?.color, 0.8),
					backgroundColor: darken(lesson.module?.color, 0.1),
					...theme.applyStyles('light', {
						color: darken(lesson.module?.color, 0.4),
						backgroundColor: lighten(lesson.module?.color, 0.8)
					})
				})}
				size="small"
			/>
		</div>
	);
}

export default LessonModule;
