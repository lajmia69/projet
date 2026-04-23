import { redirect } from 'next/navigation';

function PodcastApp() {
	redirect(`/podcasts`);
	return null;
}

export default PodcastApp;