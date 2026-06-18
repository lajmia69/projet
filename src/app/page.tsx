import { redirect } from 'next/navigation';

function MainPage() {
	redirect(`/platform/dashboard/welcome`);
	return null;
}

export default MainPage;
