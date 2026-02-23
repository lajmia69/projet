import { useMemo } from 'react';
import FuseUtils from '@fuse/utils';
import { useRoles } from './Useroles';
import { useRolesAppContext } from '.././../Contexts/useRolesAppContext';
import { Role } from '../types';

export function useFilteredRoles() {
	const { searchText } = useRolesAppContext();
	const { data: roles, isLoading } = useRoles();

	const filtered = useMemo(() => {
		if (!roles || isLoading) return [];
		if (!searchText.trim()) return roles;
		return FuseUtils.filterArrayByString<Role>(roles, searchText);
	}, [roles, searchText, isLoading]);

	return { data: filtered, isLoading };
}