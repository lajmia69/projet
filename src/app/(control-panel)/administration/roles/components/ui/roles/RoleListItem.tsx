'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'motion/react';
import { format } from 'date-fns/format';
import { Role } from '../../../api/types';

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; icon: string; from: string; to: string }> = {
	SuperAdmin:             { label: 'Super Admin',           icon: 'lucide:shield-alert',  from: '#dc2626', to: '#7f1d1d' },
	ContentAdmin:           { label: 'Content Admin',         icon: 'lucide:file-check',    from: '#2563eb', to: '#1e40af' },
	MemberAdmin:            { label: 'Member Admin',          icon: 'lucide:users-cog',     from: '#7c3aed', to: '#5b21b6' },
	StudioAdmin:            { label: 'Studio Admin',          icon: 'lucide:video-cog',     from: '#f97316', to: '#c2410c' },
	RadioContentCreator:    { label: 'Radio Creator',         icon: 'lucide:radio',         from: '#06b6d4', to: '#0369a1' },
	PodcastContentCreator:  { label: 'Podcast Creator',       icon: 'lucide:mic-2',         from: '#ec4899', to: '#be185d' },
	CultureContentCreator:  { label: 'Culture Creator',       icon: 'lucide:palette',       from: '#f59e0b', to: '#d97706' },
	LessonContentCreator:   { label: 'Lesson Creator',        icon: 'lucide:book-open',     from: '#8b5cf6', to: '#6d28d9' },
	StudioStaff:            { label: 'Studio Staff',          icon: 'lucide:users',         from: '#0ea5e9', to: '#0284c7' },
	Member:                 { label: 'Member',                icon: 'lucide:user-check',    from: '#22c55e', to: '#15803d' },
	Application:            { label: 'Application',           icon: 'lucide:app-window',    from: '#a16207', to: '#78350f' },
	Contact:                { label: 'Contact',               icon: 'lucide:user',          from: '#64748b', to: '#334155' },
};

const DEFAULT_CONFIG = { label: 'Unknown', icon: 'lucide:help-circle', from: '#64748b', to: '#334155' };

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
	role: Role;
	index?: number;
	onClick: (role: Role) => void;
	selected?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

function RoleListItem({ role, index = 0, onClick, selected = false }: Props) {
	const cfg = TYPE_CONFIG[role.type] ?? DEFAULT_CONFIG;

	const createdDate = role.createdAt
		? format(new Date(role.createdAt), 'MMM d, yyyy')
		: null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 14 }}
			animate={{ opacity: 1, y: 0, transition: { delay: index * 0.035, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } }}
		>
			<Box
				component="button"
				type="button"
				onClick={() => onClick(role)}
				className="group relative flex w-full items-center overflow-hidden rounded-2xl border text-left transition-all duration-200"
				sx={{
					backgroundColor: selected ? cfg.from + '08' : 'background.paper',
					borderColor: selected ? cfg.from : 'divider',
					boxShadow: selected ? `0 6px 28px -4px ${cfg.from}28` : 'none',
					'&:hover': {
						borderColor: cfg.from,
						boxShadow: `0 6px 28px -4px ${cfg.from}28`,
						transform: 'translateY(-2px)'
					}
				}}
			>
				{/* Accent stripe */}
				<Box
					className="w-1 self-stretch shrink-0"
					sx={{ background: `linear-gradient(180deg, ${cfg.from}, ${cfg.to})`, opacity: 0.85 }}
				/>

				<div className="flex flex-1 items-center gap-4 px-4 py-3.5 min-w-0">
					{/* Icon */}
					<Box
						className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
						sx={{
							background: selected
								? `linear-gradient(135deg, ${cfg.from}, ${cfg.to})`
								: cfg.from + '18',
							transition: 'background 0.2s',
							'& .group:hover &': {
								background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})`
							}
						}}
					>
						<FuseSvgIcon
							size={20}
							sx={{ color: selected ? 'white' : cfg.from }}
						>
							{cfg.icon}
						</FuseSvgIcon>
					</Box>

					{/* Info */}
					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						{/* Name + type badge */}
						<div className="flex flex-wrap items-center gap-2">
							<Typography className="truncate text-sm font-bold leading-none">
								{role.name}
							</Typography>
							<Box
								className="inline-flex items-center gap-1 rounded-full px-2 py-[2px]"
								sx={{ background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})` }}
							>
								<FuseSvgIcon className="text-white" size={9}>{cfg.icon}</FuseSvgIcon>
								<Typography className="text-[10px] font-bold leading-none text-white whitespace-nowrap">
									{cfg.label}
								</Typography>
							</Box>
						</div>

						{/* Created date */}
						{createdDate && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={10} color="action">lucide:calendar</FuseSvgIcon>
								<Typography className="text-[11px]" color="text.secondary">
									Created {createdDate}
								</Typography>
							</div>
						)}
					</div>

					{/* Chevron */}
					<Box
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover:translate-x-0.5"
						sx={{ color: 'text.disabled' }}
					>
						<FuseSvgIcon size={16}>lucide:chevron-right</FuseSvgIcon>
					</Box>
				</div>
			</Box>
		</motion.div>
	);
}

export default RoleListItem;
export { TYPE_CONFIG, DEFAULT_CONFIG };