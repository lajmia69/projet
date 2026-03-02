import { FuseSettingsConfigType } from '@fuse/core/FuseSettings/FuseSettings';
import { PartialDeep } from 'type-fest';

/**
 * The type definition for a user object.
 */

export type UserAuthAccount = {
	id?: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	date_joined?: string;
};

export type LevelAuthAccount = {
	id?: number;
	username: string;
};

export type AuthAccount = {
	id: number;
	user: UserAuthAccount;
	role: [string];
	level: LevelAuthAccount;
	full_name: string;
	avatar_alt: string;
	avatar_url: string;
	notifications: number;
	avatar: string;
	is_active: boolean;
	phone: string;
	address: string;
	biography: string;
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
	account: AuthAccount;
	token: Token;
};
