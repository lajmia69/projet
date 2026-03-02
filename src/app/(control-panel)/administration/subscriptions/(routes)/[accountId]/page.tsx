'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AccountSubscriptionPage() {
	const { accountId } = useParams<{ accountId: string }>();
	const router = useRouter();

	useEffect(() => {
		router.replace(`/administration/subscriptions/${accountId}/view`);
	}, [accountId, router]);

	return null;
}

export default AccountSubscriptionPage;