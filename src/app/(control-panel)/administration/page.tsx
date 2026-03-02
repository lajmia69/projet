import { redirect } from 'next/navigation';

function AdministrationPage() {
	redirect(`/administration/dashboard`);
	return null;
}

export default AdministrationPage;
