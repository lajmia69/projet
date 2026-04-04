'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import {
	FormControl, FormLabel, MenuItem, Select, Typography, CircularProgress,
	Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import useUser from '@auth/useUser';
import {
	useRadioAdminEpisodeGuests,
	useCreateEpisodeGuest,
	useUpdateEpisodeGuest,
	useDeleteEpisodeGuest,
	useRadioAdminGuestTypes,
	useRadioAdminEpisodes,
	useRadioAdminAccounts,
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { EpisodeGuest, CreateEpisodeGuestPayload, UpdateEpisodeGuestPayload } from '@/app/(control-panel)/administration/radio/api/types';
import { RadioAdminTable, SimpleFormDialog } from '../ui/RadioAdminTable';

type GuestLinkForm = {
	episode_id:    string;
	guest_id:      string;
	guest_type_id: string;
};

const empty: GuestLinkForm = { episode_id: '', guest_id: '', guest_type_id: '' };

export default function EpisodeGuestsView() {
	const { data: account } = useUser();
	const token = account?.token;
	const { enqueueSnackbar } = useSnackbar();

	const { data, isLoading }                                                             = useRadioAdminEpisodeGuests(token);
	const { data: guestTypes }                                                            = useRadioAdminGuestTypes(token);
	const { data: episodesData }                                                          = useRadioAdminEpisodes(token);
	const { data: accountsData, isLoading: isAccountsLoading, isError: isAccountsError } = useRadioAdminAccounts(token);

	const { mutate: create, isPending: isCreating }  = useCreateEpisodeGuest(token);
	const { mutate: update, isPending: isUpdating }  = useUpdateEpisodeGuest(token);
	const { mutate: remove, isPending: isDeleting }  = useDeleteEpisodeGuest(token);

	const [addOpen,      setAddOpen]      = useState(false);
	const [editOpen,     setEditOpen]     = useState(false);
	const [form,         setForm]         = useState<GuestLinkForm>(empty);
	const [editingId,    setEditingId]    = useState<number | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

	const setField = (field: keyof GuestLinkForm, value: string) =>
		setForm((p) => ({ ...p, [field]: value }));

	const openAdd = () => { setForm(empty); setAddOpen(true); };

	const openEdit = (row: EpisodeGuest) => {
		setForm({
			episode_id:    String(row.episode?.id    ?? ''),
			guest_id:      String(row.guest?.id      ?? ''),
			guest_type_id: String(row.guest_type?.id ?? ''),
		});
		setEditingId(row.id);
		setEditOpen(true);
	};

	// All three IDs are required for create
	const canSubmitCreate = !!form.episode_id && !!form.guest_id && !!form.guest_type_id;

	// All three IDs are required for edit too — guest_id is pre-populated from the row
	const canSubmitEdit = !!form.episode_id && !!form.guest_id && !!form.guest_type_id;

	const buildCreatePayload = (): CreateEpisodeGuestPayload => ({
		episode_id:    Number(form.episode_id),
		guest_id:      Number(form.guest_id),
		guest_type_id: Number(form.guest_type_id),
	});

	/**
	 * FIX: Only include IDs that are actually set (non-empty). Sending guest_id:0
	 * or episode_id:0 causes the backend to reject the request.
	 */
	const buildUpdatePayload = (): Omit<UpdateEpisodeGuestPayload, 'id'> => {
		const payload: Omit<UpdateEpisodeGuestPayload, 'id'> = {};
		if (form.episode_id)    payload.episode_id    = Number(form.episode_id);
		if (form.guest_id)      payload.guest_id      = Number(form.guest_id);
		if (form.guest_type_id) payload.guest_type_id = Number(form.guest_type_id);
		return payload;
	};

	const handleAdd = () => {
		if (!canSubmitCreate) return;
		create(buildCreatePayload(), {
			onSuccess: () => setAddOpen(false),
			onError:   (err) => {
				console.error('Create episode guest failed:', err);
				enqueueSnackbar('Error creating guest link', { variant: 'error' });
			},
		});
	};

	const handleEdit = () => {
		if (!editingId || !canSubmitEdit) return;
		update({ id: editingId, ...buildUpdatePayload() }, {
			onSuccess: () => setEditOpen(false),
			onError:   (err) => {
				console.error('Update episode guest failed:', err);
				enqueueSnackbar('Error updating guest link', { variant: 'error' });
			},
		});
	};

	const handleDeleteConfirmed = () => {
		if (deleteTarget === null) return;
		const id = deleteTarget;
		setDeleteTarget(null); // close dialog first
		remove(id, {
			onError: (err) => {
				console.error('Delete episode guest failed:', err);
				enqueueSnackbar('Error deleting guest link', { variant: 'error' });
			},
		});
	};

	// ─── Table columns ────────────────────────────────────────────────────────

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

	// ─── Guest selector ───────────────────────────────────────────────────────

	const guestSelector = () => {
		if (isAccountsLoading) {
			return <CircularProgress size={20} sx={{ mt: 0.5 }} />;
		}
		if (isAccountsError) {
			return <Typography color="error" variant="caption">Error loading accounts.</Typography>;
		}
		if (!accountsData?.items?.length) {
			return <Typography variant="caption" color="textSecondary">No accounts found.</Typography>;
		}
		return (
			<Select
				size="small"
				value={form.guest_id}
				onChange={(e) => setField('guest_id', e.target.value)}
				displayEmpty
			>
				<MenuItem value="" disabled><em>Select a guest…</em></MenuItem>
				{accountsData.items.map((acc) => (
					<MenuItem key={acc.id} value={String(acc.id)}>
						{acc.full_name}
						{acc.user?.username ? (
							<Typography component="span" variant="caption" color="textSecondary" sx={{ ml: 1 }}>
								@{acc.user.username}
							</Typography>
						) : null}
					</MenuItem>
				))}
			</Select>
		);
	};

	// ─── Shared form fields ───────────────────────────────────────────────────

	const formContent = (
		<>
			<FormControl fullWidth>
				<FormLabel required>Episode</FormLabel>
				<Select
					size="small"
					value={form.episode_id}
					onChange={(e) => setField('episode_id', e.target.value)}
					displayEmpty
				>
					<MenuItem value="" disabled><em>Select an episode…</em></MenuItem>
					{episodesData?.items.map((ep) => (
						<MenuItem key={ep.id} value={String(ep.id)}>{ep.name}</MenuItem>
					))}
				</Select>
			</FormControl>

			<FormControl fullWidth>
				<FormLabel required>Guest</FormLabel>
				{guestSelector()}
			</FormControl>

			<FormControl fullWidth>
				<FormLabel required>Guest Type / Role</FormLabel>
				<Select
					size="small"
					value={form.guest_type_id}
					onChange={(e) => setField('guest_type_id', e.target.value)}
					displayEmpty
				>
					<MenuItem value="" disabled><em>Select a type…</em></MenuItem>
					{guestTypes?.items.map((t) => (
						<MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
					))}
				</Select>
			</FormControl>
		</>
	);

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<>
			<RadioAdminTable
				title="Episode Guests"
				addButtonLabel="Link Guest"
				data={data?.items}
				isLoading={isLoading}
				columns={columns}
				onAdd={openAdd}
				onEdit={openEdit}
				onDelete={(id) => setDeleteTarget(id)}
				formDialog={
					<>
						<SimpleFormDialog
							open={addOpen}
							onClose={() => setAddOpen(false)}
							title="Link Guest to Episode"
							isPending={isCreating}
							canSubmit={canSubmitCreate}
							onSubmit={handleAdd}
						>
							{formContent}
						</SimpleFormDialog>

						<SimpleFormDialog
							open={editOpen}
							onClose={() => setEditOpen(false)}
							title="Edit Guest Link"
							isPending={isUpdating}
							canSubmit={canSubmitEdit}
							onSubmit={handleEdit}
						>
							{formContent}
						</SimpleFormDialog>
					</>
				}
			/>

			{/* ── Delete confirmation dialog ── */}
			<Dialog
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				maxWidth="xs"
				fullWidth
				PaperProps={{ sx: { borderRadius: '16px' } }}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Remove Guest Link?</DialogTitle>
				<DialogContent>
					<Typography>This will unlink the guest from the episode. This action cannot be undone.</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setDeleteTarget(null)} variant="outlined" disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirmed}
						variant="contained"
						color="error"
						disabled={isDeleting}
						startIcon={isDeleting ? <CircularProgress size={14} /> : undefined}
					>
						{isDeleting ? 'Removing…' : 'Remove'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}