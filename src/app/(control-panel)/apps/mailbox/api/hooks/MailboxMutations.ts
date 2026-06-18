import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { mailboxApi } from '../services/mailboxApiService';
import { CreateMessagePayload } from '../types';

export function useSendMessage(accountId: string, token: string) {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (data: CreateMessagePayload) => mailboxApi.sendMessage(accountId, token, data),
		onSuccess: () => {
			enqueueSnackbar('Message sent!', { variant: 'success' });
			queryClient.invalidateQueries({ queryKey: ['mailbox', 'conversations', accountId] });
		},
		onError: (error: Error) => {
			enqueueSnackbar(`Failed to send message: ${error.message}`, { variant: 'error' });
		}
	});
}

export function useDeleteConversation(accountId: string, token: string) {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (conversationId: string) => mailboxApi.deleteConversation(accountId, conversationId, token),
		onSuccess: () => {
			enqueueSnackbar('Conversation deleted!', { variant: 'success' });
			queryClient.invalidateQueries({ queryKey: ['mailbox', 'conversations', accountId] });
		},
		onError: (error: Error) => {
			enqueueSnackbar(`Failed to delete conversation: ${error.message}`, { variant: 'error' });
		}
	});
}

export function useMarkAsRead(accountId: string, token: string) {
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	return useMutation({
		mutationFn: (conversationId: string) => mailboxApi.markAsRead(accountId, conversationId, token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['mailbox', 'conversations', accountId] });
		},
		onError: (error: Error) => {
			enqueueSnackbar(`Failed to mark as read: ${error.message}`, { variant: 'error' });
		}
	});
}
