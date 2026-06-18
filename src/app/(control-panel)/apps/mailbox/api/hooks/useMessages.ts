import { useQuery } from '@tanstack/react-query';
import { mailboxApi } from '../services/mailboxApiService';

export default function useMessages(accountId: string, conversationId: string, token: string) {
	return useQuery({
		queryKey: ['mailbox', 'messages', accountId, conversationId],
		queryFn: () => mailboxApi.getMessages(accountId, conversationId, token),
		enabled: Boolean(accountId && conversationId && token)
	});
}
