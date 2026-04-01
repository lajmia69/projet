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
	useRadioAdminEpisodes,
	useCreateEpisode,
	useUpdateEpisode,
	useDeleteEpisode,
	useValidateEpisode,
	usePublishEpisode,
	useRadioAdminEmissions,
	useRadioAdminSeasons,
	useRadioAdminLanguages,
} from '@/app/(control-panel)/administration/radio/api/hooks/useRadioAdmin';
import { Episode, CreateEpisodePayload } from '@/app/(control-panel)/administration/radio/api/types';

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' }
}));

type EpisodeForm = {
	name: string;
	description: string;
	language_id: string;
	emission_id: string;
	season_id: string;
};

const empty: EpisodeForm = { name: '', description: '', language_id: '', emission_id: '', season_id: '' };

export default function AdminEpisodesView() {
	const { data: account } = useUser();
	const token = account?.token;

	const { data: episodesData, isLoading } = useRadioAdminEpisodes(token);
	const { data: emissionsData } = useRadioAdminEmissions(token);
	const { data: seasonsData } = useRadioAdminSeasons(token);
	const { data: languagesData, isLoading: isLanguagesLoading, isError: isLanguagesError } = useRadioAdminLanguages(token);
	const { mutate: create, isPending: isCreating } = useCreateEpisode(token);
	const { mutate: update, isPending: isUpdating } = useUpdateEpisode(token);
	const { mutate: remove } = useDeleteEpisode(token);
	const { mutate: validate } = useValidateEpisode(token);
	const { mutate: publish } = usePublishEpisode(token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [form, setForm] = useState<EpisodeForm>(empty);

	const setField = (f: keyof EpisodeForm, v: string) => setForm((p) => ({ ...p, [f]: v }));
	const canSubmit = !!form.name.trim() && !!form.language_id;

	const openAdd = () => { setForm(empty); setAddOpen(true); };
	const openEdit = (row: Episode) => {
		setForm({
			name: row.name,
			description: row.description ?? '',
			language_id: String(row.language?.id ?? ''),
			emission_id: String(row.emission?.id ?? ''),
			season_id: String(row.season?.id ?? ''),
		});
		setEditingId(row.id);
		setEditOpen(true);
	};

	const buildPayload = (): CreateEpisodePayload => ({
		name: form.name.trim(),
		description: form.description.trim(),
		language_id: Number(form.language_id),
		emission_id: form.emission_id ? Number(form.emission_id) : undefined,
		season_id: form.season_id ? Number(form.season_id) : undefined,
	});

	const handleAdd = () => create(buildPayload(), {
		onSuccess: () => setAddOpen(false),
		onError: (err) => console.error('Create episode failed:', err),
	});
	const handleEdit = () => update({ id: editingId!, ...buildPayload() }, {
		onSuccess: () => setEditOpen(false),
		onError: (err) => console.error('Update episode failed:', err),
	});

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
		{ accessorKey: 'name', header: 'Name', Cell: ({ cell }) => <span className="font-medium">{cell.getValue<string>()}</span> },
		{
			id: 'emission',
			header: 'Emission',
			accessorFn: (row) => row.emission?.name ?? '',
			Cell: ({ row }) => (
				<span className="text-sm truncate max-w-[160px] block">{row.original.emission?.name ?? '—'}</span>
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
				<FormLabel required>Episode Name</FormLabel>
				<TextField size="small" value={form.name} onChange={(e) => setField('name', e.target.value)} />
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
					<FormLabel>Emission</FormLabel>
					<Select size="small" value={form.emission_id} onChange={(e) => setField('emission_id', e.target.value)} displayEmpty>
						<MenuItem value=""><em>None</em></MenuItem>
						{emissionsData?.items.map((e) => <MenuItem key={e.id} value={String(e.id)}>{e.name}</MenuItem>)}
					</Select>
				</FormControl>
				<FormControl fullWidth>
					<FormLabel>Season</FormLabel>
					<Select size="small" value={form.season_id} onChange={(e) => setField('season_id', e.target.value)} displayEmpty>
						<MenuItem value=""><em>None</em></MenuItem>
						{seasonsData?.items.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>)}
					</Select>
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
								<Typography className="text-4xl leading-none font-extrabold tracking-tight">Episodes</Typography>
							</motion.span>
							<div className="flex flex-1 items-center justify-end gap-2">
								<Button variant="contained" color="secondary" onClick={openAdd} startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}>
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
				<DialogTitle sx={{ fontWeight: 700 }}>Add Episode</DialogTitle>
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
				<DialogTitle sx={{ fontWeight: 700 }}>Edit Episode</DialogTitle>
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