export type Permission = {
	id: number;
	name: string;
	label: string;
};

export type RoleType = {
	id: number;
	name: string;
	description: string;
};

export type Role = {
	id: number;
	name: string;
	type: RoleType;
	permissions: Permission[];
};

export type CreateRole = {
	name: string;
	type_id: number;
};

export type RolesResponse = {
	count: number;
	items: Role[];
};

export type RoleTypesResponse = {
	count: number;
	items: RoleType[];
};
