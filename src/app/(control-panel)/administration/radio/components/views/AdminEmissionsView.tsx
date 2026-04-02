'use client';

import { useMemo, useRef, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import {
	Paper, ListItemIcon, MenuItem, Dialog, DialogTitle, DialogContent,
	DialogActions, Button, Typography, FormControl, FormLabel,
	TextField, Select, Chip, CircularProgress, Divider, Box,
	IconButton, Tooltip, Switch, FormControlLabel,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
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
	useRadioAdminTags,
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { radioAdminApi } from '@/app/(control-panel)/administration/radio/api/services/radioAdminApiService';
import { Emission, CreateEmissionPayload } from '@/app/(control-panel)/administration/radio/api/types';

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' }
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeFormat(dateStr: string | undefined): string {
	if (!dateStr) return '—';
	const d = parseISO(dateStr);
	return isValid(d) ? format(d, 'MMM d, yyyy') : '—';
}

function toDateOnly(v: string | undefined): string | undefined {
	if (!v) return undefined;
	return v.split('T')[0] || undefined;
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

type EmissionForm = {
	name: string;
	slug: string;
	description: string;
	poster_description: string;
	language_id: string;
	emission_type_id: string;
	publishing_date: string;
	start_date: string;
	end_date: string;
	tags: string[];           // array of tag names
	is_pubic_content: boolean;
	is_published: boolean;
};

const empty: EmissionForm = {
	name: '',
	slug: '',
	description: '',
	poster_description: '',
	language_id: '',
	emission_type_id: '',
	publishing_date: '',
	start_date: '',
	end_date: '',
	tags: [],
	is_pubic_content: false,
	is_published: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminEmissionsView() {
	const { data: account } = useUser();
	const token = account?.token;
	const accountId = token?.id ? Number(token.id) : undefined;

	const { data: emissionsData, isLoading } = useRadioAdminEmissions(token);
	const { data: emissionTypesData } = useRadioAdminEmissionTypes(token);
	const { data: languagesData, isLoading: isLanguagesLoading, isError: isLanguagesError } = useRadioAdminLanguages(token);
	const { data: tagsData, isLoading: isTagsLoading } = useRadioAdminTags(token);

	const { mutate: create, isPending: isCreating } = useCreateEmission(token);
	const { mutate: update, isPending: isUpdating } = useUpdateEmission(token);
	const { mutate: remove } = useDeleteEmission(token);
	const { mutate: validate } = useValidateEmission(token);
	const { mutate: publish } = usePublishEmission(token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<EmissionForm>(empty);

	const [posterFile, setPosterFile] = useState<File | null>(null);
	const [isPosterUploading, setIsPosterUploading] = useState(false);
	const posterInputRef = useRef<HTMLInputElement>(null);

	// Helpers to update individual fields
	const setField = <K extends keyof EmissionForm>(f: K, v: EmissionForm[K]) =>
		setForm((p) => ({ ...p, [f]: v }));

	const canSubmit =
		!!form.name.trim() &&
		!!form.language_id &&
		!!form.emission_type_id &&
		!!form.publishing_date &&
		!!form.start_date &&
		!!accountId;

	const isPending = isCreating || isUpdating || isPosterUploading;

	// All tag names available from the backend
	const tagOptions: string[] = useMemo(
		() => tagsData?.items.map((t) => t.name) ?? [],
		[tagsData]
	);

	const openAdd = () => { setForm(empty); setPosterFile(null); setAddOpen(true); };

	const openEdit = (row: Emission) => {
		setForm({
			name: row.name,
			slug: row.slug ?? '',
			description: row.description ?? '',
			poster_description: row.poster_description ?? '',
			language_id: String(row.language?.id ?? ''),
			emission_type_id: String(row.emission_type?.id ?? ''),
			publishing_date: toDateOnly(row.publishing_date) ?? '',
			start_date: toDateOnly(row.start_date) ?? '',
			end_date: toDateOnly(row.end_date) ?? '',
			// Populate tags from the existing emission's tag names
			tags: row.tags?.map((t) => t.name) ?? [],
			is_pubic_content: row.is_pubic_content ?? false,
			is_published: row.is_published ?? false,
		});
		setPosterFile(null);
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = (): CreateEmissionPayload => {
		const payload: CreateEmissionPayload = {
			name: form.name.trim(),
			created_by_id: accountId!,
			language_id: Number(form.language_id),
			tags: form.tags,
			transcription: {},
		};

		if (form.slug.trim())               payload.slug               = form.slug.trim();
		if (form.description.trim())        payload.description        = form.description.trim();
		if (form.poster_description.trim()) payload.poster_description = form.poster_description.trim();
		if (form.emission_type_id)          payload.emission_type_id   = Number(form.emission_type_id);
		if (form.publishing_date)           payload.publishing_date    = form.publishing_date;
		if (form.start_date)                payload.start_date         = form.start_date;
		if (form.end_date)                  payload.end_date           = form.end_date;
		payload.is_pubic_content = form.is_pubic_content;
		payload.is_published     = form.is_published;

		return payload;
	};

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

	// ─── Table columns ────────────────────────────────────────────────────────

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
			id: 'tags',
			header: 'Tags',
			accessorFn: (row) => row.tags?.map((t) => t.name).join(', ') ?? '',
			Cell: ({ row }) => (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{row.original.tags?.slice(0, 3).map((t) => (
						<Chip key={t.id} label={t.name} size="small" sx={{ fontSize: '0.68rem', height: 20 }} />
					))}
					{(row.original.tags?.length ?? 0) > 3 && (
						<Chip label={`+${(row.original.tags?.length ?? 0) - 3}`} size="small" sx={{ fontSize: '0.68rem', height: 20 }} />
					)}
				</Box>
			),
		},
		{
			id: 'status',
			header: 'Status',
			accessorFn: (row) => row.is_published,
			Cell: ({ row }) => {
				const { is_published, is_approved_content, is_pubic_content } = row.original;
				const label = is_published ? 'Published' : is_approved_content ? 'Approved' : is_pubic_content ? 'Public' : 'Draft';
				const bg    = is_published ? '#dcfce7' : is_approved_content ? '#dbeafe' : is_pubic_content ? '#fef9c3' : '#f1f5f9';
				const color = is_published ? '#15803d' : is_approved_content ? '#1d4ed8' : is_pubic_content ? '#854d0e' : '#475569';
				return <Chip label={label} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, backgroundColor: bg, color }} />;
			},
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

	// ─── Shared form fields ───────────────────────────────────────────────────

	const formContent = (
		<>
			{/* ── Name ── */}
			<FormControl fullWidth>
				<FormLabel required>Name</FormLabel>
				<TextField
					size="small"
					value={form.name}
					onChange={(e) => setField('name', e.target.value)}
					placeholder="Emission name"
				/>
			</FormControl>

			{/* ── Slug ── */}
			<FormControl fullWidth>
				<FormLabel>Slug</FormLabel>
				<TextField
					size="small"
					value={form.slug}
					onChange={(e) => setField('slug', e.target.value)}
					placeholder="auto-generated if left blank"
				/>
			</FormControl>

			{/* ── Description ── */}
			<FormControl fullWidth>
				<FormLabel required>Description</FormLabel>
				<TextField
					size="small"
					multiline
					minRows={3}
					value={form.description}
					onChange={(e) => setField('description', e.target.value)}
					placeholder="Emission description"
				/>
			</FormControl>

			{/* ── Poster image ── */}
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
							<Tooltip title="Remove">
								<IconButton size="small" onClick={() => setPosterFile(null)}>
									<FuseSvgIcon size={14}>lucide:x</FuseSvgIcon>
								</IconButton>
							</Tooltip>
						</>
					)}
				</Box>
				<input
					ref={posterInputRef}
					type="file"
					accept="image/*"
					style={{ display: 'none' }}
					onChange={(e) => { setPosterFile(e.target.files?.[0] ?? null); e.target.value = ''; }}
				/>
				<Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
					Uploaded via multipart after saving.
				</Typography>
			</FormControl>

			{/* ── Poster description ── */}
			<FormControl fullWidth>
				<FormLabel required>Poster Description</FormLabel>
				<TextField
					size="small"
					multiline
					minRows={2}
					value={form.poster_description}
					onChange={(e) => setField('poster_description', e.target.value)}
					placeholder="Alt text / caption for the poster image"
				/>
			</FormControl>

			{/* ── Language ── */}
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

			{/* ── Emission Type ── */}
			<FormControl fullWidth>
				<FormLabel required>Emission Type</FormLabel>
				<Select
					size="small"
					value={form.emission_type_id}
					onChange={(e) => setField('emission_type_id', e.target.value)}
					displayEmpty
				>
					<MenuItem value="" disabled><em>Select a type…</em></MenuItem>
					{emissionTypesData?.items.map((t) => (
						<MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
					))}
				</Select>
			</FormControl>

			{/* ── Dates row ── */}
			<Box sx={{ display: 'flex', gap: 2 }}>
				<FormControl fullWidth>
					<FormLabel required>Start Date</FormLabel>
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
			</Box>

			{/* ── Publishing date ── */}
			<FormControl fullWidth>
				<FormLabel required>Publishing Date</FormLabel>
				<TextField
					size="small"
					type="date"
					value={form.publishing_date}
					onChange={(e) => setField('publishing_date', e.target.value)}
					InputLabelProps={{ shrink: true }}
				/>
			</FormControl>

			{/* ── Tags — fetched from backend, multi-select with freeSolo fallback ── */}
			<FormControl fullWidth>
				<FormLabel required>Tags</FormLabel>
				<Autocomplete
					multiple
					freeSolo
					options={tagOptions}
					value={form.tags}
					onChange={(_, newValue) => setField('tags', newValue as string[])}
					loading={isTagsLoading}
					renderTags={(value, getTagProps) =>
						value.map((option, index) => (
							<Chip
								{...getTagProps({ index })}
								key={option}
								label={option}
								size="small"
								sx={{ fontSize: '0.75rem' }}
							/>
						))
					}
					renderInput={(params) => (
						<TextField
							{...params}
							size="small"
							placeholder={form.tags.length === 0 ? 'Select or type tags…' : ''}
							InputProps={{
								...params.InputProps,
								endAdornment: (
									<>
										{isTagsLoading ? <CircularProgress size={16} /> : null}
										{params.InputProps.endAdornment}
									</>
								),
							}}
						/>
					)}
				/>
				<Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
					Choose from existing tags or type a new one and press Enter.
				</Typography>
			</FormControl>

			{/* ── Toggles ── */}
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 0.5 }}>
				<FormControlLabel
					control={
						<Switch
							checked={form.is_pubic_content}
							onChange={(e) => setField('is_pubic_content', e.target.checked)}
							color="primary"
						/>
					}
					label="Is Public Content"
				/>
				<FormControlLabel
					control={
						<Switch
							checked={form.is_published}
							onChange={(e) => setField('is_published', e.target.checked)}
							color="primary"
						/>
					}
					label="Is Published"
				/>
			</Box>

			{/* ── Created by (read-only) ── */}
			<FormControl fullWidth>
				<FormLabel>Created By</FormLabel>
				<TextField
					size="small"
					value={`Account #${accountId}`}
					disabled
					helperText="Automatically set to your account"
				/>
			</FormControl>
		</>
	);

	const dialogContent = (
		<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
			{formContent}
		</DialogContent>
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
					<Button onClick={() => setAddOpen(false)} variant="outlined" disabled={isPending}>Cancel</Button>
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
					<Button onClick={() => setEditOpen(false)} variant="outlined" disabled={isPending}>Cancel</Button>
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