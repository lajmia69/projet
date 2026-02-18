import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';
import { PartialDeep } from 'type-fest';

/**
 * The type definition for a user object.
 */
export type Permission = {
	id: number;
	name: string;
};

export type Level = {
	id: number;
	name: string;
};

export type Subscription = {
	id: number;
	start_date: string;
	end_date: string;
	is_active: boolean;
	level?: Level;
	reference: string;
};

export type Role = {
	role_id: number;
	id?: number;
	name?: string;
	label?: string;
	permissions?: Permission[];
};

export type UserAccount = {
	id?: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	date_joined?: string;
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

export type Token = {
	id: string;
	access: string;
	refresh: string;
};

export type User = {
	id: string;
	role: string[] | string | null;
	displayName: string;
	photoURL?: string;
	email?: string;
	shortcuts?: string[];
	settings?: PartialDeep<FuseSettingsConfigType>;
	loginRedirectUrl?: string; // The URL to redirect to after login.
	account: Account;
	token: Token;
};
