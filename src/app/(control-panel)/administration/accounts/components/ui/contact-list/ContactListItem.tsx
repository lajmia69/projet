import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import Box from '@mui/material/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Tooltip from '@mui/material/Tooltip';
import { motion } from 'motion/react';
import { Contact, UserRole, studentPlacementLabel, contactFullName } from '../../../api/types';

type Props = { contact: Contact; index?: number };

const SEC_COLORS: Record<string, string> = {
	Scientific: '#6366f1', Letters: '#f59e0b', Sports: '#22c55e',
	IT: '#8b5cf6', Science: '#0ea5e9', Economics: '#ec4899', Maths: '#ef4444', Technique: '#f97316'
};

const ROLE_CONFIG = {
	super_admin: { label: 'Super Admin', from: '#dc2626', to: '#7f1d1d', icon: 'lucide:shield-admin' },
	content_admin: { label: 'Content Admin', from: '#2563eb', to: '#1e40af', icon: 'lucide:file-check' },
	member_admin: { label: 'Member Admin', from: '#7c3aed', to: '#5b21b6', icon: 'lucide:users-cog' },
	studio_admin: { label: 'Studio Admin', from: '#f97316', to: '#c2410c', icon: 'lucide:video-cog' },
	radio_content_creator: { label: 'Radio Creator', from: '#06b6d4', to: '#0369a1', icon: 'lucide:radio' },
	broadcast_content_creator: { label: 'Broadcast Creator', from: '#ec4899', to: '#be185d', icon: 'lucide:tv' },
	culture_content_creator: { label: 'Culture Creator', from: '#f59e0b', to: '#d97706', icon: 'lucide:palette' },
	lesson_content_creator: { label: 'Lesson Creator', from: '#8b5cf6', to: '#6d28d9', icon: 'lucide:book-open' },
	member: { label: 'Member', from: '#22c55e', to: '#16a34a', icon: 'lucide:user' },
	studio_staff: { label: 'Studio Staff', from: '#06b6d4', to: '#0891b2', icon: 'lucide:users' }
} as const;

function ContactListItem({ contact, index = 0 }: Props) {
	const role = (contact.role ?? '') as UserRole;
	const roleConfig = role ? ROLE_CONFIG[role] : null;

	const fullName = contactFullName(contact);
	const initials = [contact.firstName, contact.lastName].filter(Boolean).map((n) => n![0]).join('').toUpperCase() || '?';

	const primaryEmail = contact.emails?.find((e) => e.email)?.email;
	const primaryPhone = contact.phoneNumbers?.find((p) => p.phoneNumber)?.phoneNumber;

	const accentColor = roleConfig?.from ?? '#64748b';

	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0, transition: { delay: index * 0.035, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } }}
		>
			<Box
				component={NavLinkAdapter}
				to={`/administration/accounts/${contact.id}`}
				className="group relative flex items-center overflow-hidden rounded-2xl border transition-all duration-200"
				sx={{
					display: 'flex', textDecoration: 'none', color: 'inherit',
					backgroundColor: 'background.paper', borderColor: 'divider',
					'&:hover': { borderColor: accentColor, boxShadow: `0 6px 28px -4px ${accentColor}28`, transform: 'translateY(-2px)' },
					'&.active': { borderColor: (t) => t.palette.secondary.main, backgroundColor: (t) => t.palette.secondary.main + '06' }
				}}
			>
				{/* Accent stripe */}
				<Box
					className="w-1 self-stretch shrink-0"
					sx={{
						background: roleConfig ? `linear-gradient(180deg, ${roleConfig.from}, ${roleConfig.to})` : 'divider',
						opacity: roleConfig ? 0.85 : 0.2
					}}
				/>

				<div className="flex flex-1 items-center gap-4 px-4 py-3.5 min-w-0">
					{/* Avatar */}
					<Box className="relative shrink-0">
						<Box
							className="rounded-full p-[2px]"
							sx={{
								background: roleConfig
									? `linear-gradient(135deg, ${roleConfig.from}66, ${roleConfig.to}22)`
									: 'linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.04))'
							}}
						>
							<Avatar
								alt={fullName} src={contact.avatar}
								sx={(t) => ({
									width: 46, height: 46, fontSize: '0.9rem', fontWeight: 700,
									backgroundColor: roleConfig ? roleConfig.from + '18' : t.palette.secondary.main + '18',
									color: roleConfig?.from ?? t.palette.secondary.dark,
									border: '2px solid', borderColor: 'background.paper'
								})}
							>
								{initials}
							</Avatar>
						</Box>
					</Box>

					{/* Info */}
					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						{/* Name + badge */}
						<div className="flex flex-wrap items-center gap-2">
							<Typography className="truncate text-sm font-bold leading-none">{fullName}</Typography>
							{roleConfig && (
								<Box
									className="inline-flex items-center gap-1 rounded-full px-2 py-[2px]"
									sx={{ background: `linear-gradient(135deg, ${roleConfig.from}, ${roleConfig.to})` }}
								>
									<FuseSvgIcon className="text-white" size={9}>{roleConfig.icon}</FuseSvgIcon>
									<Typography className="text-[10px] font-bold leading-none text-white whitespace-nowrap">{roleConfig.label}</Typography>
								</Box>
							)}
						</div>

						{/* Subtitle */}

						{/* Email / phone */}
						<div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
							{primaryEmail && (
								<span className="flex items-center gap-1 text-[11px] text-gray-400">
									<FuseSvgIcon size={10} color="action">lucide:mail</FuseSvgIcon>
									<span className="max-w-[160px] truncate">{primaryEmail}</span>
								</span>
							)}
							{primaryPhone && (
								<span className="flex items-center gap-1 text-[11px] text-gray-400">
									<FuseSvgIcon size={10} color="action">lucide:phone</FuseSvgIcon>
									+216 {primaryPhone}
								</span>
							)}
						</div>
					</div>

					{/* Quick actions + chevron */}
					<div className="flex shrink-0 items-center gap-1.5">
						<div className="flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
							{primaryEmail && (
								<Tooltip title={`Email ${contact.firstName}`} arrow>
									<Box component="a" href={`mailto:${primaryEmail}`} onClick={(e) => e.stopPropagation()}
										className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
										sx={{ backgroundColor: 'action.hover', color: 'text.secondary', '&:hover': { backgroundColor: 'secondary.main', color: 'white' } }}>
										<FuseSvgIcon size={13}>lucide:mail</FuseSvgIcon>
									</Box>
								</Tooltip>
							)}
							{primaryPhone && (
								<Tooltip title={`Call ${contact.firstName}`} arrow>
									<Box component="a" href={`tel:+216${primaryPhone}`} onClick={(e) => e.stopPropagation()}
										className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
										sx={{ backgroundColor: 'action.hover', color: 'text.secondary', '&:hover': { backgroundColor: 'success.main', color: 'white' } }}>
										<FuseSvgIcon size={13}>lucide:phone</FuseSvgIcon>
									</Box>
								</Tooltip>
							)}
						</div>
						<Box className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 group-hover:translate-x-0.5"
							sx={{ color: 'text.disabled' }}>
							<FuseSvgIcon size={16}>lucide:chevron-right</FuseSvgIcon>
						</Box>
					</div>
				</div>
			</Box>
		</motion.div>
	);
}

export default ContactListItem;