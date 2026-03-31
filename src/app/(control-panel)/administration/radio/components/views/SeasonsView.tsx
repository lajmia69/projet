'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import { Button, FormControl, FormLabel, TextField } from '@mui/material';
import useUser from '@auth/useUser';
import {
	useSeasons,
	useCreateSeason,
	useUpdateSeason,
	useDeleteSeason,
} from '@/app/(control-panel)/content/radio/api/hooks/Radiohooks';
import { Season } from '@/app/(control-panel)/content/radio/api/types';
import { RadioAdminTable, SimpleFormDialog } from './RadioAdminTable';

type SeasonForm = { name: string; description: string; number: string };
const empty: SeasonForm = { name: '', description: '', number: '' };

export default function SeasonsView() {
	const { data: account } = useUser();
	const id = account?.id;
	const token = account?.token?.access;

	const { data, isLoading } = useSeasons(id, token);
	const { mutate: create, isPending: isCreating } = useCreateSeason(id, token);
	const { mutate: update, isPending: isUpdating } = useUpdateSeason(id, token);
	const { mutate: remove } = useDeleteSeason(id, token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState<SeasonForm>(empty);
	const [editingId, setEditingId] = useState<number | null>(null);

	const setField = (field: keyof SeasonForm, value: string) =>
		setForm((p) => ({ ...p, [field]: value }));

	const openAdd = () => { setForm(empty); setAddOpen(true); };
	const openEdit = (row: Season) => {
		setForm({ name: row.name, description: row.description ?? '', number: String(row.number ?? '') });
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = () => ({
		name: form.name.trim(),
		description: form.description.trim() || undefined,
		number: form.number ? Number(form.number) : undefined,
	});

	const handleAdd = () => create(buildPayload(), { onSuccess: () => setAddOpen(false) });
	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, { onSuccess: () => setEditOpen(false) });

	const columns = useMemo<MRT_ColumnDef<Season>[]>(() => [
		{ accessorKey: 'id', header: 'ID', size: 70 },
		{ accessorKey: 'number', header: 'No.', size: 80 },
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
				<FormLabel>Season Number</FormLabel>
				<TextField size="small" type="number" value={form.number} onChange={(e) => setField('number', e.target.value)} />
			</FormControl>
			<FormControl fullWidth>
				<FormLabel>Description</FormLabel>
				<TextField size="small" multiline minRows={2} value={form.description} onChange={(e) => setField('description', e.target.value)} />
			</FormControl>
		</>
	);

	return (
		<RadioAdminTable
			title="Seasons"
			data={data?.items}
			isLoading={isLoading}
			columns={columns}
			onAdd={openAdd}
			onEdit={openEdit}
			onDelete={(id) => remove(id)}
			formDialog={
				<>
					<SimpleFormDialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Season" isPending={isCreating} canSubmit={!!form.name.trim()} onSubmit={handleAdd}>
						{formContent}
					</SimpleFormDialog>
					<SimpleFormDialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Season" isPending={isUpdating} canSubmit={!!form.name.trim()} onSubmit={handleEdit}>
						{formContent}
					</SimpleFormDialog>
				</>
			}
		/>
	);
}