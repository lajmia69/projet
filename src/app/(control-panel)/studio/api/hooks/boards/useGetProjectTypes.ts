import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from '../../useCurrentAccountId';

export const projectTypesQueryKey = (accountId: number) => ['studio', 'project-types', accountId];

export function useGetProjectTypes() {
	const accountId = useCurrentAccountId();

	return useQuery({
		queryKey: projectTypesQueryKey(accountId),
		queryFn: async () => {
			const { items } = await studioApiService.getProjectTypes(accountId);
			return items;
		},
		enabled: !!accountId
	});
}