import { api } from '@/utils/api';
import { Token } from '@auth/user';
import { Role, RolesResponse, RoleType, RoleTypesResponse } from '@/app/(control-panel)/administration/roles/api/types';

export const rolesApi = {
	getRolesList: async (token: Token): Promise<Role[]> => {
		const response = await api.get(`account/role/list/${token.id}`, {
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
			.get(`account/role/detail/${token.id}/${roleId}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token.access}`
				}
			})
			.json();
	},

	createRole: async (token: Omit<Token, ''>, role: Omit<Role, ''>): Promise<Role> => {
		const data = { name: role.name, type_id: role.type.id };
		return api
			.post(`account/role/create/${token.id}/`, {
				headers: {
					Authorization: `Bearer ${token.access}`
				},
				json: data
			})
			.json();
	},

	updateRole: async (token: Omit<Token, ''>, role: Omit<Role, ''>): Promise<Role> => {
		const data = { id: role.id, name: role.name, type_id: role.type.id };
		return api
			.put(`account/role/update/${token.id}/`, {
				headers: {
					Authorization: `Bearer ${token.access}`
				},
				json: data
			})
			.json();
	},

	deleteRole: async (token: Token, roleId: number): Promise<void> => {
		await api.delete(`account/role/delete/${token.id}/${roleId}`, {
			headers: {
				Authorization: `Bearer ${token.access}`
			}
		});
	},

	getRoleTypesList: async (token: Token): Promise<RoleType[]> => {
		const response = await api.get(`account/role_type/list/${token.id}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token.access}`
			}
		});
		const data: RoleTypesResponse = await response.json();
		return data.items;
	}

	// getTags: async (): Promise<Tag[]> => {
	// 	return api.get('mock/contacts/tags').json();
	// },
	//
	// getTag: async (tagId: string): Promise<Tag> => {
	// 	return api.get(`mock/contacts/tags/${tagId}`).json();
	// },
	//
	// createTag: async (tag: Omit<Tag, 'id'>): Promise<Tag> => {
	// 	return api
	// 		.post('mock/contacts/tags', {
	// 			json: tag
	// 		})
	// 		.json();
	// },
	//
	// updateTag: async (tag: Tag): Promise<Tag> => {
	// 	return api
	// 		.put(`mock/contacts/tags/${tag.id}`, {
	// 			json: tag
	// 		})
	// 		.json();
	// },
	//
	// deleteTag: async (tagId: string): Promise<void> => {
	// 	await api.delete(`mock/contacts/tags/${tagId}`);
	// },
	//
	// getCountries: async (): Promise<Country[]> => {
	// 	return api.get('mock/countries').json();
	// }
};
