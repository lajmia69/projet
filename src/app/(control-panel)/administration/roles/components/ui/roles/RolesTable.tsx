// File: src/app/(control-panel)/administration/roles/components/ui/roles/RolesTable.tsx

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
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { motion } from 'motion/react';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseLoading from '@fuse/core/FuseLoading';
import { useRoles, useDeleteRoles } from '../../../api/hooks/Useroles';
import { Role } from '../../../api/types';

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

const headCells: { id: SortKey; label: string; minWidth?: number }[] = [
	{ id: 'id', label: 'ID', minWidth: 100 },
	{ id: 'name', label: 'Role Name', minWidth: 160 },
	{ id: 'type', label: 'Role Type', minWidth: 160 },
	{ id: 'createdAt', label: 'Creation Date', minWidth: 180 },
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

/**
 * The roles table.
 */
function RolesTable() {
	const { data: roles = [], isLoading } = useRoles();
	const { mutate: deleteRoles } = useDeleteRoles();

	const [order, setOrder] = useState<SortOrder>('asc');
	const [orderBy, setOrderBy] = useState<SortKey>('name');
	const [selected, setSelected] = useState<string[]>([]);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	const handleSort = (property: SortKey) => {
		const isAsc = orderBy === property && order === 'asc';
		setOrder(isAsc ? 'desc' : 'asc');
		setOrderBy(property);
	};

	const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.checked) {
			setSelected(roles.map((r) => r.id));
		} else {
			setSelected([]);
		}
	};

	const handleSelect = (id: string) => {
		setSelected((prev) =>
			prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
		);
	};

	const handleDeleteSelected = () => {
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

	if (isLoading) {
		return <FuseLoading />;
	}

	const numSelected = selected.length;
	const rowCount = roles.length;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, transition: { delay: 0.1 } }}
			className="w-full"
		>
			<Paper
				className="w-full overflow-hidden shadow-none"
				elevation={0}
			>
				{numSelected > 0 && (
					<Toolbar className="flex items-center justify-between bg-secondary-light px-4">
						<Typography
							color="inherit"
							variant="subtitle1"
							component="div"
						>
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
					<Table
						stickyHeader
						aria-label="roles table"
					>
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
										className="py-16 text-gray-400"
									>
										No roles found
									</TableCell>
								</TableRow>
							) : (
								paginatedRoles.map((role) => {
									const isSelected = selected.includes(role.id);
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

											<TableCell>
												<Typography
													variant="body2"
													className="font-mono text-xs text-gray-500"
												>
													{role.id}
												</Typography>
											</TableCell>

											<TableCell>
												<Typography
													variant="body2"
													className="font-medium"
												>
													{role.name}
												</Typography>
											</TableCell>

											<TableCell>
												<span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
													{role.type}
												</span>
											</TableCell>

											<TableCell>
												<Typography
													variant="body2"
													className="text-gray-600"
												>
													{formatDate(role.createdAt)}
												</Typography>
											</TableCell>

											<TableCell>
												<Typography
													variant="body2"
													className="text-gray-600"
												>
													{formatDate(role.updatedAt)}
												</Typography>
											</TableCell>

											<TableCell align="right">
												<Tooltip title="Edit role">
													<IconButton
														component={NavLinkAdapter}
														to={`/administration/roles/${role.id}`}
														size="small"
													>
														<FuseSvgIcon size={18}>lucide:pencil</FuseSvgIcon>
													</IconButton>
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
	);
}

export default RolesTable;