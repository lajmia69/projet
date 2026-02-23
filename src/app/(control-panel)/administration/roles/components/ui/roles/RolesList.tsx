'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import { useSnackbar } from 'notistack';

import RoleListItem, { TYPE_CONFIG, DEFAULT_CONFIG } from './RoleListItem';
import RoleDialog from './RoleDialog';
import { useFilteredRoles } from '../../../api/hooks/useFilteredRoles';
import { useIsSuperAdmin } from '../../../api/hooks/useIsSuperAdmin';
import { Role } from '../../../api/types';

// ─── Component ────────────────────────────────────────────────────────────────

function RolesList() {
	const { data: roles, isLoading } = useFilteredRoles();
	const isSuperAdmin = useIsSuperAdmin();
	const { enqueueSnackbar } = useSnackbar();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editRole,   setEditRole]   = useState<Role | undefined>(undefined);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	function openCreate() {
		if (!isSuperAdmin) {
			enqueueSnackbar('Access denied – only Super Admins can create roles.', {
				variant: 'error',
				anchorOrigin: { vertical: 'top', horizontal: 'center' }
			});
			return;
		}
		setEditRole(undefined);
		setDialogOpen(true);
	}

	function openEdit(role: Role) {
		setSelectedId(role.id);
		if (!isSuperAdmin) {
			enqueueSnackbar('Access denied – only Super Admins can edit roles.', {
				variant: 'error',
				anchorOrigin: { vertical: 'top', horizontal: 'center' }
			});
			return;
		}
		setEditRole(role);
		setDialogOpen(true);
	}

	// Group roles by type
	const grouped = useMemo((): Record<string, Role[]> => {
		if (!roles) return {};
		return roles.reduce<Record<string, Role[]>>((acc, role) => {
			const key = role.type || 'Unknown';
			if (!acc[key]) acc[key] = [];
			acc[key].push(role);
			return acc;
		}, {});
	}, [roles]);

	if (isLoading) {
		return (
			<div className="flex flex-1 items-center justify-center py-24">
				<FuseLoading />
			</div>
		);
	}

	if (!roles?.length) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
				className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-28 text-center"
			>
				<div className="relative flex h-28 w-44 items-center justify-center">
					{[
						{ color: '#dc2626', icon: 'lucide:shield-alert', left: 0,  top: 14 },
						{ color: '#7c3aed', icon: 'lucide:users-cog',    left: 46, top: 0  },
						{ color: '#22c55e', icon: 'lucide:user-check',   left: 92, top: 14 }
					].map(({ color, icon, left, top }, i) => (
						<Box
							key={i}
							className="absolute flex items-center justify-center rounded-full border-2"
							sx={{ width: 52, height: 52, left, top, borderColor: 'background.paper', backgroundColor: color + '18' }}
						>
							<FuseSvgIcon size={22} sx={{ color }}>{icon}</FuseSvgIcon>
						</Box>
					))}
					<Box
						className="absolute -bottom-2 right-0 flex h-9 w-9 items-center justify-center rounded-full shadow-lg"
						sx={(t) => ({ backgroundColor: t.palette.secondary.main, color: 'white', border: '2px solid', borderColor: 'background.paper' })}
					>
						<FuseSvgIcon size={16}>lucide:plus</FuseSvgIcon>
					</Box>
				</div>

				<div className="max-w-xs">
					<Typography className="text-2xl font-extrabold tracking-tight">No roles yet</Typography>
					<Typography className="mt-2 text-sm leading-relaxed" color="text.secondary">
						Create roles to manage permissions across your platform.
					</Typography>
				</div>

				<Button
					variant="contained"
					color="secondary"
					onClick={openCreate}
					startIcon={<FuseSvgIcon size={18}>lucide:shield-plus</FuseSvgIcon>}
					className="rounded-xl px-6 py-2.5 font-bold shadow-lg"
				>
					Create First Role
				</Button>
			</motion.div>
		);
	}

	let globalIndex = 0;

	return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { duration: 0.2 } }}
				className="flex max-h-full w-full flex-auto flex-col overflow-y-auto"
			>
				{Object.entries(grouped).map(([type, typeRoles]) => {
					const cfg = TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
					return (
						<div key={type} className="px-4 pb-2 md:px-6">
							{/* Sticky group header — mirrors ContactsList letter header */}
							<div className="sticky top-0 z-10 flex items-center gap-3 py-3">
								<Box
									className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black"
									sx={{
										background: `linear-gradient(135deg, ${cfg.from}, ${cfg.to})`,
										color: 'white',
										boxShadow: `0 2px 8px ${cfg.from}44`
									}}
								>
									<FuseSvgIcon className="text-white" size={15}>{cfg.icon}</FuseSvgIcon>
								</Box>
								<Box className="h-px flex-1" sx={{ backgroundColor: 'divider' }} />
								<Typography className="text-[11px] font-bold tabular-nums" color="text.disabled">
									{typeRoles.length}
								</Typography>
							</div>

							{/* Role cards */}
							<div className="flex flex-col gap-2">
								{typeRoles.map((role) => (
									<RoleListItem
										key={role.id}
										role={role}
										index={globalIndex++}
										onClick={openEdit}
										selected={selectedId === role.id}
									/>
								))}
							</div>
						</div>
					);
				})}
				<div className="h-8" />
			</motion.div>

			<RoleDialog
				open={dialogOpen}
				onClose={() => { setDialogOpen(false); setEditRole(undefined); }}
				role={editRole}
			/>
		</>
	);
}

export default RolesList;