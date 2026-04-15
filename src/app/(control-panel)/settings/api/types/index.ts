// Matches UserSchema from backend
export type SettingsUser = {
	id?: number | null;
	username: string;
	first_name?: string | null;
	last_name?: string | null;
	email?: string | null;
};

// Matches AuthAccountSchema from GET /account/signin/{account_id}/
export type SettingsAccount = {
	id?: number | null;
	user: SettingsUser;
	full_name: string;
	avatar?: string;
	avatar_url: string;
	avatar_alt: string;
	phone: string;
	address?: string | null;
	biography?: string | null;
	is_active?: boolean;
};

// Matches UpdateAccountSchema for PUT /account/update/{current_account_id}/
export type UpdateAccountPayload = {
	id?: number | null;
	user: {
		username: string;
		first_name?: string | null;
		last_name?: string | null;
		email?: string | null;
	};
	phone: string;
	address?: string | null;
	biography?: string | null;
};

// Matches UpdateAccountPasswordSchema for PATCH /account/update/password/{current_account_id}/{account_id}/
export type SettingsSecurity = {
	password: string;
	new_password: string;
	new_password_verification: string;
};
