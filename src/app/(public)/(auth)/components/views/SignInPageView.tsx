import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Link from '@mui/material/Link';
import { styled, keyframes } from '@mui/material/styles';

// ─── Color tokens ────────────────────────────────────────────────────────────
const C = {
  cream: '#E8E4DA',
  creamDark: '#D9D4C7',
  teal: '#2D8B7C',
  darkTeal: '#1C4A52',
  navy: '#1A2E38',
} as const;

// ─── Waveform animation ───────────────────────────────────────────────────────
const pulse = keyframes`
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.8); }
`;

const barCount = 28;

// ─── Dot grid helper ─────────────────────────────────────────────────────────
function DotGrid() {
  const dots = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 10; c++) {
      dots.push(
        <div
          key={`${r}-${c}`}
          style={{
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'rgba(45,139,124,0.35)',
            margin: 7,
            display: 'inline-block',
          }}
        />
      );
    }
  }
  return (
    <div style={{ lineHeight: 0, letterSpacing: 0 }}>{dots}</div>
  );
}

// ─── Right decorative panel ───────────────────────────────────────────────────
function RightPanel() {
  return (
    <Box
      sx={{
        width: '48%',
        background: `linear-gradient(160deg, ${C.darkTeal} 0%, ${C.navy} 60%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 5,
        gap: 3,
      }}
    >
      {/* Dot grid top-right */}
      <Box sx={{ position: 'absolute', top: 24, right: 20, opacity: 0.5 }}>
        <DotGrid />
      </Box>

      {/* Dot grid bottom-left */}
      <Box sx={{ position: 'absolute', bottom: 24, left: 20, opacity: 0.3 }}>
        <DotGrid />
      </Box>

      {/* DESIGNED FOR EVERY LEARNER label */}
      <Box
        sx={{
          fontFamily: '"DM Mono", monospace',
          fontSize: 9,
          letterSpacing: '0.22em',
          color: C.teal,
          textTransform: 'uppercase',
          position: 'absolute',
          top: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
        }}
      >
        Designed for every learner
      </Box>

      {/* Mic icon */}
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: `1.5px solid rgba(45,139,124,0.45)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(45,139,124,0.08)',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="2" width="6" height="11" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
      </Box>

      {/* Brand name */}
      <Box sx={{ textAlign: 'center', lineHeight: 1 }}>
        <Box
          component="span"
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 40,
            fontWeight: 400,
            color: C.cream,
            letterSpacing: '-0.01em',
          }}
        >
          Edu
        </Box>
        <Box
          component="span"
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 40,
            fontWeight: 400,
            fontStyle: 'italic',
            color: C.teal,
          }}
        >
          Voice
        </Box>
      </Box>

      {/* Quote */}
      <Box sx={{ textAlign: 'center', maxWidth: 220 }}>
        <Box
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 17,
            color: C.cream,
            opacity: 0.88,
            lineHeight: 1.5,
          }}
        >
          "Your voice is<br />your vision."
        </Box>
        <Box
          sx={{
            fontFamily: '"DM Mono", monospace',
            fontSize: 9,
            letterSpacing: '0.18em',
            color: C.teal,
            textTransform: 'uppercase',
            mt: 1.5,
          }}
        >
          Audio-first learning for the blind
        </Box>
      </Box>

      {/* Waveform bars */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 36 }}>
        {Array.from({ length: barCount }).map((_, i) => {
          const h = 6 + Math.abs(Math.sin(i * 0.7)) * 22;
          const delay = (i * 0.07).toFixed(2);
          return (
            <Box
              key={i}
              sx={{
                width: 3,
                height: `${h}px`,
                borderRadius: 4,
                background: C.teal,
                opacity: 0.7,
                animation: `${pulse} ${1.2 + (i % 5) * 0.18}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </Box>

      {/* Feature badges */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxWidth: 280 }}>
        {['Voice-guided', 'Braille-ready', 'Screen-reader', 'Audio-first'].map((b) => (
          <Box
            key={b}
            sx={{
              px: 1.75,
              py: 0.5,
              borderRadius: '20px',
              border: `1px solid rgba(45,139,124,0.45)`,
              fontFamily: '"DM Mono", monospace',
              fontSize: 9,
              letterSpacing: '0.1em',
              color: C.teal,
              textTransform: 'uppercase',
            }}
          >
            {b}
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          fontFamily: '"DM Mono", monospace',
          fontSize: 9,
          letterSpacing: '0.15em',
          color: 'rgba(232,228,218,0.25)',
          textTransform: 'uppercase',
        }}
      >
        © 2025 EduVoice
      </Box>
    </Box>
  );
}

// ─── Styled input ─────────────────────────────────────────────────────────────
const StyledInput = styled('input')({
  width: '100%',
  padding: '12px 14px',
  background: C.navy,
  color: C.cream,
  border: `1.5px solid transparent`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: '"DM Sans", sans-serif',
  outline: 'none',
  transition: 'border-color 0.2s',
  '&::placeholder': { color: 'rgba(232,228,218,0.25)' },
  '&:focus': { borderColor: C.teal },
});

// ─── Main component ───────────────────────────────────────────────────────────
function SignInPageView() {
  const [remember, setRemember] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      {/* ── LEFT PANEL ── */}
      <Box
        sx={{
          width: '52%',
          background: C.cream,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', p: '36px 44px 32px' }}>

          {/* Brand */}
          <Box
            sx={{
              fontFamily: '"DM Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.2em',
              color: C.teal,
              textTransform: 'uppercase',
              mb: 'auto',
            }}
          >
            EduVoice
          </Box>

          {/* Tab bar */}
          <Box
            sx={{
              display: 'flex',
              background: 'rgba(26,46,56,0.07)',
              borderRadius: '10px',
              p: '3px',
              mb: 3,
            }}
          >
            {(['Sign In', 'Sign Up', 'Sign Out'] as const).map((t) => (
              <Box
                key={t}
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  py: '8px',
                  borderRadius: '8px',
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ...(t === 'Sign In'
                    ? { background: C.navy, color: C.cream, boxShadow: '0 2px 8px rgba(26,46,56,0.25)' }
                    : { color: C.darkTeal, opacity: 0.5 }),
                }}
              >
                {t}
              </Box>
            ))}
          </Box>

          {/* Accessibility chips */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {['Voice-guided', 'Braille-ready', 'Screen-reader'].map((chip) => (
              <Box
                key={chip}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: '20px',
                  border: `1px solid rgba(28,74,82,0.2)`,
                  fontSize: 11,
                  color: C.darkTeal,
                  fontWeight: 300,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', border: `1.5px solid ${C.teal}` }} />
                {chip}
              </Box>
            ))}
          </Box>

          {/* Heading */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 42,
                fontWeight: 400,
                color: C.navy,
                lineHeight: 1.0,
              }}
            >
              Welcome
            </Box>
            <Box
              sx={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 42,
                fontWeight: 400,
                fontStyle: 'italic',
                color: C.teal,
                lineHeight: 1.0,
              }}
            >
              back.
            </Box>
            <Box sx={{ fontSize: 13, color: C.darkTeal, opacity: 0.65, mt: 0.75, fontWeight: 300 }}>
              Sign in — your voice assistant is ready
            </Box>
          </Box>

          {/* Form */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Email */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.navy, opacity: 0.45, mb: 0.75 }}>
                Email Address
              </Box>
              <StyledInput type="email" placeholder="you@example.com" />
            </Box>

            {/* Password */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: C.navy, opacity: 0.45, mb: 0.75 }}>
                Password
              </Box>
              <StyledInput type="password" placeholder="••••••••" />
            </Box>

            {/* Remember + Forgot */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    sx={{ color: C.darkTeal, '&.Mui-checked': { color: C.teal }, p: 0.5 }}
                  />
                }
                label={<Box sx={{ fontSize: 12, color: C.darkTeal, fontWeight: 300 }}>Remember me</Box>}
                sx={{ m: 0, gap: 0.5 }}
              />
              <Link href="#" underline="hover" sx={{ fontSize: 12, color: C.teal, fontWeight: 400 }}>
                Forgot password?
              </Link>
            </Box>

            {/* Submit */}
            <Box
              component="button"
              sx={{
                width: '100%',
                py: '14px',
                background: C.darkTeal,
                color: C.cream,
                border: 'none',
                borderRadius: '8px',
                fontSize: 11,
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                '&:hover': { background: C.navy },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              Sign In
            </Box>

            {/* Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 1.5, color: C.darkTeal, opacity: 0.35, fontSize: 11 }}>
              <Box sx={{ flex: 1, height: '0.5px', background: C.darkTeal, opacity: 0.4 }} />
              or
              <Box sx={{ flex: 1, height: '0.5px', background: C.darkTeal, opacity: 0.4 }} />
            </Box>

            {/* Info box */}
            <Box
              sx={{
                background: 'rgba(45,139,124,0.1)',
                border: '0.5px solid rgba(45,139,124,0.3)',
                borderRadius: '8px',
                p: '10px 14px',
                fontSize: 12,
                color: C.darkTeal,
                lineHeight: 1.65,
                fontWeight: 300,
              }}
            >
              You are browsing <strong style={{ fontWeight: 500 }}>EduVoice Demo</strong>. Click on the "Sign in" button to access your audio-learning environment.
            </Box>

            {/* Alt link */}
            <Box sx={{ textAlign: 'center', fontSize: 12, color: C.darkTeal, opacity: 0.55, mt: 1.5 }}>
              No account?{' '}
              <Link href="#" underline="hover" sx={{ color: C.teal, fontWeight: 500, opacity: 1 }}>
                Create one
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── RIGHT PANEL ── */}
      <RightPanel />
    </Box>
  );
}

export default SignInPageView;