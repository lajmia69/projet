'use client';

import { useMemo, useRef, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import {
	Paper, ListItemIcon, MenuItem, Dialog, DialogTitle, DialogContent,
	DialogActions, Button, Typography, FormControl, FormLabel,
	TextField, Select, Chip, CircularProgress, Divider, Box,
	IconButton, Tooltip,
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
import { radioAdminApi } from '@/app/(control-panel)/administration/radio/api/services/radioAdminApiService';
import { Emission, CreateEmissionPayload } from '@/app/(control-panel)/administration/radio/api/types';

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' }
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * FIX #3 – Date formatting.
 * The backend sends simple YYYY-MM-DD strings. `parseISO` handles them
 * correctly as-is; we no longer need to append a fake time component.
 */
function safeFormat(dateStr: string | undefined): string {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
}

/**
 * Strips any time component so <input type="date"> always receives YYYY-MM-DD.
 * Returns undefined (not '') so optional date fields are omitted from payloads.
 */
function toDateOnly(v: string | undefined): string | undefined {
	if (!v) return undefined;
	const part = v.split('T')[0];
	return part || undefined;
}

async function logHttpError(label: string, err: unknown) {
	if (err && typeof err === 'object' && 'response' in err) {
		const res = (err as { response: Response }).response;
		try {
			const body = await res.clone().json();
			console.error(`${label} [${res.status}]:`, JSON.stringify(body, null, 2));
		} catch {
			const text = await res.clone().text();
			console.error(`${label} [${res.status}]:`, text);
		}
	} else {
		console.error(label, err);
	}
}

// ─── Form state ───────────────────────────────────────────────────────────────

/**
 * FIX #4 – ID fields are kept as strings only inside the form state (required
 * by MUI Select). `buildPayload` converts them to numbers before sending.
 * No other part of the app should read raw form IDs as numeric values.
 */
type EmissionForm = {
	name: string;
	slug: string;
	description: string;
	/** String in form state; converted to number in buildPayload. */
	language_id: string;
	/** String in form state; converted to number in buildPayload. */
	emission_type_id: string;
	publishing_date: string;
	start_date: string;
};

const empty: EmissionForm = {
	name: '', slug: '', description: '',
	language_id: '', emission_type_id: '',
	publishing_date: '', start_date: '',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminEmissionsView() {
	const { data: account } = useUser();
	const token = account?.token;

	const { data: emissionsData, isLoading } = useRadioAdminEmissions(token);
	const { data: emissionTypesData } = useRadioAdminEmissionTypes(token);
	const {
		data: languagesData,
		isLoading: isLanguagesLoading,
		isError: isLanguagesError,
	} = useRadioAdminLanguages(token);

	const { mutate: create, isPending: isCreating } = useCreateEmission(token);
	const { mutate: update, isPending: isUpdating } = useUpdateEmission(token);
	const { mutate: remove } = useDeleteEmission(token);
	const { mutate: validate } = useValidateEmission(token);
	const { mutate: publish } = usePublishEmission(token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<EmissionForm>(empty);

	// FIX #5 – Poster upload state (separate from the text-field form so the
	// File object never gets serialised into the JSON payload by accident).
	const [posterFile, setPosterFile] = useState<File | null>(null);
	const [isPosterUploading, setIsPosterUploading] = useState(false);
	const posterInputRef = useRef<HTMLInputElement>(null);

	const setField = (f: keyof EmissionForm, v: string) =>
		setForm((p) => ({ ...p, [f]: v }));

	const canSubmit = !!form.name.trim() && !!form.language_id;
	const isPending = isCreating || isUpdating || isPosterUploading;

	const openAdd = () => { setForm(empty); setPosterFile(null); setAddOpen(true); };
	const openEdit = (row: Emission) => {
		setForm({
			name: row.name,
			slug: row.slug ?? '',
			description: row.description ?? '',
			language_id: String(row.language?.id ?? ''),
			emission_type_id: String(row.emission_type?.id ?? ''),
			// FIX #3 – use toDateOnly; backend already sends YYYY-MM-DD
			publishing_date: toDateOnly(row.publishing_date) ?? '',
			start_date: toDateOnly(row.start_date) ?? '',
		});
		setPosterFile(null);
		setEditingId(row.id);
		setEditOpen(true);
	};

	/**
	 * FIX #2 – Include `tags` and `transcription` in the payload.
	 * FIX #4 – language_id and emission_type_id are numbers, not strings.
	 * FIX #3 – Dates come back as YYYY-MM-DD; toDateOnly keeps them stable.
	 */
	const buildPayload = (): CreateEmissionPayload => {
		const payload: CreateEmissionPayload = {
			name: form.name.trim(),
			// FIX #4: explicit Number() conversion — the form holds a string
			language_id: Number(form.language_id),
			// FIX #2: always send tags array (empty when none chosen)
			tags: [],
			// FIX #2: always send transcription object (empty when not set)
			transcription: {},
		};

		if (form.slug.trim())       payload.slug             = form.slug.trim();
		if (form.description.trim()) payload.description     = form.description.trim();
		if (form.emission_type_id)  payload.emission_type_id = Number(form.emission_type_id);
		if (form.publishing_date)   payload.publishing_date  = form.publishing_date;
		if (form.start_date)        payload.start_date       = form.start_date;

		return payload;
	};

	/** Upload the poster image via the dedicated multipart endpoint. */
	const uploadPosterIfNeeded = async (emissionId: number) => {
		if (!posterFile || !token) return;
		setIsPosterUploading(true);
		try {
			const fd = new FormData();
			fd.append('id', String(emissionId));
			fd.append('poster', posterFile);
			await radioAdminApi.updateEmissionPoster(token, fd);
		} catch (err) {
			logHttpError('Poster upload failed', err);
		} finally {
			setIsPosterUploading(false);
		}
	};

	const handleAdd = () =>
		create(buildPayload(), {
			onSuccess: async (created) => {
				await uploadPosterIfNeeded(created.id);
				setAddOpen(false);
			},
			onError: (err) => logHttpError('Create emission failed', err),
		});

	const handleEdit = () =>
		update({ id: editingId!, ...buildPayload() }, {
			onSuccess: async (updated) => {
				await uploadPosterIfNeeded(updated.id);
				setEditOpen(false);
			},
			onError: (err) => logHttpError('Update emission failed', err),
		});

	// ─── Columns ────────────────────────────────────────────────────────────────

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
			Cell: ({ row }) => {
				// FIX #1: use `is_pubic_content` (backend field name) instead of `is_public_content`
				const { is_published, is_approved_content, is_pubic_content } = row.original;
				const label = is_published ? 'Published' : is_approved_content ? 'Approved' : is_pubic_content ? 'Public' : 'Draft';
				const bg    = is_published ? '#dcfce7' : is_approved_content ? '#dbeafe' : is_pubic_content ? '#fef9c3' : '#f1f5f9';
				const color = is_published ? '#15803d' : is_approved_content ? '#1d4ed8' : is_pubic_content ? '#854d0e' : '#475569';
				return (
					<Chip label={label} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, backgroundColor: bg, color }} />
				);
			},
		},
		{
			id: 'publishing_date',
			header: 'Published',
			// FIX #3: safeFormat now correctly handles plain YYYY-MM-DD strings
			accessorFn: (row) => row.publishing_date ?? '',
			Cell: ({ row }) => safeFormat(row.original.publishing_date),
		},
		{
			id: 'created_by',
			header: 'Created By',
			accessorFn: (row) => row.created_by?.full_name ?? '',
		},
	], []);

	// ─── Shared form fields ──────────────────────────────────────────────────────

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

			{/* FIX #5 – Poster upload field */}
			<FormControl fullWidth>
				<FormLabel>Poster Image</FormLabel>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
					<Button
						variant="outlined"
						size="small"
						onClick={() => posterInputRef.current?.click()}
						startIcon={<FuseSvgIcon size={16}>lucide:image</FuseSvgIcon>}
					>
						{posterFile ? 'Change image' : 'Choose image'}
					</Button>
					{posterFile && (
						<>
							<Typography variant="caption" noWrap sx={{ maxWidth: 180 }}>
								{posterFile.name}
							</Typography>
							<Tooltip title="Remove selection">
								<IconButton size="small" onClick={() => setPosterFile(null)}>
									<FuseSvgIcon size={14}>lucide:x</FuseSvgIcon>
								</IconButton>
							</Tooltip>
						</>
					)}
				</Box>
				{/* Hidden native file input — keeps the UI clean */}
				<input
					ref={posterInputRef}
					type="file"
					accept="image/*"
					style={{ display: 'none' }}
					onChange={(e) => {
						const file = e.target.files?.[0] ?? null;
						setPosterFile(file);
						// Reset so the same file can be re-selected after clearing
						e.target.value = '';
					}}
				/>
				<Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
					Uploaded separately via multipart after the emission is saved.
				</Typography>
			</FormControl>
		</>
	);

	const dialogContent = (
		<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
			{formContent}
		</DialogContent>
	);

	// ─── Render ─────────────────────────────────────────────────────────────────

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
					<Button onClick={() => setAddOpen(false)} variant="outlined" disabled={isPending}>
						Cancel
					</Button>
					<Button
						onClick={handleAdd}
						variant="contained"
						color="secondary"
						disabled={!canSubmit || isPending}
						startIcon={isPending ? <CircularProgress size={14} /> : undefined}
					>
						{isCreating ? 'Creating…' : isPosterUploading ? 'Uploading poster…' : 'Create'}
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
					<Button onClick={() => setEditOpen(false)} variant="outlined" disabled={isPending}>
						Cancel
					</Button>
					<Button
						onClick={handleEdit}
						variant="contained"
						color="secondary"
						disabled={!canSubmit || isPending}
						startIcon={isPending ? <CircularProgress size={14} /> : undefined}
					>
						{isUpdating ? 'Saving…' : isPosterUploading ? 'Uploading poster…' : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}