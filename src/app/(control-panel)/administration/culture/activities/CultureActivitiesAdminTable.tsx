import React, { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from '@/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, FormControl, InputLabel, Divider, Typography, ListItemIcon } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCulturalActivities, useCreateCulturalActivity, useUpdateCulturalActivity, useDeleteCulturalActivity, useCulturalActivityTypes } from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import { CreateCulturalActivityPayload, UpdateCulturalActivityPayload, CulturalActivity } from '@/app/(control-panel)/culture/api/types/projectsAndActivities';

export default function CulturalActivitiesAdminTable() {
  const { data: activities = [], isLoading } = useCulturalActivities();
  const { data: types } = useCulturalActivityTypes();

  const { mutate: createActivity, isPending: isCreating } = useCreateCulturalActivity() as any;
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateCulturalActivity() as any;
  const { mutate: deleteActivity, isPending: isDeleting } = useDeleteCulturalActivity() as any;

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<CulturalActivity | null>(null);
  const [form, setForm] = useState<{ name: string; description: string; date: string; typeId: string; languageId: string }>({ name: '', description: '', date: '', typeId: '', languageId: '1' });
  const queryClient = useQueryClient();

  const setField = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const openAdd = () => { setForm({ name: '', description: '', date: '', typeId: '', languageId: '1' }); setAddOpen(true); };
  const openEdit = (row: CulturalActivity) => {
    setEditing(row);
    setForm({
      name: row.name ?? '',
      description: row.description ?? '',
      date: row.date ?? '',
      typeId: String(row.cultural_activity_type?.id ?? ''),
      languageId: String(row.language?.id ?? '1'),
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    const payload: CreateCulturalActivityPayload = {
      name: form.name.trim(),
      slug: form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() || ' ',
      poster_description: form.name.trim(),
      date: form.date || new Date().toISOString(),
      language_id: Number(form.languageId) || 1,
      cultural_activity_type_id: Number(form.typeId) || 1,
      tags: [],
    } as CreateCulturalActivityPayload;
    createActivity(payload, {
      onSuccess: () => { setAddOpen(false); queryClient.invalidateQueries(); },
      onError: (err: any) => console.error('[CultureActivities Admin] create failed', err),
    });
  };

  const handleEdit = () => {
    if (!editing) return;
    const payload: UpdateCulturalActivityPayload = {
      id: editing.id,
      name: form.name.trim(),
      slug: editing.slug ?? form.name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: form.description.trim() || ' ',
      date: form.date || editing.date,
      language_id: Number(form.languageId) || (editing.language?.id ?? 1),
      cultural_activity_type_id: Number(form.typeId) || (editing.cultural_activity_type?.id ?? 1),
      // retain existing fields if needed
      poster_description: editing.poster_description ?? form.name,
      tags: editing.tags ?? [],
    } as any;
    updateActivity(payload, {
      onSuccess: () => { setEditOpen(false); queryClient.invalidateQueries(); },
      onError: (err: any) => console.error('[CultureActivities Admin] update failed', err),
    });
  };

  const handleDelete = (id: number) => {
    deleteActivity(id, { onSuccess: () => queryClient.invalidateQueries() } as any);
  };

  const columns = useMemo<MRT_ColumnDef<CulturalActivity>[]>(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: 'Name' },
    { id: 'type', header: 'Type', accessorFn: (r) => r.cultural_activity_type?.name ?? '' },
    { id: 'language', header: 'Language', accessorFn: (r) => r.language?.name ?? '' },
    { id: 'date', header: 'Date', accessorFn: (r) => r.date ?? '' },
  ], []);

  const formContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Name" size="small" value={form.name} onChange={e => setField('name', e.target.value)} />
      <TextField label="Description" size="small" multiline minRows={2} value={form.description} onChange={e => setField('description', e.target.value)} />
      <FormControl size="small" fullWidth>
        <InputLabel>Type</InputLabel>
        <Select size="small" value={form.typeId} onChange={e => setField('typeId', e.target.value)} displayEmpty>
          <MenuItem value=""><em>Select…</em></MenuItem>
          {types?.map((t: any) => (
            <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField label="Date" type="date" size="small" value={form.date} onChange={e => setField('date', e.target.value)} InputLabelProps={{ shrink: true }} />
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Cultural Activities</Typography>
        <GradientButton onClick={openAdd} startIcon={<FuseSvgIcon>lucide:plus</FuseSvgIcon>}>Add Activity</GradientButton>
      </Box>
      {isLoading ? (
        <FuseLoading />
      ) : (
        <DataTable
          data={activities ?? []}
          columns={columns}
          enableRowNumbers
          enableRowActions
          enablePagination
          initialState={{ pagination: { pageSize: 15, pageIndex: 0 } }}
          renderRowActionMenuItems={({ row, closeMenu }) => [
            <MenuItem key="edit" onClick={() => { openEdit(row.original); closeMenu(); }}>
              <ListItemIcon><FuseSvgIcon size={16}>lucide:pencil</FuseSvgIcon></ListItemIcon>Edit
            </MenuItem>,
            <MenuItem key="del" onClick={() => { handleDelete(row.original.id); closeMenu(); }}>
              <ListItemIcon><FuseSvgIcon size={16}>lucide:trash</FuseSvgIcon></ListItemIcon>Delete
            </MenuItem>,
          ]}
        />
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Cultural Activity</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAdd} variant="contained" color="secondary" disabled={isCreating} startIcon={isCreating ? <FuseSvgIcon size={14} /> : undefined}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Cultural Activity</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleEdit} variant="contained" color="secondary" disabled={isUpdating} startIcon={isUpdating ? <FuseSvgIcon size={14} /> : undefined}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
