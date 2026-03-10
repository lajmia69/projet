import { useMemo } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { ListItemIcon, MenuItem, Paper } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { format } from 'date-fns/format';
import { useSnackbar } from 'notistack';
import useUser from '@auth/useUser';
import useNavigate from '@fuse/hooks/useNavigate';
import { useAccountsList } from '../../../api/hooks/useAccountsList';
import { useSubscriptionsList } from '../../../api/hooks/useSubscriptionsList';
import { useToggleSubscription } from '../../../api/hooks/useToggleSubscription';
import { Account, Subscription } from '../../../api/types';

type AccountWithSubs = Account & { subscriptions: Subscription[] };

function SubscriptionsTable() {
	const { data: currentAccount } = useUser();
	const token = currentAccount.token;
	const navigate = useNavigate();

	const { data: accounts, isLoading: accountsLoading } = useAccountsList(token);
	const { data: allSubscriptions, isLoading: subsLoading } = useSubscriptionsList(token);
	const { mutate: toggleSubscription } = useToggleSubscription(token);
	const { enqueueSnackbar } = useSnackbar();

	const mergedData = useMemo<AccountWithSubs[]>(() => {
		if (!accounts) return [];

		return accounts.map((account) => {
			// Source 1: from the all-subscriptions endpoint matched by account id
			const fromSubsList = (allSubscriptions ?? []).filter(
				(sub) => sub.account?.id === account.id
			);

			// Source 2: subscriptions nested inside the account object
			const fromAccount = account.subscriptions ?? [];

			// Merge and deduplicate by subscription id
				const combined = [...fromSubsList, ...fromAccount];			const unique = combined.filter(
				(sub, index, self) => self.findIndex((s) => s.id === sub.id) === index
			);

			return { ...account, subscriptions: unique };
		});
	}, [accounts, allSubscriptions]);

	const columns = useMemo<MRT_ColumnDef<AccountWithSubs>[]>(
		() => [
			{
				accessorKey: 'full_name',
				header: 'Account',
				Cell: ({ row }) => (
					<div className="flex flex-col">
						<Typography className="font-medium text-sm">
							{row.original.full_name}
						</Typography>
						<Typography className="text-xs" color="text.secondary">
							{row.original.email}
						</Typography>
					</div>
				)
			},
			{
				accessorKey: 'subscriptions',
				header: 'Subscriptions',
				Cell: ({ row }) => {
					const subs = row.original.subscriptions;

					if (subs.length === 0) {
						return (
							<Chip
								label="No subscription"
								size="small"
								sx={{
									backgroundColor: '#fef9c3',
									color: '#854d0e',
									border: '1px solid #fde68a',
									fontWeight: 600,
									fontSize: 11
								}}
							/>
						);
					}

					return (
						<div className="flex flex-col gap-1">
							{subs.map((sub) => (
								<div key={sub.id} className="flex items-center gap-2">
									<Chip
										label={sub.is_active ? 'Active' : 'Inactive'}
										size="small"
										sx={{
											backgroundColor: sub.is_active ? '#dcfce7' : '#f1f5f9',
											color: sub.is_active ? '#16a34a' : '#64748b',
											border: `1px solid ${sub.is_active ? '#bbf7d0' : '#e2e8f0'}`,
											fontWeight: 600,
											fontSize: 11
										}}
									/>
									<Typography className="text-xs font-medium" color="text.secondary">
										{sub.reference}
									</Typography>
									{sub.level?.name && (
										<Chip
											label={sub.level.name}
											size="small"
											sx={{
												backgroundColor: '#eff6ff',
												color: '#1d4ed8',
												border: '1px solid #bfdbfe',
												fontWeight: 600,
												fontSize: 11
											}}
										/>
									)}
								</div>
							))}
						</div>
					);
				}
			},
			{
				id: 'period',
				header: 'Period',
				Cell: ({ row }) => {
					const subs = row.original.subscriptions;
					if (subs.length === 0) return <span>—</span>;
					return (
						<div className="flex flex-col gap-1">
							{subs.map((sub) => (
								<Typography key={sub.id} className="text-xs" color="text.secondary">
									{sub.start_date
										? format(new Date(`${sub.start_date}T00:00:00`), 'MMM d, yyyy')
										: '—'}{' '}
									→{' '}
									{sub.end_date
										? format(new Date(`${sub.end_date}T00:00:00`),   'MMM d, yyyy')
										: '—'}
								</Typography>
							))}
						</div>
					);
				}
			},
			{
				id: 'manage',
				header: 'Actions',
				Cell: () => (
					<Button
						component={NavLinkAdapter}
						to="/administration/subscriptions/new"
						variant="outlined"
						size="small"
						color="secondary"
						startIcon={<FuseSvgIcon size={14}>lucide:plus</FuseSvgIcon>}
					>
						Add
					</Button>
				)
			}
		],
		[]
	);

	if (accountsLoading || subsLoading) {
		return <FuseLoading />;
	}

	return (
		<Paper
			className="flex h-full w-full flex-col overflow-hidden rounded-b-none"
			elevation={2}
		>
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
					pagination: { pageSize: 25, pageIndex: 0 }
				}}
				muiPaginationProps={{
					color: 'secondary',
					rowsPerPageOptions: [10, 25, 50],
					shape: 'rounded',
					variant: 'outlined'
				}}
				data={mergedData}
				columns={columns}
				renderRowActionMenuItems={({ closeMenu, row }) => {
					const subs = row.original.subscriptions;

					const addItem = (
						<MenuItem
							key="new"
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
					);

					const toggleItems = subs.map((sub: Subscription) => (
						<MenuItem
							key={sub.id}
							onClick={() => {
								toggleSubscription(
									{ subscriptionId: sub.id, is_active: !sub.is_active },
									{
										onSuccess: () =>
											enqueueSnackbar(
												`Subscription ${!sub.is_active ? 'activated' : 'deactivated'} successfully`,
												{ variant: 'success' }
											),
										onError: () =>
											enqueueSnackbar('Failed to update subscription', {
												variant: 'error'
											})
									}
								);
								closeMenu();
							}}
						>
							<ListItemIcon>
								<FuseSvgIcon>
									{sub.is_active ? 'lucide:toggle-right' : 'lucide:toggle-left'}
								</FuseSvgIcon>
							</ListItemIcon>
							{sub.is_active
								? `Deactivate "${sub.reference}"`
								: `Activate "${sub.reference}"`}
						</MenuItem>
					));

					return [addItem, ...toggleItems];
				}}
			/>
		</Paper>
	);
}

export default SubscriptionsTable;