import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '@/app/(control-panel)/administration/roles/api/services/rolesApiService';
import { RoleType } from '@/app/(control-panel)/administration/roles/api/types';
import { Token } from '@auth/user';

export const roleTypesListQueryKey = (token: Token) => ['role_types', 'list', token];

export const useRoleTypesList = (token: Token) => {
	return useQuery<RoleType[]>({
		queryFn: () => rolesApi.getRoleTypesList(token),
		queryKey: roleTypesListQueryKey(token)
	});
};
