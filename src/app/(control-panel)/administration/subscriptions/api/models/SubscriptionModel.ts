import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { Subscription } from '@/app/(control-panel)/administration/accounts/api/types';
import { CreateSubscription } from '../types';

export const SubscriptionModel = (data: PartialDeep<Subscription>): Subscription =>
	_.defaults(data || {}, {
		id: 0,
		start_date: '',
		end_date: '',
		is_active: false,
		level: { id: 0, name: '' },
		reference: '',
		account: { id: 0 }
	});

export const CreateSubscriptionModel = (
	data: PartialDeep<CreateSubscription>
): CreateSubscription =>
	_.defaults(data || {}, {
		// Empty strings so the date picker renders blank, not today / end-of-year
		start_date: '',
		end_date: '',
		is_active: false,
		level_id: 0,
		reference: '',
		account_id: 0
	});

export default SubscriptionModel;