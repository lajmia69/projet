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
import useUser from '@auth/useUser';
import DataTable from 'src/components/data-table/DataTable';
import {
	useRadioAdminReportages,
	useCreateReportage,
	useUpdateReportage,
	useDeleteReportage,
	useValidateReportage,
	usePublishReportage,
	useRadioAdminReportageTypes,
	useRadioAdminLanguages,
	useRadioAdminEpisodes,
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { Reportage, CreateReportagePayload } from '@/app/(control-panel)/administration/radio/api/types';

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' }
}));

async function logHttpError(label: string, err: unknown) {
	if (err && typeof err === 'object' && 'response' in err) {
		const res = (err as { response: Response }).response;
		try {
			const body = await res.clone().json();
			console.error(`${label} — server validation errors:`, body);
		} catch {
			const text = await res.clone().text();
			console.error(`${label} — server said:`, text);
		}
	} else {
		console.error(label, err);
	}
}

function toDateOnly(value: string | undefined): string | undefined {
	if (!value) return undefined;
	return value.split('T')[0] || undefined;
}

type ReportageForm = {
	name: string;
	slug: string;
	description: string;
	language_id: string;
	reportage_type_id: string;
	episode_id: string;
	publishing_date: string;
	online_date: string;
};

const empty: ReportageForm = {
	name: '',
	slug: '',
	description: '',
	language_id: '',
	reportage_type_id: '',
	episode_id: '',
	publishing_date: '',
	online_date: '',
};

export default function AdminReportagesView() {
	const { data: account } = useUser();
	const token = account?.token;

	const { data: reportagesData, isLoading } = useRadioAdminReportages(token);
	const { data: reportageTypesData } = useRadioAdminReportageTypes(token);
	const { data: languagesData, isLoading: isLanguagesLoading, isError: isLanguagesError } = useRadioAdminLanguages(token);
	const { data: episodesData } = useRadioAdminEpisodes(token);
	const { mutate: create, isPending: isCreating } = useCreateReportage(token);
	const { mutate: update, isPending: isUpdating } = useUpdateReportage(token);
	const { mutate: remove } = useDeleteReportage(token);
	const { mutate: validate } = useValidateReportage(token);
	const { mutate: publish } = usePublishReportage(token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<ReportageForm>(empty);

	const setField = (f: keyof ReportageForm, v: string) => setForm((p) => ({ ...p, [f]: v }));
	const canSubmit = !!form.name.trim() && !!form.language_id;

	const openAdd = () => { setForm(empty); setAddOpen(true); };
	const openEdit = (row: Reportage) => {
		setForm({
			name: row.name,
			slug: row.slug ?? '',
			description: row.description ?? '',
			language_id: String(row.language?.id ?? ''),
			reportage_type_id: String(row.reportage_type?.id ?? ''),
			episode_id: String(row.episode?.id ?? ''),
			publishing_date: toDateOnly(row.publishing_date) ?? '',
			online_date: toDateOnly(row.online_date) ?? '',
		});
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = (): CreateReportagePayload => {
		const languageId = Number(form.language_id);
		const reportageTypeId = form.reportage_type_id ? Number(form.reportage_type_id) : undefined;
		const episodeId = form.episode_id ? Number(form.episode_id) : 0;

		const payload: CreateReportagePayload = {
			name: form.name.trim(),
			slug: form.slug.trim() || undefined,
			description: form.description.trim() || undefined,
			language_id: Number.isFinite(languageId) ? languageId : 0,
			reportage_type_id: reportageTypeId && Number.isFinite(reportageTypeId) ? reportageTypeId : undefined,
			// Backend requires episode_id; send 0 when none selected (matches the schema default)
			episode_id: Number.isFinite(episodeId) ? episodeId : 0,
			transcription: {},
			tags: [],
			publishing_date: toDateOnly(form.publishing_date),
			online_date: toDateOnly(form.online_date),
		};
		console.log('Reportage payload:', JSON.stringify(payload, null, 2));
		return payload;
	};

	const handleAdd = () => create(buildPayload(), {
		onSuccess: () => setAddOpen(false),
		onError: (err) => logHttpError('Create reportage failed', err),
	});

	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, {
		onSuccess: () => setEditOpen(false),
		onError: (err) => logHttpError('Update reportage failed', err),
	});

	const columns = useMemo<MRT_ColumnDef<Reportage>[]>(() => [
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
		{ accessorKey: 'name', header: 'Name', Cell: ({ cell }) => <span className="font-medium">{cell.getValue<string>()}</span> },
		{
			id: 'reportage_type',
			header: 'Type',
			accessorFn: (row) => row.reportage_type?.name ?? '',
			Cell: ({ row }) => row.original.reportage_type?.name ? (
				<Chip label={row.original.reportage_type.name} size="small" sx={{ fontSize: '0.72rem', height: 22 }} />
			) : <span className="text-gray-400">—</span>,
		},
		{
			id: 'language',
			header: 'Language',
			accessorFn: (row) => row.language?.name ?? '',
		},
		{
			id: 'episode',
			header: 'Episode',
			accessorFn: (row) => row.episode?.name ?? '',
			Cell: ({ row }) => (
				<span className="text-sm truncate max-w-[160px] block">{row.original.episode?.name ?? '—'}</span>
			),
		},
		{
			id: 'status',
			header: 'Status',
			accessorFn: (row) => row.is_published,
			Cell: ({ row }) => (
				<Chip
					label={row.original.is_published ? 'Published' : row.original.is_approved_content ? 'Approved' : 'Draft'}
					size="small"
					sx={{
						height: 22, fontSize: '0.72rem', fontWeight: 700,
						backgroundColor: row.original.is_published ? '#dcfce7' : row.original.is_approved_content ? '#dbeafe' : '#f1f5f9',
						color: row.original.is_published ? '#15803d' : row.original.is_approved_content ? '#1d4ed8' : '#475569',
					}}
				/>
			),
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
				<FormLabel required>Reportage Name</FormLabel>
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
				<TextField size="small" multiline minRows={2} value={form.description} onChange={(e) => setField('description', e.target.value)} />
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
					<Select size="small" value={form.language_id} onChange={(e) => setField('language_id', e.target.value)} displayEmpty>
						<MenuItem value="" disabled><em>Select a language…</em></MenuItem>
						{languagesData.items.map((l) => <MenuItem key={l.id} value={String(l.id)}>{l.name}</MenuItem>)}
					</Select>
				)}
			</FormControl>
			<div className="flex gap-3">
				<FormControl fullWidth>
					<FormLabel>Reportage Type</FormLabel>
					<Select size="small" value={form.reportage_type_id} onChange={(e) => setField('reportage_type_id', e.target.value)} displayEmpty>
						<MenuItem value=""><em>None</em></MenuItem>
						{reportageTypesData?.items.map((t) => <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>)}
					</Select>
				</FormControl>
				<FormControl fullWidth>
					<FormLabel>Episode</FormLabel>
					<Select size="small" value={form.episode_id} onChange={(e) => setField('episode_id', e.target.value)} displayEmpty>
						<MenuItem value=""><em>None</em></MenuItem>
						{episodesData?.items.map((e) => <MenuItem key={e.id} value={String(e.id)}>{e.name}</MenuItem>)}
					</Select>
				</FormControl>
			</div>
			<div className="flex gap-3">
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
			</div>
		</>
	);

	return (
		<>
			<Root
				header={
					<div className="flex flex-auto flex-col py-4 px-4">
						<PageBreadcrumb className="mb-2" />
						<div className="flex items-center gap-2">
							<motion.span initial={{ x: -20 }} animate={{ x: 0, transition: { delay: 0.2 } }}>
								<Typography className="text-4xl leading-none font-extrabold tracking-tight">Reportages</Typography>
							</motion.span>
							<div className="flex flex-1 items-center justify-end gap-2">
								<Button variant="contained" color="secondary" onClick={openAdd} startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}>
									Add Reportage
								</Button>
							</div>
						</div>
					</div>
				}
				content={
					isLoading ? <FuseLoading /> : (
						<Paper className="flex h-full w-full flex-col overflow-hidden rounded-b-none" elevation={2}>
							<DataTable
								data={reportagesData?.items ?? []}
								columns={columns}
								enableRowNumbers
								enableRowActions
								enablePagination
								paginationDisplayMode="pages"
								initialState={{ pagination: { pageSize: 15, pageIndex: 0 }, sorting: [{ id: 'id', desc: true }] }}
								muiPaginationProps={{ color: 'secondary', rowsPerPageOptions: [10, 15, 25], shape: 'rounded', variant: 'outlined' }}
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

			<Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Add Reportage</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>{formContent}</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setAddOpen(false)} variant="outlined" disabled={isCreating}>Cancel</Button>
					<Button onClick={handleAdd} variant="contained" color="secondary" disabled={!canSubmit || isCreating}
						startIcon={isCreating ? <CircularProgress size={14} /> : undefined}>
						{isCreating ? 'Creating…' : 'Create'}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Edit Reportage</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2.5 }}>{formContent}</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setEditOpen(false)} variant="outlined" disabled={isUpdating}>Cancel</Button>
					<Button onClick={handleEdit} variant="contained" color="secondary" disabled={!canSubmit || isUpdating}
						startIcon={isUpdating ? <CircularProgress size={14} /> : undefined}>
						{isUpdating ? 'Saving…' : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}