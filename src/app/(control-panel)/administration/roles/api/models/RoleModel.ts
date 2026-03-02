import { PartialDeep } from 'type-fest';
import _ from 'lodash';
import { CreateRole } from '@/app/(control-panel)/administration/roles/api/types';

/**
 * The Account Role model.
 */
export const CreateRoleModel = (data: PartialDeep<CreateRole> | null): CreateRole =>
	_.defaults(data || {}, {
		name: '',
		type_id: 1
	});
