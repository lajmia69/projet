// src/app/(control-panel)/studio/formats/page.tsx
'use client';

import { useState, useEffect } from 'react';
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

const FADE_START = 20;
const FADE_END = 180;

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
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const progress = Math.min(1, Math.max(0, (scrollY - FADE_START) / (FADE_END - FADE_START)));

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
    <div className="flex flex-col h-full" style={{ background: 'var(--mui-palette-background-default)' }}>
      {/* ── Hero Header ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1A2E38 0%, #2D8B7C 100%)',
          paddingTop: '48px',
          paddingBottom: '56px',
          opacity: 1 - progress,
          transform: `translateY(${-(progress * 24)}px)`,
          willChange: 'opacity, transform',
          flexShrink: 0,
        }}
      >
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(29,201,138,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(29,201,138,0.06) 1px, transparent 1px)`,
          backgroundSize: '52px 52px',
          pointerEvents: 'none',
        }} />
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-100px',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,168,176,0.22) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-50px', right: '-50px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(42,232,142,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
          <PageBreadcrumb className="mb-4 opacity-60" />
          <Typography component="h1" sx={{
            fontSize: { xs: '1.75rem', sm: '2.4rem', md: '3rem' },
            fontWeight: 800,
            color: '#e8fff5',
            textShadow: '0 2px 32px rgba(0,0,0,0.55)',
            lineHeight: 1.15,
          }}>
            Audio Formats
          </Typography>
          <Typography sx={{
            fontSize: { xs: '0.875rem', sm: '0.95rem' },
            color: 'rgba(42,232,142,0.72)',
            lineHeight: 1.75,
            mt: 1.5,
          }}>
            Configure the audio format presets used across your production projects.
          </Typography>

          {formats.length > 0 && (
            <div className="mt-4">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 14px', borderRadius: '999px',
                border: '1px solid rgba(14,168,176,0.35)',
                backgroundColor: 'rgba(14,168,176,0.12)',
              }}>
                <FuseSvgIcon size={13} sx={{ color: 'rgba(14,168,176,0.75)' }}>lucide:file-audio</FuseSvgIcon>
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: 'rgba(14,168,176,0.85)', letterSpacing: '0.025em' }}>
                  {formats.length} format{formats.length !== 1 ? 's' : ''} configured
                </Typography>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="px-6 py-4 shrink-0 flex items-center justify-end">
        <Button
          variant="contained"
          color="secondary"
          startIcon={<FuseSvgIcon size={18}>lucide:plus</FuseSvgIcon>}
          onClick={() => setDialogOpen(true)}
        >
          New Format
        </Button>
      </div>

      <Divider />

      {/* ── List ── */}
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

      {/* ── Create dialog ── */}
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

      {/* ── Delete confirm dialog ── */}
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