'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import {
	Box,
	Chip,
	InputAdornment,
	MenuItem,
	Paper,
	Select,
	TextField,
	FormControl,
	InputLabel,
	Stack,
	Tooltip,
	IconButton
} from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { format, isValid, parseISO } from 'date-fns';
import useUser from '@auth/useUser';
import useNavigate from '@fuse/hooks/useNavigate';
import { useSubscriptionsList } from '../../../api/hooks/useSubscriptionsList';
import { useLevelsList } from '../../../api/hooks/useLevelsList';
import { Subscription } from '../../../api/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function safeFormat(dateStr: string | null | undefined, fmt = 'MMM d, yyyy') {
	if (!dateStr) return '—';
	const d = parseISO(`${dateStr.split('T')[0]}T00:00:00`);
	return isValid(d) ? format(d, fmt) : '—';
}

function resolveLevelId(level: any): number | undefined {
	if (typeof level === 'number') return level;
	return level?.id;
}

function resolveLevelName(level: any, levelMap: Map<number, string>): string | undefined {
	if (typeof level === 'object' && level?.name) return level.name;
	const id = resolveLevelId(level);
	return id !== undefined ? levelMap.get(id) : undefined;
}

const STATUS_OPTIONS = [
	{ value: '', label: 'All Statuses' },
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' }
];

// ─── component ──────────────────────────────────────────────────────────────

function SubscriptionsTable() {
	const { data: currentAccount } = useUser();
	const token = currentAccount.token;
	const navigate = useNavigate();

	const { data: allSubscriptions = [], isLoading: subsLoading } = useSubscriptionsList(token);
	const { data: levels = [], isLoading: levelsLoading } = useLevelsList(token);

	const levelMap = useMemo(
		() => new Map(levels.map((l) => [l.id, l.name])),
		[levels]
	);

	// ── filter state ──
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [startDateFrom, setStartDateFrom] = useState('');
	const [startDateTo, setStartDateTo] = useState('');
	const [endDateFrom, setEndDateFrom] = useState('');
	const [endDateTo, setEndDateTo] = useState('');

	// ── filtered data ──
	const filtered = useMemo(() => {
		let data = [...allSubscriptions];

		if (search.trim()) {
			const q = search.toLowerCase();
			data = data.filter((sub) => {
				const lName = resolveLevelName(sub.level, levelMap) ?? '';
				return (
					String(sub.id).includes(q) ||
					sub.reference?.toLowerCase().includes(q) ||
					lName.toLowerCase().includes(q) ||
					String(sub.account?.id ?? '').includes(q) ||
					(sub.account as any)?.full_name?.toLowerCase().includes(q) ||
					(sub.account as any)?.email?.toLowerCase().includes(q)
				);
			});
		}

		if (statusFilter === 'active') data = data.filter((s) => s.is_active);
		if (statusFilter === 'inactive') data = data.filter((s) => !s.is_active);

		if (startDateFrom)
			data = data.filter((s) => s.start_date && s.start_date >= startDateFrom);
		if (startDateTo)
			data = data.filter((s) => s.start_date && s.start_date <= startDateTo);
		if (endDateFrom)
			data = data.filter((s) => s.end_date && s.end_date >= endDateFrom);
		if (endDateTo)
			data = data.filter((s) => s.end_date && s.end_date <= endDateTo);

		return data;
	}, [allSubscriptions, levelMap, search, statusFilter, startDateFrom, startDateTo, endDateFrom, endDateTo]);

	const hasFilters = !!(search || statusFilter || startDateFrom || startDateTo || endDateFrom || endDateTo);

	function clearFilters() {
		setSearch('');
		setStatusFilter('');
		setStartDateFrom('');
		setStartDateTo('');
		setEndDateFrom('');
		setEndDateTo('');
	}

	// ── columns ──
	const columns = useMemo<MRT_ColumnDef<Subscription>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				grow: false,
				size: 60,
				Cell: ({ cell }) => (
					<Typography
						sx={{
							fontSize: '0.8rem',
							fontWeight: 700,
							fontFamily: 'monospace',
							color: 'text.secondary',
							letterSpacing: '0.02em'
						}}
					>
						#{cell.getValue<number>()}
					</Typography>
				)
			},
			{
				id: 'account',
				header: 'Account',
				grow: 2,
				accessorFn: (row) => (row.account as any)?.full_name ?? '',
				Cell: ({ row }) => {
					const acct = row.original.account as any;
					return (
						<div className="flex flex-col min-w-0">
							<Typography
								sx={{
									fontSize: '0.875rem',
									fontWeight: 600,
									color: 'text.primary',
									lineHeight: 1.4,
									letterSpacing: '0.01em'
								}}
								className="truncate"
							>
								{acct?.full_name ?? `Account #${acct?.id ?? '—'}`}
							</Typography>
							{acct?.email && (
								<Typography
									sx={{
										fontSize: '0.775rem',
										fontWeight: 400,
										color: 'text.secondary',
										letterSpacing: '0.01em'
									}}
									className="truncate"
								>
									{acct.email}
								</Typography>
							)}
						</div>
					);
				}
			},
			{
				accessorKey: 'reference',
				header: 'Reference',
				grow: 2,
				Cell: ({ cell }) => (
					<Typography
						sx={{
							fontSize: '0.825rem',
							fontWeight: 500,
							color: 'text.primary',
							letterSpacing: '0.015em',
							fontFamily: 'monospace'
						}}
						className="truncate"
					>
						{cell.getValue<string>() || '—'}
					</Typography>
				)
			},
			{
				id: 'level',
				header: 'Level',
				grow: 1,
				accessorFn: (row) => resolveLevelName(row.level, levelMap) ?? '',
				Cell: ({ row }) => {
					const levelName = resolveLevelName(row.original.level, levelMap);
					return levelName ? (
						<Chip
							label={levelName}
							size="small"
							sx={{
								backgroundColor: '#eff6ff',
								color: '#1d4ed8',
								border: '1px solid #bfdbfe',
								fontWeight: 700,
								fontSize: '0.775rem',
								letterSpacing: '0.02em',
								maxWidth: '100%',
								height: 24
							}}
						/>
					) : (
						<Typography sx={{ fontSize: '0.875rem', color: 'text.disabled' }}>—</Typography>
					);
				}
			},
			{
				id: 'status',
				header: 'Status',
				grow: false,
				size: 100,
				accessorFn: (row) => row.is_active,
				Cell: ({ row }) => (
					<Chip
						label={row.original.is_active ? 'Active' : 'Inactive'}
						size="small"
						sx={{
							backgroundColor: row.original.is_active ? '#dcfce7' : '#f1f5f9',
							color: row.original.is_active ? '#15803d' : '#475569',
							border: `1px solid ${row.original.is_active ? '#86efac' : '#cbd5e1'}`,
							fontWeight: 700,
							fontSize: '0.775rem',
							letterSpacing: '0.03em',
							height: 24
						}}
					/>
				)
			},
			{
				id: 'start_date',
				header: 'Start Date',
				grow: false,
				size: 120,
				accessorFn: (row) => row.start_date ?? '',
				Cell: ({ row }) => (
					<Typography
						sx={{
							fontSize: '0.825rem',
							fontWeight: 500,
							color: 'text.primary',
							letterSpacing: '0.01em'
						}}
					>
						{safeFormat(row.original.start_date)}
					</Typography>
				)
			},
			{
				id: 'end_date',
				header: 'Expiry Date',
				grow: false,
				size: 120,
				accessorFn: (row) => row.end_date ?? '',
				Cell: ({ row }) => (
					<Typography
						sx={{
							fontSize: '0.825rem',
							fontWeight: 500,
							color: 'text.primary',
							letterSpacing: '0.01em'
						}}
					>
						{safeFormat(row.original.end_date)}
					</Typography>
				)
			}
		],
		[levelMap]
	);

	if (subsLoading || levelsLoading) return <FuseLoading />;

	return (
		<Paper className="flex h-full w-full flex-col overflow-hidden rounded-b-none" elevation={2}>
			{/* ── Filter bar ── */}
			<Box className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-3 py-3">
				<TextField
					placeholder="Search…"
					size="small"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<FuseSvgIcon size={16} className="text-gray-400">lucide:search</FuseSvgIcon>
							</InputAdornment>
						),
						endAdornment: search ? (
							<InputAdornment position="end">
								<IconButton size="small" onClick={() => setSearch('')}>
									<FuseSvgIcon size={14}>lucide:x</FuseSvgIcon>
								</IconButton>
							</InputAdornment>
						) : null
					}}
					sx={{ width: 180 }}
				/>

				<FormControl size="small" sx={{ width: 130 }}>
					<InputLabel>Status</InputLabel>
					<Select
						label="Status"
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
					>
						{STATUS_OPTIONS.map((o) => (
							<MenuItem key={o.value} value={o.value}>
								{o.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<Stack direction="row" alignItems="center" gap={0.5}>
					<TextField
						label="Start from"
						type="date"
						size="small"
						value={startDateFrom}
						onChange={(e) => setStartDateFrom(e.target.value)}
						InputLabelProps={{ shrink: true }}
						inputProps={{ max: startDateTo || undefined }}
						sx={{ width: 140 }}
					/>
					<Typography variant="caption" color="text.secondary">→</Typography>
					<TextField
						label="Start to"
						type="date"
						size="small"
						value={startDateTo}
						onChange={(e) => setStartDateTo(e.target.value)}
						InputLabelProps={{ shrink: true }}
						inputProps={{ min: startDateFrom || undefined }}
						sx={{ width: 140 }}
					/>
				</Stack>

				<Stack direction="row" alignItems="center" gap={0.5}>
					<TextField
						label="Expiry from"
						type="date"
						size="small"
						value={endDateFrom}
						onChange={(e) => setEndDateFrom(e.target.value)}
						InputLabelProps={{ shrink: true }}
						inputProps={{ max: endDateTo || undefined }}
						sx={{ width: 140 }}
					/>
					<Typography variant="caption" color="text.secondary">→</Typography>
					<TextField
						label="Expiry to"
						type="date"
						size="small"
						value={endDateTo}
						onChange={(e) => setEndDateTo(e.target.value)}
						InputLabelProps={{ shrink: true }}
						inputProps={{ min: endDateFrom || undefined }}
						sx={{ width: 140 }}
					/>
				</Stack>

				{hasFilters && (
					<Tooltip title="Clear all filters">
						<Button
							size="small"
							variant="outlined"
							color="inherit"
							onClick={clearFilters}
							startIcon={<FuseSvgIcon size={14}>lucide:filter-x</FuseSvgIcon>}
						>
							Clear
						</Button>
					</Tooltip>
				)}

				<Box className="ml-auto">
					<Typography variant="caption" color="text.secondary">
						{filtered.length} of {allSubscriptions.length}
					</Typography>
				</Box>
			</Box>

			{/* ── Table ── */}
			<DataTable
				enableStickyHeader
				enableStickyFooter
				enablePagination
				paginateExpandedRows
				enableSelectAll={false}
				enableRowSelection={false}
				enableRowActions={false}
				layoutMode="grid"
				autoResetPageIndex
				paginationDisplayMode="pages"
				enableRowNumbers
				initialState={{
					pagination: { pageSize: 25, pageIndex: 0 },
					sorting: [{ id: 'id', desc: true }]
				}}
				muiPaginationProps={{
					color: 'secondary',
					rowsPerPageOptions: [10, 25, 50],
					shape: 'rounded',
					variant: 'outlined'
				}}
				muiTableProps={{
					sx: { tableLayout: 'fixed' }
				}}
				muiTableContainerProps={{
					sx: { overflow: 'hidden' },
					onWheel: (e) => {
						window.scrollBy({ top: e.deltaY, behavior: 'auto' });
					}
				}}
				muiTableHeadCellProps={{
					sx: {
						fontSize: '0.8rem',
						fontWeight: 700,
						color: 'text.primary',
						letterSpacing: '0.06em',
						textTransform: 'uppercase',
						backgroundColor: 'background.paper',
						borderBottom: '2px solid',
						borderColor: 'divider',
						paddingY: '12px'
					}
				}}
				muiTableBodyCellProps={{
					sx: {
						paddingY: '14px',
						borderBottom: '1px solid',
						borderColor: 'divider'
					}
				}}
				muiTableBodyRowProps={({ row }) => ({
					onClick: () => navigate(`/administration/subscriptions/${row.original.id}`),
					sx: {
						cursor: 'pointer',
						'&:hover': {
							backgroundColor: 'action.hover'
						}
					}
				})}
				data={filtered}
				columns={columns}
			/>
		</Paper>
	);
}

export default SubscriptionsTable;