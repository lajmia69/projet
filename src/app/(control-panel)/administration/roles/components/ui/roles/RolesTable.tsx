import { useMemo } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { ListItemIcon, MenuItem, Paper } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useRolesList } from '@/app/(control-panel)/administration/roles/api/hooks/useRolesList';
import { useDeleteRole } from '@/app/(control-panel)/administration/roles/api/hooks/useDeleteRole';
import useUser from '@auth/useUser';
import { Role } from '@/app/(control-panel)/administration/roles/api/types';
import { useSnackbar } from 'notistack';

function RolesTable() {
	const { data: currentAccount } = useUser();
	const { data: roles, isLoading } = useRolesList(currentAccount.token);
	const { mutate: deleteRole } = useDeleteRole(currentAccount.token);
	const { enqueueSnackbar } = useSnackbar();

	function handleDeleteRole(roleId: number) {
		deleteRole(roleId, {
			onSuccess: () => {
				enqueueSnackbar('Role deleted successfully', { variant: 'success' });
			},
			onError: (error) => {
				console.error('Delete error:', error);
				enqueueSnackbar('Failed to delete role', { variant: 'error' });
			}
		});
	}

	const columns = useMemo<MRT_ColumnDef<Role>[]>(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/administration/roles/${row.original.id}`}
						role="button"
					>
						<u>{row.original.name}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'type.description',
				header: 'Type',
				Cell: ({ row }) => (
					<div className="flex flex-wrap gap-1">
						<u>{row.original.type.description}</u>
					</div>
				)
			}
		],
		[]
	);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<Paper
			className="flex h-full w-full flex-auto flex-col overflow-hidden rounded-b-none"
			elevation={2}
		>
			<DataTable
				data={roles}
				columns={columns}
				renderRowActionMenuItems={({ closeMenu, row, table }) => [
					<MenuItem
						key={0}
						onClick={() => {
							handleDeleteRole(row.original.id);
							closeMenu();
							table.resetRowSelection();
						}}
					>
						<ListItemIcon>
							<FuseSvgIcon>lucide:trash</FuseSvgIcon>
						</ListItemIcon>
						Delete
					</MenuItem>
				]}
				renderTopToolbarCustomActions={({ table }) => {
					const { rowSelection } = table.getState();

					if (Object.keys(rowSelection).length === 0) {
						return null;
					}

					return (
						<Button
							variant="contained"
							size="small"
							onClick={() => {
								const selectedRows = table.getSelectedRowModel().rows;
								selectedRows.forEach((row) => handleDeleteRole(row.original.id));
								table.resetRowSelection();
							}}
							className="flex min-w-9 shrink ltr:mr-2 rtl:ml-2"
							color="secondary"
						>
							<FuseSvgIcon>lucide:trash</FuseSvgIcon>
							<span className="mx-2 hidden sm:flex">Delete selected items</span>
						</Button>
					);
				}}
			/>
		</Paper>
	);
}

export default RolesTable;