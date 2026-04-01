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
	description: string;
	number: string;
	start_date: string;
	end_date: string;
};

const empty: SeasonForm = {
	name: '',
	description: '',
	number: '',
	start_date: '',
	end_date: '',
};

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
			description: row.description ?? '',
			number: String(row.number ?? ''),
			start_date: (row as any).start_date ?? '',
			end_date: (row as any).end_date ?? '',
		});
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = () => ({
		name: form.name.trim(),
		description: form.description.trim() || undefined,
		number: form.number ? Number(form.number) : undefined,
		...(form.start_date ? { start_date: form.start_date } : {}),
		...(form.end_date ? { end_date: form.end_date } : {}),
	});

	const handleAdd = () => create(buildPayload(), { onSuccess: () => setAddOpen(false) });
	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, { onSuccess: () => setEditOpen(false) });

	const columns = useMemo<MRT_ColumnDef<Season>[]>(() => [
		{ accessorKey: 'id', header: 'ID', size: 70 },
		{ accessorKey: 'number', header: 'No.', size: 80 },
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'description', header: 'Description' },
		{
			id: 'start_date',
			header: 'Start Date',
			accessorFn: (row) => (row as any).start_date ?? '',
		},
		{
			id: 'end_date',
			header: 'End Date',
			accessorFn: (row) => (row as any).end_date ?? '',
		},
	], []);

	const formContent = (
		<>
			<FormControl fullWidth>
				<FormLabel required>Name</FormLabel>
				<TextField size="small" value={form.name} onChange={(e) => setField('name', e.target.value)} />
			</FormControl>
			<FormControl fullWidth>
				<FormLabel>Season Number</FormLabel>
				<TextField
					size="small"
					type="number"
					value={form.number}
					onChange={(e) => setField('number', e.target.value)}
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
						inputProps={{ placeholder: 'yyyy-mm-dd' }}
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
						inputProps={{ placeholder: 'yyyy-mm-dd' }}
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
					<SimpleFormDialog
						open={addOpen}
						onClose={() => setAddOpen(false)}
						title="Add Season"
						isPending={isCreating}
						canSubmit={!!form.name.trim()}
						onSubmit={handleAdd}
					>
						{formContent}
					</SimpleFormDialog>
					<SimpleFormDialog
						open={editOpen}
						onClose={() => setEditOpen(false)}
						title="Edit Season"
						isPending={isUpdating}
						canSubmit={!!form.name.trim()}
						onSubmit={handleEdit}
					>
						{formContent}
					</SimpleFormDialog>
				</>
			}
		/>
	);
}