import { useQuery } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { useCurrentAccountId } from './Usecurrentaccountid';

export const studioProjectsQueryKey = (accountId: number) => ['studio', 'projects', accountId];

export function useGetStudioBoards() {
	const accountId = useCurrentAccountId();

	return useQuery({
		queryKey: studioProjectsQueryKey(accountId),
		queryFn: () => studioApiService.getProjects(accountId),
		select: (data) => data.items,
		enabled: !!accountId
	});
}