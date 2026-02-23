'use client';

import { useMemo, useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TablePagination from '@mui/material/TablePagination';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'motion/react';
import FuseLoading from '@fuse/core/FuseLoading';
import { useSnackbar } from 'notistack';

import { useRoles, useDeleteRoles } from '../../../api/hooks/Useroles';
import { Role } from '../../../api/types';
import RoleDialog from './RoleDialog';

// ─── Same super-admin hook as RolesHeader ─────────────────────────────────────
function useIsSuperAdmin(): boolean {
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { useUser } = require('@fuse/core/FuseAuthorization/useUser');
		const user = useUser?.();
		const role: string =
			user?.role ?? user?.data?.role ?? user?.roles?.[0] ?? '';
		return role === 'super_admin';
	} catch {
		try {
			const stored = localStorage.getItem('user');
			if (stored) {
				const parsed = JSON.parse(stored);
				const role: string =
					parsed?.role ?? parsed?.data?.role ?? parsed?.roles?.[0] ?? '';
				return role === 'super_admin';
			}
		} catch {
			// ignore
		}
		return true; // dev fallback
	}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type SortOrder = 'asc' | 'desc';
type SortKey = keyof Role;

function formatDate(dateStr: string | undefined) {
	if (!dateStr) return '—';
	return new Date(dateStr).toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
}

const TYPE_COLORS: Record<string, string> = {
	SuperAdmin:             '#dc2626',
	ContentAdmin:           '#2563eb',
	MemberAdmin:            '#7c3aed',
	StudioAdmin:            '#f97316',
	RadioContentCreator:    '#06b6d4',
	PodcastContentCreator:  '#ec4899',
	CultureContentCreator:  '#f59e0b',
	Teacher:                '#8b5cf6',
	StudioStaff:            '#0ea5e9',
	Member:                 '#22c55e',
	Application:            '#a16207',
	Contact:                '#64748b'
};

const headCells: { id: SortKey; label: string; minWidth?: number }[] = [
	{ id: 'name',      label: 'Role Name',     minWidth: 160 },
	{ id: 'type',      label: 'Role Type',     minWidth: 160 },
	{ id: 'createdAt', label: 'Created',        minWidth: 180 },
	{ id: 'updatedAt', label: 'Last Modified', minWidth: 180 }
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if ((b[orderBy] ?? '') < (a[orderBy] ?? '')) return -1;
	if ((b[orderBy] ?? '') > (a[orderBy] ?? '')) return 1;
	return 0;
}

function getComparator(order: SortOrder, orderBy: SortKey) {
	return order === 'desc'
		? (a: Role, b: Role) => descendingComparator(a, b, orderBy)
		: (a: Role, b: Role) => -descendingComparator(a, b, orderBy);
}

// ─── Component ────────────────────────────────────────────────────────────────

function RolesTable() {
	const { data: roles = [], isLoading } = useRoles();
	const { mutate: deleteRoles } = useDeleteRoles();
	const { enqueueSnackbar } = useSnackbar();
	const isSuperAdmin = useIsSuperAdmin();

	const [order,       setOrder]       = useState<SortOrder>('asc');
	const [orderBy,     setOrderBy]     = useState<SortKey>('name');
	const [selected,    setSelected]    = useState<string[]>([]);
	const [page,        setPage]        = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const [editRole,   setEditRole]   = useState<Role | undefined>(undefined);
	const [dialogOpen, setDialogOpen] = useState(false);

	function openEdit(role: Role) {
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

	function closeDialog() {
		setDialogOpen(false);
		setEditRole(undefined);
	}

	const handleSort = (property: SortKey) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelected(e.target.checked ? roles.map((r) => r.id) : []);
	};

	const handleSelect = (id: string) => {
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
		);
	};

	const handleDeleteSelected = () => {
		if (!isSuperAdmin) {
			enqueueSnackbar('Access denied – only Super Admins can delete roles.', { variant: 'error' });
			return;
		}
		deleteRoles(selected);
		setSelected([]);
	};

	const sortedRoles = useMemo(
		() => [...roles].sort(getComparator(order, orderBy)),
		[roles, order, orderBy]
	);

	const paginatedRoles = sortedRoles.slice(
		page * rowsPerPage,
		page * rowsPerPage + rowsPerPage
	);

	if (isLoading) return <FuseLoading />;

	const numSelected = selected.length;
	const rowCount    = roles.length;

	return (
		<>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="w-full"
			>
				<Paper className="w-full overflow-hidden shadow-none" elevation={0}>
					{/* Bulk-action toolbar */}
					{numSelected > 0 && (
						<Toolbar className="flex items-center justify-between px-4"
							sx={{ backgroundColor: 'secondary.light' }}>
							<Typography color="inherit" variant="subtitle1">
								{numSelected} selected
							</Typography>
							<Tooltip title="Delete selected">
								<IconButton onClick={handleDeleteSelected}>
									<FuseSvgIcon>lucide:trash</FuseSvgIcon>
								</IconButton>
							</Tooltip>
						</Toolbar>
					)}

					<TableContainer>
						<Table stickyHeader aria-label="roles table">
							<TableHead>
								<TableRow>
									<TableCell padding="checkbox">
										<Checkbox
											indeterminate={numSelected > 0 && numSelected < rowCount}
											checked={rowCount > 0 && numSelected === rowCount}
											onChange={handleSelectAll}
											inputProps={{ 'aria-label': 'select all roles' }}
										/>
									</TableCell>

									{headCells.map((cell) => (
										<TableCell
											key={cell.id}
											style={{ minWidth: cell.minWidth }}
											sortDirection={orderBy === cell.id ? order : false}
										>
											<TableSortLabel
												active={orderBy === cell.id}
												direction={orderBy === cell.id ? order : 'asc'}
												onClick={() => handleSort(cell.id)}
											>
												<span className="font-semibold">{cell.label}</span>
											</TableSortLabel>
										</TableCell>
									))}

									<TableCell align="right" />
								</TableRow>
							</TableHead>

							<TableBody>
								{paginatedRoles.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={headCells.length + 2}
											align="center"
											className="py-16"
											sx={{ color: 'text.disabled' }}
										>
											No roles found
										</TableCell>
									</TableRow>
								) : (
									paginatedRoles.map((role) => {
										const isSelected = selected.includes(role.id);
										const color = TYPE_COLORS[role.type] ?? '#64748b';
										return (
											<TableRow
												key={role.id}
												hover
												selected={isSelected}
												aria-checked={isSelected}
											>
												<TableCell padding="checkbox">
													<Checkbox
														checked={isSelected}
														onChange={() => handleSelect(role.id)}
														inputProps={{ 'aria-label': `select role ${role.name}` }}
													/>
												</TableCell>

												{/* Name */}
												<TableCell>
													<div className="flex items-center gap-2">
														<Box
															className="h-2.5 w-2.5 rounded-full shrink-0"
															sx={{ backgroundColor: color }}
														/>
														<Typography variant="body2" className="font-semibold">
															{role.name}
														</Typography>
													</div>
												</TableCell>

												{/* Type badge */}
												<TableCell>
													<Box
														className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold"
														sx={{
															backgroundColor: color + '18',
															color,
															border: `1px solid ${color}30`
														}}
													>
														{role.type}
													</Box>
												</TableCell>

												<TableCell>
													<Typography variant="body2" color="text.secondary">
														{formatDate(role.createdAt)}
													</Typography>
												</TableCell>

												<TableCell>
													<Typography variant="body2" color="text.secondary">
														{formatDate(role.updatedAt)}
													</Typography>
												</TableCell>

												<TableCell align="right">
													<Tooltip
														title={isSuperAdmin ? 'Edit role' : 'Only Super Admins can edit roles'}
														arrow
													>
														<span>
															<IconButton
																size="small"
																onClick={() => openEdit(role)}
																sx={{ opacity: isSuperAdmin ? 1 : 0.4 }}
															>
																<FuseSvgIcon size={18}>lucide:pencil</FuseSvgIcon>
															</IconButton>
														</span>
													</Tooltip>
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</TableContainer>

					<TablePagination
						rowsPerPageOptions={[5, 10, 25, 50]}
						component="div"
						count={roles.length}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={(_, newPage) => setPage(newPage)}
						onRowsPerPageChange={(e) => {
							setRowsPerPage(parseInt(e.target.value, 10));
							setPage(0);
						}}
					/>
				</Paper>
			</motion.div>

			{/* Edit dialog */}
			<RoleDialog open={dialogOpen} onClose={closeDialog} role={editRole} />
		</>
	);
}

export default RolesTable;