'use client';

import { useState } from 'react';
import {
	Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
	DialogTitle, Divider, IconButton, Paper, TextField, Tooltip, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import {
	useCulturalProjectTypes,
	useCreateCulturalProjectType,
	useUpdateCulturalProjectType,
	useDeleteCulturalProjectType
} from '../../api/hooks/useCultureProjectsActivities';
import { CulturalProjectType } from '../../api/types/projectsAndActivities';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.vars.palette.primary.dark,
		color: theme.palette.getContrastText(theme.palette.primary.main)
	}
}));

// ─── Type Row ─────────────────────────────────────────────────────────────────

function TypeRow({
	type,
	onEdit,
	onDelete
}: {
	type: CulturalProjectType;
	onEdit: (t: CulturalProjectType) => void;
	onDelete: (id: number) => void;
}) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<>
			<Paper
				sx={{
					display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2,
					borderRadius: '12px', border: '1px solid', borderColor: 'divider',
					transition: 'box-shadow .2s',
					'&:hover': { boxShadow: 3 }
				}}
			>
				<Box sx={{
					width: 40, height: 40, borderRadius: '10px',
					backgroundColor: 'primary.main', display: 'flex',
					alignItems: 'center', justifyContent: 'center', flexShrink: 0
				}}>
					<FuseSvgIcon size={18} sx={{ color: 'primary.contrastText' }}>lucide:folder</FuseSvgIcon>
				</Box>

				<div className="flex-1 min-w-0">
					<Typography fontWeight={700} noWrap>{type.name}</Typography>
					{type.description && (
						<Typography variant="body2" color="text.secondary" noWrap>{type.description}</Typography>
					)}
				</div>

				<Chip label={`ID ${type.id}`} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />

				<Tooltip title="Edit">
					<IconButton size="small" onClick={() => onEdit(type)}>
						<FuseSvgIcon size={16}>lucide:pencil</FuseSvgIcon>
					</IconButton>
				</Tooltip>
				<Tooltip title="Delete">
					<IconButton size="small" color="error" onClick={() => setConfirmOpen(true)}>
						<FuseSvgIcon size={16}>lucide:trash-2</FuseSvgIcon>
					</IconButton>
				</Tooltip>
			</Paper>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth
				PaperProps={{ sx: { borderRadius: '14px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Delete Type?</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						<strong>{type.name}</strong> will be permanently deleted. Any projects using this type may be affected.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined">Cancel</Button>
					<Button onClick={() => { onDelete(type.id); setConfirmOpen(false); }} variant="contained" color="error">Delete</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

// ─── Form Dialog ─────────────────────────────────────────────────────────────

function TypeFormDialog({
	open,
	initial,
	onClose
}: {
	open: boolean;
	initial: CulturalProjectType | null;
	onClose: () => void;
}) {
	const { mutate: create, isPending: creating } = useCreateCulturalProjectType();
	const { mutate: update, isPending: updating } = useUpdateCulturalProjectType();
	const isPending = creating || updating;

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	// Sync when dialog opens
	const handleOpen = () => {
		setName(initial?.name ?? '');
		setDescription(initial?.description ?? '');
	};

	const handleSubmit = () => {
		if (!name.trim()) return;
		if (initial) {
			update({ id: initial.id, name: name.trim(), description: description.trim() }, { onSuccess: onClose });
		} else {
			create({ name: name.trim(), description: description.trim() }, { onSuccess: onClose });
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="xs"
			TransitionProps={{ onEnter: handleOpen }}
			PaperProps={{ sx: { borderRadius: '16px' } }}
		>
			<DialogTitle sx={{ fontWeight: 800 }}>{initial ? 'Edit Project Type' : 'New Project Type'}</DialogTitle>
			<Divider />
			<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
				<TextField
					label="Name *" size="small" value={name}
					onChange={e => setName(e.target.value)} fullWidth autoFocus
				/>
				<TextField
					label="Description" size="small" value={description}
					onChange={e => setDescription(e.target.value)} fullWidth multiline minRows={2}
				/>
			</DialogContent>
			<Divider />
			<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
				<Button onClick={onClose} variant="outlined" disabled={isPending}>Cancel</Button>
				<Button
					onClick={handleSubmit} variant="contained" color="secondary"
					disabled={!name.trim() || isPending}
					startIcon={isPending ? <CircularProgress size={14} /> : <FuseSvgIcon size={15}>lucide:check</FuseSvgIcon>}
				>
					{isPending ? 'Saving…' : initial ? 'Save' : 'Create'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

// ─── Main View ────────────────────────────────────────────────────────────────

const listVariants = { show: { transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function CulturalProjectTypesView() {
	const { data: types = [], isLoading } = useCulturalProjectTypes();
	const { mutate: deleteType } = useDeleteCulturalProjectType();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editing, setEditing] = useState<CulturalProjectType | null>(null);
	const [search, setSearch] = useState('');

	const filtered = types.filter(t =>
		t.name.toLowerCase().includes(search.toLowerCase()) ||
		t.description?.toLowerCase().includes(search.toLowerCase())
	);

	const openCreate = () => { setEditing(null); setDialogOpen(true); };
	const openEdit = (t: CulturalProjectType) => { setEditing(t); setDialogOpen(true); };

	if (isLoading) return <FuseLoading />;

	return (
		<>
			<Root
				header={
					<Box className="relative flex shrink-0 items-center justify-center overflow-hidden px-4 py-10 md:p-16">
						<div className="mx-auto flex w-full flex-col items-center justify-center">
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
								<PageBreadcrumb color="inherit" borderColor="inherit" className="mb-4" />
							</motion.div>
							<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}>
								<Typography color="inherit" className="text-center text-4xl font-extrabold tracking-tight">
									Project Types
								</Typography>
							</motion.div>
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }}>
								<Typography color="inherit" className="mt-2 text-center text-lg opacity-75">
									Manage the categories used when creating cultural projects.
								</Typography>
							</motion.div>
							<motion.div
								initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}
								style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '4px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.1)' }}
							>
								<FuseSvgIcon size={13} sx={{ color: 'rgba(255,255,255,0.7)' }}>lucide:folder</FuseSvgIcon>
								<Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
									{types.length} {types.length === 1 ? 'type' : 'types'}
								</Typography>
							</motion.div>
						</div>
						<svg className="pointer-events-none absolute inset-0" viewBox="0 0 960 540" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
							<g className="opacity-5" fill="none" stroke="currentColor" strokeWidth="100">
								<circle r="234" cx="196" cy="23" /><circle r="234" cx="790" cy="491" />
							</g>
						</svg>
					</Box>
				}
				content={
					<div className="mx-auto w-full max-w-2xl p-6 flex flex-col gap-4">
						{/* Toolbar */}
						<div className="flex items-center gap-2 flex-wrap">
							<TextField
								size="small" placeholder="Search types…" value={search}
								onChange={e => setSearch(e.target.value)}
								sx={{ flex: 1, minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
							/>
							<Button
								onClick={openCreate} variant="contained" color="secondary" size="small"
								startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
								sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', whiteSpace: 'nowrap' }}
							>
								New type
							</Button>
						</div>

						{/* List */}
						{filtered.length > 0 ? (
							<motion.div className="flex flex-col gap-2" variants={listVariants} initial="hidden" animate="show">
								{filtered.map(t => (
									<motion.div key={t.id} variants={itemVariants}>
										<TypeRow type={t} onEdit={openEdit} onDelete={deleteType} />
									</motion.div>
								))}
							</motion.div>
						) : (
							<div className="flex flex-col items-center gap-3 py-20">
								<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:folder-x</FuseSvgIcon>
								<Typography color="text.secondary" variant="h6">No project types yet</Typography>
								<Typography color="text.disabled" variant="body2">
									You need at least one type before you can create a project.
								</Typography>
								<Button onClick={openCreate} variant="outlined" color="secondary"
									startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}>
									Create your first type
								</Button>
							</div>
						)}
					</div>
				}
				scroll="page"
			/>

			<TypeFormDialog open={dialogOpen} initial={editing} onClose={() => setDialogOpen(false)} />
		</>
	);
}