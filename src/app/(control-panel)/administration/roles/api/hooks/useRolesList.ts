import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '@/app/(control-panel)/administration/roles/api/services/rolesApiService';
import { Role } from '@/app/(control-panel)/administration/roles/api/types';
import { Token } from '@auth/user';

export const rolesListQueryKey = (token: Token) => ['roles', 'list', token];

export const useRolesList = (token: Token) => {
	return useQuery<Role[]>({
		queryFn: () => rolesApi.getRolesList(token),
		queryKey: rolesListQueryKey(token),
		refetchOnWindowFocus: true
	});
};
