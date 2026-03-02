import { useEffect, useMemo, useRef } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { ListItemIcon, MenuItem, Paper } from '@mui/material';
// import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import Typography from '@mui/material/Typography';
// import clsx from 'clsx';
import Button from '@mui/material/Button';
import { useRolesList } from '@/app/(control-panel)/administration/roles/api/hooks/useRolesList';
// import { useDeleteProducts } from '../../../api/hooks/products/useDeleteProducts';
import useUser from '@auth/useUser';
import { Role } from '@/app/(control-panel)/administration/roles/api/types';

function RolesTable() {
	const { data: currentAccount } = useUser();
	const { data: roles, isLoading } = useRolesList(currentAccount.token);

	// Référence pour suivre l'état de montage du composant
	const isMounted = useRef(true);

	// Effet de nettoyage
	useEffect(() => {
		// Le composant est monté
		isMounted.current = true;

		// Fonction de nettoyage appelée au démontage
		return () => {
			isMounted.current = false;
		};
	}, []);

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
			// {
			// 	accessorKey: 'priceTaxIncl',
			// 	header: 'Price',
			// 	accessorFn: (row) => `$${row.priceTaxIncl}`
			// },
			// {
			// 	accessorKey: 'quantity',
			// 	header: 'Quantity',
			// 	Cell: ({ row }) => (
			// 		<div className="flex items-center gap-1">
			// 			<span>{row.original.quantity}</span>
			// 			<i
			// 				className={clsx(
			// 					'inline-block h-2 w-2 rounded-sm',
			// 					row.original.quantity <= 5 && 'bg-red-500',
			// 					row.original.quantity > 5 && row.original.quantity <= 25 && 'bg-orange-500',
			// 					row.original.quantity > 25 && 'bg-green-500'
			// 				)}
			// 			/>
			// 		</div>
			// 	)
			// },
			// {
			// 	accessorKey: 'active',
			// 	header: 'Active',
			// 	Cell: ({ row }) => (
			// 		<div className="flex items-center">
			// 			{row.original.active ? (
			// 				<FuseSvgIcon
			// 					className="text-green-500"
			// 					size={20}
			// 				>
			// 					lucide:circle-check
			// 				</FuseSvgIcon>
			// 			) : (
			// 				<FuseSvgIcon
			// 					className="text-red-500"
			// 					size={20}
			// 				>
			// 					lucide:circle-minus
			// 				</FuseSvgIcon>
			// 			)}
			// 		</div>
			// 	)
			// }
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
							// deleteProducts([row.original.id]);
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
								// deleteProducts(selectedRows.map((row) => row.original.id));
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
