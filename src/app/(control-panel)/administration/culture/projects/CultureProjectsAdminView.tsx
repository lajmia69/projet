'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import {
  Paper, Box, Typography, Chip, CircularProgress, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, FormLabel, Select, MenuItem,
  ListItemIcon,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import { format, parseISO, isValid } from 'date-fns';
import FusePageCarded from '@fuse/core/FusePageCarded';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';
import DataTable from 'src/components/data-table/DataTable';
import {
  useCulturalProjects,
  useCreateCulturalProject,
  useUpdateCulturalProject,
  useDeleteCulturalProject,
  useCulturalProjectTypes,
} from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import {
  CulturalProject,
  CreateCulturalProjectPayload,
  UpdateCulturalProjectPayload,
} from '@/app/(control-panel)/culture/api/types/projectsAndActivities';

// ─── Styled root ────────────────────────────────────────────────────────────
const Root = styled(FusePageCarded)(() => ({
  '& .container': { maxWidth: '100%!important' },
}));

// ─── Helpers ────────────────────────────────────────────────────────────────
function safeFmt(d?: string) {
  if (!d) return '—';
  const parsed = parseISO(d);
  return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : '—';
}

// ─── Types ──────────────────────────────────────────────────────────────────
type ProjectForm = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  typeId: string;
  languageId: string;
};

const emptyForm: ProjectForm = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  typeId: '',
  languageId: '1',
};

type FormErrors = Partial<Record<keyof ProjectForm, string>>;

// ─── Component ──────────────────────────────────────────────────────────────
export default function CultureProjectsAdminView() {
  // Data
  const { data: projects = [], isLoading } = useCulturalProjects();
  const { data: projectTypes = [] } = useCulturalProjectTypes();

  // Mutations
  const { mutate: createProject, isPending: isCreating } = useCreateCulturalProject() as any;
  const { mutate: updateProject, isPending: isUpdating } = useUpdateCulturalProject() as any;
  const { mutate: deleteProject, isPending: isDeleting } = useDeleteCulturalProject() as any;

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<CulturalProject | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const setField = (f: keyof ProjectForm, v: string) =>
    setForm((p) => ({ ...p, [f]: v }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.typeId) errors.typeId = 'Type is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Open helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(emptyForm);
    setFormErrors({});
    setAddOpen(true);
  };

  const openEdit = (row: CulturalProject) => {
    setEditingRow(row);
    setForm({
      name: row.name ?? '',
      description: row.description ?? '',
      startDate: row.start_date ? row.start_date.slice(0, 10) : '',
      endDate: row.end_date ? row.end_date.slice(0, 10) : '',
      typeId: String(row.cultural_project_type?.id ?? ''),
      languageId: String(row.language?.id ?? '1'),
    });
    setFormErrors({});
    setEditOpen(true);
  };

  // ── Submit handlers ──────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!validate()) return;
    const payload: CreateCulturalProjectPayload = {
      name: form.name.trim(),
      slug: form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() || '',
      start_date: form.startDate || new Date().toISOString().slice(0, 10),
      end_date: form.endDate || form.startDate || new Date().toISOString().slice(0, 10),
      publishing_date: new Date().toISOString(),
      language_id: Number(form.languageId) || 1,
      cultural_project_type_id: Number(form.typeId) || 1,
      tags: [],
    } as any;

    createProject(payload, {
      onSuccess: () => setAddOpen(false),
      onError: (err: any) => console.error('[CultureProjects] create failed', err),
    });
  };

  const handleEdit = () => {
    if (!validate() || !editingRow) return;
    const payload: UpdateCulturalProjectPayload = {
      id: editingRow.id,
      name: form.name.trim(),
      slug: editingRow.slug ?? form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() || '',
      start_date: form.startDate || (editingRow.start_date ?? ''),
      end_date: form.endDate || (editingRow.end_date ?? ''),
      language_id: Number(form.languageId) || (editingRow.language?.id ?? 1),
      cultural_project_type_id: Number(form.typeId) || (editingRow.cultural_project_type?.id ?? 1),
      tags: editingRow.tags ?? [],
    } as any;

    updateProject(payload, {
      onSuccess: () => setEditOpen(false),
      onError: (err: any) => console.error('[CultureProjects] update failed', err),
    });
  };

  const handleDeleteConfirmed = () => {
    if (deleteTarget === null) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    deleteProject(id);
  };

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = useMemo<MRT_ColumnDef<CulturalProject>[]>(() => [
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
      id: 'type',
      header: 'Type',
      accessorFn: (r) => r.cultural_project_type?.name ?? '',
      Cell: ({ row }) =>
        row.original.cultural_project_type?.name ? (
          <Chip
            label={row.original.cultural_project_type.name}
            size="small"
            sx={{ fontSize: '0.72rem', height: 22 }}
          />
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      id: 'language',
      header: 'Language',
      accessorFn: (r) => r.language?.name ?? '—',
    },
    {
      id: 'start_date',
      header: 'Start Date',
      accessorFn: (r) => r.start_date ?? '',
      Cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {safeFmt(row.original.start_date)}
        </Typography>
      ),
    },
    {
      id: 'end_date',
      header: 'End Date',
      accessorFn: (r) => r.end_date ?? '',
      Cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {safeFmt(row.original.end_date)}
        </Typography>
      ),
    },
  ], []);

  // ── Shared form UI ───────────────────────────────────────────────────────
  const formContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <FormControl fullWidth>
        <FormLabel required>Name</FormLabel>
        <TextField
          size="small"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          error={!!form && !!formErrors.name}
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
          onChange={(e) => setField('description', e.target.value)}
        />
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl fullWidth>
          <FormLabel>Start Date</FormLabel>
          <TextField
            size="small"
            type="date"
            value={form.startDate}
            onChange={(e) => setField('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </FormControl>
        <FormControl fullWidth>
          <FormLabel>End Date</FormLabel>
          <TextField
            size="small"
            type="date"
            value={form.endDate}
            onChange={(e) => setField('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </FormControl>
      </Box>

      <FormControl fullWidth error={!!formErrors.typeId}>
        <FormLabel required>Type</FormLabel>
        <Select
          size="small"
          value={form.typeId}
          onChange={(e) => setField('typeId', e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled><em>Select a type…</em></MenuItem>
          {(projectTypes as any[]).map((t) => (
            <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
          ))}
        </Select>
        {formErrors.typeId && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{formErrors.typeId}</Typography>
        )}
      </FormControl>
    </Box>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <Root
        header={
          <div className="flex flex-auto flex-col py-4 px-4">
            <PageBreadcrumb className="mb-2" />
            <div className="flex items-center gap-2">
              <motion.span initial={{ x: -20 }} animate={{ x: 0, transition: { delay: 0.2 } }}>
                <Typography className="text-4xl leading-none font-extrabold tracking-tight">
                  Cultural Projects
                </Typography>
              </motion.span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <GradientButton onClick={openAdd} startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}>
                  Add Project
                </GradientButton>
              </div>
            </div>
          </div>
        }
        content={
          isLoading ? (
            <FuseLoading />
          ) : (
            <Paper className="flex h-full w-full flex-col overflow-hidden rounded-b-none" elevation={2}>
              <DataTable
                data={projects ?? []}
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
                  <MenuItem key="del" onClick={() => { setDeleteTarget(row.original.id); closeMenu(); }}>
                    <ListItemIcon><FuseSvgIcon>lucide:trash</FuseSvgIcon></ListItemIcon>Delete
                  </MenuItem>,
                ]}
              />
            </Paper>
          )
        }
      />

      {/* ── Add Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Cultural Project</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined" disabled={isCreating}>Cancel</Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            color="secondary"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={14} /> : undefined}
          >
            {isCreating ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Dialog ────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Cultural Project</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined" disabled={isUpdating}>Cancel</Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            color="secondary"
            disabled={isUpdating}
            startIcon={isUpdating ? <CircularProgress size={14} /> : undefined}
          >
            {isUpdating ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Project?</DialogTitle>
        <DialogContent>
          <Typography>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" disabled={isDeleting}>Cancel</Button>
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