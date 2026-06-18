'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { motion } from 'motion/react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useMessages from '../../api/hooks/useMessages';
import useConversation from '../../api/hooks/useConversation';
import { useMarkAsRead } from '../../api/hooks/MailboxMutations';
import { Message } from '../../api/types';
import { useTranslation } from 'react-i18next';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': {
		background: 'transparent',
		border: 'none',
		boxShadow: 'none',
		padding: 0,
		minHeight: 'auto'
	},
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' }
}));

const messageItem = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

function ConversationView() {
	const params = useParams();
	const router = useRouter();
	const { data: user } = useUser();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation('mailbox');

	const accountId = user?.id?.toString() ?? '';
	const token = user?.token?.access ?? '';
	const conversationId = params.conversationId as string;

	const { data: conversation } = useConversation(accountId, conversationId, token);
	const { data: messagesData, isLoading } = useMessages(accountId, conversationId, token);
	const { mutate: markAsRead } = useMarkAsRead(accountId, token);

	useEffect(() => {
		if (conversationId && accountId && token) {
			markAsRead(conversationId);
		}
	}, [conversationId, accountId, token, markAsRead]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messagesData?.items]);

	const getOtherParticipant = () => {
		if (!conversation) return null;
		return conversation.participants.find((p) => p.id?.toString() !== accountId) ?? conversation.participants[0];
	};

	const formatTime = (dateStr: string) => {
		const d = new Date(dateStr);
		return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	const formatDate = (dateStr: string) => {
		const d = new Date(dateStr);
		const now = new Date();
		const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
		if (diffDays === 0) return t('TODAY');
		if (diffDays === 1) return t('YESTERDAY');
		return d.toLocaleDateString();
	};

	const groupMessagesByDate = (msgs: Message[]) => {
		const groups: { date: string; messages: Message[] }[] = [];
		let currentDate = '';
		msgs.forEach((msg) => {
			const msgDate = formatDate(msg.created_at);
			if (msgDate !== currentDate) {
				currentDate = msgDate;
				groups.push({ date: msgDate, messages: [] });
			}
			groups[groups.length - 1].messages.push(msg);
		});
		return groups;
	};

	if (isLoading) return <FuseLoading />;

	const other = getOtherParticipant();
	const messageGroups = groupMessagesByDate(messagesData?.items ?? []);

	return (
		<Root
			scroll="page"
			header={
				<div
					style={{
						position: 'relative',
						width: '100%',
						overflow: 'hidden',
						background: 'linear-gradient(135deg, #1A2E38 0%, #2D8B7C 100%)',
						paddingTop: '16px',
						paddingBottom: '20px'
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundImage: `linear-gradient(rgba(29,201,138,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(29,201,138,0.06) 1px, transparent 1px)`,
							backgroundSize: '52px 52px',
							pointerEvents: 'none'
						}}
					/>

					<div className="relative flex items-center gap-3 px-6" style={{ zIndex: 1 }}>
						<IconButton
							onClick={() => router.push('/apps/mailbox/inbox')}
							sx={{ color: '#e8fff5' }}
						>
							<FuseSvgIcon size={20}>lucide:arrow-left</FuseSvgIcon>
						</IconButton>

						<Avatar
							src={other?.avatar}
							sx={{
								width: 40,
								height: 40,
								fontSize: '0.85rem',
								fontWeight: 700,
								background: 'linear-gradient(135deg, #1DC98A, #2AE88E)',
								color: '#0D1A47'
							}}
						>
							{other?.full_name?.charAt(0) ?? '?'}
						</Avatar>

						<div className="flex flex-col">
							<Typography
								sx={{
									fontWeight: 700,
									fontSize: '1rem',
									color: '#e8fff5'
								}}
							>
								{other?.full_name ?? 'Unknown'}
							</Typography>
							<Typography
								sx={{
									fontSize: '0.75rem',
									color: 'rgba(42,232,142,0.7)'
								}}
							>
								{conversation?.last_message?.subject ?? t('NO_SUBJECT')}
							</Typography>
						</div>
					</div>
				</div>
			}
			content={
				<div className="flex flex-col h-full">
					<div className="flex-1 overflow-y-auto p-4 pt-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
						{messageGroups.length > 0 ? (
							<motion.div
								className="flex flex-col gap-6"
								variants={{ show: { transition: { staggerChildren: 0.03 } } }}
								initial="hidden"
								animate="show"
							>
								{messageGroups.map((group) => (
									<div key={group.date}>
										<div className="flex justify-center mb-4">
											<Typography
												variant="caption"
												sx={{
													color: 'text.secondary',
													backgroundColor: 'background.paper',
													px: 2,
													py: 0.5,
													borderRadius: '999px',
													fontWeight: 600,
													fontSize: '0.7rem',
													border: '1px solid',
													borderColor: 'divider'
												}}
											>
												{group.date}
											</Typography>
										</div>

										<div className="flex flex-col gap-3">
											{group.messages.map((msg) => {
												const isMine = msg.sender?.id?.toString() === accountId;

												return (
													<motion.div variants={messageItem} key={msg.id}>
														<div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
															<div
																className="flex gap-2 max-w-[75%]"
																style={{ flexDirection: isMine ? 'row-reverse' : 'row' }}
															>
																{!isMine && (
																	<Avatar
																		src={msg.sender?.avatar}
																		sx={{
																			width: 32,
																			height: 32,
																			fontSize: '0.7rem',
																			fontWeight: 700,
																			background: 'linear-gradient(135deg, #1DC98A, #2AE88E)',
																			color: '#0D1A47',
																			flexShrink: 0
																		}}
																	>
																		{msg.sender?.full_name?.charAt(0) ?? '?'}
																	</Avatar>
																)}
																<div
																	style={{
																		backgroundColor: isMine
																			? 'linear-gradient(135deg, #1DC98A, #2AE88E)'
																			: 'rgba(29,201,138,0.08)',
																		color: isMine ? '#0D1A47' : 'inherit',
																		borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
																		border: isMine ? 'none' : '1px solid rgba(29,201,138,0.15)',
																		padding: '12px 16px'
																	}}
																>
																	{msg.subject && (
																		<Typography
																			sx={{
																				fontWeight: 700,
																				fontSize: '0.8rem',
																				mb: 0.5,
																				color: isMine ? '#0D1A47' : 'text.primary'
																			}}
																		>
																			{msg.subject}
																		</Typography>
																	)}
																	<Typography
																		sx={{
																			fontSize: '0.85rem',
																			lineHeight: 1.6,
																			whiteSpace: 'pre-wrap',
																			color: isMine ? '#0D1A47' : 'text.primary'
																		}}
																	>
																		{msg.body}
																	</Typography>
																	<Typography
																		sx={{
																			fontSize: '0.65rem',
																			mt: 0.5,
																			textAlign: 'right',
																			color: isMine ? 'rgba(13,26,71,0.5)' : 'text.disabled'
																		}}
																	>
																		{formatTime(msg.created_at)}
																	</Typography>
																</div>
															</div>
														</div>
													</motion.div>
												);
											})}
										</div>
									</div>
								))}
								<div ref={messagesEndRef} />
							</motion.div>
						) : (
							<div className="flex flex-1 items-center justify-center py-16">
								<div className="flex flex-col items-center gap-3">
									<FuseSvgIcon size={40} sx={{ color: 'text.disabled' }}>lucide:message-circle</FuseSvgIcon>
									<Typography color="text.secondary" className="text-lg font-medium">
										{t('NO_MESSAGES')}
									</Typography>
									<Typography color="text.disabled" className="text-sm">
										{t('NO_MESSAGES_HINT')}
									</Typography>
								</div>
							</div>
						)}
					</div>
				</div>
			}
		/>
	);
}

export default ConversationView;
