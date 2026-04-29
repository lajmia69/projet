import React, { useState } from 'react';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { styled } from '@mui/material/styles';
import PageBreadcrumb from '@/components/PageBreadcrumb';
import GradientButton from '@/app/(control-panel)/components/ui/GradientButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import CultureActivitiesAdminTable from './CultureActivitiesAdminTable';
import { useCreateCulturalActivity, useCulturalActivityTypes } from '@/app/(control-panel)/culture/api/hooks/useCultureProjectsActivities';
// CreateCulturalActivityPayload imported above
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Divider, Button } from '@mui/material';
import { CreateCulturalActivityPayload } from '@/app/(control-panel)/culture/api/types/projectsAndActivities';

const Root = styled(FusePageCarded)(() => ({
    '& .container': { maxWidth: '100%!important' },
}));

export default function CultureActivitiesAdminView() {
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [typeId, setTypeId] = useState('');
  // fetch types for dropdown in add form
  const { data: activityTypes } = useCulturalActivityTypes();
  const { mutate: createActivity, isPending: isCreating } = useCreateCulturalActivity();
  const addDialog = () => {
    setName(''); setDescription(''); setTypeId(''); setAddOpen(true);
  };
  const handleAddSubmit = () => {
    if (!name.trim()) return;
    const payload: CreateCulturalActivityPayload = {
      name: name.trim(),
      slug: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description.trim() || ' ',
      poster_description: name.trim(),
      date: new Date().toISOString(),
      language_id: 1,
      cultural_activity_type_id: Number(typeId) || 1,
      tags: [],
    } as any;
    createActivity?.(payload, { onSuccess: () => setAddOpen(false) } as any);
  };

  // Local UI for Add dialog (parity with Lesson style)
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0,10));
  return (
    <>
      <Root
        header={
        <div className="flex flex-auto flex-col py-4 px-4">
          <PageBreadcrumb className="mb-2" />
          <div className="flex items-center gap-2" style={{ justifyContent: 'space-between' }}>
            <span className="text-4xl font-extrabold leading-none tracking-tight">Cultural Activities</span>
            <GradientButton onClick={addDialog} startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}>Add Activity</GradientButton>
          </div>
        </div>
      }
      content={<CultureActivitiesAdminTable />}
    />
      {/* Add Activity Dialog (matches Lesson UI) */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Cultural Activity</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: '20px !important', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Name" size="small" value={name} onChange={e => setName(e.target.value)} autoFocus />
          <TextField label="Description" size="small" value={description} onChange={e => setDescription(e.target.value)} multiline minRows={2} />
          <FormControl size="small">
            <InputLabel>Type</InputLabel>
            <Select size="small" value={typeId} onChange={e => setTypeId(e.target.value)} displayEmpty>
              <MenuItem value=""><em>Select type…</em></MenuItem>
              {activityTypes?.map((t: any) => (
                <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Date" type="date" size="small" value={startDate} onChange={e => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setAddOpen(false)} variant="outlined">Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained" color="secondary" disabled={!!isCreating} startIcon={isCreating ? <FuseSvgIcon size={14} /> : undefined}>
            {isCreating ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
