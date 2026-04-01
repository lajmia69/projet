'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import { FormControl, FormLabel, MenuItem, Select, TextField } from '@mui/material';
import useUser from '@auth/useUser';
import {
	useRadioAdminEpisodeGuests,
	useCreateEpisodeGuest,
	useUpdateEpisodeGuest,
	useDeleteEpisodeGuest,
	useRadioAdminGuestTypes,
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { EpisodeGuest } from '@/app/(control-panel)/administration/radio/api/types';
import { RadioAdminTable, SimpleFormDialog } from '../ui/RadioAdminTable';

type GuestForm = { full_name: string; biography: string; guest_type_id: string };
const empty: GuestForm = { full_name: '', biography: '', guest_type_id: '' };

export default function EpisodeGuestsView() {
	const { data: account } = useUser();
	const token = account?.token;

	const { data, isLoading } = useRadioAdminEpisodeGuests(token);
	const { data: guestTypes } = useRadioAdminGuestTypes(token);
	const { mutate: create, isPending: isCreating } = useCreateEpisodeGuest(token);
	const { mutate: update, isPending: isUpdating } = useUpdateEpisodeGuest(token);
	const { mutate: remove } = useDeleteEpisodeGuest(token);

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
		biography: form.biography.trim(),
		guest_type_id: Number(form.guest_type_id),
	});

	const canSubmit = !!form.full_name.trim() && !!form.guest_type_id;

	const handleAdd = () => create(buildPayload(), {
		onSuccess: () => setAddOpen(false),
		onError: (err) => console.error('Create episode guest failed:', err),
	});
	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, {
		onSuccess: () => setEditOpen(false),
		onError: (err) => console.error('Update episode guest failed:', err),
	});

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