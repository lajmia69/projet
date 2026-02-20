

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../services/rolesApiService';
import { Role } from '../types';

// Query Keys
export const rolesQueryKey = ['roles'];
export const roleQueryKey = (roleId: string) => ['roles', roleId];

// Get all roles
export const useRoles = () => {
	return useQuery<Role[]>({
		queryFn: rolesApi.getRoles,
		queryKey: rolesQueryKey
	});
};

// Get single role
export const useRole = (roleId: string) => {
	return useQuery<Role>({
		queryKey: roleQueryKey(roleId),
		queryFn: () => rolesApi.getRole(roleId),
		enabled: !!roleId
	});
};

// Create role
export const useCreateRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rolesApi.createRole,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rolesQueryKey });
		}
	});
};

// Update role
export const useUpdateRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rolesApi.updateRole,
		onSuccess: (_, role) => {
			queryClient.invalidateQueries({ queryKey: rolesQueryKey });
			queryClient.invalidateQueries({ queryKey: roleQueryKey(role.id) });
		}
	});
};

// Delete single role
export const useDeleteRole = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rolesApi.deleteRole,
		onSuccess: (_, roleId) => {
			queryClient.invalidateQueries({ queryKey: rolesQueryKey });
			queryClient.invalidateQueries({ queryKey: roleQueryKey(roleId) });
		}
	});
};

// Delete multiple roles
export const useDeleteRoles = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: rolesApi.deleteRoles,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: rolesQueryKey });
		}
	});
};