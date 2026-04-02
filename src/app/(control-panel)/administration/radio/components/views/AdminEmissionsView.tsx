'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import {
	Paper, ListItemIcon, MenuItem, Dialog, DialogTitle, DialogContent,
	DialogActions, Button, Typography, FormControl, FormLabel,
	TextField, Select, Chip, CircularProgress, Divider
} from '@mui/material';
import { motion } from 'motion/react';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { styled } from '@mui/material/styles';
import { format, parseISO, isValid } from 'date-fns';
import useUser from '@auth/useUser';
import DataTable from 'src/components/data-table/DataTable';
import {
	useRadioAdminEmissions,
	useCreateEmission,
	useUpdateEmission,
	useDeleteEmission,
	useValidateEmission,
	usePublishEmission,
	useRadioAdminEmissionTypes,
	useRadioAdminLanguages,
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { Emission } from '@/app/(control-panel)/administration/radio/api/types';

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' }
}));

function safeFormat(dateStr: string | undefined) {
	if (!dateStr) return '—';
	const d = parseISO(dateStr.split('T')[0] + 'T00:00:00');
	return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
}

function toDateOnly(v: string | undefined) {
	if (!v) return '';
	return v.split('T')[0] ?? '';
}

async function logHttpError(label: string, err: unknown) {
	if (err && typeof err === 'object' && 'response' in err) {
		const res = (err as { response: Response }).response;
		try {
			const body = await res.clone().json();
			console.error(`${label} [${res.status}] server said:`, JSON.stringify(body, null, 2));
		} catch {
			const text = await res.clone().text();
			console.error(`${label} [${res.status}] server said:`, text);
		}
	} else {
		console.error(label, err);
	}
}

type EmissionForm = {
	name: string;
	slug: string;
	description: string;
	language_id: string;
	emission_type_id: string;
	publishing_date: string;
	start_date: string;
};

const empty: EmissionForm = {
	name: '', slug: '', description: '',
	language_id: '', emission_type_id: '',
	publishing_date: '', start_date: '',
};

export default function AdminEmissionsView() {
	const { data: account } = useUser();
	const token = account?.token;

	const { data: emissionsData, isLoading } = useRadioAdminEmissions(token);
	const { data: emissionTypesData } = useRadioAdminEmissionTypes(token);
	const { data: languagesData, isLoading: isLanguagesLoading, isError: isLanguagesError } = useRadioAdminLanguages(token);
	const { mutate: create, isPending: isCreating } = useCreateEmission(token);
	const { mutate: update, isPending: isUpdating } = useUpdateEmission(token);
	const { mutate: remove } = useDeleteEmission(token);
	const { mutate: validate } = useValidateEmission(token);
	const { mutate: publish } = usePublishEmission(token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<EmissionForm>(empty);

	const setField = (f: keyof EmissionForm, v: string) => setForm((p) => ({ ...p, [f]: v }));
	const canSubmit = !!form.name.trim() && !!form.language_id;

	const openAdd = () => { setForm(empty); setAddOpen(true); };
	const openEdit = (row: Emission) => {
		setForm({
			name: row.name,
			slug: row.slug ?? '',
			description: row.description ?? '',
			language_id: String(row.language?.id ?? ''),
			emission_type_id: String(row.emission_type?.id ?? ''),
			publishing_date: toDateOnly(row.publishing_date),
			start_date: toDateOnly(row.start_date),
		});
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = () => {
		// Only send fields the backend explicitly listed in its create schema.
		// No transcription, no tags — emission schema didn't show those.
		const payload: Record<string, unknown> = {
			name: form.name.trim(),
			language_id: Number(form.language_id),
		};

		if (form.slug.trim())           payload.slug            = form.slug.trim();
		if (form.description.trim())    payload.description     = form.description.trim();
		if (form.emission_type_id)      payload.emission_type_id = Number(form.emission_type_id);
		if (form.publishing_date)       payload.publishing_date  = form.publishing_date;
		if (form.start_date)            payload.start_date       = form.start_date;

		console.log('Emission payload →', JSON.stringify(payload, null, 2));
		return payload;
	};

	const handleAdd = () =>
		create(buildPayload() as never, {
			onSuccess: () => setAddOpen(false),
			onError:   (err) => logHttpError('Create emission failed', err),
		});

	const handleEdit = () =>
		update({ id: editingId!, ...(buildPayload() as never) }, {
			onSuccess: () => setEditOpen(false),
			onError:   (err) => logHttpError('Update emission failed', err),
		});

	const columns = useMemo<MRT_ColumnDef<Emission>[]>(() => [
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
			id: 'emission_type',
			header: 'Type',
			accessorFn: (row) => row.emission_type?.name ?? '',
			Cell: ({ row }) => row.original.emission_type?.name
				? <Chip label={row.original.emission_type.name} size="small" sx={{ fontSize: '0.72rem', height: 22 }} />
				: <span className="text-gray-400">—</span>,
		},
		{
			id: 'language',
			header: 'Language',
			accessorFn: (row) => row.language?.name ?? '',
		},
		{
			id: 'status',
			header: 'Status',
			accessorFn: (row) => row.is_published,
			Cell: ({ row }) => (
				<Chip
					label={
						row.original.is_published         ? 'Published'
						: row.original.is_approved_content ? 'Approved'
						: 'Draft'
					}
					size="small"
					sx={{
						height: 22, fontSize: '0.72rem', fontWeight: 700,
						backgroundColor: row.original.is_published         ? '#dcfce7'
							: row.original.is_approved_content ? '#dbeafe' : '#f1f5f9',
						color: row.original.is_published         ? '#15803d'
							: row.original.is_approved_content ? '#1d4ed8' : '#475569',
					}}
				/>
			),
		},
		{
			id: 'publishing_date',
			header: 'Published',
			accessorFn: (row) => row.publishing_date ?? '',
			Cell: ({ row }) => safeFormat(row.original.publishing_date),
		},
		{
			id: 'created_by',
			header: 'Created By',
			accessorFn: (row) => row.created_by?.full_name ?? '',
		},
	], []);

	const formContent = (
		<>
			<FormControl fullWidth>
				<FormLabel required>Name</FormLabel>
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

			<FormControl fullWidth>
				<FormLabel required>Language</FormLabel>
				{isLanguagesLoading ? (
					<CircularProgress size={20} />
				) : isLanguagesError ? (
					<Typography color="error">Error loading languages</Typography>
				) : !languagesData?.items?.length ? (
					<Typography color="textSecondary">No languages available</Typography>
				) : (
					<Select
						size="small"
						value={form.language_id}
						onChange={(e) => setField('language_id', e.target.value)}
						displayEmpty
					>
						<MenuItem value="" disabled><em>Select a language…</em></MenuItem>
						{languagesData.items.map((l) => (
							<MenuItem key={l.id} value={String(l.id)}>{l.name}</MenuItem>
						))}
					</Select>
				)}
			</FormControl>

			<FormControl fullWidth>
				<FormLabel>Emission Type</FormLabel>
				<Select
					size="small"
					value={form.emission_type_id}
					onChange={(e) => setField('emission_type_id', e.target.value)}
					displayEmpty
				>
					<MenuItem value=""><em>None</em></MenuItem>
					{emissionTypesData?.items.map((t) => (
						<MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
					))}
				</Select>
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
					<FormLabel>Publishing Date</FormLabel>
					<TextField
						size="small"
						type="date"
						value={form.publishing_date}
						onChange={(e) => setField('publishing_date', e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>
				</FormControl>
			</div>
		</>
	);

	const dialogContent = (
		<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
			{formContent}
		</DialogContent>
	);

	return (
		<>
			<Root
				header={
					<div className="flex flex-auto flex-col py-4 px-4">
						<PageBreadcrumb className="mb-2" />
						<div className="flex items-center gap-2">
							<motion.span initial={{ x: -20 }} animate={{ x: 0, transition: { delay: 0.2 } }}>
								<Typography className="text-4xl leading-none font-extrabold tracking-tight">
									Emissions
								</Typography>
							</motion.span>
							<div className="flex flex-1 items-center justify-end gap-2">
								<Button
									variant="contained"
									color="secondary"
									onClick={openAdd}
									startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}
								>
									Add Emission
								</Button>
							</div>
						</div>
					</div>
				}
				content={
					isLoading ? <FuseLoading /> : (
						<Paper className="flex h-full w-full flex-col overflow-hidden rounded-b-none" elevation={2}>
							<DataTable
								data={emissionsData?.items ?? []}
								columns={columns}
								enableRowNumbers
								enableRowActions
								enablePagination
								paginationDisplayMode="pages"
								initialState={{
									pagination: { pageSize: 15, pageIndex: 0 },
									sorting: [{ id: 'id', desc: true }],
								}}
								muiPaginationProps={{
									color: 'secondary',
									rowsPerPageOptions: [10, 15, 25],
									shape: 'rounded',
									variant: 'outlined',
								}}
								renderRowActionMenuItems={({ row, closeMenu }) => [
									<MenuItem key="edit" onClick={() => { openEdit(row.original); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:pencil</FuseSvgIcon></ListItemIcon>Edit
									</MenuItem>,
									<MenuItem key="validate" onClick={() => { validate(row.original.id); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:check-circle</FuseSvgIcon></ListItemIcon>Validate
									</MenuItem>,
									<MenuItem key="publish" onClick={() => { publish(row.original.id); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:send</FuseSvgIcon></ListItemIcon>Publish
									</MenuItem>,
									<MenuItem key="del" onClick={() => { remove(row.original.id); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:trash</FuseSvgIcon></ListItemIcon>Delete
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
				<DialogTitle sx={{ fontWeight: 700 }}>Add Emission</DialogTitle>
				<Divider />
				{dialogContent}
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setAddOpen(false)} variant="outlined" disabled={isCreating}>
						Cancel
					</Button>
					<Button
						onClick={handleAdd}
						variant="contained"
						color="secondary"
						disabled={!canSubmit || isCreating}
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
				<DialogTitle sx={{ fontWeight: 700 }}>Edit Emission</DialogTitle>
				<Divider />
				{dialogContent}
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setEditOpen(false)} variant="outlined" disabled={isUpdating}>
						Cancel
					</Button>
					<Button
						onClick={handleEdit}
						variant="contained"
						color="secondary"
						disabled={!canSubmit || isUpdating}
						startIcon={isUpdating ? <CircularProgress size={14} /> : undefined}
					>
						{isUpdating ? 'Saving…' : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}