import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import {
	Account,
	Subscription,
	CreateAccount,
	CreateUserAccount
} from '@/app/(control-panel)/administration/accounts/api/types';

/**
 * The Account Subscription model.
 */
export const SubscriptionModel = (data: PartialDeep<Subscription> | null): Subscription =>
	_.defaults(data || {}, {
		id: _.uniqueId(),
		start_date: '',
		end_date: '',
		is_active: false,
		level: {},
		reference: ''
	});



/**
 * The Account model.
 */
const AccountModel = (data: PartialDeep<Account>): Account =>
	_.defaults(data || {}, {
		id: _.uniqueId(),
		avatar: '',
		phone: '',
		address: '',
		biography: '',
		is_active: false,
		full_name: '',
		username: '',
		first_name: '',
		last_name: '',
		email: '',
		avatar_alt: '',
		avatar_url: '',
		can_edit: false,
		roles: [],
		subscriptions: [],
		created_at: '',
		hasPassword: false
	});

export default AccountModel;

export const CreateUserAccountModel = (data: PartialDeep<CreateUserAccount>): CreateUserAccount =>
	_.defaults(data || {}, {
		username: '',
		first_name: '',
		last_name: '',
		email: ''
	});

export const CreateAccountModel = (data: PartialDeep<CreateAccount>): CreateAccount =>
	_.defaults(data || {}, {
		avatar: '',
		user: {},
		roles: [],
		phone: '',
		address: '',
		biography: ''
	});
