'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import { FormControl, FormLabel, TextField } from '@mui/material';
import useUser from '@auth/useUser';
import {
	usePodcastCategories,
	useCreatePodcastCategory,
	useUpdatePodcastCategory,
	useDeletePodcastCategory,
} from '@/app/(control-panel)/content/podcast/api/hooks/categories/Podcastcategoryhooks';
import { PodcastCategory } from '@/app/(control-panel)/content/podcast/api/types';
import { RadioAdminTable, SimpleFormDialog } from '@/app/(control-panel)/administration/radio/components/ui/RadioAdminTable';

type CategoryForm = { name: string; description: string };
const empty: CategoryForm = { name: '', description: '' };

export default function PodcastCategoriesAdminView() {
	const { data: account } = useUser();
	const id = account?.id;
	const token = account?.token?.access;

	const { data, isLoading } = usePodcastCategories(id, token);
	const { mutate: create, isPending: isCreating } = useCreatePodcastCategory(id, token);
	const { mutate: update, isPending: isUpdating } = useUpdatePodcastCategory(id, token);
	const { mutate: remove } = useDeletePodcastCategory(id, token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [form, setForm] = useState<CategoryForm>(empty);
	const [editingId, setEditingId] = useState<number | null>(null);

	const setField = (f: keyof CategoryForm, v: string) => setForm(p => ({ ...p, [f]: v }));

	const openAdd = () => { setForm(empty); setAddOpen(true); };
	const openEdit = (row: PodcastCategory) => {
		setForm({ name: row.name, description: row.description ?? '' });
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = () => ({ name: form.name.trim(), description: form.description.trim() });

	const handleAdd = () => create(buildPayload(), { onSuccess: () => setAddOpen(false) });
	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, { onSuccess: () => setEditOpen(false) });

	const columns = useMemo<MRT_ColumnDef<PodcastCategory>[]>(() => [
		{ accessorKey: 'id', header: 'ID', size: 70 },
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'description', header: 'Description' },
	], []);

	const formContent = (
		<>
			<FormControl fullWidth>
				<FormLabel required>Name</FormLabel>
				<TextField size="small" value={form.name} onChange={e => setField('name', e.target.value)} />
			</FormControl>
			<FormControl fullWidth>
				<FormLabel>Description</FormLabel>
				<TextField size="small" multiline minRows={2} value={form.description}
					onChange={e => setField('description', e.target.value)} />
			</FormControl>
		</>
	);

	return (
		<RadioAdminTable
			title="Podcast Categories"
			addButtonLabel="Add Category"
			data={data?.items}
			isLoading={isLoading}
			columns={columns}
			onAdd={openAdd}
			onEdit={openEdit}
			onDelete={id => remove(id)}
			formDialog={
				<>
					<SimpleFormDialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Category"
						isPending={isCreating} canSubmit={!!form.name.trim()} onSubmit={handleAdd}>
						{formContent}
					</SimpleFormDialog>
					<SimpleFormDialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Category"
						isPending={isUpdating} canSubmit={!!form.name.trim()} onSubmit={handleEdit}>
						{formContent}
					</SimpleFormDialog>
				</>
			}
		/>
	);
}