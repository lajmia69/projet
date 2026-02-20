import { redirect } from 'next/navigation';

function ECommerceApp() {
	redirect(`/administration/roles`);
	return null;
}

export default ECommerceApp;
