export type ContactPhoneNumber = {
	country: string;
	phoneNumber: string;
	label?: string;
};

export type ContactEmail = {
	email: string;
	label?: string;
};

export type Contact = {
	id: string;
	avatar?: string;
	background?: string;
	name: string;
	emails?: ContactEmail[];
	phoneNumbers?: ContactPhoneNumber[];
	title?: string;
	company?: string;
	birthday?: string;
	address?: string;
	notes?: string;
	tags?: string[];
};

export type Tag = {
	id: string;
	title: string;
};

export type Country = {
	id?: string;
	title?: string;
	iso?: string;
	code?: string;
	flagImagePos?: string;
};

export type GroupedContacts = {
	group: string;
	children?: Contact[];
};

export type AccumulatorType = Record<string, GroupedContacts>;

export type Permission = {
	id: number;
	name: string;
	label: string;
};

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

export type RoleType = {
	id?: number;
	name?: string;
	description?: string;
};

export type Role = {
	id: number;
	name: string;
	type: RoleType;
	permissions: Permission[];
};

export type CreateUserAccount = {
	username?: string;
	first_name?: string;
	last_name?: string;
	email?: string;
};

export type CreateAccount = {
	avatar?: string;
	user?: CreateUserAccount;
	roles?: [number];
	phone?: string;
	address?: string;
	biography?: string;
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
	roles?: [Role];
	subscriptions?: Subscription[];
	created_at?: string;
	hasPassword?: boolean;
};

export type AccountsResponse = {
	count: number;
	items: Account[];
};

export type GroupedAccounts = {
	group: string;
	children?: Account[];
};
export type SubscriptionsResponse = {
  count: number;
  items: Subscription[];
};

export type AccumulatorAccountsType = Record<string, GroupedAccounts>;
