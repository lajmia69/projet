'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import {
	Paper, ListItemIcon, MenuItem, Dialog, DialogTitle, DialogContent,
	DialogActions, Button, Typography, FormControl, FormLabel,
	TextField, Select, Chip, CircularProgress, Divider, Box,
} from '@mui/material';
import { motion } from 'motion/react';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { styled } from '@mui/material/styles';
import { format, parseISO, isValid } from 'date-fns';
import useUser from '@auth/useUser';
import { useSnackbar } from 'notistack';
import DataTable from 'src/components/data-table/DataTable';
import {
	useRadioAdminEpisodes,
	useCreateEpisode,
	useUpdateEpisode,
	useDeleteEpisode,
	useValidateEpisode,
	usePublishEpisode,
	useRadioAdminEmissions,
	useRadioAdminSeasons,
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { Episode, CreateEpisodePayload, UpdateEpisodePayload } from '@/app/(control-panel)/administration/radio/api/types';

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' }
}));

function safeFormat(dateStr: string | undefined): string {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
}

function toDateOnly(v: string | undefined): string {
	if (!v) return '';
	return v.split('T')[0] ?? '';
}

async function logHttpError(label: string, err: unknown) {
	if (err && typeof err === 'object' && 'response' in err) {
		const res = (err as { response: Response }).response;
		try {
			const body = await res.clone().json();
			console.error(`${label} [${res.status}]:`, JSON.stringify(body, null, 2));
		} catch {
			console.error(`${label} [${res.status}]:`, await res.clone().text());
		}
	} else {
		console.error(label, err);
	}
}

type EpisodeForm = {
	name:            string;
	slug:            string;
	description:     string;
	emission_id:     string;
	season_id:       string;
	publishing_date: string;
	online_date:     string;
};

const empty: EpisodeForm = {
	name: '', slug: '', description: '', emission_id: '', season_id: '',
	publishing_date: '', online_date: '',
};

export default function AdminEpisodesView() {
	const { data: account } = useUser();
	const token = account?.token;
	const { enqueueSnackbar } = useSnackbar();

	const { data: episodesData,  isLoading }         = useRadioAdminEpisodes(token);
	const { data: emissionsData }                    = useRadioAdminEmissions(token);
	const { data: seasonsData }                      = useRadioAdminSeasons(token);
	const { mutate: create, isPending: isCreating }  = useCreateEpisode(token);
	const { mutate: update, isPending: isUpdating }  = useUpdateEpisode(token);
	const { mutate: remove,  isPending: isDeleting } = useDeleteEpisode(token);
	const { mutate: validate }                       = useValidateEpisode(token);
	const { mutate: publish }                        = usePublishEpisode(token);

	const [addOpen,      setAddOpen]      = useState(false);
	const [editOpen,     setEditOpen]     = useState(false);
	const [editingId,    setEditingId]    = useState<number | null>(null);
	const [form,         setForm]         = useState<EpisodeForm>(empty);
	const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

	const setField = (f: keyof EpisodeForm, v: string) =>
		setForm((p) => ({ ...p, [f]: v }));

	const canSubmitCreate = !!form.name.trim() && !!form.emission_id;
	const canSubmitEdit   = !!form.name.trim();

	const openAdd = () => { setForm(empty); setAddOpen(true); };

	const openEdit = (row: Episode) => {
		setForm({
			name:            row.name,
			slug:            row.slug            ?? '',
			description:     row.description     ?? '',
			emission_id:     String(row.emission?.id ?? ''),
			season_id:       String(row.season?.id   ?? ''),
			publishing_date: toDateOnly(row.publishing_date),
			online_date:     toDateOnly(row.online_date),
		});
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildCreatePayload = (): CreateEpisodePayload => ({
		name:          form.name.trim(),
		slug:          form.slug.trim()        || undefined,
		description:   form.description.trim() || undefined,
		emission_id:   form.emission_id ? Number(form.emission_id) : undefined,
		season_id:     form.season_id   ? Number(form.season_id)   : undefined,
		transcription: {},
		tags:          [],
	});

	const buildUpdatePayload = (): Omit<UpdateEpisodePayload, 'id'> => {
		const payload: Omit<UpdateEpisodePayload, 'id'> = {
			name: form.name.trim(),
		};
		if (form.slug.trim())        payload.slug            = form.slug.trim();
		if (form.description.trim()) payload.description     = form.description.trim();
		if (form.emission_id)        payload.emission_id     = Number(form.emission_id);
		if (form.season_id)          payload.season_id       = Number(form.season_id);
		if (form.publishing_date)    payload.publishing_date = form.publishing_date;
		if (form.online_date)        payload.online_date     = form.online_date;
		return payload;
	};

	const handleAdd = () => {
		if (!token || !canSubmitCreate) return;
		create(buildCreatePayload(), {
			onSuccess: () => setAddOpen(false),
			onError:   (err) => logHttpError('Create episode failed', err),
		});
	};

	const handleEdit = () => {
		if (!token || !editingId || !canSubmitEdit) return;
		update({ id: editingId, ...buildUpdatePayload() }, {
			onSuccess: () => setEditOpen(false),
			onError:   (err) => {
				logHttpError('Update episode failed', err);
				enqueueSnackbar('Error updating episode', { variant: 'error' });
			},
		});
	};

	const handleDeleteConfirmed = () => {
		if (deleteTarget === null) return;
		const id = deleteTarget;
		setDeleteTarget(null); // close dialog immediately
		remove(id, {
			onError: (err) => logHttpError('Delete episode failed', err),
		});
	};

	// ─── Table columns ────────────────────────────────────────────────────────

	const columns = useMemo<MRT_ColumnDef<Episode>[]>(() => [
		{
			accessorKey: 'id',
			header: 'ID',
			size: 70,
			Cell: ({ cell }) => (
				<Typography sx={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', color: 'text.secondary' }}>
					#{cell.getValue<number>()}
				</Typography>
			),
		},
		{
			accessorKey: 'name',
			header: 'Name',
			Cell: ({ cell }) => <span className="font-medium">{cell.getValue<string>()}</span>,
		},
		{
			id: 'emission',
			header: 'Emission',
			accessorFn: (row) => row.emission?.name ?? '',
			Cell: ({ row }) => (
				<span className="text-sm truncate max-w-[160px] block">
					{row.original.emission?.name ?? '—'}
				</span>
			),
		},
		{
			id: 'season',
			header: 'Season',
			accessorFn: (row) => row.season?.name ?? '',
		},
		{
			id: 'language',
			header: 'Language',
			accessorFn: (row) => row.language?.name ?? '',
		},
		{
			id: 'publishing_date',
			header: 'Publishing Date',
			accessorFn: (row) => row.publishing_date ?? '',
			Cell: ({ row }) => safeFormat(row.original.publishing_date),
		},
		{
			id: 'status',
			header: 'Status',
			accessorFn: (row) => row.is_published,
			Cell: ({ row }) => {
				const { is_published, is_approved_content, is_pubic_content } = row.original;
				const label = is_published       ? 'Published'
					: is_approved_content         ? 'Approved'
					: is_pubic_content            ? 'Public'
					:                               'Draft';
				const bg    = is_published       ? '#dcfce7'
					: is_approved_content         ? '#dbeafe'
					: is_pubic_content            ? '#fef9c3'
					:                               '#f1f5f9';
				const color = is_published       ? '#15803d'
					: is_approved_content         ? '#1d4ed8'
					: is_pubic_content            ? '#854d0e'
					:                               '#475569';
				return (
					<Chip
						label={label}
						size="small"
						sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, backgroundColor: bg, color }}
					/>
				);
			},
		},
		{
			id: 'created_by',
			header: 'Created By',
			accessorFn: (row) => row.created_by?.full_name ?? '',
		},
	], []);

	// ─── Shared form fields ───────────────────────────────────────────────────

	const formContent = (
		<>
			<FormControl fullWidth>
				<FormLabel required>Episode Name</FormLabel>
				<TextField
					size="small"
					value={form.name}
					onChange={(e) => setField('name', e.target.value)}
				/>
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

			<Box sx={{ display: 'flex', gap: 2 }}>
				<FormControl fullWidth>
					<FormLabel>Emission</FormLabel>
					<Select
						size="small"
						value={form.emission_id}
						onChange={(e) => setField('emission_id', e.target.value)}
						displayEmpty
					>
						<MenuItem value=""><em>None / keep existing</em></MenuItem>
						{emissionsData?.items.map((e) => (
							<MenuItem key={e.id} value={String(e.id)}>{e.name}</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl fullWidth>
					<FormLabel>Season</FormLabel>
					<Select
						size="small"
						value={form.season_id}
						onChange={(e) => setField('season_id', e.target.value)}
						displayEmpty
					>
						<MenuItem value=""><em>None</em></MenuItem>
						{seasonsData?.items.map((s) => (
							<MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>

			<Box sx={{ display: 'flex', gap: 2 }}>
				<FormControl fullWidth>
					<FormLabel>Publishing Date</FormLabel>
					<TextField
						size="small"
						type="date"
						value={form.publishing_date}
						onChange={(e) => setField('publishing_date', e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>
				</FormControl>

				<FormControl fullWidth>
					<FormLabel>Online Date</FormLabel>
					<TextField
						size="small"
						type="date"
						value={form.online_date}
						onChange={(e) => setField('online_date', e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>
				</FormControl>
			</Box>
		</>
	);

	// ─── Render ───────────────────────────────────────────────────────────────

	return (
		<>
			<Root
				header={
					<div className="flex flex-auto flex-col py-4 px-4">
						<PageBreadcrumb className="mb-2" />
						<div className="flex items-center gap-2">
							<motion.span initial={{ x: -20 }} animate={{ x: 0, transition: { delay: 0.2 } }}>
								<Typography className="text-4xl leading-none font-extrabold tracking-tight">
									Episodes
								</Typography>
							</motion.span>
							<div className="flex flex-1 items-center justify-end gap-2">
								<Button
									variant="contained"
									color="secondary"
									onClick={openAdd}
									startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}
								>
									Add Episode
								</Button>
							</div>
						</div>
					</div>
				}
				content={
					isLoading ? <FuseLoading /> : (
						<Paper className="flex h-full w-full flex-col overflow-hidden rounded-b-none" elevation={2}>
							<DataTable
								data={episodesData?.items ?? []}
								columns={columns}
								enableRowNumbers
								enableRowActions
								enablePagination
								paginationDisplayMode="pages"
								initialState={{
									pagination: { pageSize: 15, pageIndex: 0 },
									sorting:    [{ id: 'id', desc: true }],
								}}
								muiPaginationProps={{
									color: 'secondary',
									rowsPerPageOptions: [10, 15, 25],
									shape: 'rounded',
									variant: 'outlined',
								}}
								renderRowActionMenuItems={({ row, closeMenu }) => [
									<MenuItem key="edit" onClick={() => { openEdit(row.original); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:pencil</FuseSvgIcon></ListItemIcon>
										Edit
									</MenuItem>,
									<MenuItem key="validate" onClick={() => { validate(row.original.id); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:check-circle</FuseSvgIcon></ListItemIcon>
										Validate
									</MenuItem>,
									<MenuItem key="publish" onClick={() => { publish(row.original.id); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:send</FuseSvgIcon></ListItemIcon>
										Publish
									</MenuItem>,
									<MenuItem key="del" onClick={() => { setDeleteTarget(row.original.id); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:trash</FuseSvgIcon></ListItemIcon>
										Delete
									</MenuItem>,
								]}
							/>
						</Paper>
					)
				}
			/>

			{/* ── Add dialog ── */}
			<Dialog
				open={addOpen}
				onClose={() => setAddOpen(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: '16px' } }}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Add Episode</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					{formContent}
				</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setAddOpen(false)} variant="outlined" disabled={isCreating}>
						Cancel
					</Button>
					<Button
						onClick={handleAdd}
						variant="contained"
						color="secondary"
						disabled={!canSubmitCreate || isCreating}
						startIcon={isCreating ? <CircularProgress size={14} /> : undefined}
					>
						{isCreating ? 'Creating…' : 'Create'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* ── Edit dialog ── */}
			<Dialog
				open={editOpen}
				onClose={() => setEditOpen(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: '16px' } }}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Edit Episode</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
					{formContent}
				</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setEditOpen(false)} variant="outlined" disabled={isUpdating}>
						Cancel
					</Button>
					<Button
						onClick={handleEdit}
						variant="contained"
						color="secondary"
						disabled={!canSubmitEdit || isUpdating}
						startIcon={isUpdating ? <CircularProgress size={14} /> : undefined}
					>
						{isUpdating ? 'Saving…' : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* ── Delete confirmation dialog ── */}
			<Dialog
				open={deleteTarget !== null}
				onClose={() => setDeleteTarget(null)}
				maxWidth="xs"
				fullWidth
				PaperProps={{ sx: { borderRadius: '16px' } }}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Delete Episode?</DialogTitle>
				<DialogContent>
					<Typography>
						This action cannot be undone. Approved or published episodes may be rejected by the server.
					</Typography>
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
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}