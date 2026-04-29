import React, { useState } from 'react';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { styled } from '@mui/material/styles';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import CultureProjectsAdminTable from './CultureProjectsAdminTable';
import { useCreateCulturalProject, useCulturalProjectTypes } from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
import { CreateCulturalProjectPayload } from '@/app/(control-panel)/culture/api/types/projectsAndActivities';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Divider, MenuItem, Select, FormControl, InputLabel, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';

const Root = styled(FusePageCarded)(() => ({
  '& .container': { maxWidth: '100%!important' },
}));

export default function CultureProjectsAdminView() {
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [categoryId, setCategoryId] = useState<string>('');
  const { data: projectTypes } = useCulturalProjectTypes();
  const { mutate: createProject, isPending: isCreating } = useCreateCulturalProject();
  const openAdd = () => { setName(''); setDescription(''); setStartDate(new Date().toISOString().slice(0,10)); setCategoryId(''); setAddOpen(true); };
  const handleAddSubmit = () => {
    if (!name.trim()) return;
    const payload: CreateCulturalProjectPayload = {
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim() || '',
      start_date: startDate,
      end_date: startDate,
      publishing_date: new Date().toISOString(),
      language_id: 1,
      cultural_project_type_id: Number(categoryId) || 1,
      tags: [],
    } as any;
    createProject(payload, { onSuccess: () => setAddOpen(false) } as any);
  };
  return (
    <>
      <Root
        header={
          <div className="flex flex-auto flex-col py-4 px-4">
            <PageBreadcrumb className="mb-2" />
            <div className="flex items-center gap-2" style={{ justifyContent: 'space-between' }}>
              <span className="text-4xl font-extrabold leading-none tracking-tight">Cultural Projects</span>
              <GradientButton onClick={openAdd} startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}>Add Project</GradientButton>
            </div>
          </div>
        }
        content={<CultureProjectsAdminTable />}
      />
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Cultural Project</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important' }}>
          <TextField label="Name" size="small" fullWidth value={name} onChange={e => setName(e.target.value)} autoFocus />
          <TextField label="Description" size="small" fullWidth value={description} onChange={e => setDescription(e.target.value)} multiline minRows={2} sx={{ mt: 2 }} />
          <TextField label="Start Date" type="date" size="small" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 2 }} />
          <FormControl size="small" fullWidth sx={{ mt: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select size="small" value={categoryId} onChange={e => setCategoryId(e.target.value)} displayEmpty>
              <MenuItem value=""><em>Select…</em></MenuItem>
              {projectTypes?.map((t: any) => (<MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>))}
            </Select>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained" color="secondary" disabled={!!isCreating} startIcon={isCreating ? <FuseSvgIcon size={14} /> : undefined}>
            {isCreating ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
