'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import { FormControl, FormLabel, TextField } from '@mui/material';
import useUser from '@auth/useUser';
import {
	useRadioAdminSeasons,
	useCreateSeason,
	useUpdateSeason,
	useDeleteSeason,
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { Season } from '@/app/(control-panel)/administration/radio/api/types';
import { RadioAdminTable, SimpleFormDialog } from '../ui/RadioAdminTable';

type SeasonForm = {
	name: string;
	slug: string;
	description: string;
	start_date: string;
	end_date: string;
};

const empty: SeasonForm = {
	name: '',
	slug: '',
	description: '',
	start_date: '',
	end_date: '',
};

function toDateOnly(v: string | undefined) {
	if (!v) return '';
	return v.split('T')[0] ?? '';
}

export default function SeasonsView() {
	const { data: account } = useUser();
	const token = account?.token;

	const { data, isLoading } = useRadioAdminSeasons(token);
	const { mutate: create, isPending: isCreating } = useCreateSeason(token);
	const { mutate: update, isPending: isUpdating } = useUpdateSeason(token);
	const { mutate: remove } = useDeleteSeason(token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState<SeasonForm>(empty);
	const [editingId, setEditingId] = useState<number | null>(null);

	const setField = (field: keyof SeasonForm, value: string) =>
		setForm((p) => ({ ...p, [field]: value }));

	const openAdd = () => { setForm(empty); setAddOpen(true); };
	const openEdit = (row: Season) => {
		setForm({
			name: row.name,
			slug: row.slug ?? '',
			description: row.description ?? '',
			start_date: toDateOnly(row.start_date),
			end_date: toDateOnly(row.end_date),
		});
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = () => ({
		name: form.name.trim(),
		slug: form.slug.trim() || undefined,
		description: form.description.trim() || undefined,
		start_date: form.start_date || undefined,
		end_date: form.end_date || undefined,
	});

	const handleAdd = () => create(buildPayload(), {
		onSuccess: () => setAddOpen(false),
		onError: (err) => console.error('Create season failed:', err),
	});
	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, {
		onSuccess: () => setEditOpen(false),
		onError: (err) => console.error('Update season failed:', err),
	});

	const columns = useMemo<MRT_ColumnDef<Season>[]>(() => [
		{ accessorKey: 'id', header: 'ID', size: 70 },
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'slug', header: 'Slug' },
		{ accessorKey: 'description', header: 'Description' },
		{ id: 'start_date', header: 'Start Date', accessorFn: (row) => row.start_date ?? '' },
		{ id: 'end_date', header: 'End Date', accessorFn: (row) => row.end_date ?? '' },
	], []);

	const formContent = (
		<>
			<FormControl fullWidth>
				<FormLabel required>Name</FormLabel>
				<TextField size="small" value={form.name} onChange={(e) => setField('name', e.target.value)} />
			</FormControl>
			<FormControl fullWidth>
				<FormLabel>Slug</FormLabel>
				<TextField
					size="small"
					value={form.slug}
					onChange={(e) => setField('slug', e.target.value)}
					placeholder="auto-generated if left blank"
				/>
			</FormControl>
			<FormControl fullWidth>
				<FormLabel>Description</FormLabel>
				<TextField
					size="small"
					multiline
					minRows={2}
					value={form.description}
					onChange={(e) => setField('description', e.target.value)}
				/>
			</FormControl>
			<div className="flex gap-3">
				<FormControl fullWidth>
					<FormLabel>Start Date</FormLabel>
					<TextField
						size="small"
						type="date"
						value={form.start_date}
						onChange={(e) => setField('start_date', e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>
				</FormControl>
				<FormControl fullWidth>
					<FormLabel>End Date</FormLabel>
					<TextField
						size="small"
						type="date"
						value={form.end_date}
						onChange={(e) => setField('end_date', e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>
				</FormControl>
			</div>
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