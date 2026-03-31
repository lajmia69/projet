'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import {
	Paper, ListItemIcon, MenuItem, Dialog, DialogTitle,
	DialogContent, DialogActions, Button, Typography
} from '@mui/material';
import { motion } from 'motion/react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { styled } from '@mui/material/styles';

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' }
}));

export type RadioAdminColumn<T> = MRT_ColumnDef<T>;

export type RadioAdminTableProps<T extends { id: number }> = {
	title: string;
	data: T[] | undefined;
	isLoading: boolean;
	columns: RadioAdminColumn<T>[];
	onAdd: () => void;
	onEdit: (row: T) => void;
	onDelete: (id: number) => void;
	formDialog: React.ReactNode;
	addButtonLabel?: string;
};

export function RadioAdminTable<T extends { id: number }>({
	title,
	data,
	isLoading,
	columns,
	onAdd,
	onEdit,
	onDelete,
	formDialog,
	addButtonLabel = 'Add',
}: RadioAdminTableProps<T>) {
	return (
		<>
			<Root
				header={
					<div className="flex flex-auto flex-col py-4 px-4">
						<PageBreadcrumb className="mb-2" />
						<div className="flex items-center gap-2">
							<motion.span initial={{ x: -20 }} animate={{ x: 0, transition: { delay: 0.2 } }}>
								<Typography className="text-4xl leading-none font-extrabold tracking-tight">
									{title}
								</Typography>
							</motion.span>
							<div className="flex flex-1 items-center justify-end gap-2">
								<Button
									variant="contained"
									color="secondary"
									onClick={onAdd}
									startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}
								>
									{addButtonLabel}
								</Button>
							</div>
						</div>
					</div>
				}
				content={
					isLoading ? (
						<FuseLoading />
					) : (
						<Paper
							className="flex h-full w-full flex-col overflow-hidden rounded-b-none"
							elevation={2}
						>
							<DataTable
								data={data ?? []}
								columns={columns}
								enableRowNumbers
								enableRowActions
								enablePagination
								paginationDisplayMode="pages"
								initialState={{ pagination: { pageSize: 15, pageIndex: 0 } }}
								muiPaginationProps={{
									color: 'secondary',
									rowsPerPageOptions: [10, 15, 25],
									shape: 'rounded',
									variant: 'outlined',
								}}
								renderRowActionMenuItems={({ row, closeMenu }) => [
									<MenuItem
										key="edit"
										onClick={() => {
											onEdit(row.original as T);
											closeMenu();
										}}
									>
										<ListItemIcon>
											<FuseSvgIcon>lucide:pencil</FuseSvgIcon>
										</ListItemIcon>
										Edit
									</MenuItem>,
									<MenuItem
										key="del"
										onClick={() => {
											onDelete(row.original.id);
											closeMenu();
										}}
									>
										<ListItemIcon>
											<FuseSvgIcon>lucide:trash</FuseSvgIcon>
										</ListItemIcon>
										Delete
									</MenuItem>,
								]}
							/>
						</Paper>
					)
				}
			/>
			{formDialog}
		</>
	);
}

export type SimpleFormDialogProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	isPending: boolean;
	canSubmit: boolean;
	onSubmit: () => void;
	children: React.ReactNode;
};

export function SimpleFormDialog({
	open,
	onClose,
	title,
	isPending,
	canSubmit,
	onSubmit,
	children,
}: SimpleFormDialogProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			fullWidth
			maxWidth="sm"
			PaperProps={{ sx: { borderRadius: '16px' } }}
		>
			<DialogTitle sx={{ fontWeight: 700, fontSize: '1.05rem' }}>{title}</DialogTitle>
			<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
				{children}
			</DialogContent>
			<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
				<Button onClick={onClose} variant="outlined" disabled={isPending}>
					Cancel
				</Button>
				<Button
					onClick={onSubmit}
					variant="contained"
					color="secondary"
					disabled={!canSubmit || isPending}
				>
					{isPending ? 'Saving…' : 'Save'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}