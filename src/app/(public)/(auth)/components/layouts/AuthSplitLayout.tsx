import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

type AuthSplitLayoutProps = {
  left: React.ReactNode;
  right?: React.ReactNode;
  leftPaperSx?: object;
  rightSx?: object;
};

/**
 * A reusable two-column layout for authentication pages.
 * Left: form area (title + form content)
 * Right: branding / logo area with a decorative background.
 */
export default function AuthSplitLayout({ left, right, leftPaperSx = {}, rightSx = {} }: AuthSplitLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'background.default',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: { xs: '100%', md: '50%' },
          height: '100%',
          px: 2,
          py: 6,
          bgcolor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(6px) saturate(1.15)',
          borderRadius: 2,
          border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          ...leftPaperSx as any
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 760, px: 2, ...leftPaperSx }}>{left}</Box>
      </Paper>

      <Box
        sx={{
          width: { xs: '0%', md: '50%' },
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: (theme) => `radial-gradient(circle at 20% 20%, ${theme.palette.primary.light}20 0%, transparent 40%), linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
          ...rightSx
        }}
      >
        {right}
      </Box>
    </Box>
  );
}
