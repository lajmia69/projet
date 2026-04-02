'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import { FormControl, FormLabel, MenuItem, Select, Typography } from '@mui/material';
import useUser from '@auth/useUser';
import {
	useRadioAdminEpisodeGuests,
	useCreateEpisodeGuest,
	useUpdateEpisodeGuest,
	useDeleteEpisodeGuest,
	useRadioAdminGuestTypes,
	useRadioAdminEpisodes,
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { EpisodeGuest } from '@/app/(control-panel)/administration/radio/api/types';
import { RadioAdminTable, SimpleFormDialog } from '../ui/RadioAdminTable';

// Episode guests are junction records: episode_id + guest_id + guest_type_id.
// "guest_id" refers to the guest registry that comes back from the episode-guests
// list endpoint (each item already has a nested guest object).

type GuestLinkForm = {
	episode_id: string;
	guest_id: string;
	guest_type_id: string;
};

const empty: GuestLinkForm = { episode_id: '', guest_id: '', guest_type_id: '' };

export default function EpisodeGuestsView() {
	const { data: account } = useUser();
	const token = account?.token;

	const { data, isLoading } = useRadioAdminEpisodeGuests(token);
	const { data: guestTypes } = useRadioAdminGuestTypes(token);
	const { data: episodesData } = useRadioAdminEpisodes(token);
	const { mutate: create, isPending: isCreating } = useCreateEpisodeGuest(token);
	const { mutate: update, isPending: isUpdating } = useUpdateEpisodeGuest(token);
	const { mutate: remove } = useDeleteEpisodeGuest(token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState<GuestLinkForm>(empty);
	const [editingId, setEditingId] = useState<number | null>(null);

	const setField = (field: keyof GuestLinkForm, value: string) =>
		setForm((p) => ({ ...p, [field]: value }));

	const openAdd = () => { setForm(empty); setAddOpen(true); };
	const openEdit = (row: EpisodeGuest) => {
		setForm({
			episode_id: String(row.episode?.id ?? ''),
			guest_id: String(row.guest?.id ?? ''),
			guest_type_id: String(row.guest_type?.id ?? ''),
		});
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = () => ({
		episode_id: Number(form.episode_id),
		guest_id: Number(form.guest_id),
		guest_type_id: Number(form.guest_type_id),
	});

	const canSubmit = !!form.episode_id && !!form.guest_id && !!form.guest_type_id;

	const handleAdd = () => create(buildPayload(), {
		onSuccess: () => setAddOpen(false),
		onError: (err) => console.error('Create episode guest failed:', err),
	});
	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, {
		onSuccess: () => setEditOpen(false),
		onError: (err) => console.error('Update episode guest failed:', err),
	});

	// Build a guest list from the existing episode-guest records for the
	// "guest_id" picker (since there is no separate guest-list endpoint visible).
	const knownGuests = useMemo(() => {
		const map = new Map<number, string>();
		data?.items.forEach((eg) => {
			if (eg.guest?.id) map.set(eg.guest.id, eg.guest.full_name);
		});
		return Array.from(map.entries()).map(([id, full_name]) => ({ id, full_name }));
	}, [data]);

	const columns = useMemo<MRT_ColumnDef<EpisodeGuest>[]>(() => [
		{ accessorKey: 'id', header: 'ID', size: 70 },
		{
			id: 'episode',
			header: 'Episode',
			accessorFn: (row) => row.episode?.name ?? '',
		},
		{
			id: 'guest',
			header: 'Guest',
			accessorFn: (row) => row.guest?.full_name ?? '',
		},
		{
			id: 'guest_type',
			header: 'Role / Type',
			accessorFn: (row) => row.guest_type?.name ?? '',
		},
	], []);

	const formContent = (
		<>
			<FormControl fullWidth>
				<FormLabel required>Episode</FormLabel>
				<Select size="small" value={form.episode_id} onChange={(e) => setField('episode_id', e.target.value)} displayEmpty>
					<MenuItem value="" disabled><em>Select an episode…</em></MenuItem>
					{episodesData?.items.map((ep) => (
						<MenuItem key={ep.id} value={String(ep.id)}>{ep.name}</MenuItem>
					))}
				</Select>
			</FormControl>

			<FormControl fullWidth>
				<FormLabel required>Guest</FormLabel>
				{knownGuests.length === 0 ? (
					<Typography variant="caption" color="textSecondary">
						No guests in the registry yet. Create a guest entry first.
					</Typography>
				) : (
					<Select size="small" value={form.guest_id} onChange={(e) => setField('guest_id', e.target.value)} displayEmpty>
						<MenuItem value="" disabled><em>Select a guest…</em></MenuItem>
						{knownGuests.map((g) => (
							<MenuItem key={g.id} value={String(g.id)}>{g.full_name}</MenuItem>
						))}
					</Select>
				)}
			</FormControl>

			<FormControl fullWidth>
				<FormLabel required>Guest Type / Role</FormLabel>
				<Select size="small" value={form.guest_type_id} onChange={(e) => setField('guest_type_id', e.target.value)} displayEmpty>
					<MenuItem value="" disabled><em>Select a type…</em></MenuItem>
					{guestTypes?.items.map((t) => (
						<MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
					))}
				</Select>
			</FormControl>
		</>
	);

	return (
		<RadioAdminTable
			title="Episode Guests"
			addButtonLabel="Link Guest"
			data={data?.items}
			isLoading={isLoading}
			columns={columns}
			onAdd={openAdd}
			onEdit={openEdit}
			onDelete={(id) => remove(id)}
			formDialog={
				<>
					<SimpleFormDialog open={addOpen} onClose={() => setAddOpen(false)} title="Link Guest to Episode" isPending={isCreating} canSubmit={canSubmit} onSubmit={handleAdd}>
						{formContent}
					</SimpleFormDialog>
					<SimpleFormDialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Guest Link" isPending={isUpdating} canSubmit={canSubmit} onSubmit={handleEdit}>
						{formContent}
					</SimpleFormDialog>
				</>
			}
		/>
	);
}