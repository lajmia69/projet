import { redirect } from 'next/navigation';

function AcademyApp() {
	redirect(`/content/podcast/courses`);
	return null;
}

export default AcademyApp;
