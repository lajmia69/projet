import { redirect } from 'next/navigation';

function RadioApp() {
	redirect(`/radio/episodes`);
	return null;
}

export default RadioApp;