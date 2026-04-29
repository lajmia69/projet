import React, { useState } from 'react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { styled } from '@mui/material/styles';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import CultureActivityTypesAdminTable from '../CultureActivityTypesAdminTable';
import { useCreateCulturalActivityType, useCulturalActivityTypes } from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import { CreateCulturalActivityTypePayload } from '@/app/(control-panel)/culture/api/types/projectsAndActivities';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Divider } from '@mui/material';

const Root = styled(FusePageCarded)(() => ({
  '& .container': { maxWidth: '100%!important' },
}));

export default function CultureActivityTypesAdminView() {
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: createType, isPending: isCreating } = useCreateCulturalActivityType();
  const { data: activityTypes } = useCulturalActivityTypes();

  const openAdd = () => { setName(''); setDescription(''); setAddOpen(true); };
  const handleAddSubmit = () => {
    if (!name.trim()) return;
    const payload: CreateCulturalActivityTypePayload = { name: name.trim(), description: description.trim() };
    createType(payload, { onSuccess: () => setAddOpen(false) } as any);
  };
  return (
    <>
      <Root
        header={
          <div className="flex flex-auto flex-col py-4 px-4">
            <PageBreadcrumb className="mb-2" />
            <div className="flex items-center gap-2" style={{ justifyContent: 'space-between' }}>
              <span className="text-4xl font-extrabold leading-none tracking-tight">Cultural Activity Types</span>
              <GradientButton onClick={openAdd} startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}>Add Type</GradientButton>
            </div>
          </div>
        }
        content={<CultureActivityTypesAdminTable />}
      />
      <Dialog open={addOpen} onClose={()=>setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight:700 }}>New Activity Type</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>
          <TextField label="Name" value={name} onChange={e=>setName(e.target.value)} fullWidth size="small" autoFocus />
          <TextField label="Description" sx={{ mt:2 }} value={description} onChange={e=>setDescription(e.target.value)} fullWidth size="small" multiline minRows={2} />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px:3, py:2 }}>
          <Button onClick={()=>setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained" color="secondary" disabled={isCreating} startIcon={isCreating ? <FuseSvgIcon size={14}/> : undefined}>{isCreating ? 'Creating…' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
