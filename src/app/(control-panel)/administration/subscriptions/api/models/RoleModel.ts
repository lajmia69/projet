import { PartialDeep } from 'type-fest';
import _ from 'lodash';
import { Createsubscription } from '@/app/(control-panel)/administration/subscriptions/api/types';

/**
 * The Account subscription model.
 */
export const CreatesubscriptionModel = (data: PartialDeep<Createsubscription> | null): Createsubscription =>
	_.defaults(data || {}, {
		name: '',
		type_id: 1
	});
