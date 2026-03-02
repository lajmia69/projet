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
	account_id?: number;
};

export type CreateSubscription = {
	start_date: string;
	end_date: string;
	is_active: boolean;
	level_id: number;
	reference: string;
	account_id: number;
};

export type SubscriptionsResponse = {
	count: number;
	items: Subscription[];
};

export type GroupedSubscriptions = {
	group: string;
	children?: Subscription[];
};

export type AccumulatorSubscriptionsType = Record<string, GroupedSubscriptions>;