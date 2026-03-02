export type Level = {
	id?: number;
	name?: string;
};

export type Subscription = {
	id: number;
	start_date: string;
	end_date: string;
	is_active: boolean;
	level: Level;
	reference: string;
};

export type Account = {
	id: number;
	avatar?: string;
	phone?: string;
	address?: string;
	biography?: string;
	is_active: boolean;
	full_name?: string;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	avatar_alt: string;
	avatar_url: string;
	can_edit: boolean;
	roles?: { id: number; name: string }[];
	subscriptions?: Subscription[];
	created_at?: string;
};

export type AccountsResponse = {
	count: number;
	items: Account[];
};

export type GroupedAccounts = {
	group: string;
	children?: Account[];
};

export type AccumulatorAccountsType = Record<string, GroupedAccounts>;