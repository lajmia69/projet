'use client';

import { redirect, useParams } from 'next/navigation';
import SubscriptionForm from '../../components/forms/SubscriptionForm';

function SubscriptionPage() {
	const { subscriptionId } = useParams<{ subscriptionId: string }>();

	if (subscriptionId === 'new') {
		return <SubscriptionForm isNew />;
	}

	redirect(`/administration/subscriptions/${subscriptionId}/view`);

	return null;
}

export default SubscriptionPage;