'use client';

import { redirect, useParams } from 'next/navigation';
// import AccountForm from '@/app/(control-panel)/administration/accounts/components/forms/AccountForm';
// import ContactForm from "@/app/(control-panel)/administration/accounts/components/forms/ContactForm";
import CreateAccountForm from '@/app/(control-panel)/administration/accounts/components/forms/CreateAccountForm';

function AccountPage() {
	const { accountId } = useParams<{ accountId: string }>();

	// console.log('accountId', accountId);
	if (accountId === 'new') {
		return <CreateAccountForm isNew />;
	}

	redirect(`/administration/accounts/${accountId}/view`);

	return null;
}

export default AccountPage;
