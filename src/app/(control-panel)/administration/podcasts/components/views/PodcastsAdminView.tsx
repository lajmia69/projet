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
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { styled } from '@mui/material/styles';
import useUser from '@auth/useUser';
import DataTable from 'src/components/data-table/DataTable';
import { useQuery } from '@tanstack/react-query';

import { useSearchPodcasts } from '@/app/(control-panel)/content/podcast/api/hooks/Usesearchpodcasts';
import {
	useCreatePodcast,
	useUpdatePodcast,
	useDeletePodcast,
	useValidatePodcast,
	usePublishPodcast,
} from '@/app/(control-panel)/content/podcast/api/hooks/Podcastmutations';
import { usePodcastCategories } from '@/app/(control-panel)/content/podcast/api/hooks/categories/Podcastcategoryhooks';
import { podcastApi } from '@/app/(control-panel)/content/podcast/api/services/podcastApiService';
import type {
	Podcast,
	CreatePodcastPayload,
	UpdatePodcastPayload,
	LanguageList,
} from '@/app/(control-panel)/content/podcast/api/types';

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' },
}));

function usePodcastLanguages(accountId: string, token: string) {
	return useQuery<LanguageList>({
		queryKey: ['podcast', 'languages', accountId],
		queryFn: () => podcastApi.getLanguages(accountId, token),
		enabled: !!accountId && !!token,
	});
}

function toSlug(name: string): string {
	return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

type PodcastForm = {
	name: string;
	description: string;
	language_id: string;
	podcast_category_id: string;
};

const empty: PodcastForm = { name: '', description: '', language_id: '', podcast_category_id: '' };
type FormErrors = Partial<Record<keyof PodcastForm, string>>;

export default function PodcastsAdminView() {
	const { data: account } = useUser();
	const id = account?.id ?? '';
	const token = account?.token?.access ?? '';

	const { data: podcastsData, isLoading } = useSearchPodcasts(id, token, { limit: 200, offset: 0 });
	const { data: categories } = usePodcastCategories(id, token);
	const { data: languages } = usePodcastLanguages(id, token);

	const { mutate: createPodcast, isPending: isCreating } = useCreatePodcast(id, token);
	const { mutate: updatePodcast, isPending: isUpdating } = useUpdatePodcast(id, token);
	const { mutate: deletePodcast, isPending: isDeleting } = useDeletePodcast(id, token);
	const { mutate: validate } = useValidatePodcast(id, token);
	const { mutate: publish } = usePublishPodcast(id, token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
	const [form, setForm] = useState<PodcastForm>(empty);
	const [formErrors, setFormErrors] = useState<FormErrors>({});

	const setField = (f: keyof PodcastForm, v: string) => setForm(p => ({ ...p, [f]: v }));

	const validateForm = (): boolean => {
		const errors: FormErrors = {};
		if (!form.name.trim()) errors.name = 'Name is required';
		if (!form.language_id) errors.language_id = 'Language is required';
		if (!form.podcast_category_id) errors.podcast_category_id = 'Category is required';
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const openAdd = () => { setForm(empty); setFormErrors({}); setAddOpen(true); };

	const openEdit = (row: Podcast) => {
		setForm({
			name: row.name ?? '',
			description: row.description ?? '',
			language_id: row.language?.id ? String(row.language.id) : '',
			podcast_category_id: row.podcast_category?.id ? String(row.podcast_category.id) : '',
		});
		setFormErrors({});
		setEditingPodcast(row);
		setEditOpen(true);
	};

	const handleAdd = () => {
		if (!validateForm()) return;

		const payload: CreatePodcastPayload = {
			name: form.name.trim(),
			slug: toSlug(form.name),
			description: form.description.trim() || ' ',
			transcription: {},
			language_id: Number(form.language_id),
			podcast_category_id: Number(form.podcast_category_id),
			tags: [],
		};

		createPodcast(payload, {
			onSuccess: () => setAddOpen(false),
			onError: (err) => console.error('[handleAdd] failed:', err),
		});
	};

	const handleEdit = () => {
		if (!validateForm() || !editingPodcast) return;

		const payload: UpdatePodcastPayload = {
			id: editingPodcast.id,
			name: form.name.trim(),
			slug: editingPodcast.slug,
			description: form.description.trim() || ' ',
			transcription: editingPodcast.transcription ?? {},
			language_id: Number(form.language_id),
			podcast_category_id: Number(form.podcast_category_id),
			add_tags: [],
			remove_tags: [],
		};

		updatePodcast(payload, {
			onSuccess: () => setEditOpen(false),
			onError: (err) => console.error('[handleEdit] failed:', err),
		});
	};

	const handleDeleteConfirmed = () => {
		if (deleteTarget === null) return;
		deletePodcast(deleteTarget);
		setDeleteTarget(null);
	};

	const columns = useMemo<MRT_ColumnDef<Podcast>[]>(() => [
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
			id: 'category',
			header: 'Category',
			accessorFn: row => row.podcast_category?.name ?? '',
			Cell: ({ row }) => row.original.podcast_category?.name
				? <Chip label={row.original.podcast_category.name} size="small" sx={{ fontSize: '0.72rem', height: 22 }} />
				: <span className="text-gray-400">—</span>,
		},
		{
			id: 'language',
			header: 'Language',
			accessorFn: row => row.language?.name ?? '',
		},
		{
			id: 'tags',
			header: 'Tags',
			accessorFn: row => row.tags?.map(t => t.name).join(', ') ?? '',
			Cell: ({ row }) => (
				<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
					{row.original.tags?.slice(0, 3).map(t => (
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
			accessorFn: row => row.is_published,
			Cell: ({ row }) => {
				const { is_published, is_approved_content, is_pubic_content } = row.original;
				const label = is_published ? 'Published' : is_approved_content ? 'Approved' : is_pubic_content ? 'Public' : 'Draft';
				const bg    = is_published ? '#dcfce7'   : is_approved_content ? '#dbeafe'   : is_pubic_content ? '#fef9c3'  : '#f1f5f9';
				const color = is_published ? '#15803d'   : is_approved_content ? '#1d4ed8'   : is_pubic_content ? '#854d0e'  : '#475569';
				return <Chip label={label} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, backgroundColor: bg, color }} />;
			},
		},
		{
			id: 'created_by',
			header: 'Created By',
			accessorFn: row => row.created_by?.full_name ?? '',
		},
	], []);

	const formContent = (
		<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
			<FormControl fullWidth>
				<FormLabel required>Name</FormLabel>
				<TextField size="small" value={form.name} onChange={e => setField('name', e.target.value)}
					error={!!formErrors.name} helperText={formErrors.name} autoFocus />
			</FormControl>
			<FormControl fullWidth>
				<FormLabel>Description</FormLabel>
				<TextField size="small" multiline minRows={3} value={form.description}
					onChange={e => setField('description', e.target.value)} />
			</FormControl>
			<Box sx={{ display: 'flex', gap: 2 }}>
				<FormControl fullWidth error={!!formErrors.language_id}>
					<FormLabel required>Language</FormLabel>
					<Select size="small" value={form.language_id} onChange={e => setField('language_id', e.target.value as string)} displayEmpty>
						<MenuItem value="" disabled><em>Select a language…</em></MenuItem>
						{languages?.items.map(l => <MenuItem key={l.id} value={String(l.id)}>{l.name}</MenuItem>)}
					</Select>
					{formErrors.language_id && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{formErrors.language_id}</Typography>}
				</FormControl>
				<FormControl fullWidth error={!!formErrors.podcast_category_id}>
					<FormLabel required>Category</FormLabel>
					<Select size="small" value={form.podcast_category_id} onChange={e => setField('podcast_category_id', e.target.value as string)} displayEmpty>
						<MenuItem value="" disabled><em>Select a category…</em></MenuItem>
						{categories?.items.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
					</Select>
					{formErrors.podcast_category_id && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{formErrors.podcast_category_id}</Typography>}
				</FormControl>
			</Box>
		</Box>
	);

	return (
		<>
			<Root
				header={
					<div className="flex flex-auto flex-col py-4 px-4">
						<PageBreadcrumb className="mb-2" />
						<div className="flex items-center gap-2">
							<motion.span initial={{ x: -20 }} animate={{ x: 0, transition: { delay: 0.2 } }}>
								<Typography className="text-4xl leading-none font-extrabold tracking-tight">Podcasts</Typography>
							</motion.span>
							<div className="flex flex-1 items-center justify-end gap-2">
								<Button
									variant="outlined"
									color="secondary"
									component={NavLinkAdapter}
									to="/administration/podcasts/categories"
									startIcon={<FuseSvgIcon>lucide:folder</FuseSvgIcon>}
								>
									Categories
								</Button>
								<Button variant="contained" color="secondary" onClick={openAdd} startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}>
									Add Podcast
								</Button>
							</div>
						</div>
					</div>
				}
				content={
					isLoading ? <FuseLoading /> : (
						<Paper className="flex h-full w-full flex-col overflow-hidden rounded-b-none" elevation={2}>
							<DataTable
								data={podcastsData?.items ?? []}
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
									<MenuItem key="del" onClick={() => { setDeleteTarget(row.original.id); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:trash</FuseSvgIcon></ListItemIcon>Delete
									</MenuItem>,
								]}
							/>
						</Paper>
					)
				}
			/>

			{/* Add */}
			<Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Add Podcast</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setAddOpen(false)} variant="outlined" disabled={isCreating}>Cancel</Button>
					<Button onClick={handleAdd} variant="contained" color="secondary" disabled={isCreating}
						startIcon={isCreating ? <CircularProgress size={14} /> : undefined}>
						{isCreating ? 'Creating…' : 'Create'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Edit */}
			<Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Edit Podcast</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setEditOpen(false)} variant="outlined" disabled={isUpdating}>Cancel</Button>
					<Button onClick={handleEdit} variant="contained" color="secondary" disabled={isUpdating}
						startIcon={isUpdating ? <CircularProgress size={14} /> : undefined}>
						{isUpdating ? 'Saving…' : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete confirm */}
			<Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Delete Podcast?</DialogTitle>
				<DialogContent>
					<Typography>This action cannot be undone.</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={() => setDeleteTarget(null)} variant="outlined" disabled={isDeleting}>Cancel</Button>
					<Button onClick={handleDeleteConfirmed} variant="contained" color="error" disabled={isDeleting}
						startIcon={isDeleting ? <CircularProgress size={14} /> : undefined}>
						{isDeleting ? 'Deleting…' : 'Delete'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}