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
import DataTable from 'src/components/data-table/DataTable';

import { useSearchLessons } from '@/app/(control-panel)/content/(lesson)/api/hooks/lessons/useSearchLessons';
import {
	useCreateLesson,
	useUpdateLesson,
	useDeleteLesson,
	useValidateLesson,
	usePublicLesson,
	usePublishLesson,
} from '@/app/(control-panel)/content/(lesson)/api/hooks/lessons/Lessonmutations';
import { useLanguages } from '@/app/(control-panel)/content/(lesson)/api/hooks/languages/useLanguages';
import { useLessonTypes, useModules } from '@/app/(control-panel)/content/(lesson)/api/hooks/lessons/Lessonmetahooks';
import { Lesson, LessonCreatePayload, LessonUpdatePayload } from '@/app/(control-panel)/content/(lesson)/api/types';

const Root = styled(FusePageCarded)(() => ({
	'& .container': { maxWidth: '100%!important' },
}));

function safeFmt(d?: string) {
	if (!d) return '—';
	const parsed = parseISO(d);
	return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : '—';
}

type LessonForm = {
	name: string;
	description: string;
	language: string;
	lesson_type: string;
	module: string;
};

const empty: LessonForm = { name: '', description: '', language: '', lesson_type: '', module: '' };
type FormErrors = Partial<Record<keyof LessonForm, string>>;

export default function LessonsAdminView() {
	const { data: account } = useUser();
	const id = account?.id;
	const token = account?.token?.access;

	const { data: lessonsData, isLoading } = useSearchLessons(id, token, { limit: 200, offset: 0 });
	const { data: languages } = useLanguages(id, token);
	const { data: lessonTypes } = useLessonTypes(id, token);
	const { data: modules } = useModules(id, token);

	const { mutate: createLesson, isPending: isCreating } = useCreateLesson(id, token);
	const { mutate: updateLesson, isPending: isUpdating } = useUpdateLesson(id, token);
	const { mutate: deleteLesson, isPending: isDeleting } = useDeleteLesson(id, token);
	// ✅ Added: validate (approve), public, and publish mutations
	const { mutate: validateLesson } = useValidateLesson(id, token);
	const { mutate: publicLesson } = usePublicLesson(id, token);
	const { mutate: publishLesson } = usePublishLesson(id, token);

	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
	const [form, setForm] = useState<LessonForm>(empty);
	const [formErrors, setFormErrors] = useState<FormErrors>({});

	const setField = (f: keyof LessonForm, v: string) => setForm(p => ({ ...p, [f]: v }));

	const validate = (): boolean => {
		const errors: FormErrors = {};
		if (!form.name.trim()) errors.name = 'Name is required';
		if (!form.language) errors.language = 'Language is required';
		if (!form.lesson_type) errors.lesson_type = 'Lesson type is required';
		if (!form.module) errors.module = 'Module is required';
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const openAdd = () => { setForm(empty); setFormErrors({}); setAddOpen(true); };

	const openEdit = (row: Lesson) => {
		setForm({
			name: row.name ?? '',
			description: row.description ?? '',
			language: row.language?.id ? String(row.language.id) : '',
			lesson_type: row.lesson_type?.id ? String(row.lesson_type.id) : '',
			module: row.module?.id ? String(row.module.id) : '',
		});
		setFormErrors({});
		setEditingLesson(row);
		setEditOpen(true);
	};

	const handleAdd = () => {
		if (!validate()) return;
		const payload: LessonCreatePayload = {
			name: form.name.trim(),
			// ✅ Fixed: empty description sent as ' ' — API requires non-empty string
			description: form.description.trim() || ' ',
			language_id: Number(form.language),
			lesson_type_id: Number(form.lesson_type),
			module_id: Number(form.module),
			transcription: {},
			tags: [],
		};
		createLesson(payload, { onSuccess: () => setAddOpen(false) });
	};

	const handleEdit = () => {
		if (!validate() || !editingLesson) return;
		const payload: LessonUpdatePayload = {
			id: editingLesson.id,
			name: form.name.trim(),
			// ✅ Fixed: empty description was causing update to fail (API requires non-empty string)
			description: form.description.trim() || ' ',
			language_id: Number(form.language),
			lesson_type_id: Number(form.lesson_type),
			module_id: Number(form.module),
			transcription: editingLesson.transcription ?? {},
			add_tags: [],
			remove_tags: [],
		};
		updateLesson(payload, { onSuccess: () => setEditOpen(false) });
	};

	const handleDeleteConfirmed = () => {
		if (deleteTarget === null) return;
		const lessonId = deleteTarget;
		setDeleteTarget(null);
		deleteLesson(lessonId);
	};

	const columns = useMemo<MRT_ColumnDef<Lesson>[]>(() => [
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
			id: 'module',
			header: 'Module',
			accessorFn: row => row.module?.name ?? '',
			Cell: ({ row }) => (
				<Box sx={{ display: 'flex', flexDirection: 'column' }}>
					<Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{row.original.module?.name ?? '—'}</Typography>
					{row.original.module?.subject?.name && (
						<Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{row.original.module.subject.name}</Typography>
					)}
				</Box>
			),
		},
		{
			id: 'language',
			header: 'Language',
			accessorFn: row => row.language?.name ?? '',
		},
		{
			id: 'lesson_type',
			header: 'Type',
			accessorFn: row => row.lesson_type?.name ?? '',
			Cell: ({ row }) => row.original.lesson_type?.name
				? <Chip label={row.original.lesson_type.name} size="small" sx={{ fontSize: '0.72rem', height: 22 }} />
				: <span className="text-gray-400">—</span>,
		},
		{
			id: 'status',
			header: 'Status',
			accessorFn: row => row.is_published,
			Cell: ({ row }) => {
				const { is_published, is_approved_content, is_pubic_content } = row.original;
				const label = is_published ? 'Published' : is_approved_content ? 'Approved' : is_pubic_content ? 'Public' : 'Draft';
				const bg = is_published ? '#dcfce7' : is_approved_content ? '#dbeafe' : is_pubic_content ? '#fef9c3' : '#f1f5f9';
				const color = is_published ? '#15803d' : is_approved_content ? '#1d4ed8' : is_pubic_content ? '#854d0e' : '#475569';
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
				<TextField
					size="small"
					value={form.name}
					onChange={e => setField('name', e.target.value)}
					error={!!formErrors.name}
					helperText={formErrors.name}
					autoFocus
				/>
			</FormControl>
			<FormControl fullWidth>
				<FormLabel>Description</FormLabel>
				<TextField
					size="small"
					multiline
					minRows={2}
					value={form.description}
					onChange={e => setField('description', e.target.value)}
				/>
			</FormControl>
			<FormControl fullWidth error={!!formErrors.language}>
				<FormLabel required>Language</FormLabel>
				<Select size="small" value={form.language} onChange={e => setField('language', e.target.value)} displayEmpty>
					<MenuItem value="" disabled><em>Select a language…</em></MenuItem>
					{languages?.items.map(l => <MenuItem key={l.id} value={String(l.id)}>{l.name}</MenuItem>)}
				</Select>
				{formErrors.language && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{formErrors.language}</Typography>}
			</FormControl>
			<Box sx={{ display: 'flex', gap: 2 }}>
				<FormControl fullWidth error={!!formErrors.lesson_type}>
					<FormLabel required>Lesson Type</FormLabel>
					<Select size="small" value={form.lesson_type} onChange={e => setField('lesson_type', e.target.value)} displayEmpty>
						<MenuItem value="" disabled><em>Select a type…</em></MenuItem>
						{lessonTypes?.items.map(t => <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>)}
					</Select>
					{formErrors.lesson_type && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{formErrors.lesson_type}</Typography>}
				</FormControl>
				<FormControl fullWidth error={!!formErrors.module}>
					<FormLabel required>Module</FormLabel>
					<Select size="small" value={form.module} onChange={e => setField('module', e.target.value)} displayEmpty>
						<MenuItem value="" disabled><em>Select a module…</em></MenuItem>
						{modules?.items.map(m => (
							<MenuItem key={m.id} value={String(m.id)}>
								{m.name}{m.subject?.name ? ` — ${m.subject.name}` : ''}
							</MenuItem>
						))}
					</Select>
					{formErrors.module && <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{formErrors.module}</Typography>}
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
								<Typography className="text-4xl leading-none font-extrabold tracking-tight">Lessons</Typography>
							</motion.span>
							<div className="flex flex-1 items-center justify-end gap-2">
								<Button variant="contained" color="secondary" onClick={openAdd} startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}>
									Add Lesson
								</Button>
							</div>
						</div>
					</div>
				}
				content={
					isLoading ? <FuseLoading /> : (
						<Paper className="flex h-full w-full flex-col overflow-hidden rounded-b-none" elevation={2}>
							<DataTable
								data={lessonsData?.items ?? []}
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
									// ✅ Added: Approve action → PATCH /lesson/validate/ {id, is_approved_content: true}
									<MenuItem key="approve" onClick={() => { validateLesson({ id: row.original.id, is_approved_content: true }); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:check-circle</FuseSvgIcon></ListItemIcon>Approve
									</MenuItem>,
									// ✅ Added: Make Public action → PATCH /lesson/public/ {id, is_pubic_content: true}
									<MenuItem key="public" onClick={() => { publicLesson({ id: row.original.id, is_pubic_content: true }); closeMenu(); }}>
										<ListItemIcon><FuseSvgIcon>lucide:globe</FuseSvgIcon></ListItemIcon>Make Public
									</MenuItem>,
									// ✅ Added: Publish action → PATCH /lesson/publish/ {id, is_published: true}
									<MenuItem key="publish" onClick={() => { publishLesson({ id: row.original.id, is_published: true }); closeMenu(); }}>
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
				<DialogTitle sx={{ fontWeight: 700 }}>Add Lesson</DialogTitle>
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
				<DialogTitle sx={{ fontWeight: 700 }}>Edit Lesson</DialogTitle>
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

			{/* Delete */}
			<Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
				<DialogTitle sx={{ fontWeight: 700 }}>Delete Lesson?</DialogTitle>
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