import React, { useState } from 'react';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { styled } from '@mui/material/styles';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import CultureProjectTypesAdminTable from '../CultureProjectTypesAdminTable';
import { useCreateCulturalProjectType, useCulturalProjectTypes } from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import { CreateCulturalProjectTypePayload } from '@/app/(control-panel)/culture/api/types/projectsAndActivities';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider, Button } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';

const Root = styled(FusePageCarded)(() => ({
  '& .container': { maxWidth: '100%!important' },
}));

export default function CultureProjectTypesAdminView() {
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: createType, isPending: isCreating } = useCreateCulturalProjectType();
  const { data: projectTypes } = useCulturalProjectTypes();
  const openAdd = () => { setName(''); setDescription(''); setAddOpen(true); };
  const handleAddSubmit = () => {
    if (!name.trim()) return;
    const payload: CreateCulturalProjectTypePayload = { name: name.trim(), description: description.trim() };
    createType(payload, { onSuccess: () => setAddOpen(false) } as any);
  };
  return (
    <>
      <Root
      header={
        <div className="flex flex-auto flex-col py-4 px-4">
          <PageBreadcrumb className="mb-2" />
          <div className="flex items-center gap-2" style={{ justifyContent: 'space-between' }}>
            <span className="text-4xl font-extrabold leading-none tracking-tight">Cultural Project Types</span>
            <GradientButton onClick={openAdd} startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}>New Type</GradientButton>
          </div>
        </div>
      }
      content={<CultureProjectTypesAdminTable />}
      />
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>New Project Type</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: '20px !important' }}>
        <TextField label="Name" size="small" fullWidth value={name} onChange={e => setName(e.target.value)} autoFocus />
        <TextField label="Description" size="small" fullWidth value={description} onChange={e => setDescription(e.target.value)} multiline minRows={2} sx={{ mt: 2 }} />
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
        <Button onClick={handleAddSubmit} variant="contained" color="secondary" disabled={!!isCreating}>
          {isCreating ? 'Creating…' : 'Create'}
        </Button>
      </DialogActions>
      </Dialog>
    </>
  );
}
