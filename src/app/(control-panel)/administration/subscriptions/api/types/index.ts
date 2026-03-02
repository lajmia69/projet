export type Permission = {
	id: number;
	name: string;
	label: string;
};

export type subscriptionType = {
	id: number;
	name: string;
	description: string;
};

export type subscription = {
	id: number;
	name: string;
	type: subscriptionType;
	permissions: Permission[];
};

export type Createsubscription = {
	name: string;
	type_id: number;
};

export type subscriptionsResponse = {
	count: number;
	items: subscription[];
};

export type subscriptionTypesResponse = {
	count: number;
	items: subscriptionType[];
};
