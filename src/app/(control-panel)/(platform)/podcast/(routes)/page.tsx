import { redirect } from 'next/navigation';

function PodcastApp() {
	// Ensure this URL matches the file structure of your app
	redirect(`/content/podcast`);
	return null;
}

export default PodcastApp;