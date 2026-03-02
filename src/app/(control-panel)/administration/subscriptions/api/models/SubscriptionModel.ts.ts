import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { Subscription, CreateSubscription } from '../types';

export const SubscriptionModel = (data: PartialDeep<Subscription>): Subscription =>
	_.defaults(data || {}, {
		id: _.uniqueId(),
		start_date: '',
		end_date: '',
		is_active: false,
		level: {},
		reference: '',
		account_id: undefined
	});

export const CreateSubscriptionModel = (data: PartialDeep<CreateSubscription>): CreateSubscription =>
	_.defaults(data || {}, {
		start_date: '',
		end_date: '',
		is_active: false,
		level_id: 0,
		reference: '',
		account_id: 0
	});

export default SubscriptionModel;