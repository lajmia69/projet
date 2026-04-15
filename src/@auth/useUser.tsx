import { useSession, signOut } from 'next-auth/react';
import { useMemo } from 'react';
import { User } from '@auth/user';
import { authUpdateDbUser } from '@auth/authApi';
import _ from 'lodash';
import setIn from '@/utils/setIn';

type useUser = {
	data: User | null;
	isGuest: boolean;
	isLoading: boolean; // 👈 added
	updateUser: (updates: Partial<User>) => Promise<User | undefined>;
	updateUserSettings: (newSettings: User['settings']) => Promise<User['settings'] | undefined>;
	signOut: () => Promise<void>;
};

function useUser(): useUser {
	const { data, update, status } = useSession(); // 👈 destructure status
	const user = useMemo(() => data?.db, [data]);
	const isGuest = useMemo(() => !user?.role || user?.role?.length === 0, [user]);
	const isLoading = status === 'loading'; // 👈 reliable loading flag from next-auth

	async function handleUpdateUser(_data: Partial<User>) {
		const response = await authUpdateDbUser(_data);

		if (!response.ok) {
			throw new Error('Failed to update user');
		}

		const updatedUser = (await response.json()) as User;

		setTimeout(() => {
			update();
		}, 300);

		return updatedUser;
	}

	async function handleUpdateUserSettings(newSettings: User['settings']) {
		const newUser = setIn(user, 'settings', newSettings) as User;

		if (_.isEqual(user, newUser)) {
			return undefined;
		}

		const updatedUser = await handleUpdateUser(newUser);

		return updatedUser?.settings;
	}

	async function handleSignOut() {
		return signOut();
	}

	return {
		data: user,
		isGuest,
		isLoading, // 👈 added
		signOut: handleSignOut,
		updateUser: handleUpdateUser,
		updateUserSettings: handleUpdateUserSettings
	};
}

export default useUser;