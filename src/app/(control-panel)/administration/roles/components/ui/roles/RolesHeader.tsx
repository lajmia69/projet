'use client';

import { useState } from 'react';
import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import { motion, AnimatePresence } from 'motion/react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useSnackbar } from 'notistack';

import { useRolesAppContext } from '../../../Contexts/useRolesAppContext';
import { useFilteredRoles } from '../../../api/hooks/useFilteredRoles';
import { useIsSuperAdmin } from '../../../api/hooks/useIsSuperAdmin';
import RoleDialog from './RoleDialog';

// ─── Component ────────────────────────────────────────────────────────────────

function RolesHeader() {
	const { searchText, setSearchText } = useRolesAppContext();
	const { data: filteredRoles }       = useFilteredRoles();
	const isSuperAdmin                  = useIsSuperAdmin();
	const { enqueueSnackbar }           = useSnackbar();

	const [dialogOpen, setDialogOpen] = useState(false);

	const filtered    = filteredRoles?.length ?? 0;
	const isFiltering = searchText.length > 0;

	function handleAddClick() {
		if (!isSuperAdmin) {
			enqueueSnackbar('Access denied – only Super Admins can create roles.', {
				variant: 'error',
				anchorOrigin: { vertical: 'top', horizontal: 'center' }
			});
			return;
		}
		setDialogOpen(true);
	}

	return (
		<>
			<div className="w-full">
				{/* ── Hero banner ── */}
				<Box
					className="relative overflow-hidden"
					sx={(t) => ({
						background: `linear-gradient(135deg, ${t.palette.secondary.dark} 0%, ${t.palette.secondary.main} 50%, ${t.palette.primary.main} 100%)`
					})}
				>
					{/* Grid texture */}
					<svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]">
						<defs>
							<pattern id="rh-grid" width="36" height="36" patternUnits="userSpaceOnUse">
								<path d="M 36 0 L 0 0 0 36" fill="none" stroke="white" strokeWidth="0.7" />
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#rh-grid)" />
					</svg>
					<div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white opacity-[0.06] blur-3xl" />

					<div className="relative px-6 pt-5 pb-6 md:px-8">
						<PageBreadcrumb className="mb-3 [&_*]:!text-white/60" />

						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							{/* Title */}
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
								className="flex items-center gap-3"
							>
								<Box
									className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
									sx={{
										backgroundColor: 'rgba(255,255,255,0.18)',
										backdropFilter: 'blur(10px)',
										border: '1px solid rgba(255,255,255,0.25)'
									}}
								>
									<FuseSvgIcon className="text-white" size={20}>lucide:shield</FuseSvgIcon>
								</Box>
								<div>
									<Typography className="text-2xl font-black tracking-tight text-white md:text-3xl">
										Roles
									</Typography>
									<Typography className="text-xs text-white/60 mt-0.5">
										{isFiltering
											? `${filtered} result${filtered !== 1 ? 's' : ''}`
											: 'Manage permission roles'
										}
									</Typography>
								</div>
							</motion.div>

							{/* Search + Add */}
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.4 } }}
								className="flex items-center gap-2"
							>
								<Box
									className="flex h-9 items-center gap-2 rounded-xl px-3"
									sx={{
										backgroundColor: 'rgba(255,255,255,0.14)',
										backdropFilter: 'blur(12px)',
										border: '1px solid rgba(255,255,255,0.22)',
										minWidth: 200,
										transition: 'all 0.2s',
										'&:focus-within': {
											backgroundColor: 'rgba(255,255,255,0.22)',
											borderColor: 'rgba(255,255,255,0.5)'
										}
									}}
								>
									<FuseSvgIcon sx={{ color: 'rgba(255,255,255,0.65)' }} size={14}>lucide:search</FuseSvgIcon>
									<Input
										placeholder="Search roles…"
										disableUnderline
										fullWidth
										value={searchText}
										onChange={(ev) => setSearchText(ev.target.value)}
										sx={{
											color: 'white',
											fontSize: '0.85rem',
											'& input::placeholder': { color: 'rgba(255,255,255,0.45)', opacity: 1 }
										}}
									/>
									<AnimatePresence>
										{searchText && (
											<motion.button
												initial={{ opacity: 0, scale: 0.6 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.6 }}
												onClick={() => setSearchText('')}
												className="flex shrink-0 items-center text-white/50 hover:text-white"
											>
												<FuseSvgIcon size={13}>lucide:x</FuseSvgIcon>
											</motion.button>
										)}
									</AnimatePresence>
								</Box>

								<Tooltip title={isSuperAdmin ? 'Create a new role' : 'Only Super Admins can create roles'} arrow>
									<span>
										<Button
											variant="contained"
											onClick={handleAddClick}
											startIcon={<FuseSvgIcon size={16}>lucide:plus</FuseSvgIcon>}
											className="h-9 shrink-0 rounded-xl px-4 font-bold"
											sx={{
												backgroundColor: 'white',
												color: 'secondary.dark',
												boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
												opacity: isSuperAdmin ? 1 : 0.6,
												'&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
											}}
										>
											Add
										</Button>
									</span>
								</Tooltip>
							</motion.div>
						</div>
					</div>
				</Box>

				{/* ── Filter results indicator ── */}
				{isFiltering && (
					<Box
						className="border-b px-6 py-3 md:px-8"
						sx={{ backgroundColor: 'background.paper', borderColor: 'divider' }}
					>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="flex items-center gap-2"
						>
							<Typography className="text-[10px] font-bold uppercase tracking-widest" color="text.disabled">
								Results
							</Typography>
							<Typography className="text-[11px] font-semibold" color="text.secondary">
								{filtered} role{filtered !== 1 ? 's' : ''} match "{searchText}"
							</Typography>
						</motion.div>
					</Box>
				)}
			</div>

			<RoleDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
		</>
	);
}

export default RolesHeader;