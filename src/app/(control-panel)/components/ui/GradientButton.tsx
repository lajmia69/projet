import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { palette } from '@/app/(control-panel)/design/palette';

const GradientButtonRoot = styled(Button)(({ theme }) => ({
  background: palette.gradient.primary,
  color: palette.text.onPrimary,
  fontWeight: 700,
  borderRadius: 8,
  textTransform: 'none',
  '&:hover': {
    background: palette.gradient.primaryHover,
  },
}));

export default function GradientButton(props: ButtonProps) {
  return <GradientButtonRoot {...props} />;
}
