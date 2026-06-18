export type MailboxUser = {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
};

export type MailboxAccount = {
	id: number;
	user: MailboxUser;
	full_name: string;
	avatar: string;
};

export type Message = {
	id: number;
	sender: MailboxAccount;
	receiver: MailboxAccount;
	subject: string;
	body: string;
	is_read: boolean;
	created_at: string;
	updated_at: string;
};

export type MessageList = {
	items: Message[];
	count: number;
};

export type Conversation = {
	id: number;
	participants: MailboxAccount[];
	last_message: Message | null;
	unread_count: number;
	created_at: string;
	updated_at: string;
};

export type ConversationList = {
	items: Conversation[];
	count: number;
};

export type CreateMessagePayload = {
	receiver_id: number;
	subject: string;
	body: string;
};

export type SearchConversations = {
	search?: string;
	limit: number;
	offset: number;
};
