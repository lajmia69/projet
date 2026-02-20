// File: src/app/(control-panel)/administration/roles/api/models/RoleModel.ts

import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { Role } from '../types';

/**
 * The role model.
 */
const RoleModel = (data: PartialDeep<Role>): Role =>
	_.defaults(data || {}, {
		id: _.uniqueId('role-'),
		name: '',
		type: ''
	});

export default RoleModel;