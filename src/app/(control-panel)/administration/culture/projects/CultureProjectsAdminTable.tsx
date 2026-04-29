import React, { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, MenuItem, Select, FormControl, InputLabel, Typography, ListItemIcon } from '@mui/material';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCulturalProjects, useCreateCulturalProject, useUpdateCulturalProject, useDeleteCulturalProject, useCulturalProjectTypes } from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import { CreateCulturalProjectPayload, UpdateCulturalProjectPayload, CulturalProject } from '@/app/(control-panel)/culture/api/types/projectsAndActivities';

export default function CulturalProjectsAdminTable() {
  const { data: projects = [], isLoading } = useCulturalProjects();
  const { data: projectTypes } = useCulturalProjectTypes();
  const { mutate: create, isPending: isCreating } = useCreateCulturalProject() as any;
  const { mutate: update, isPending: isUpdating } = useUpdateCulturalProject() as any;
  const { mutate: del, isPending: isDeleting } = useDeleteCulturalProject() as any;
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<CulturalProject | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; date?: string; startDate?: string; endDate?: string; categoryId: string; languageId: string }>({ name: '', description: '', categoryId: '', languageId: '1' });

  const setField = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const openAdd = () => { setForm({ name: '', description: '', date: '', startDate: '', endDate: '', categoryId: '', languageId: '1' }); setAddOpen(true); };
  const openEdit = (row: CulturalProject) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      description: row.description || '',
      date: row.start_date || '',
      startDate: row.start_date || '',
      endDate: row.end_date || '',
      categoryId: String(row.cultural_project_type?.id ?? ''),
      languageId: String(row.language?.id ?? '1')
    });
    setEditOpen(true);
  };
  const handleAdd = () => {
    const payload: CreateCulturalProjectPayload = {
      name: form.name.trim(),
      slug: form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() || '',
      start_date: form.startDate ?? form.date ?? '',
      end_date: form.endDate ?? form.startDate ?? '',
      publishing_date: new Date().toISOString(),
      language_id: Number(form.languageId) || 1,
      cultural_project_type_id: Number(form.categoryId) || 1,
      tags: [],
    } as any;
    create(payload, {
      onSuccess: () => { setAddOpen(false); },
      onError: (err: any) => console.error('Create culture project failed', err),
    } as any);
  };
  const handleEdit = () => {
    if (!editing) return;
    const payload: UpdateCulturalProjectPayload = {
      id: editing.id,
      name: form.name.trim(),
      slug: editing.slug ?? form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() ?? '',
      start_date: form.startDate ?? (editing.start_date ?? ''),
      end_date: form.endDate ?? (editing.end_date ?? ''),
      language_id: Number(form.languageId) || (editing.language?.id ?? 1),
      cultural_project_type_id: Number(form.categoryId) || (editing.cultural_project_type?.id ?? 1),
      tags: editing.tags ?? [],
    } as any;
    update(payload, {
      onSuccess: () => setEditOpen(false),
      onError: (err: any) => console.error('Update culture project failed', err),
    } as any);
  };
  const handleDelete = (id: number) => del(id, {} as any);

  const columns = useMemo<MRT_ColumnDef<CulturalProject>[]>(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: 'Name' },
    { id: 'type', header: 'Type', accessorFn: (r) => r.cultural_project_type?.name ?? '' },
    { id: 'language', header: 'Language', accessorFn: (r) => r.language?.name ?? '' },
    { id: 'start', header: 'Start', accessorFn: (r) => r.start_date ?? '' },
  ], []);

  const formContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Name" size="small" value={form.name} onChange={e => setField('name', e.target.value)} />
      <TextField label="Description" size="small" value={form.description} onChange={e => setField('description', e.target.value)} />
      <TextField label="Start Date" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.startDate ?? ''} onChange={e => setField('startDate', e.target.value)} />
      <TextField label="End Date" size="small" type="date" InputLabelProps={{ shrink: true }} value={form.endDate ?? ''} onChange={e => setField('endDate', e.target.value)} />
      <FormControl size="small" fullWidth>
        <InputLabel>Type</InputLabel>
        <Select value={form.categoryId} onChange={e => setField('categoryId', e.target.value)} displayEmpty>
          <MenuItem value=""><em>Select…</em></MenuItem>
          {projectTypes?.map((t: any) => (<MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>))}
        </Select>
      </FormControl>
      <TextField label="Language Id" size="small" value={form.languageId} onChange={e => setField('languageId', e.target.value)} />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 2 }}>
        <Typography variant="h6">Cultural Projects</Typography>
        {/* Add button moved to the page header for parity with Lessons admin */}
      </Box>
      {isLoading ? <FuseLoading /> : (
        <DataTable data={projects ?? []} columns={columns} enableRowNumbers enableRowActions enablePagination initialState={{ pagination: { pageSize: 15, pageIndex: 0 } }} renderRowActionMenuItems={({ row, closeMenu }) => [
          <MenuItem key="edit" onClick={() => { openEdit(row.original); closeMenu(); }}>
            <ListItemIcon><FuseSvgIcon size={16}>lucide:pencil</FuseSvgIcon></ListItemIcon>Edit
          </MenuItem>,
          <MenuItem key="del" onClick={() => { handleDelete(row.original.id); closeMenu(); }}>
            <ListItemIcon><FuseSvgIcon size={16}>lucide:trash</FuseSvgIcon></ListItemIcon>Delete
          </MenuItem>
        ]} />
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Cultural Project</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAdd} variant="contained" color="secondary" disabled={isCreating}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Cultural Project</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleEdit} variant="contained" color="secondary" disabled={isUpdating}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
