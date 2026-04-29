import React, { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, MenuItem, ListItemIcon, Typography } from '@mui/material';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useCulturalProjectTypes, useCreateCulturalProjectType, useUpdateCulturalProjectType, useDeleteCulturalProjectType } from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import { CulturalProjectType } from '@/app/(control-panel)/culture/api/types/projectsAndActivities';

export default function CulturalProjectTypesAdminTable() {
  const { data: types = [], isLoading } = useCulturalProjectTypes();
  const { mutate: create, isPending: isCreating } = useCreateCulturalProjectType() as any;
  const { mutate: update, isPending: isUpdating } = useUpdateCulturalProjectType() as any;
  const { mutate: del } = useDeleteCulturalProjectType() as any;

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CulturalProjectType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openCreate = () => { setName(''); setDescription(''); setOpen(true); };
  const openEdit = (t: CulturalProjectType) => { setEditing(t); setName(t.name); setDescription(t.description ?? ''); setOpen(true); };
  const close = () => { setOpen(false); setEditing(null); };

  const handleSubmit = () => {
    if (editing) {
      update({ id: editing.id, name: name.trim(), description: description.trim() }, { onSuccess: close } as any);
    } else {
      create({ name: name.trim(), description: description.trim() }, { onSuccess: close } as any);
    }
  };
  const handleDelete = (id: number) => del(id, {} as any);

  const columns = useMemo<MRT_ColumnDef<CulturalProjectType>[]>(() => [
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
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb: 2 }}>
        <Typography variant="h6">Cultural Project Types</Typography>
        <GradientButton onClick={openCreate} startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}>New Type</GradientButton>
      </Box>
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
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Project Type' : 'New Project Type'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>{formContent}</DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={close} variant="outlined">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
