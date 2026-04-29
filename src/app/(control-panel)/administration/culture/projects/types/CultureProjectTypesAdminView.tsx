'use client';

import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import {
  Paper, Box, Typography, CircularProgress, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, FormLabel,
  ListItemIcon, MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import FusePageCarded from '@fuse/core/FusePageCarded';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';
import DataTable from 'src/components/data-table/DataTable';
import {
  useCulturalProjectTypes,
  useCreateCulturalProjectType,
  useUpdateCulturalProjectType,
  useDeleteCulturalProjectType,
} from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import { CulturalProjectType } from '@/app/(control-panel)/culture/api/types/projectsAndActivities';

// ─── Styled root ────────────────────────────────────────────────────────────
const Root = styled(FusePageCarded)(() => ({
  '& .container': { maxWidth: '100%!important' },
}));

// ─── Types ──────────────────────────────────────────────────────────────────
type TypeForm = { name: string; description: string };
type FormErrors = Partial<Record<keyof TypeForm, string>>;
const emptyForm: TypeForm = { name: '', description: '' };

// ─── Component ──────────────────────────────────────────────────────────────
export default function CultureProjectTypesAdminView() {
  // Data
  const { data: types = [], isLoading } = useCulturalProjectTypes();

  // Mutations
  const { mutate: createType, isPending: isCreating } = useCreateCulturalProjectType() as any;
  const { mutate: updateType, isPending: isUpdating } = useUpdateCulturalProjectType() as any;
  const { mutate: deleteType, isPending: isDeleting } = useDeleteCulturalProjectType() as any;

  // Dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [editingRow, setEditingRow] = useState<CulturalProjectType | null>(null);
  const [form, setForm] = useState<TypeForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const setField = (f: keyof TypeForm, v: string) =>
    setForm((p) => ({ ...p, [f]: v }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Open helpers ─────────────────────────────────────────────────────────
  const openAdd = () => { setForm(emptyForm); setFormErrors({}); setAddOpen(true); };

  const openEdit = (row: CulturalProjectType) => {
    setEditingRow(row);
    setForm({ name: row.name ?? '', description: row.description ?? '' });
    setFormErrors({});
    setEditOpen(true);
  };

  // ── Submit handlers ──────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!validate()) return;
    createType(
      { name: form.name.trim(), description: form.description.trim() },
      {
        onSuccess: () => setAddOpen(false),
        onError: (err: any) => console.error('[ProjectTypes] create failed', err),
      },
    );
  };

  const handleEdit = () => {
    if (!validate() || !editingRow) return;
    updateType(
      { id: editingRow.id, name: form.name.trim(), description: form.description.trim() },
      {
        onSuccess: () => setEditOpen(false),
        onError: (err: any) => console.error('[ProjectTypes] update failed', err),
      },
    );
  };

  const handleDeleteConfirmed = () => {
    if (deleteTarget === null) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    deleteType(id);
  };

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = useMemo<MRT_ColumnDef<CulturalProjectType>[]>(() => [
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
      accessorKey: 'description',
      header: 'Description',
      Cell: ({ cell }) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {cell.getValue<string>() || '—'}
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
                  Cultural Project Types
                </Typography>
              </motion.span>
              <div className="flex flex-1 items-center justify-end gap-2">
                <GradientButton onClick={openAdd} startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}>
                  New Type
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
                data={types ?? []}
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
        <DialogTitle sx={{ fontWeight: 700 }}>New Project Type</DialogTitle>
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
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Project Type</DialogTitle>
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
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Project Type?</DialogTitle>
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