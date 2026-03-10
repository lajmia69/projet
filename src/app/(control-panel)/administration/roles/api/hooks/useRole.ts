import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '@/app/(control-panel)/administration/roles/api/services/rolesApiService';
import { Token } from '@auth/user';
import { Role } from '@/app/(control-panel)/administration/roles/api/types';

export const roleQueryKey = (token: Token, roleId: number) => ['role', 'item', token, roleId];

export const useRole = (token: Token, roleId: number) => {
	return useQuery<Role>({
		queryFn: () => rolesApi.getRole(token, roleId),
		queryKey: roleQueryKey(token, roleId),
		// The query will not execute until the roleId exists
		enabled: !!roleId,
		refetchOnWindowFocus: true
	});
};
