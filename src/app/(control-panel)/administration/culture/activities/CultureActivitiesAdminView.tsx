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
import DataTable from '@/components/data-table/DataTable';
import {
  useCulturalActivities,
  useCreateCulturalActivity,
  useUpdateCulturalActivity,
  useDeleteCulturalActivity,
  useCulturalActivityTypes,
} from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import {
  CulturalActivity,
  CreateCulturalActivityPayload,
  UpdateCulturalActivityPayload,
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
type ActivityForm = {
  name: string;
  description: string;
  date: string;
  typeId: string;
  languageId: string;
};

const emptyForm: ActivityForm = {
  name: '',
  description: '',
  date: '',
  typeId: '',
  languageId: '1',
};

type FormErrors = Partial<Record<keyof ActivityForm, string>>;

// ─── Component ──────────────────────────────────────────────────────────────
export default function CultureActivitiesAdminView() {
  // Data
  const { data: activities = [], isLoading } = useCulturalActivities();
  const { data: types = [] } = useCulturalActivityTypes();

  // Mutations
  const { mutate: createActivity, isPending: isCreating } = useCreateCulturalActivity() as any;
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateCulturalActivity() as any;
  const { mutate: deleteActivity, isPending: isDeleting } = useDeleteCulturalActivity() as any;

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<CulturalActivity | null>(null);
  const [form, setForm] = useState<ActivityForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const setField = (f: keyof ActivityForm, v: string) =>
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

  const openEdit = (row: CulturalActivity) => {
    setEditingRow(row);
    setForm({
      name: row.name ?? '',
      description: row.description ?? '',
      date: row.date ? row.date.slice(0, 10) : '',
      typeId: String(row.cultural_activity_type?.id ?? ''),
      languageId: String(row.language?.id ?? '1'),
    });
    setFormErrors({});
    setEditOpen(true);
  };

  // ── Submit handlers ──────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!validate()) return;
    const payload: CreateCulturalActivityPayload = {
      name: form.name.trim(),
      slug: form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() || ' ',
      poster_description: form.name.trim(),
      date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
      language_id: Number(form.languageId) || 1,
      cultural_activity_type_id: Number(form.typeId) || 1,
      tags: [],
    } as CreateCulturalActivityPayload;

    createActivity(payload, {
      onSuccess: () => setAddOpen(false),
      onError: (err: any) => console.error('[CultureActivities] create failed', err),
    });
  };

  const handleEdit = () => {
    if (!validate() || !editingRow) return;
    const payload: UpdateCulturalActivityPayload = {
      id: editingRow.id,
      name: form.name.trim(),
      slug: editingRow.slug ?? form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() || ' ',
      date: form.date ? new Date(form.date).toISOString() : editingRow.date,
      language_id: Number(form.languageId) || (editingRow.language?.id ?? 1),
      cultural_activity_type_id: Number(form.typeId) || (editingRow.cultural_activity_type?.id ?? 1),
      poster_description: editingRow.poster_description ?? form.name.trim(),
      tags: editingRow.tags ?? [],
    } as any;

    updateActivity(payload, {
      onSuccess: () => setEditOpen(false),
      onError: (err: any) => console.error('[CultureActivities] update failed', err),
    });
  };

  const handleDeleteConfirmed = () => {
    if (deleteTarget === null) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    deleteActivity(id);
  };

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = useMemo<MRT_ColumnDef<CulturalActivity>[]>(() => [
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
      accessorFn: (r) => r.cultural_activity_type?.name ?? '',
      Cell: ({ row }) =>
        row.original.cultural_activity_type?.name ? (
          <Chip
            label={row.original.cultural_activity_type.name}
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
      id: 'date',
      header: 'Date',
      accessorFn: (r) => r.date ?? '',
      Cell: ({ row }) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {safeFmt(row.original.date)}
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
          onChange={(e) => setField('description', e.target.value)}
        />
      </FormControl>

      <FormControl fullWidth error={!!formErrors.typeId}>
        <FormLabel required>Type</FormLabel>
        <Select
          size="small"
          value={form.typeId}
          onChange={(e) => setField('typeId', e.target.value)}
          displayEmpty
        >
          <MenuItem value="" disabled><em>Select a type…</em></MenuItem>
          {(types as any[]).map((t) => (
            <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
          ))}
        </Select>
        {formErrors.typeId && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>{formErrors.typeId}</Typography>
        )}
      </FormControl>

      <FormControl fullWidth>
        <FormLabel>Date</FormLabel>
        <TextField
          size="small"
          type="date"
          value={form.date}
          onChange={(e) => setField('date', e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
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
                  Cultural Activities
                </Typography>
              </motion.span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <GradientButton onClick={openAdd} startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}>
                  Add Activity
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
                data={activities ?? []}
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
        <DialogTitle sx={{ fontWeight: 700 }}>Add Cultural Activity</DialogTitle>
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
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Cultural Activity</DialogTitle>
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
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Activity?</DialogTitle>
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