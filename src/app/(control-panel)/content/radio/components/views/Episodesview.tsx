'use client';
import _ from 'lodash';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
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
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
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
import DurationDisplay from '../ui/Durationdisplay';

// Palette: #112468 Deep navy | #1764C0 Royal blue | #0EA8B0 Ocean teal
//          #1DC98A Seafoam   | #2AE88E Mint green | #0D1A47 Midnight navy

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
				sx={(theme) => ({
					display: 'flex', flexDirection: 'column', borderRadius: '18px', overflow: 'hidden',
					height: '100%', position: 'relative',
					border: theme.palette.mode === 'dark' ? '1px solid rgba(29,201,138,0.22)' : '1px solid rgba(29,201,138,0.2)',
					background: theme.palette.mode === 'dark'
						? 'linear-gradient(145deg, #0D1A47 0%, #112468 100%)'
						: 'linear-gradient(145deg, #112468 0%, #1764C0 100%)',
					boxShadow: theme.palette.mode === 'dark'
						? '0 0 0 1px rgba(29,201,138,0.1), 0 4px 24px rgba(13,26,71,0.4)'
						: '0 0 0 1px rgba(29,201,138,0.08), 0 4px 20px rgba(17,36,104,0.3)',
					transition: 'transform 0.25s ease, box-shadow 0.25s ease',
					'&:hover': {
						transform: 'translateY(-5px)',
						borderColor: theme.palette.mode === 'dark' ? 'rgba(42,232,142,0.45)' : 'rgba(29,201,138,0.5)',
						boxShadow: theme.palette.mode === 'dark'
							? '0 0 0 1px rgba(42,232,142,0.2), 0 8px 40px rgba(29,201,138,0.3)'
							: '0 0 0 1px rgba(29,201,138,0.22), 0 8px 40px rgba(17,36,104,0.45)',
					},
				})}
			>
				{/* Top accent bar — Seafoam → Mint */}
				<div style={{ height: 3, width: '100%', background: 'linear-gradient(90deg, #1DC98A, #2AE88E)' }} />

				<div className="flex flex-col flex-1 p-5 gap-3" style={{ position: 'relative', zIndex: 1 }}>
					{/* Chips */}
					<div className="flex flex-wrap gap-1.5 pr-10">
						{episode.emission_type?.name && (
							<Chip
								label={episode.emission_type.name}
								size="small"
								sx={() => ({
									fontSize: '0.72rem',
									fontWeight: 700,
									letterSpacing: '0.04em',
									textTransform: 'uppercase',
									height: 22,
									color: '#fff',
									backgroundColor: 'rgba(42,232,142,0.18)',
									border: '1px solid rgba(42,232,142,0.4)',
									boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
									'& .MuiChip-label': { color: '#fff' }
								})}
							/>
						)}
						{episode.season?.name && (
							<Chip label={episode.season.name} size="small" sx={() => ({
								fontSize: '0.68rem', fontWeight: 600, height: 20,
								color: 'rgba(255,255,255,0.55)',
								backgroundColor: 'rgba(255,255,255,0.08)',
								border: '1px solid rgba(255,255,255,0.14)',
							})} />
						)}
						{episode.episode_number != null && (
							<Chip label={`Ep. ${episode.episode_number}`} size="small" sx={() => ({
								fontSize: '0.68rem', fontWeight: 700, height: 20,
								color: '#2AE88E',
								backgroundColor: 'rgba(42,232,142,0.12)',
								border: '1px solid rgba(42,232,142,0.3)',
							})} />
						)}
					</div>

					{/* Title */}
					<Typography className="font-semibold line-clamp-2 leading-snug"
						dir={episode.transcription?.language_orientation}
						sx={() => ({ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 })}>
						{episode.name}
					</Typography>

					{episode.transcription?.author && (
						<Typography className="line-clamp-1" dir={episode.transcription?.language_orientation}
							sx={() => ({ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem' })}>
							{episode.transcription.author}
						</Typography>
					)}

					<div className="flex-1" />
					<div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(42,232,142,0.4), transparent)' }} />

					{/* Meta */}
					<div className="flex items-center gap-3 flex-wrap">
						{(episode.streaming_version?.duration || episode.hd_version?.duration) && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={{ color: '#1DC98A' }}>lucide:clock</FuseSvgIcon>
								<Typography className="text-xs font-medium" sx={{ color: '#1DC98A' }}>
									<DurationDisplay isoDuration={episode.streaming_version?.duration || episode.hd_version?.duration} format="short" />
								</Typography>
							</div>
						)}
						{episode.language?.name && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={{ color: 'rgba(255,255,255,0.4)' }}>lucide:globe</FuseSvgIcon>
								<Typography className="text-xs" sx={{ color: 'rgba(255,255,255,0.45)' }}>
									{episode.language.name}
								</Typography>
							</div>
						)}
						{episode.is_published && (
							<Chip label="On Air" size="small" sx={() => ({
								ml: 'auto', height: 18, fontSize: '0.65rem', fontWeight: 700,
								color: '#fff',
								backgroundColor: 'rgba(29,201,138,0.35)',
								border: '1px solid rgba(42,232,142,0.55)',
							})} />
						)}
					</div>

					{/* Creator + CTA */}
					<div className="flex items-center justify-between gap-2 pt-0.5">
						{episode.created_by?.full_name && (
							<div className="flex items-center gap-1.5 min-w-0">
								<FuseSvgIcon size={13} sx={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>lucide:mic-2</FuseSvgIcon>
								<Typography className="text-xs truncate" sx={{ fontWeight: 500, color: 'rgba(255,255,255,0.38)' }}>
									{episode.created_by.full_name}
								</Typography>
							</div>
						)}
						<Button component={Link} to={`/content/radio/episodes/${episode.id}`} size="small" variant="contained"
							sx={() => ({
								borderRadius: '9px', fontSize: '0.73rem', fontWeight: 700, textTransform: 'none',
								paddingX: '14px', paddingY: '5px', flexShrink: 0, minWidth: 'unset',
								background: 'linear-gradient(135deg, #1DC98A, #2AE88E)', color: '#0D1A47',
								boxShadow: '0 0 14px rgba(29,201,138,0.45)',
								'&:hover': { background: 'linear-gradient(135deg, #2AE88E, #1DC98A)', transform: 'scale(1.04)', boxShadow: '0 0 20px rgba(42,232,142,0.55)' },
							})}
							endIcon={<FuseSvgIcon size={13}>{episode.transcription?.language_orientation === 'rtl' ? 'lucide:arrow-left' : 'lucide:arrow-right'}</FuseSvgIcon>}>
							Listen
						</Button>
					</div>
				</div>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: 320 } }}>
				<DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
					Delete episode?
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ fontSize: '0.875rem' }}>
						<strong>{episode.name}</strong> will be permanently removed. This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined" size="small" sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 600 }}>
						Cancel
					</Button>
					<Button
						onClick={() => { onDelete(episode.id); setConfirmOpen(false); }}
						variant="contained" color="error" size="small"
						sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 600 }}
					>
						Delete
					</Button>
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
					background: 'linear-gradient(135deg, #0D1A47 0%, #112468 40%, #0EA8B0 80%, #1DC98A 100%)',
					paddingTop: '56px', paddingBottom: '64px',
					opacity: 1 - progress, transform: `translateY(${-(progress * 24)}px)`,
					pointerEvents: 'none', willChange: 'opacity, transform',
				}}>
					{/* Grid overlay */}
					<div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(29,201,138,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(29,201,138,0.06) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
					{/* Radial glow — navy left */}
					<div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(23,100,192,0.22) 0%, transparent 65%)' }} />
					{/* Mint accent orb — right */}
					<div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(42,232,142,0.18) 0%, transparent 65%)' }} />
					<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
							<Typography component="h1" sx={{ fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' }, fontWeight: 800, color: '#e8fff5', textShadow: '0 2px 32px rgba(0,0,0,0.55)' }}>
								Radio Episodes
							</Typography>
						</motion.div>
						<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
							<Typography sx={{ fontSize: '0.975rem', color: 'rgba(42,232,142,0.72)', lineHeight: 1.75 }}>
								Browse all radio episodes — one story at a time.
							</Typography>
						</motion.div>
						{episodes?.count != null && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.24, duration: 0.4 } }} className="mt-5">
								<div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '999px', border: '1px solid rgba(42,232,142,0.3)', backgroundColor: 'rgba(42,232,142,0.1)' }}>
									<FuseSvgIcon size={13} sx={{ color: 'rgba(42,232,142,0.65)' }}>lucide:mic-2</FuseSvgIcon>
									<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(42,232,142,0.75)' }}>
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
									<EpisodeCard
										episode={episode}
										onDelete={(id) => deleteEpisode(id)}
									/>
								</motion.div>
							))}
						</motion.div>
					) : (
						<div className="flex flex-1 items-center justify-center py-20">
							<div className="flex flex-col items-center gap-3">
								<FuseSvgIcon size={40} sx={{ color: 'text.disabled' }}>lucide:search-x</FuseSvgIcon>
								<Typography color="text.secondary" className="text-xl font-medium">No episodes found</Typography>
								<Typography color="text.disabled" className="text-sm">Try adjusting your filters</Typography>
							</div>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default EpisodesView;