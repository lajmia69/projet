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
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import { styled } from '@mui/material/styles';
import useUser from '@auth/useUser';
import { useSearchEpisodes, useEmissionTypes, useSeasons } from '../../api/hooks/Radiohooks';
import { Episode, SearchEpisodes } from '../../api/types';
import DurationDisplay from '../ui/Durationdisplay';

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

function EpisodeCard({ episode }: { episode: Episode }) {
	return (
		<Card
			sx={(theme) => ({
				display: 'flex', flexDirection: 'column', borderRadius: '18px', overflow: 'hidden',
				height: '100%', position: 'relative',
				border: theme.palette.mode === 'dark' ? '1px solid rgba(99,202,183,0.18)' : '1px solid rgba(20,184,166,0.18)',
				background: theme.palette.mode === 'dark'
					? 'linear-gradient(145deg, rgba(5,15,14,0.98) 0%, rgba(5,25,22,0.98) 100%)'
					: 'linear-gradient(145deg, #ffffff 0%, #f0fdfb 100%)',
				boxShadow: theme.palette.mode === 'dark'
					? '0 0 0 1px rgba(99,202,183,0.08), 0 4px 24px rgba(20,184,166,0.1)'
					: '0 0 0 1px rgba(20,184,166,0.07), 0 4px 20px rgba(20,184,166,0.07)',
				transition: 'transform 0.25s ease, box-shadow 0.25s ease',
				'&:hover': {
					transform: 'translateY(-5px)',
					borderColor: theme.palette.mode === 'dark' ? 'rgba(99,202,183,0.4)' : 'rgba(20,184,166,0.4)',
					boxShadow: theme.palette.mode === 'dark'
						? '0 0 0 1px rgba(99,202,183,0.2), 0 8px 40px rgba(20,184,166,0.25)'
						: '0 0 0 1px rgba(20,184,166,0.18), 0 8px 40px rgba(20,184,166,0.18)',
				},
			})}
		>
			<div style={{ height: 3, width: '100%', background: 'linear-gradient(90deg, #0d9488, #14b8a6, #5eead4)' }} />
			<div className="flex flex-col flex-1 p-5 gap-3" style={{ position: 'relative', zIndex: 1 }}>

				{/* Type + Season chips */}
				<div className="flex flex-wrap gap-1.5">
					{episode.emission_type?.name && (
						<Chip label={episode.emission_type.name} size="small" sx={(theme) => ({
							fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', height: 20,
							color: theme.palette.mode === 'dark' ? '#5eead4' : '#134e4a',
							backgroundColor: theme.palette.mode === 'dark' ? 'rgba(20,184,166,0.18)' : 'rgba(20,184,166,0.12)',
							border: '1px solid rgba(20,184,166,0.3)',
						})} />
					)}
					{episode.season?.name && (
						<Chip label={episode.season.name} size="small" sx={(theme) => ({
							fontSize: '0.68rem', fontWeight: 600, height: 20,
							color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
							backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
							border: '1px solid rgba(0,0,0,0.08)',
						})} />
					)}
					{episode.episode_number != null && (
						<Chip label={`Ep. ${episode.episode_number}`} size="small" sx={(theme) => ({
							fontSize: '0.68rem', fontWeight: 700, height: 20,
							color: theme.palette.mode === 'dark' ? '#5eead4' : '#0f766e',
							backgroundColor: theme.palette.mode === 'dark' ? 'rgba(20,184,166,0.12)' : 'rgba(20,184,166,0.08)',
							border: '1px solid rgba(20,184,166,0.25)',
						})} />
					)}
				</div>

				{/* Title */}
				<Typography className="font-semibold line-clamp-2 leading-snug"
					dir={episode.transcription?.language_orientation}
					sx={(theme) => ({ fontSize: '0.975rem', color: theme.palette.mode === 'dark' ? '#ccfbf1' : '#0f1a19', lineHeight: 1.45 })}>
					{episode.name}
				</Typography>

				{episode.transcription?.author && (
					<Typography className="line-clamp-1" dir={episode.transcription?.language_orientation}
						sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: '0.82rem' })}>
						{episode.transcription.author}
					</Typography>
				)}

				<div className="flex-1" />
				<div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.3), transparent)' }} />

				{/* Meta */}
				<div className="flex items-center gap-3 flex-wrap">
					{(episode.streaming_version?.duration || episode.hd_version?.duration) && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={12} sx={{ color: '#14b8a6' }}>lucide:clock</FuseSvgIcon>
							<Typography className="text-xs font-medium" sx={{ color: '#14b8a6' }}>
								<DurationDisplay isoDuration={episode.streaming_version?.duration || episode.hd_version?.duration} format="short" />
							</Typography>
						</div>
					)}
					{episode.language?.name && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={12} sx={(t) => ({ color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' })}>lucide:globe</FuseSvgIcon>
							<Typography className="text-xs" sx={(t) => ({ color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' })}>
								{episode.language.name}
							</Typography>
						</div>
					)}
					{episode.is_published && (
						<Chip label="On Air" size="small" sx={(t) => ({
							ml: 'auto', height: 18, fontSize: '0.65rem', fontWeight: 700,
							color: t.palette.mode === 'dark' ? '#5eead4' : '#134e4a',
							backgroundColor: t.palette.mode === 'dark' ? 'rgba(20,184,166,0.12)' : 'rgba(20,184,166,0.15)',
							border: '1px solid rgba(20,184,166,0.35)',
						})} />
					)}
				</div>

				{/* Creator + CTA */}
				<div className="flex items-center justify-between gap-2 pt-0.5">
					{episode.created_by?.full_name && (
						<div className="flex items-center gap-1.5 min-w-0">
							<FuseSvgIcon size={13} sx={(t) => ({ color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', flexShrink: 0 })}>lucide:mic-2</FuseSvgIcon>
							<Typography className="text-xs truncate" sx={(t) => ({ fontWeight: 500, color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' })}>
								{episode.created_by.full_name}
							</Typography>
						</div>
					)}
					<Button component={Link} to={`/content/radio/episodes/${episode.id}`} size="small" variant="contained"
						sx={(t) => ({
							borderRadius: '9px', fontSize: '0.73rem', fontWeight: 700, textTransform: 'none',
							paddingX: '14px', paddingY: '5px', flexShrink: 0, minWidth: 'unset',
							background: 'linear-gradient(135deg, #0d9488, #14b8a6)', color: '#fff',
							boxShadow: t.palette.mode === 'dark' ? '0 0 14px rgba(20,184,166,0.45)' : '0 0 12px rgba(20,184,166,0.3)',
							'&:hover': { background: 'linear-gradient(135deg, #0f766e, #0d9488)', transform: 'scale(1.04)' },
						})}
						endIcon={<FuseSvgIcon size={13}>{episode.transcription?.language_orientation === 'rtl' ? 'lucide:arrow-left' : 'lucide:arrow-right'}</FuseSvgIcon>}>
						Listen
					</Button>
				</div>
			</div>
		</Card>
	);
}

function EpisodesView() {
	const { data: account } = useUser();
	const searchParams: SearchEpisodes = { limit: 50, offset: 0 };

	const { data: episodes, isLoading } = useSearchEpisodes(account?.id, account?.token?.access, searchParams);
	const { data: emissionTypes } = useEmissionTypes(account?.id, account?.token?.access);
	const { data: seasons } = useSeasons(account?.id, account?.token?.access);

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
					background: 'linear-gradient(160deg, #0a1512 0%, #082b25 50%, #071a16 100%)',
					paddingTop: '56px', paddingBottom: '64px',
					opacity: 1 - progress, transform: `translateY(${-(progress * 24)}px)`,
					pointerEvents: 'none', willChange: 'opacity, transform',
				}}>
					<div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(20,184,166,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.045) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
					<div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 65%)' }} />
					<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
							<Typography component="h1" sx={{ fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' }, fontWeight: 800, color: '#ccfbf1', textShadow: '0 2px 32px rgba(0,0,0,0.55)' }}>
								Radio Episodes
							</Typography>
						</motion.div>
						<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
							<Typography sx={{ fontSize: '0.975rem', color: 'rgba(153,246,228,0.65)', lineHeight: 1.75 }}>
								Browse all radio episodes — one story at a time.
							</Typography>
						</motion.div>
						{episodes?.count != null && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.24, duration: 0.4 } }} className="mt-5">
								<div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '999px', border: '1px solid rgba(20,184,166,0.25)', backgroundColor: 'rgba(20,184,166,0.08)' }}>
									<FuseSvgIcon size={13} sx={{ color: 'rgba(153,246,228,0.55)' }}>lucide:mic-2</FuseSvgIcon>
									<Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: 'rgba(153,246,228,0.6)' }}>
										{episodes.count} episodes available
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
									<EpisodeCard episode={episode} />
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