import { useMemo } from 'react';
import FuseUtils from '@fuse/utils';
import { useRoles } from '../../api/hooks/Useroles';
import { useRolesAppContext } from '../../contexts/useRolesAppContext';
import { Role } from '../api/types';

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