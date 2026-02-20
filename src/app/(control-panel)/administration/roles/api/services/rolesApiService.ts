
import { api } from '@/utils/api';
import { Role } from '../types';

export const rolesApi = {
	// Roles
	getRoles: async (): Promise<Role[]> => {
		return api.get('mock/roles').json();
	},

	getRole: async (roleId: string): Promise<Role> => {
		return api.get(`mock/roles/${roleId}`).json();
	},

	createRole: async (role: Omit<Role, 'id'>): Promise<Role> => {
		return api
			.post('mock/roles', {
				json: role
			})
			.json();
	},

	updateRole: async (role: Role): Promise<Role> => {
		return api
			.put(`mock/roles/${role.id}`, {
				json: role
			})
			.json();
	},

	deleteRole: async (roleId: string) => {
		return api.delete(`mock/roles/${roleId}`);
	},

	deleteRoles: async (roleIds: string[]) => {
		return api.delete('mock/roles', {
			json: roleIds
		});
	}
};