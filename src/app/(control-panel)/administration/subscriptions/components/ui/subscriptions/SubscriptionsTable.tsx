'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import {
	Box,
	Chip,
	InputAdornment,
	ListItemIcon,
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
import { Subscription } from '../../../api/types';

// ─── helpers ────────────────────────────────────────────────────────────────

function safeFormat(dateStr: string | null | undefined, fmt = 'MMM d, yyyy') {
	if (!dateStr) return '—';
	const d = parseISO(`${dateStr.split('T')[0]}T00:00:00`);
	return isValid(d) ? format(d, fmt) : '—';
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

	const { data: allSubscriptions = [], isLoading } = useSubscriptionsList(token);

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
			data = data.filter(
				(sub) =>
					String(sub.id).includes(q) ||
					sub.reference?.toLowerCase().includes(q) ||
					sub.level?.name?.toLowerCase().includes(q) ||
					String(sub.account?.id ?? '').includes(q) ||
					(sub.account as any)?.full_name?.toLowerCase().includes(q) ||
					(sub.account as any)?.email?.toLowerCase().includes(q)
			);
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
	}, [allSubscriptions, search, statusFilter, startDateFrom, startDateTo, endDateFrom, endDateTo]);

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
				size: 70,
				Cell: ({ cell }) => (
					<Typography className="text-xs font-mono font-semibold" color="text.secondary">
						#{cell.getValue<number>()}
					</Typography>
				)
			},
			{
				id: 'account',
				header: 'Account',
				accessorFn: (row) => (row.account as any)?.full_name ?? '',
				Cell: ({ row }) => {
					const acct = row.original.account as any;
					return (
						<div className="flex flex-col">
							<Typography className="font-medium text-sm">
								{acct?.full_name ?? `Account #${acct?.id ?? '—'}`}
							</Typography>
							{acct?.email && (
								<Typography className="text-xs" color="text.secondary">
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
				Cell: ({ cell }) => (
					<Typography className="text-sm font-medium">{cell.getValue<string>() || '—'}</Typography>
				)
			},
			{
				id: 'plan',
				header: 'Plan',
				accessorFn: (row) => row.level?.name ?? '',
				Cell: ({ row }) =>
					row.original.level?.name ? (
						<Chip
							label={row.original.level.name}
							size="small"
							sx={{
								backgroundColor: '#eff6ff',
								color: '#1d4ed8',
								border: '1px solid #bfdbfe',
								fontWeight: 600,
								fontSize: 11
							}}
						/>
					) : (
						<Typography className="text-xs" color="text.secondary">—</Typography>
					)
			},
			{
				id: 'status',
				header: 'Status',
				accessorFn: (row) => row.is_active,
				Cell: ({ row }) => (
					<Chip
						label={row.original.is_active ? 'Active' : 'Inactive'}
						size="small"
						sx={{
							backgroundColor: row.original.is_active ? '#dcfce7' : '#f1f5f9',
							color: row.original.is_active ? '#16a34a' : '#64748b',
							border: `1px solid ${row.original.is_active ? '#bbf7d0' : '#e2e8f0'}`,
							fontWeight: 600,
							fontSize: 11
						}}
					/>
				)
			},
			{
				id: 'start_date',
				header: 'Start Date',
				accessorFn: (row) => row.start_date ?? '',
				Cell: ({ row }) => (
					<Typography className="text-sm">{safeFormat(row.original.start_date)}</Typography>
				)
			},
			{
				id: 'end_date',
				header: 'Expiry Date',
				accessorFn: (row) => row.end_date ?? '',
				Cell: ({ row }) => (
					<Typography className="text-sm">{safeFormat(row.original.end_date)}</Typography>
				)
			}
		],
		[]
	);

	if (isLoading) return <FuseLoading />;

	return (
		<Paper className="flex h-full w-full flex-col overflow-hidden rounded-b-none" elevation={2}>
			{/* ── Filter bar ── */}
			<Box className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-3 py-3">
				{/* Search */}
				<TextField
					placeholder="Search subscriptions…"
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
					sx={{ minWidth: 220 }}
				/>

				{/* Status filter */}
				<FormControl size="small" sx={{ minWidth: 140 }}>
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

				{/* Start date range */}
				<Stack direction="row" alignItems="center" gap={0.5}>
					<TextField
						label="Start from"
						type="date"
						size="small"
						value={startDateFrom}
						onChange={(e) => setStartDateFrom(e.target.value)}
						InputLabelProps={{ shrink: true }}
						inputProps={{ max: startDateTo || undefined }}
						sx={{ width: 150 }}
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
						sx={{ width: 150 }}
					/>
				</Stack>

				{/* End date range */}
				<Stack direction="row" alignItems="center" gap={0.5}>
					<TextField
						label="Expiry from"
						type="date"
						size="small"
						value={endDateFrom}
						onChange={(e) => setEndDateFrom(e.target.value)}
						InputLabelProps={{ shrink: true }}
						inputProps={{ max: endDateTo || undefined }}
						sx={{ width: 150 }}
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
						sx={{ width: 150 }}
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
						{filtered.length} of {allSubscriptions.length} subscriptions
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
				data={filtered}
				columns={columns}
				renderRowActionMenuItems={({ closeMenu, row }) => {
					const sub = row.original;
					return [
						<MenuItem
							key="view"
							onClick={() => {
								navigate(`/administration/subscriptions/${sub.id}`);
								closeMenu();
							}}
						>
							<ListItemIcon>
								<FuseSvgIcon>lucide:eye</FuseSvgIcon>
							</ListItemIcon>
							View Details
						</MenuItem>,

						<MenuItem
							key="new-for-account"
							onClick={() => {
								navigate('/administration/subscriptions/new');
								closeMenu();
							}}
						>
							<ListItemIcon>
								<FuseSvgIcon>lucide:plus</FuseSvgIcon>
							</ListItemIcon>
							Add Subscription
						</MenuItem>
					];
				}}
			/>
		</Paper>
	);
}

export default SubscriptionsTable;