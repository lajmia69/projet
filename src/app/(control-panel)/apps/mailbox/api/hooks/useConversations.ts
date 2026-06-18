import { useQuery } from '@tanstack/react-query';
import { mailboxApi } from '../services/mailboxApiService';

export default function useConversations(accountId: string, token: string) {
	return useQuery({
		queryKey: ['mailbox', 'conversations', accountId],
		queryFn: () => mailboxApi.getConversations(accountId, token),
		enabled: Boolean(accountId && token)
	});
}
