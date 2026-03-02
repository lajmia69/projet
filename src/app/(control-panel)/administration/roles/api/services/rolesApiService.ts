import { api } from '@/utils/api';
import { Token } from '@auth/user';
import {
	CreateRole,
	Role,
	RolesResponse,
	RoleType,
	RoleTypesResponse
} from '@/app/(control-panel)/administration/roles/api/types';

export const rolesApi = {
	getRolesList: async (token: Token): Promise<Role[]> => {
		const response = await api.get(`account/role/list/${token.id}/`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token.access}`
			}
		});
		const data: RolesResponse = await response.json();
		return data.items;
	},

	getRole: async (token: Token, roleId: number): Promise<Role> => {
		return api
			.get(`account/role/detail/${token.id}/${roleId}/`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token.access}`
				}
			})
			.json();
	},

	createRole: async (token: Omit<Token, ''>, role: Omit<CreateRole, ''>): Promise<CreateRole> => {
		return api
			.post(`account/role/create/${token.id}/`, {
				headers: {
					Authorization: `Bearer ${token.access}`
				},
				json: role
			})
			.json();
	},

	updateRole: async (token: Omit<Token, ''>, role: Omit<Role, 'avatar'>): Promise<Role> => {
		return api
			.put(`account/role/update/${token.id}/`, {
				headers: {
					Authorization: `Bearer ${token.access}`
				},
				json: role
			})
			.json();
	},

	deleteRole: async (token: Token, roleId: number): Promise<void> => {
    await api.delete(`account/role/${roleId}/delete/${token.id}/`, {
        headers: {
            Authorization: `Bearer ${token.access}`
        }
    });
},

	getRoleTypesList: async (token: Token): Promise<RoleType[]> => {
		const response = await api.get(`account/role_type/list/${token.id}/`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token.access}`
			}
		});
		const data: RoleTypesResponse = await response.json();
		return data.items;
	}
};