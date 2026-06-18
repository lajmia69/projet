import { redirect } from 'next/navigation';

function LessonApp() {
	redirect(`/lessons`);
	return null;
}

export default LessonApp;
