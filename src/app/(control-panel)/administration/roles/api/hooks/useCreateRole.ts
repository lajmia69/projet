import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/app/(control-panel)/administration/roles/api/services/rolesApiService';
// import { rolesListQueryKey } from '@/app/(control-panel)/administration/roles/api/hooks/useRolesList';
import { Token } from '@auth/user';
import { Role } from '@/app/(control-panel)/administration/roles/api/types';

export const useCreateRole = (token: Token) => {
	const queryClient = useQueryClient();
	return useMutation<Role, Error, Omit<Role, ''>, Role>({
		mutationFn: (role) => rolesApi.createRole(token, role),
		onSuccess: () => {
			// queryClient.invalidateQueries({ queryKey: rolesListQueryKey(token) });
			queryClient.invalidateQueries({ queryKey: ['roles'] });
			queryClient.invalidateQueries({ queryKey: ['role'] });
		}
	});
};
