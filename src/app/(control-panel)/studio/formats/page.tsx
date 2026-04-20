// src/app/(control-panel)/studio/formats/page.tsx
'use client';

import { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useGetAudioFormats } from '../api/hooks/audio/Usegetaudioformats';
import { useCurrentAccountId } from '../api/useCurrentAccountId';
import { useStudioAuth } from '../api/hooks/useStudioauth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApiService } from '../api/services/studioApiService';
import { audioFormatsQueryKey } from '../api/hooks/audio/Usegetaudioformats';
import { AudioFormat, CreateAudioFormat } from '../api/types';

const CHANNEL_OPTIONS = [
  { value: 1, label: 'Mono' },
  { value: 2, label: 'Stereo' },
  { value: 6, label: '5.1 Surround' },
];

const EMPTY_FORM: CreateAudioFormat = {
  name: '',
  extension: '',
  bit_rates: '',
  flow_rates: '',
  frequency: '',
  channel: 2,
};

function FormatRow({
  format,
  onDelete,
}: {
  format: AudioFormat;
  onDelete: (f: AudioFormat) => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:shadow-sm transition-shadow"
      style={{ borderColor: 'var(--mui-palette-divider)' }}
    >
      <div
        className="flex shrink-0 items-center justify-center w-10 h-10 rounded-lg"
        style={{ backgroundColor: 'rgba(var(--mui-palette-secondary-mainChannel) / 0.12)' }}
      >
        <FuseSvgIcon size={18} style={{ color: 'var(--mui-palette-secondary-main)' }}>
          lucide:file-audio
        </FuseSvgIcon>
      </div>

      <div className="flex-1 min-w-0">
        <Typography className="text-sm font-semibold">{format.name}</Typography>
        <Typography className="text-xs" color="text.secondary">
          .{format.extension.toUpperCase()} · {format.bit_rates} kbps · {format.frequency} kHz ·{' '}
          {format.channel_label ?? (format.channel === 1 ? 'Mono' : 'Stereo')}
        </Typography>
        {format.flow_rates && (
          <Typography className="text-xs" color="text.disabled">
            Flow rate: {format.flow_rates}
          </Typography>
        )}
      </div>

      <Button
        size="small"
        color="error"
        onClick={() => onDelete(format)}
        sx={{ minWidth: 0, px: 1 }}
      >
        <FuseSvgIcon size={16}>lucide:trash-2</FuseSvgIcon>
      </Button>
    </div>
  );
}

export default function FormatsPage() {
  useStudioAuth();

  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();
  const { data: formats = [], isLoading } = useGetAudioFormats();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CreateAudioFormat>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AudioFormat | null>(null);

  const { mutateAsync: createFormat, isPending: isCreating } = useMutation({
    mutationFn: (data: CreateAudioFormat) => studioApiService.createAudioFormat(accountId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: audioFormatsQueryKey(accountId) }),
  });

  const { mutateAsync: deleteFormat, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => studioApiService.deleteAudioFormat(accountId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: audioFormatsQueryKey(accountId) }),
  });

  function handleChange(field: keyof CreateAudioFormat, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate() {
    if (!form.name || !form.extension) return;
    await createFormat(form);
    setForm(EMPTY_FORM);
    setDialogOpen(false);
  }

  async function handleDelete() {
    if (!deleteTarget?.id) return;
    await deleteFormat(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <PageBreadcrumb className="mb-3" />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Typography className="text-3xl font-extrabold tracking-tight leading-none">
              Audio Formats
            </Typography>
            <Typography className="text-sm mt-1" color="text.secondary">
              {formats.length} format{formats.length !== 1 ? 's' : ''} configured
            </Typography>
          </div>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<FuseSvgIcon size={18}>lucide:plus</FuseSvgIcon>}
            onClick={() => setDialogOpen(true)}
          >
            New Format
          </Button>
        </div>
      </div>

      <Divider />

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <CircularProgress color="secondary" />
          </div>
        ) : formats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FuseSvgIcon size={48} color="disabled">lucide:file-audio</FuseSvgIcon>
            <Typography color="text.secondary">No audio formats configured yet.</Typography>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<FuseSvgIcon size={16}>lucide:plus</FuseSvgIcon>}
              onClick={() => setDialogOpen(true)}
            >
              Add your first format
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-w-2xl">
            {formats.map((f) => (
              <FormatRow key={f.id} format={f} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Audio Format</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 pt-2">
            <TextField
              label="Name *"
              size="small"
              fullWidth
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. MP3 Standard"
            />
            <TextField
              label="Extension *"
              size="small"
              fullWidth
              value={form.extension}
              onChange={(e) => handleChange('extension', e.target.value.toLowerCase().replace(/^\./, ''))}
              placeholder="e.g. mp3"
            />
            <div className="flex gap-3">
              <TextField
                label="Bit Rate (kbps)"
                size="small"
                fullWidth
                value={form.bit_rates}
                onChange={(e) => handleChange('bit_rates', e.target.value)}
                placeholder="e.g. 128"
              />
              <TextField
                label="Frequency (kHz)"
                size="small"
                fullWidth
                value={form.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
                placeholder="e.g. 44.1"
              />
            </div>
            <TextField
              label="Flow Rate"
              size="small"
              fullWidth
              value={form.flow_rates}
              onChange={(e) => handleChange('flow_rates', e.target.value)}
              placeholder="e.g. 128kbps CBR"
            />
            <TextField
              select
              label="Channel"
              size="small"
              fullWidth
              value={form.channel}
              onChange={(e) => handleChange('channel', Number(e.target.value))}
            >
              {CHANNEL_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={!form.name || !form.extension || isCreating}
            onClick={handleCreate}
          >
            {isCreating ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete format?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}