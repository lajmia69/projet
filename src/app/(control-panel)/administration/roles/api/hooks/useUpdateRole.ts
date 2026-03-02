import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/app/(control-panel)/administration/roles/api/services/rolesApiService';
import { rolesListQueryKey } from '@/app/(control-panel)/administration/roles/api/hooks/useRolesList';
import { roleQueryKey } from '@/app/(control-panel)/administration/roles/api/hooks/useRole';
import { Token } from '@auth/user';
import { Role } from '@/app/(control-panel)/administration/roles/api/types';

export const useUpdateRole = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation<Role, Error, Omit<Role, 'avatar'>>({
		mutationFn: (role) => rolesApi.updateRole(token, role),
		onSuccess: (_, role) => {
			queryClient.invalidateQueries({ queryKey: rolesListQueryKey(token) });
			queryClient.invalidateQueries({ queryKey: roleQueryKey(token, role.id) });
		}
	});
};