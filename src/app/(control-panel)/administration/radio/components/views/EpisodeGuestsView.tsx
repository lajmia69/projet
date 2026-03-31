'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import { FormControl, FormLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import useUser from '@auth/useUser';
import {
	useEpisodeGuests,
	useCreateEpisodeGuest,
	useUpdateEpisodeGuest,
	useDeleteEpisodeGuest,
	useGuestTypes,
} from '@/app/(control-panel)/content/radio/api/hooks/Radiohooks';
import { EpisodeGuest } from '@/app/(control-panel)/content/radio/api/types';
import { RadioAdminTable, SimpleFormDialog } from './RadioAdminTable';

type GuestForm = { full_name: string; biography: string; guest_type_id: string };
const empty: GuestForm = { full_name: '', biography: '', guest_type_id: '' };

export default function EpisodeGuestsView() {
	const { data: account } = useUser();
	const id = account?.id;
	const token = account?.token?.access;

	const { data, isLoading } = useEpisodeGuests(id, token);
	const { data: guestTypes } = useGuestTypes(id, token);
	const { mutate: create, isPending: isCreating } = useCreateEpisodeGuest(id, token);
	const { mutate: update, isPending: isUpdating } = useUpdateEpisodeGuest(id, token);
	const { mutate: remove } = useDeleteEpisodeGuest(id, token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState<GuestForm>(empty);
	const [editingId, setEditingId] = useState<number | null>(null);

	const setField = (field: keyof GuestForm, value: string) =>
		setForm((p) => ({ ...p, [field]: value }));

	const openAdd = () => { setForm(empty); setAddOpen(true); };
	const openEdit = (row: EpisodeGuest) => {
		setForm({
			full_name: row.full_name,
			biography: row.biography ?? '',
			guest_type_id: String(row.guest_type?.id ?? ''),
		});
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = () => ({
		full_name: form.full_name.trim(),
		biography: form.biography.trim() || undefined,
		guest_type_id: Number(form.guest_type_id),
	});

	const canSubmit = !!form.full_name.trim() && !!form.guest_type_id;
	const handleAdd = () => create(buildPayload(), { onSuccess: () => setAddOpen(false) });
	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, { onSuccess: () => setEditOpen(false) });

	const columns = useMemo<MRT_ColumnDef<EpisodeGuest>[]>(() => [
		{ accessorKey: 'id', header: 'ID', size: 70 },
		{ accessorKey: 'full_name', header: 'Full Name' },
		{
			id: 'guest_type',
			header: 'Type',
			accessorFn: (row) => row.guest_type?.name ?? '',
		},
		{ accessorKey: 'biography', header: 'Biography', Cell: ({ cell }) => <span className="line-clamp-1">{cell.getValue<string>()}</span> },
	], []);

	const formContent = (
		<>
			<FormControl fullWidth>
				<FormLabel required>Full Name</FormLabel>
				<TextField size="small" value={form.full_name} onChange={(e) => setField('full_name', e.target.value)} />
			</FormControl>
			<FormControl fullWidth>
				<FormLabel required>Guest Type</FormLabel>
				<Select size="small" value={form.guest_type_id} onChange={(e) => setField('guest_type_id', e.target.value)} displayEmpty>
					<MenuItem value="" disabled><em>Select a type…</em></MenuItem>
					{guestTypes?.items.map((t) => (
						<MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
					))}
				</Select>
			</FormControl>
			<FormControl fullWidth>
				<FormLabel>Biography</FormLabel>
				<TextField size="small" multiline minRows={3} value={form.biography} onChange={(e) => setField('biography', e.target.value)} />
			</FormControl>
		</>
	);

	return (
		<RadioAdminTable
			title="Episode Guests"
			data={data?.items}
			isLoading={isLoading}
			columns={columns}
			onAdd={openAdd}
			onEdit={openEdit}
			onDelete={(id) => remove(id)}
			formDialog={
				<>
					<SimpleFormDialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Episode Guest" isPending={isCreating} canSubmit={canSubmit} onSubmit={handleAdd}>
						{formContent}
					</SimpleFormDialog>
					<SimpleFormDialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Episode Guest" isPending={isUpdating} canSubmit={canSubmit} onSubmit={handleEdit}>
						{formContent}
					</SimpleFormDialog>
				</>
			}
		/>
	);
}