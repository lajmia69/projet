'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import useUser from '@auth/useUser';
import { motion } from 'motion/react';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import useConversations from '../../api/hooks/useConversations';
import { useDeleteConversation, useMarkAsRead } from '../../api/hooks/MailboxMutations';
import { Conversation } from '../../api/types';
import { useTranslation } from 'react-i18next';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 },
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' }
}));

const listContainer = { show: { transition: { staggerChildren: 0.04 } } };
const listItem = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function InboxView() {
	const router = useRouter();
	const { data: user } = useUser();
	const { t } = useTranslation('mailbox');

	const accountId = user?.id?.toString() ?? '';
	const token = user?.token?.access ?? '';

	const { data: conversations, isLoading } = useConversations(accountId, token);
	const { mutate: deleteConversation } = useDeleteConversation(accountId, token);
	const { mutate: markAsRead } = useMarkAsRead(accountId, token);

	const [searchText, setSearchText] = useState('');
	const [filteredData, setFilteredData] = useState<Conversation[]>([]);
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const onScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const progress = Math.min(1, Math.max(0, (scrollY - 20) / 160));

	useEffect(() => {
		if (!conversations?.items) return;
		if (!searchText.trim()) {
			setFilteredData(conversations.items);
			return;
		}
		const q = searchText.toLowerCase();
		setFilteredData(
			conversations.items.filter((c) => {
				const other = c.participants.find((p) => p.id?.toString() !== accountId);
				const name = other?.full_name?.toLowerCase() ?? '';
				const subject = c.last_message?.subject?.toLowerCase() ?? '';
				return name.includes(q) || subject.includes(q);
			})
		);
	}, [conversations, searchText, accountId]);

	const getOtherParticipant = (conversation: Conversation) => {
		return conversation.participants.find((p) => p.id?.toString() !== accountId) ?? conversation.participants[0];
	};

	const handleOpenConversation = (conversation: Conversation) => {
		if (conversation.unread_count > 0) {
			markAsRead(String(conversation.id));
		}
		router.push(`/apps/mailbox/conversation/${conversation.id}`);
	};

	const handleDelete = (e: React.MouseEvent, conversationId: number) => {
		e.stopPropagation();
		deleteConversation(String(conversationId));
	};

	const formatTime = (dateStr: string) => {
		const d = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 7) return `${diffDays}d ago`;
		return d.toLocaleDateString();
	};

	if (isLoading) return <FuseLoading />;

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
						paddingTop: '56px',
						paddingBottom: '64px',
						opacity: 1 - progress,
						transform: `translateY(${-(progress * 24)}px)`,
						pointerEvents: 'none',
						willChange: 'opacity, transform'
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
					<div
						style={{
							position: 'absolute',
							top: '-100px',
							left: '-120px',
							width: '500px',
							height: '500px',
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(14,168,176,0.22) 0%, transparent 65%)',
							pointerEvents: 'none'
						}}
					/>
					<div
						style={{
							position: 'absolute',
							bottom: '-60px',
							right: '-60px',
							width: '360px',
							height: '360px',
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(42,232,142,0.18) 0%, transparent 65%)',
							pointerEvents: 'none'
						}}
					/>

					<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
							<Typography
								component="h1"
								sx={{
									fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' },
									fontWeight: 800,
									color: '#e8fff5',
									textShadow: '0 2px 32px rgba(0,0,0,0.55)'
								}}
							>
								{t('INBOX_TITLE')}
							</Typography>
						</motion.div>
						<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
							<Typography sx={{ fontSize: { xs: '0.875rem', sm: '0.975rem' }, color: 'rgba(42,232,142,0.72)', lineHeight: 1.75 }}>
								{t('INBOX_SUBTITLE')}
							</Typography>
						</motion.div>
						{conversations?.count != null && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.24, duration: 0.4 } }} className="mt-5">
								<div
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: '6px',
										padding: '4px 14px',
										borderRadius: '999px',
										border: '1px solid rgba(14,168,176,0.35)',
										backgroundColor: 'rgba(14,168,176,0.12)'
									}}
								>
									<FuseSvgIcon size={13} sx={{ color: 'rgba(14,168,176,0.75)' }}>lucide:mail</FuseSvgIcon>
									<Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: 'rgba(14,168,176,0.85)', letterSpacing: '0.025em' }}>
										{t('CONVERSATIONS_COUNT', { count: conversations.count })}
									</Typography>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4 pt-6">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
						className="mb-6"
					>
						<TextField
							size="small"
							placeholder={t('SEARCH_PLACEHOLDER')}
							value={searchText}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
							sx={{ minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon>
										</InputAdornment>
									)
								}
							}}
						/>
					</motion.div>

					{filteredData.length > 0 ? (
						<motion.div
							className="flex flex-col gap-2"
							variants={listContainer}
							initial="hidden"
							animate="show"
						>
							{filteredData.map((conversation) => {
								const other = getOtherParticipant(conversation);
								const hasUnread = conversation.unread_count > 0;

								return (
									<motion.div variants={listItem} key={conversation.id}>
										<Card
											onClick={() => handleOpenConversation(conversation)}
											sx={{
												cursor: 'pointer',
												borderRadius: '12px',
												p: 0,
												transition: 'all 0.2s ease',
												border: '1px solid',
												borderColor: hasUnread ? 'rgba(29,201,138,0.3)' : 'divider',
												backgroundColor: hasUnread ? 'rgba(29,201,138,0.04)' : 'background.paper',
												'&:hover': {
													boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
													borderColor: 'rgba(29,201,138,0.4)',
													transform: 'translateY(-1px)'
												}
											}}
										>
											<div className="flex items-center gap-3 p-4">
												<Badge
													badgeContent={conversation.unread_count}
													color="primary"
													invisible={!hasUnread}
													sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.65rem' } }}
												>
													<Avatar
														src={other?.avatar}
														sx={{
															width: 44,
															height: 44,
															fontSize: '0.9rem',
															fontWeight: 700,
															background: 'linear-gradient(135deg, #1DC98A, #2AE88E)',
															color: '#0D1A47'
														}}
													>
														{other?.full_name?.charAt(0) ?? '?'}
													</Avatar>
												</Badge>

												<div className="flex flex-1 flex-col gap-0.5 min-w-0">
													<div className="flex items-center justify-between gap-2">
														<Typography
															sx={{
																fontWeight: hasUnread ? 800 : 500,
																fontSize: '0.9rem',
																whiteSpace: 'nowrap',
																overflow: 'hidden',
																textOverflow: 'ellipsis'
															}}
														>
															{other?.full_name ?? 'Unknown'}
														</Typography>
														<Typography
															variant="caption"
															sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontSize: '0.72rem' }}
														>
															{conversation.last_message ? formatTime(conversation.last_message.created_at) : ''}
														</Typography>
													</div>
													{conversation.last_message && (
														<>
															<Typography
																sx={{
																	fontWeight: hasUnread ? 700 : 500,
																	fontSize: '0.82rem',
																	color: 'text.primary',
																	whiteSpace: 'nowrap',
																	overflow: 'hidden',
																	textOverflow: 'ellipsis'
																}}
															>
																{conversation.last_message.subject}
															</Typography>
															<Typography
																variant="body2"
																sx={{
																	color: 'text.secondary',
																	fontSize: '0.78rem',
																	whiteSpace: 'nowrap',
																	overflow: 'hidden',
																	textOverflow: 'ellipsis',
																	mt: 0.25
																}}
															>
																{conversation.last_message.body}
															</Typography>
														</>
													)}
												</div>

												<IconButton
													size="small"
													onClick={(e) => handleDelete(e, conversation.id)}
													sx={{
														flexShrink: 0,
														color: 'text.disabled',
														'&:hover': { color: 'error.main' }
													}}
												>
													<FuseSvgIcon size={16}>lucide:trash-2</FuseSvgIcon>
												</IconButton>
											</div>
										</Card>
									</motion.div>
								);
							})}
						</motion.div>
					) : (
						<div className="flex flex-1 items-center justify-center">
							<div className="flex flex-col items-center gap-3 py-16">
								<FuseSvgIcon size={40} sx={{ color: 'text.disabled' }}>lucide:inbox</FuseSvgIcon>
								<Typography color="text.secondary" className="text-xl font-medium">
									{searchText ? t('NO_CONVERSATIONS_SEARCH') : t('NO_CONVERSATIONS')}
								</Typography>
								<Typography color="text.disabled" className="text-sm">
									{searchText ? t('TRY_DIFFERENT_SEARCH') : t('NO_CONVERSATIONS_HINT')}
								</Typography>
							</div>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default InboxView;
