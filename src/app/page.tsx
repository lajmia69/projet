import { redirect } from 'next/navigation';

function MainPage() {
	redirect(`/dashboard/welcome`);
	return null;
}

export default MainPage;
