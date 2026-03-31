'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import { FormControl, FormLabel, TextField } from '@mui/material';
import useUser from '@auth/useUser';
import {
	useGuestTypes,
	useCreateGuestType,
	useUpdateGuestType,
	useDeleteGuestType,
} from '@/app/(control-panel)/content/radio/api/hooks/Radiohooks';
import { GuestType } from '@/app/(control-panel)/content/radio/api/types';
import { RadioAdminTable, SimpleFormDialog } from '../ui/RadioAdminTable';

type GuestTypeForm = { name: string; description: string };
const empty: GuestTypeForm = { name: '', description: '' };

export default function GuestTypesView() {
	const { data: account } = useUser();
	const id = account?.id;
	const token = account?.token?.access;

	const { data, isLoading } = useGuestTypes(id, token);
	const { mutate: create, isPending: isCreating } = useCreateGuestType(id, token);
	const { mutate: update, isPending: isUpdating } = useUpdateGuestType(id, token);
	const { mutate: remove } = useDeleteGuestType(id, token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState<GuestTypeForm>(empty);
	const [editingId, setEditingId] = useState<number | null>(null);

	const setField = (field: keyof GuestTypeForm, value: string) =>
		setForm((p) => ({ ...p, [field]: value }));

	const openAdd = () => { setForm(empty); setAddOpen(true); };
	const openEdit = (row: GuestType) => {
		setForm({ name: row.name, description: row.description ?? '' });
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = () => ({
		name: form.name.trim(),
		description: form.description.trim() || undefined,
	});

	const handleAdd = () => create(buildPayload(), { onSuccess: () => setAddOpen(false) });
	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, { onSuccess: () => setEditOpen(false) });

	const columns = useMemo<MRT_ColumnDef<GuestType>[]>(() => [
		{ accessorKey: 'id', header: 'ID', size: 70 },
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'description', header: 'Description' },
	], []);

	const formContent = (
		<>
			<FormControl fullWidth>
				<FormLabel required>Name</FormLabel>
				<TextField size="small" value={form.name} onChange={(e) => setField('name', e.target.value)} />
			</FormControl>
			<FormControl fullWidth>
				<FormLabel>Description</FormLabel>
				<TextField size="small" multiline minRows={2} value={form.description} onChange={(e) => setField('description', e.target.value)} />
			</FormControl>
		</>
	);

	return (
		<RadioAdminTable
			title="Guest Types"
			data={data?.items}
			isLoading={isLoading}
			columns={columns}
			onAdd={openAdd}
			onEdit={openEdit}
			onDelete={(id) => remove(id)}
			formDialog={
				<>
					<SimpleFormDialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Guest Type" isPending={isCreating} canSubmit={!!form.name.trim()} onSubmit={handleAdd}>
						{formContent}
					</SimpleFormDialog>
					<SimpleFormDialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Guest Type" isPending={isUpdating} canSubmit={!!form.name.trim()} onSubmit={handleEdit}>
						{formContent}
					</SimpleFormDialog>
				</>
			}
		/>
	);
}