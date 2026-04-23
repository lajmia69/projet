import { redirect } from 'next/navigation';

function PodcastApp() {
	redirect('/content/podcast/courses');
	return null;
}

export default PodcastApp;