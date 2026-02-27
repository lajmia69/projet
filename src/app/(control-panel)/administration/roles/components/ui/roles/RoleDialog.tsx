'use client';

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';
import { useSnackbar } from 'notistack';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

import { useCreateRole, useUpdateRole } from '../../../api/hooks/Useroles';
import RoleModel from '../../../api/models/RoleModel';
import { Role } from '../../../api/types';

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Role name is required').min(2, 'Must be at least 2 characters'),
	type: z.string().min(1, 'Role type is required')
});

type FormType = z.infer<typeof schema>;

// ─── Role type config ─────────────────────────────────────────────────────────

const ROLE_TYPES = [
	{ value: 'Contact',               label: 'Contact',              icon: 'lucide:user',         color: '#64748b' },
	{ value: 'SuperAdmin',            label: 'Super Admin',           icon: 'lucide:shield-alert', color: '#dc2626' },
	{ value: 'ContentAdmin',          label: 'Content Admin',         icon: 'lucide:file-check',   color: '#2563eb' },
	{ value: 'MemberAdmin',           label: 'Member Admin',          icon: 'lucide:users-cog',    color: '#7c3aed' },
	{ value: 'StudioAdmin',           label: 'Studio Admin',          icon: 'lucide:video-cog',    color: '#f97316' },
	{ value: 'RadioContentCreator',   label: 'Radio Creator',         icon: 'lucide:radio',        color: '#06b6d4' },
	{ value: 'PodcastContentCreator', label: 'Podcast Creator',       icon: 'lucide:mic-2',        color: '#ec4899' },
	{ value: 'CultureContentCreator', label: 'Culture Creator',       icon: 'lucide:palette',      color: '#f59e0b' },
	{ value: 'Lesson Content Creator', label: 'Lesson Content Creator', icon: 'lucide:book-open',  color: '#8b5cf6' },
	{ value: 'StudioStaff',           label: 'Studio Staff',          icon: 'lucide:users',        color: '#0ea5e9' },
	{ value: 'Member',                label: 'Member',                icon: 'lucide:user-check',   color: '#22c55e' },
	{ value: 'Application',           label: 'Application',           icon: 'lucide:app-window',   color: '#a16207' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

type RoleDialogProps = {
	open: boolean;
	onClose: () => void;
	role?: Role;
};

// ─── Component ────────────────────────────────────────────────────────────────

function RoleDialog({ open, onClose, role }: RoleDialogProps) {
	const { enqueueSnackbar } = useSnackbar();
	const isNew = !role?.id;

	const { mutate: createRole, isPending: isCreating } = useCreateRole();
	const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
	const isSaving = isCreating || isUpdating;

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { isValid, dirtyFields, errors }
	} = useForm<FormType>({
		mode: 'all',
		resolver: zodResolver(schema),
		defaultValues: RoleModel({})
	});

	const selectedType = watch('type');
	const selectedTypeConfig = ROLE_TYPES.find((t) => t.value === selectedType);
	const isDirty = Object.keys(dirtyFields).length > 0;

	useEffect(() => {
		if (open) {
			reset(role ? { ...role } : RoleModel({}));
		}
	}, [open, role, reset]);

	function onSubmit(data: FormType) {
		if (isNew) {
			const { id, ...rest } = data;
			createRole(rest as Omit<Role, 'id'>, {
				onSuccess: () => {
					enqueueSnackbar('Role created successfully', { variant: 'success' });
					onClose();
				},
				onError: (error: any) => {
					if (error?.response?.status === 401) {
						enqueueSnackbar('You do not have permission to create roles', { variant: 'error' });
					} else {
						enqueueSnackbar('Failed to create role', { variant: 'error' });
					}
				}
			});
		} else {
			updateRole(data as Role, {
				onSuccess: () => {
					enqueueSnackbar('Role updated successfully', { variant: 'success' });
					onClose();
				},
				onError: (error: any) => {
					if (error?.response?.status === 401) {
						enqueueSnackbar('You do not have permission to update roles', { variant: 'error' });
					} else {
						enqueueSnackbar('Failed to update role', { variant: 'error' });
					}
				}
			});
		}
	}

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '20px',
					overflow: 'visible',
					boxShadow: '0 32px 64px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)'
				}
			}}
		>
			{/* ── Gradient header ── */}
			<Box
				className="relative overflow-hidden rounded-t-[20px] px-6 pt-6 pb-5"
				sx={(t) => ({
					background: `linear-gradient(135deg, ${t.palette.secondary.dark} 0%, ${t.palette.secondary.main} 55%, ${t.palette.primary.main} 100%)`
				})}
			>
				<svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
					<defs>
						<pattern id="rdg" width="28" height="28" patternUnits="userSpaceOnUse">
							<path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth="0.6" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#rdg)" />
				</svg>
				<div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white opacity-[0.05] blur-2xl" />

				<div className="relative flex items-start justify-between gap-4">
					<div className="flex items-center gap-3">
						<AnimatePresence mode="wait">
							<motion.div
								key={selectedTypeConfig?.value ?? 'default'}
								initial={{ scale: 0.6, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.6, opacity: 0 }}
								transition={{ duration: 0.2 }}
							>
								<Box
									className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
									sx={{
										backgroundColor: selectedTypeConfig
											? selectedTypeConfig.color + '28'
											: 'rgba(255,255,255,0.15)',
										border: '1px solid rgba(255,255,255,0.2)',
										backdropFilter: 'blur(8px)'
									}}
								>
									<FuseSvgIcon className="text-white" size={24}>
										{selectedTypeConfig?.icon ?? 'lucide:shield'}
									</FuseSvgIcon>
								</Box>
							</motion.div>
						</AnimatePresence>

						<div>
							<Typography className="text-lg font-black leading-tight text-white">
								{isNew ? 'New Role' : 'Edit Role'}
							</Typography>
							<Typography className="text-xs text-white/60 mt-0.5">
								{isNew ? 'Create a new permission role' : `Editing: ${role?.name}`}
							</Typography>
						</div>
					</div>

					<IconButton
						size="small"
						onClick={onClose}
						sx={{
							color: 'rgba(255,255,255,0.7)',
							'&:hover': { color: 'white', backgroundColor: 'rgba(255,255,255,0.15)' }
						}}
					>
						<FuseSvgIcon size={18}>lucide:x</FuseSvgIcon>
					</IconButton>
				</div>
			</Box>

			{/* ── Form body ── */}
			<DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
				<form id="role-dialog-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
					{/* Name field */}
					<Controller
						name="name"
						control={control}
						render={({ field }) => (
							<FormControl className="w-full">
								<FormLabel htmlFor="role-name" sx={{ mb: 0.75, fontWeight: 700, fontSize: '0.8rem' }}>
									Role Name *
								</FormLabel>
								<TextField
									{...field}
									id="role-name"
									placeholder="e.g. Content Moderator"
									variant="outlined"
									fullWidth
									autoFocus
									error={!!errors.name}
									helperText={errors.name?.message}
									slotProps={{
										input: {
											style: { minHeight: 50 },
											startAdornment: (
												<Box className="mr-2 flex items-center">
													<FuseSvgIcon color="action" size={18}>lucide:pencil-line</FuseSvgIcon>
												</Box>
											)
										}
									}}
								/>
							</FormControl>
						)}
					/>

					{/* Type chip grid */}
					<Controller
						name="type"
						control={control}
						render={({ field: { onChange, value } }) => (
							<FormControl className="w-full">
								<FormLabel sx={{ mb: 0.75, fontWeight: 700, fontSize: '0.8rem' }}>
									Role Type *
								</FormLabel>

								<div className="grid grid-cols-3 gap-2">
									{ROLE_TYPES.map((rt) => {
										const selected = value === rt.value;
										return (
											<Box
												key={rt.value}
												component="button"
												type="button"
												onClick={() => onChange(rt.value)}
												className="flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-xs font-bold transition-all duration-150"
												sx={{
													borderColor: selected ? rt.color : 'divider',
													backgroundColor: selected ? rt.color + '12' : 'background.paper',
													color: selected ? rt.color : 'text.secondary',
													boxShadow: selected ? `0 2px 10px ${rt.color}30` : 'none',
													'&:hover': { borderColor: rt.color, color: rt.color, backgroundColor: rt.color + '08' }
												}}
											>
												<Box
													className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
													sx={{ background: selected ? rt.color : 'action.hover' }}
												>
													<FuseSvgIcon size={12} sx={{ color: selected ? 'white' : 'text.disabled' }}>
														{rt.icon}
													</FuseSvgIcon>
												</Box>
												<span className="leading-tight truncate">{rt.label}</span>
												<AnimatePresence>
													{selected && (
														<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="ml-auto shrink-0">
															<FuseSvgIcon size={12} sx={{ color: rt.color }}>lucide:check-circle-2</FuseSvgIcon>
														</motion.div>
													)}
												</AnimatePresence>
											</Box>
										);
									})}
								</div>

								{errors.type && (
									<Typography className="mt-1 text-xs" color="error">{errors.type.message}</Typography>
								)}
							</FormControl>
						)}
					/>
				</form>
			</DialogContent>

			<Divider sx={{ mx: 3, mt: 2 }} />

			{/* ── Actions ── */}
			<DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
				<Button variant="outlined" size="small" onClick={onClose} sx={{ borderRadius: '10px', px: 2.5 }}>
					Cancel
				</Button>
				<Button
					type="submit"
					form="role-dialog-form"
					variant="contained"
					color="secondary"
					size="small"
					disabled={!isValid || (!isNew && !isDirty) || isSaving}
					startIcon={<FuseSvgIcon size={15}>{isSaving ? 'lucide:loader-2' : 'lucide:save'}</FuseSvgIcon>}
					sx={{ borderRadius: '10px', px: 2.5, fontWeight: 700 }}
				>
					{isSaving ? 'Saving…' : isNew ? 'Create Role' : 'Save Changes'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default RoleDialog;