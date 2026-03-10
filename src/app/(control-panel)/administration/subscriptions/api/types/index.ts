export type {
	Account,
	AccountsResponse,
	Subscription,
	SubscriptionsResponse,
	Level,
	Role,
	RoleType,
	Permission
} from '@/app/(control-panel)/administration/accounts/api/types';

export type CreateSubscription = {
	start_date: string;
	end_date: string;
	is_active: boolean;
	level_id: number;
	reference: string;
	account_id: number;
};