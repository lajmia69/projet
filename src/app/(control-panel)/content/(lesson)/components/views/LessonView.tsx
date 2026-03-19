'use client';
import FusePageSimple from '@fuse/core/FusePageSimple';
// import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import useParams from '@fuse/hooks/useParams';
import { useLesson } from '@/app/(control-panel)/(platform)/(lesson)/api/hooks/lessons/useLesson';
import useUser from '@auth/useUser';
import FuseLoading from '@fuse/core/FuseLoading';
import Player from '@/components/Player';
import useThemeMediaQuery from '../../../../../../@fuse/hooks/useThemeMediaQuery';
// import '../../i18n';

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
	// const { t } = useTranslation('examplePage');
	const params = useParams();
	const [lessonId] = params.lessonParams as string;
	const { data: account } = useUser();
	const { data: lesson, isLoading } = useLesson(account.id, lessonId, account.token.access);
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	if (isLoading) {
		return <FuseLoading />;
	}

	function getSteps() {
		return lesson.transcription.content.map((content) => {
			// const step = content.text;

			// if (content.timestamp > 0) {
			// console.log({ time: step[0], text: step[1].trim() });
			// const time = content.time;
			// const timestamp = parseInt(time[0]) * 60 + parseInt(time[1]);
			return {
				index: content.index - 1,
				languageOrientation: lesson.transcription.language_orientation,
				speaker: content.speaker,
				time: content.time,
				timestamp: content.timestamp,
				text: content.text
			};
			// } else {
			// 	return { index: index, time: '0:00', timestamp: 0, text: '' };
			// }
		});
	}

	return (
		<Root
			scroll={isMobile ? 'page' : 'content'}
			header={
				<div
					dir={lesson.transcription.language_orientation}
					className="p-6"
				>
					<h4 className={'text-3xl'}>{lesson.name}</h4>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4">
					<h4>Vous ecoutez {lesson.description}</h4>
					<br />
					<Player
						steps={getSteps()}
						playlist={[{ src: lesson.hd_version.src, timestamp: lesson.hd_version.timestamp }]}
						transcription={lesson.transcription}
					/>
				</div>
			}
		/>
	);
}

export default LessonView;
