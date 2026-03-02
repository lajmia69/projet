import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/app/(control-panel)/administration/roles/api/services/rolesApiService';
import { rolesListQueryKey } from '@/app/(control-panel)/administration/roles/api/hooks/useRolesList';
import { roleQueryKey } from '@/app/(control-panel)/administration/roles/api/hooks/useRole';
import { Token } from '@auth/user';

export const useDeleteRole = (token: Token) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (roleId: number) => rolesApi.deleteRole(token, roleId),
		onSuccess: (_, roleId) => {
			queryClient.invalidateQueries({ queryKey: rolesListQueryKey(token) });
			queryClient.invalidateQueries({ queryKey: roleQueryKey(token, roleId) });
		}
	});
};