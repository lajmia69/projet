// File: src/app/(control-panel)/administration/roles/api/models/RoleModel.ts

import { PartialDeep } from 'type-fest';
import { Role } from '../types';

/**
 * The role model.
 */
const RoleModel = (data: PartialDeep<Role>): Role => ({
	id: data?.id ?? '',
	name: data?.name ?? '',
	type: data?.type ?? '',
	createdAt: data?.createdAt ?? new Date().toISOString(),
	updatedAt: data?.updatedAt ?? new Date().toISOString()
});

export default RoleModel;