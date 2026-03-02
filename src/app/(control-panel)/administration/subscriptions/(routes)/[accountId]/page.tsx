'use client';

import { useParams } from 'next/navigation';
import { redirect } from 'next/navigation';

function AccountSubscriptionPage() {
	const { accountId } = useParams<{ accountId: string }>();
	redirect(`/administration/subscriptions/${accountId}/view`);
	return null;
}

export default AccountSubscriptionPage;