import { PartialDeep } from 'type-fest';
import _ from 'lodash';
import { Role } from '@/app/(control-panel)/administration/roles/api/types';

/**
 * The Account Role model.
 */
export const RoleModel = (data: PartialDeep<Role> | null): Role =>
	_.defaults(data || {}, {
		id: 0,
		name: '',
		type: {
			id: 1,
			name: '',
			description: ''
		},
		permissions: []
	});
