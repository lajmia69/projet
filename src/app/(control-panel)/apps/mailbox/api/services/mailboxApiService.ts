import { api } from '@/utils/api';
import {
	ConversationList,
	Conversation,
	MessageList,
	Message,
	CreateMessagePayload,
	SearchConversations
} from '../types';

const authHeader = (accessToken: string) => ({
	headers: { Authorization: `Bearer ${accessToken}` }
});

export const mailboxApi = {
	getConversations: async (accountId: string, accessToken: string): Promise<ConversationList> => {
		return api.get(`mailbox/conversations/${accountId}/`, authHeader(accessToken)).json();
	},

	getConversation: async (accountId: string, conversationId: string, accessToken: string): Promise<Conversation> => {
		return api.get(`mailbox/conversations/${accountId}/${conversationId}/`, authHeader(accessToken)).json();
	},

	searchConversations: async (accountId: string, accessToken: string, search: SearchConversations): Promise<ConversationList> => {
		const params = new URLSearchParams();
		params.set('limit', String(search.limit ?? 10));
		params.set('offset', String(search.offset ?? 0));
		if (search.search) params.set('search', search.search);
		return api.get(`mailbox/conversations/${accountId}/?${params.toString()}`, authHeader(accessToken)).json();
	},

	getMessages: async (accountId: string, conversationId: string, accessToken: string): Promise<MessageList> => {
		return api.get(`mailbox/messages/${accountId}/${conversationId}/`, authHeader(accessToken)).json();
	},

	sendMessage: async (accountId: string, accessToken: string, data: CreateMessagePayload): Promise<Message> => {
		return api.post(`mailbox/messages/${accountId}/`, { json: data, ...authHeader(accessToken) }).json();
	},

	deleteConversation: async (accountId: string, conversationId: string, accessToken: string): Promise<void> => {
		await api.delete(`mailbox/conversations/${accountId}/${conversationId}/`, authHeader(accessToken));
	},

	markAsRead: async (accountId: string, conversationId: string, accessToken: string): Promise<void> => {
		await api.patch(`mailbox/conversations/${accountId}/${conversationId}/read/`, authHeader(accessToken));
	}
};
