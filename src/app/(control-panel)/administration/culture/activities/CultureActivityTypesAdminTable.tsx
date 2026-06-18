import React, { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from '@/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, MenuItem, ListItemIcon } from '@mui/material';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCulturalActivityTypes, useCreateCulturalActivityType, useUpdateCulturalActivityType, useDeleteCulturalActivityType } from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import { CulturalActivityType } from '@/app/(control-panel)/culture/api/types/projectsAndActivities';

export default function CulturalActivityTypesAdminTable() {
  const { data: types = [], isLoading } = useCulturalActivityTypes();
  const { mutate: create, isPending: isCreating } = useCreateCulturalActivityType() as any;
  const { mutate: update, isPending: isUpdating } = useUpdateCulturalActivityType() as any;
  const { mutate: remove } = useDeleteCulturalActivityType() as any;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CulturalActivityType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openCreate = () => { setName(''); setDescription(''); setOpen(true); };
  const openEdit = (t: CulturalActivityType) => { setEditing(t); setName(t.name); setDescription(t.description ?? ''); setOpen(true); };
  const close = () => { setOpen(false); setEditing(null); };

  const handleSubmit = () => {
    if (editing) {
      update({ id: editing.id, name: name.trim(), description: description.trim() }, { onSuccess: () => close() } as any);
    } else {
      create({ name: name.trim(), description: description.trim() }, { onSuccess: () => close() } as any);
    }
  };
  const handleDelete = (id: number) => remove(id, {} as any);

  const columns = useMemo<MRT_ColumnDef<CulturalActivityType>[]>(() => [
    { accessorKey: 'id', header: 'ID', size: 60 },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
  ], []);

  const formContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField label="Name" size="small" value={name} onChange={e => setName(e.target.value)} />
      <TextField label="Description" size="small" value={description} onChange={e => setDescription(e.target.value)} />
    </Box>
  );

  return (
    <Box>
      {isLoading ? <FuseLoading /> : (
        <DataTable data={types ?? []} columns={columns} enableRowNumbers enableRowActions enablePagination initialState={{ pagination: { pageSize: 15, pageIndex: 0 } }} renderRowActionMenuItems={({ row, closeMenu }) => [
          <MenuItem key="edit" onClick={() => { openEdit(row.original); closeMenu(); }}>
            <ListItemIcon><FuseSvgIcon size={16}>lucide:pencil</FuseSvgIcon></ListItemIcon>Edit
          </MenuItem>,
          <MenuItem key="del" onClick={() => { handleDelete(row.original.id); closeMenu(); }}>
            <ListItemIcon><FuseSvgIcon size={16}>lucide:trash</FuseSvgIcon></ListItemIcon>Delete
          </MenuItem>,
        ]} />
      )}

      <Dialog open={open} onClose={close} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Activity Type' : 'New Activity Type'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={close} variant="outlined">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary" disabled={false} startIcon={isCreating || isUpdating ? <FuseSvgIcon size={14}/> : undefined}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
