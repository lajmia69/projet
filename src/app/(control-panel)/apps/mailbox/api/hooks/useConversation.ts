import { useQuery } from '@tanstack/react-query';
import { mailboxApi } from '../services/mailboxApiService';

export default function useConversation(accountId: string, conversationId: string, token: string) {
	return useQuery({
		queryKey: ['mailbox', 'conversation', accountId, conversationId],
		queryFn: () => mailboxApi.getConversation(accountId, conversationId, token),
		enabled: Boolean(accountId && conversationId && token)
	});
}
