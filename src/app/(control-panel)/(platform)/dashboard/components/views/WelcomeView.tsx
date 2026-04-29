'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Typography, Box, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import useUser from '@auth/useUser';

// Palette: #112468 Deep navy | #1764C0 Royal blue | #0EA8B0 Ocean teal
//          #1DC98A Seafoam   | #2AE88E Mint green | #0D1A47 Midnight navy

const Root = styled(FusePageSimple)(() => ({
    '& .FusePageSimple-header': { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 },
    '& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
    '& .FusePageSimple-content': { overflow: 'visible !important', display: 'flex', flexDirection: 'column' },
    '& .FusePageSimple-rootWrapper': { overflow: 'visible !important' }
}));

const quickLinks = [
    {
        label: 'Lessons',
        description: 'Browse and listen to educational content',
        icon: 'heroicons-outline:academic-cap',
        url: '/content/lessons'
    },
    {
        label: 'Radio Emissions',
        description: 'Emissions, episodes and reportages',
        icon: 'heroicons-outline:radio',
        url: '/content/radio/emissions'
    },
    {
        label: 'Podcast',
        description: 'Discover podcast episodes',
        icon: 'heroicons-outline:microphone',
        url: '/content/podcast/courses'
    },
    {
        label: 'Radio Episodes',
        description: 'Browse all radio episodes',
        icon: 'heroicons-outline:play',
        url: '/content/radio/episodes'
    },
    {
        label: 'Radio Reportages',
        description: 'In-depth radio reporting',
        icon: 'heroicons-outline:document-text',
        url: '/content/radio/reportages'
    }
];

function Greeting({ name }: { name: string }) {
    const hour = new Date().getHours();
    const salutation = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return (
        <>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{salutation}, </span>
            <span style={{ color: '#fff' }}>{name || 'there'}</span>
        </>
    );
}

function LiveClock() {
    const [time, setTime] = useState('');
    useEffect(() => {
        const update = () =>
            setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);
    return (
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }}>
            {time}
        </Typography>
    );
}

function QuickLinkCard({ link, delay }: { link: (typeof quickLinks)[0]; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay, duration: 0.4 } }}
            style={{ height: '100%' }}
        >
            <Paper
                component={Link}
                to={link.url}
                elevation={0}
                sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    height: '100%',
                    textDecoration: 'none',
                    position: 'relative',
                    border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(14,168,176,0.25)'
                        : '1px solid rgba(14,168,176,0.22)',
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, #0D1A47 0%, #112468 100%)'
                        : 'linear-gradient(145deg, #112468 0%, #1764C0 100%)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 0 0 1px rgba(14,168,176,0.1), 0 4px 24px rgba(13,26,71,0.4)'
                        : '0 0 0 1px rgba(14,168,176,0.1), 0 4px 20px rgba(17,36,104,0.3)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: 'rgba(14,168,176,0.5)',
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 0 0 1px rgba(14,168,176,0.22), 0 8px 40px rgba(14,168,176,0.3)'
                            : '0 0 0 1px rgba(14,168,176,0.22), 0 8px 40px rgba(14,168,176,0.35)'
                    }
                })}
            >
                {/* Top accent bar */}
                <div style={{ height: 3, width: '100%', background: 'linear-gradient(90deg, #0EA8B0, #1DC98A)', flexShrink: 0 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, flex: 1, position: 'relative', zIndex: 1 }}>
                    <Box sx={{
                        width: 46, height: 46, borderRadius: '12px',
                        background: 'rgba(14,168,176,0.18)',
                        border: '1px solid rgba(14,168,176,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 12px rgba(14,168,176,0.25)'
                    }}>
                        <FuseSvgIcon sx={{ color: '#0EA8B0' }} size={22}>{link.icon}</FuseSvgIcon>
                    </Box>

                    <div>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', color: '#ffffff' }}>
                            {link.label}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', mt: 0.5, lineHeight: 1.5 }}>
                            {link.description}
                        </Typography>
                    </div>

                    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(14,168,176,0.45), transparent)' }} />

                    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0EA8B0' }}>Open</Typography>
                        <FuseSvgIcon size={14} sx={{ color: '#0EA8B0' }}>lucide:arrow-right</FuseSvgIcon>
                    </Box>
                </Box>
            </Paper>
        </motion.div>
    );
}

export default function WelcomeView() {
    const { data: user, isGuest } = useUser();
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const el = document.querySelector('.FusePageSimple-content') as HTMLElement | null;
        const target = el ?? window;
        const FADE_START = 20;
        const FADE_END = 180;
        const onScroll = () => {
            const top = el ? el.scrollTop : window.scrollY;
            const p = Math.min(Math.max((top - FADE_START) / (FADE_END - FADE_START), 0), 1);
            setScrollProgress(p);
        };
        target.addEventListener('scroll', onScroll, { passive: true });
        return () => target.removeEventListener('scroll', onScroll);
    }, []);

    const displayName = useMemo(() => {
        if (isGuest || !user) return '';
        return (user as any)?.displayName || (user as any)?.email?.split('@')[0] || '';
    }, [user, isGuest]);

    const today = useMemo(
        () => new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }),
        []
    );

    return (
        <Root
            scroll="page"
            header={
                <div style={{
                    position: 'relative', width: '100%', overflow: 'hidden',
                    background: 'linear-gradient(135deg, #0D1A47 0%, #112468 40%, #0EA8B0 80%, #1DC98A 100%)',
                    paddingTop: '56px', paddingBottom: '64px',
                    opacity: 1 - scrollProgress,
                    transform: `translateY(${-(scrollProgress * 24)}px)`,
                    willChange: 'opacity, transform'
                }}>
                    {/* Grid overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(29,201,138,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(29,201,138,0.06) 1px, transparent 1px)',
                        backgroundSize: '52px 52px', pointerEvents: 'none'
                    }} />
                    {/* Radial glow — left */}
                    <div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,168,176,0.22) 0%, transparent 65%)', pointerEvents: 'none' }} />
                    {/* Mint orb — right */}
                    <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(42,232,142,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, paddingLeft: '48px', paddingRight: '48px', maxWidth: '800px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}
                        >
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '4px 14px', borderRadius: '999px',
                                border: '1px solid rgba(14,168,176,0.35)',
                                backgroundColor: 'rgba(14,168,176,0.12)'
                            }}>
                                <FuseSvgIcon size={13} sx={{ color: 'rgba(14,168,176,0.75)' }}>lucide:radio</FuseSvgIcon>
                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(14,168,176,0.85)', letterSpacing: '0.06em' }}>
                                    Platform
                                </Typography>
                            </div>
                            <LiveClock />
                            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', ml: 'auto' }}>
                                {today}
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.08, duration: 0.55 } }}
                        >
                            <Typography component="h1" sx={{
                                fontSize: { xs: '2rem', md: '3rem', lg: '3.5rem' },
                                fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.03em',
                                mb: 2, textShadow: '0 2px 32px rgba(0,0,0,0.45)'
                            }}>
                                <Greeting name={displayName} />
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.45 } }}
                        >
                            <Typography sx={{
                                fontSize: { xs: '0.95rem', md: '1.05rem' },
                                color: 'rgba(42,232,142,0.72)', maxWidth: 520, lineHeight: 1.75, mb: 4
                            }}>
                                Welcome to EDUVOICE.
                            </Typography>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.28, duration: 0.4 } }}
                            style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                        >
                            <Button
                                component={Link}
                                to="/content/lessons"
                                variant="contained"
                                size="medium"
                                startIcon={<FuseSvgIcon size={16}>heroicons-outline:academic-cap</FuseSvgIcon>}
                                sx={{
                                    background: 'linear-gradient(135deg, #0EA8B0, #1DC98A)',
                                    color: '#0D1A47', fontWeight: 700, textTransform: 'none',
                                    borderRadius: '10px', px: 3,
                                    boxShadow: '0 0 16px rgba(14,168,176,0.5)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1DC98A, #0EA8B0)',
                                        boxShadow: '0 0 24px rgba(14,168,176,0.65)',
                                        transform: 'scale(1.03)'
                                    }
                                }}
                            >
                                Browse Lessons
                            </Button>
                        </motion.div>
                    </div>
                </div>
            }
            content={
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Box sx={{ p: { xs: 3, md: 6 }, flex: 1 }}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.35 } }}>
                            <Typography sx={{
                                fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em',
                                textTransform: 'uppercase', color: 'text.disabled', mb: 3
                            }}>
                                Quick access
                            </Typography>
                        </motion.div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                            {quickLinks.map((link, i) => (
                                <QuickLinkCard key={link.url} link={link} delay={0.4 + i * 0.06} />
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { delay: 0.85 } }}
                            style={{ marginTop: 48, textAlign: 'center' }}
                        >
                            <Typography sx={{ fontSize: '0.78rem', color: 'text.disabled' }}>
                                EcoCloud Media Platform &mdash; All rights reserved
                            </Typography>
                        </motion.div>
                    </Box>
                </div>
            }
        />
    );
}