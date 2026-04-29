'use client';
import _ from 'lodash';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { TOP_BAR_GRADIENT, CARD_BG_LIGHT, CTA_GRADIENT, CHIP_TEAL_BG, CHIP_TEAL_COLOR, ON_AIR_BG } from '@/app/(control-panel)/design/palette';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import { styled } from '@mui/material/styles';
import useUser from '@auth/useUser';
import { useSearchEpisodes, useEmissionTypes, useSeasons, useDeleteEpisode } from '../../api/hooks/Radiohooks';
import { Episode, SearchEpisodes } from '../../api/types';
import DurationDisplay from '../ui/DurationDisplay';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 },
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' }
}));

const cardContainer = { show: { transition: { staggerChildren: 0.05 } } };
const cardItem = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const FADE_START = 20;
const FADE_END = 180;

function EpisodeCard({ episode, onDelete }: { episode: Episode; onDelete: (id: number) => void }) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<>
                <Card
				sx={{
					display: 'flex', flexDirection: 'column', borderRadius: '18px', overflow: 'hidden',
					height: '100%', position: 'relative',
					border: '1px solid rgba(45,139,124,0.18)',
                    background: CARD_BG_LIGHT,
					boxShadow: '0 2px 12px rgba(26,46,56,0.08)',
					transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
					'&:hover': {
						transform: 'translateY(-5px)',
						borderColor: 'rgba(45,139,124,0.4)',
						boxShadow: '0 8px 32px rgba(45,139,124,0.2)',
					},
				}}
			>
				{/* Top accent bar */}
                <div style={{ height: 6, width: '100%', background: TOP_BAR_GRADIENT }} />

				<div className="flex flex-col flex-1 p-5 gap-3" style={{ position: 'relative', zIndex: 1 }}>
					{/* Chips */}
					<div className="flex flex-wrap gap-1.5">
                        {episode.emission_type?.name && (
                            <Chip
                                label={episode.emission_type.name}
                                size="small"
                                sx={{
                                    fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
                                    textTransform: 'uppercase', height: 22,
                                    color: CHIP_TEAL_COLOR,
                                    backgroundColor: CHIP_TEAL_BG,
                                    border: '1px solid rgba(45,139,124,0.35)',
                                    maxWidth: 140,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    '& .MuiChip-label': { color: CHIP_TEAL_COLOR },
                                }}
                            />
                        )}
							{episode.season?.name && (
								<Chip 
    label={episode.season.name} 
    size="small" 
    sx={{
        fontSize: '0.72rem', 
        fontWeight: 700, 
        textTransform: 'uppercase', 
        height: 22,
        color: CHIP_TEAL_COLOR,
        backgroundColor: CHIP_TEAL_BG,
        border: '1px solid rgba(45,139,124,0.35)',
        '& .MuiChip-label': { color: CHIP_TEAL_COLOR },
    }}
/>
							)}
						{episode.episode_number != null && (
							<Chip label={`Ep. ${episode.episode_number}`} size="small" sx={{
								fontSize: '0.68rem', fontWeight: 700, height: 20,
								color: '#1C4A52',
								backgroundColor: 'rgba(45,139,124,0.12)',
								border: '1px solid rgba(45,139,124,0.3)',
							}} />
						)}
					</div>

					{/* Title */}
					<Typography className="font-semibold line-clamp-2 leading-snug"
						dir={episode.transcription?.language_orientation}
						sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#1A2E38', lineHeight: 1.25 }}>
						{episode.name}
					</Typography>

					{episode.transcription?.author && (
						<Typography className="line-clamp-1" dir={episode.transcription?.language_orientation}
							sx={{ color: 'rgba(26,46,56,0.55)', fontSize: '0.82rem' }}>
							{episode.transcription.author}
						</Typography>
					)}

					<div className="flex-1" />
					<div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(45,139,124,0.35), transparent)' }} />

					{/* Meta */}
					<div className="flex items-center gap-3 flex-wrap">
						{(episode.streaming_version?.duration || episode.hd_version?.duration) && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={{ color: '#2D8B7C' }}>lucide:clock</FuseSvgIcon>
								<Typography className="text-xs font-medium" sx={{ color: '#2D8B7C' }}>
									<DurationDisplay isoDuration={episode.streaming_version?.duration || episode.hd_version?.duration} format="short" />
								</Typography>
							</div>
						)}
						{episode.language?.name && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={{ color: 'rgba(26,46,56,0.35)' }}>lucide:globe</FuseSvgIcon>
								<Typography className="text-xs" sx={{ fontWeight: 500, color: 'rgba(26,46,56,0.45)' }}>
									{episode.language.name}
								</Typography>
							</div>
						)}
						{episode.is_published && (
							<Typography className="text-xs ml-auto" sx={{
								fontWeight: 700, paddingX: '7px', paddingY: '2px', borderRadius: '6px',
								color: '#1C4A52', background: 'rgba(45,139,124,0.12)', border: '1px solid rgba(45,139,124,0.3)',
							}}>
								On Air
							</Typography>
						)}
					</div>

					{/* Creator + CTA */}
					<div className="flex items-center justify-between gap-2 pt-0.5">
						{episode.created_by?.full_name && (
							<div className="flex items-center gap-1.5 min-w-0">
								<FuseSvgIcon size={13} sx={{ color: 'rgba(26,46,56,0.3)', flexShrink: 0 }}>lucide:mic-2</FuseSvgIcon>
								<Typography className="text-xs truncate" sx={{ fontWeight: 500, color: 'rgba(26,46,56,0.45)' }}>
									{episode.created_by.full_name}
								</Typography>
							</div>
						)}
                    <Button component={Link} to={`/content/radio/episodes/${episode.id}`} size="small" variant="contained"
                            sx={{
                                borderRadius: '9px', fontSize: '0.73rem', fontWeight: 700, textTransform: 'none',
                                paddingX: '14px', paddingY: '5px', flexShrink: 0, minWidth: 'unset', letterSpacing: '0.02em',
                                background: CTA_GRADIENT, color: '#E8E4DA',
                                boxShadow: '0 0 14px rgba(45,139,124,0.35)',
                                transition: 'box-shadow 0.2s ease, transform 0.15s ease',
                                '&:hover': { background: 'linear-gradient(135deg, #2D8B7C, #1A2E38)', boxShadow: '0 0 20px rgba(45,139,124,0.5)', transform: 'scale(1.04)' },
                            }}
							endIcon={<FuseSvgIcon size={13}>{episode.transcription?.language_orientation === 'rtl' ? 'lucide:arrow-left' : 'lucide:arrow-right'}</FuseSvgIcon>}>
							Listen
						</Button>
					</div>
				</div>
			</Card>

			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: 320 } }}>
				<DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>Delete episode?</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ fontSize: '0.875rem' }}>
						<strong>{episode.name}</strong> will be permanently removed. This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined" size="small" sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
					<Button onClick={() => { onDelete(episode.id); setConfirmOpen(false); }} variant="contained" color="error" size="small" sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 600 }}>Delete</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

function EpisodesView() {
	const { data: account } = useUser();
	const searchParams: SearchEpisodes = { limit: 50, offset: 0 };

	const { data: episodes, isLoading } = useSearchEpisodes(account?.id, account?.token?.access, searchParams);
	const { data: emissionTypes } = useEmissionTypes(account?.id, account?.token?.access);
	const { data: seasons } = useSeasons(account?.id, account?.token?.access);
	const { mutate: deleteEpisode } = useDeleteEpisode(account?.id, account?.token?.access);

	const [searchText, setSearchText] = useState('');
	const [selectedType, setSelectedType] = useState('all');
	const [selectedSeason, setSelectedSeason] = useState('all');
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const onScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const progress = Math.min(1, Math.max(0, (scrollY - FADE_START) / (FADE_END - FADE_START)));

	const filteredData = useMemo(() => {
		if (!episodes?.items) return [];
		return episodes.items.filter((e) => {
			const matchSearch = e.name?.toLowerCase().includes(searchText.toLowerCase());
			const matchType = selectedType === 'all' || String(e.emission_type?.id) === selectedType;
			const matchSeason = selectedSeason === 'all' || String(e.season?.id) === selectedSeason;
			return matchSearch && matchType && matchSeason;
		});
	}, [episodes, searchText, selectedType, selectedSeason]);

	if (isLoading) return <FuseLoading />;

	return (
		<Root
			scroll="page"
			header={
				<div style={{
					position: 'relative', width: '100%', overflow: 'hidden',
					background: 'linear-gradient(135deg, #1A2E38 0%, #2D8B7C 100%)',
					paddingTop: '56px', paddingBottom: '64px',
					opacity: 1 - progress, transform: `translateY(${-(progress * 24)}px)`,
					pointerEvents: 'none', willChange: 'opacity, transform',
				}}>
					<div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(232,228,218,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(232,228,218,0.06) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
					<div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,139,124,0.22) 0%, transparent 65%)' }} />
					<div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,228,218,0.18) 0%, transparent 65%)' }} />

					<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
							<Typography component="h1" sx={{ fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' }, fontWeight: 800, color: '#E8E4DA', textShadow: '0 2px 32px rgba(0,0,0,0.55)' }}>
								Radio Episodes
							</Typography>
						</motion.div>
						<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
							<Typography sx={{ fontSize: { xs: '0.875rem', sm: '0.975rem' }, color: 'rgba(232,228,218,0.72)', lineHeight: 1.75 }}>
								Browse all radio episodes — one story at a time.
							</Typography>
						</motion.div>
						{episodes?.count != null && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.24, duration: 0.4 } }} className="mt-5">
								<div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '999px', border: '1px solid rgba(45,139,124,0.35)', backgroundColor: 'rgba(45,139,124,0.12)' }}>
									<FuseSvgIcon size={13} sx={{ color: 'rgba(45,139,124,0.75)' }}>lucide:mic-2</FuseSvgIcon>
									<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(45,139,124,0.85)' }}>
										{episodes.count} episode{episodes.count !== 1 ? 's' : ''}
									</Typography>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4 pt-6">
					<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="flex w-full flex-wrap items-center gap-2 mb-6">

						<FormControl size="small" sx={{ minWidth: 140 }} variant="outlined">
							<InputLabel>Type</InputLabel>
							<Select value={selectedType} label="Type" onChange={(e: SelectChangeEvent) => setSelectedType(e.target.value)} sx={{ borderRadius: '10px' }}>
								<MenuItem value="all"><em>All</em></MenuItem>
								{emissionTypes?.items.map((t) => <MenuItem value={String(t.id)} key={t.id}>{t.name}</MenuItem>)}
							</Select>
						</FormControl>

						<FormControl size="small" sx={{ minWidth: 140 }} variant="outlined">
							<InputLabel>Season</InputLabel>
							<Select value={selectedSeason} label="Season" onChange={(e: SelectChangeEvent) => setSelectedSeason(e.target.value)} sx={{ borderRadius: '10px' }}>
								<MenuItem value="all"><em>All</em></MenuItem>
								{seasons?.items.map((s) => <MenuItem value={String(s.id)} key={s.id}>{s.name}</MenuItem>)}
							</Select>
						</FormControl>

						<TextField size="small" placeholder="Search episodes…" value={searchText}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
							sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
							slotProps={{ input: { startAdornment: <InputAdornment position="start"><FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon></InputAdornment> } }}
						/>

						{filteredData.length > 0 && (
							<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
								{filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
							</Typography>
						)}
					</motion.div>

					{filteredData.length > 0 ? (
						<motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" variants={cardContainer} initial="hidden" animate="show">
							{filteredData.map((episode) => (
								<motion.div variants={cardItem} key={episode.id}>
									<EpisodeCard episode={episode} onDelete={(id) => deleteEpisode(id)} />
								</motion.div>
							))}
						</motion.div>
					) : (
						<div className="flex flex-1 items-center justify-center py-20">
							<div className="flex flex-col items-center gap-3">
								<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:search-x</FuseSvgIcon>
								<Typography color="text.secondary" variant="h6">No episodes found</Typography>
								<Typography color="text.disabled" variant="body2">Try adjusting your filters or search terms</Typography>
							</div>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default EpisodesView;
