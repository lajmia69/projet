import { redirect } from 'next/navigation';

function PodcastApp() {
	redirect(`/content/podcast`);
	return null;
}

export default PodcastApp;