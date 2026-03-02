import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { Permission } from '@/app/(control-panel)/administration/accounts/api/types';

/**
 * The Account Permission model.
 */
export const PermissionModel = (data: PartialDeep<Permission> | null): Permission =>
	_.defaults(data || {}, {
		id: _.uniqueId(),
		name: '',
		label: ''
	});

export default PermissionModel;
