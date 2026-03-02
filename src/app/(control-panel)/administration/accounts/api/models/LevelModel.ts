import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import { Level } from '@/app/(control-panel)/administration/accounts/api/types';

/**
 * The Account Level model.
 */
export const LevelModel = (data: PartialDeep<Level> | null): Level =>
	_.defaults(data || {}, {
		id: _.uniqueId(),
		name: ''
	});

export default LevelModel;
