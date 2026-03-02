import { useMutation } from '@tanstack/react-query';
import { rolesApi } from '@/app/(control-panel)/administration/roles/api/services/rolesApiService';
// import { rolesListQueryKey } from '@/app/(control-panel)/administration/roles/api/hooks/useRolesList';
import { Token } from '@auth/user';
import { CreateRole, Role } from '@/app/(control-panel)/administration/roles/api/types';
import useNavigate from '@fuse/hooks/useNavigate';

export const useCreateRole = (token: Token) => {
	// const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation<CreateRole, Error, Omit<CreateRole, ''>, Role>({
		mutationFn: (role) => rolesApi.createRole(token, role),
		onSuccess: () => {
			navigate('/administration/roles');
			// queryClient.invalidateQueries({ queryKey: rolesListQueryKey(token) });
		}
	});
};
