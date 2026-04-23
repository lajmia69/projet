'use client';

import { ChangeEvent, useEffect, useState, useMemo } from 'react';
import {
	FormControl, MenuItem, Select, TextField, Typography, InputAdornment, InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'motion/react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Link from '@fuse/core/Link';
import { Podcast, SearchPodcasts } from '../../api/types';
import { useSearchPodcasts } from '../../api/hooks/Usesearchpodcasts';
import { usePodcastCategories } from '../../api/hooks/categories/Podcastcategoryhooks';
import useUser from '@auth/useUser';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': {
		background: 'transparent',
		border: 'none',
		boxShadow: 'none',
		padding: 0,
	},
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' },
}));

const cardContainer = { show: { transition: { staggerChildren: 0.05 } } };
const cardItem = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const FADE_START = 20;
const FADE_END = 180;

function PodcastCard({ podcast }: { podcast: Podcast }) {
	return (
		<Card
			sx={(theme) => ({
				display: 'flex',
				flexDirection: 'column',
				borderRadius: '18px',
				overflow: 'hidden',
				height: '100%',
				position: 'relative',
				border: theme.palette.mode === 'dark'
					? '1px solid rgba(168,85,247,0.18)'
					: '1px solid rgba(139,92,246,0.14)',
				background: theme.palette.mode === 'dark'
					? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(30,20,50,0.98) 100%)'
					: 'linear-gradient(145deg, #ffffff 0%, #f5f0ff 100%)',
				boxShadow: theme.palette.mode === 'dark'
					? '0 0 0 1px rgba(168,85,247,0.08), 0 4px 24px rgba(139,92,246,0.12), 0 1px 4px rgba(0,0,0,0.4)'
					: '0 0 0 1px rgba(139,92,246,0.06), 0 4px 20px rgba(139,92,246,0.08), 0 1px 4px rgba(0,0,0,0.04)',
				transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
				'&:hover': {
					transform: 'translateY(-5px)',
					borderColor: theme.palette.mode === 'dark' ? 'rgba(168,85,247,0.4)' : 'rgba(139,92,246,0.35)',
					boxShadow: theme.palette.mode === 'dark'
						? '0 0 0 1px rgba(168,85,247,0.2), 0 8px 40px rgba(139,92,246,0.28), 0 2px 8px rgba(0,0,0,0.4)'
						: '0 0 0 1px rgba(139,92,246,0.18), 0 8px 40px rgba(139,92,246,0.18), 0 2px 8px rgba(0,0,0,0.06)',
				},
				'&::before': {
					content: '""',
					position: 'absolute',
					top: '-30px',
					right: '-30px',
					width: '120px',
					height: '120px',
					borderRadius: '50%',
					background: theme.palette.mode === 'dark'
						? 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)'
						: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
					pointerEvents: 'none',
					zIndex: 0,
				},
			})}
		>
			<div style={{ height: 3, width: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #c4b5fd)', position: 'relative', zIndex: 1 }} />

			<div className="flex flex-col flex-1 p-5 gap-3" style={{ position: 'relative', zIndex: 1 }}>

				<div className="flex flex-wrap gap-1.5">
					{podcast.podcast_category?.name && (
						<Chip
							label={podcast.podcast_category.name}
							size="small"
							sx={(theme) => ({
								fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', height: 20,
								color: theme.palette.mode === 'dark' ? '#c4b5fd' : '#6d28d9',
								backgroundColor: theme.palette.mode === 'dark' ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.1)',
								border: theme.palette.mode === 'dark' ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(139,92,246,0.25)',
							})}
						/>
					)}
					{podcast.is_published && (
						<Chip label="Published" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
					)}
				</div>

				<Typography
					className="font-semibold line-clamp-2 leading-snug"
					sx={(theme) => ({ fontSize: '0.975rem', color: theme.palette.mode === 'dark' ? '#f0f0ff' : '#0f172a', lineHeight: 1.45 })}
				>
					{podcast.name}
				</Typography>

				{podcast.transcription?.author && (
					<Typography
						className="line-clamp-1"
						sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: '0.82rem' })}
					>
						{podcast.transcription.author as string}
					</Typography>
				)}

				<div className="flex-1" />

				<div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.25), transparent)' }} />

				<div className="flex items-center gap-3 flex-wrap">
					{podcast.language?.name && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={12} sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' })}>lucide:globe</FuseSvgIcon>
							<Typography className="text-xs" sx={(theme) => ({ fontWeight: 500, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' })}>
								{podcast.language.name}
							</Typography>
						</div>
					)}
					{(podcast.streaming_version?.duration || podcast.hd_version?.duration) && (
						<div className="flex items-center gap-1">
							<FuseSvgIcon size={12} sx={{ color: '#a78bfa' }}>lucide:clock</FuseSvgIcon>
							<Typography className="text-xs font-medium" sx={{ color: '#a78bfa' }}>
								{podcast.streaming_version?.duration || podcast.hd_version?.duration}
							</Typography>
						</div>
					)}
				</div>

				<div className="flex items-center justify-between gap-2 pt-0.5">
					{podcast.created_by?.full_name && (
						<div className="flex items-center gap-1.5 min-w-0">
							<FuseSvgIcon size={13} sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', flexShrink: 0 })}>
								lucide:mic
							</FuseSvgIcon>
							<Typography className="text-xs truncate" sx={(theme) => ({ fontWeight: 500, color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' })}>
								{podcast.created_by.full_name}
							</Typography>
						</div>
					)}
					<Button
						component={Link}
						to={`/podcasts/${podcast.id}`}
						size="small"
						variant="contained"
						sx={(theme) => ({
							borderRadius: '9px', fontSize: '0.73rem', fontWeight: 700, textTransform: 'none',
							paddingX: '14px', paddingY: '5px', flexShrink: 0, minWidth: 'unset', letterSpacing: '0.02em',
							background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: '#fff',
							boxShadow: theme.palette.mode === 'dark' ? '0 0 14px rgba(139,92,246,0.5), 0 2px 6px rgba(0,0,0,0.3)' : '0 0 12px rgba(139,92,246,0.35), 0 2px 6px rgba(124,58,237,0.25)',
							transition: 'box-shadow 0.2s ease, transform 0.15s ease',
							'&:hover': {
								background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
								boxShadow: theme.palette.mode === 'dark' ? '0 0 24px rgba(139,92,246,0.7), 0 4px 10px rgba(0,0,0,0.3)' : '0 0 22px rgba(139,92,246,0.55), 0 4px 10px rgba(124,58,237,0.3)',
								transform: 'scale(1.04)',
							},
						})}
						endIcon={<FuseSvgIcon size={13}>lucide:arrow-right</FuseSvgIcon>}
					>
						Listen
					</Button>
				</div>
			</div>
		</Card>
	);
}

function PodcastsView() {
	const { data: account } = useUser();

	const { data: categories } = usePodcastCategories(account?.id, account?.token?.access);

	const searchParams: SearchPodcasts = { limit: 50, offset: 0 };
	const { data: podcasts, isLoading } = useSearchPodcasts(
		account?.id,
		account?.token?.access,
		searchParams
	);

	const [searchText, setSearchText] = useState('');
	const [filters, setFilters] = useState({ language: 'all', category: 'all' });
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const onScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const progress = Math.min(1, Math.max(0, (scrollY - FADE_START) / (FADE_END - FADE_START)));
	const heroOpacity = 1 - progress;
	const heroTranslateY = -(progress * 24);

	const filteredData = useMemo(() => {
		if (!podcasts?.items) return [];
		return podcasts.items.filter((podcast) => {
			const matchesSearch = podcast.name?.toLowerCase().includes(searchText.toLowerCase());
			const matchesLang = filters.language === 'all' || podcast.language?.name === filters.language;
			const matchesCategory = filters.category === 'all' || String(podcast.podcast_category?.id) === filters.category;
			return matchesSearch && matchesLang && matchesCategory;
		});
	}, [podcasts, searchText, filters]);

	const languages = useMemo(() => {
		if (!podcasts?.items) return [];
		const seen = new Set<string>();
		return podcasts.items
			.map(p => p.language)
			.filter(l => l && !seen.has(l.name) && seen.add(l.name));
	}, [podcasts]);

	const handleFilterChange = (field: keyof typeof filters, value: string) => {
		setFilters(prev => ({ ...prev, [field]: value }));
	};

	if (isLoading) return <FuseLoading />;

	return (
		<Root
			scroll="page"
			header={
				<div
					style={{
						position: 'relative',
						width: '100%',
						overflow: 'hidden',
						background: 'linear-gradient(160deg, #1a1030 0%, #231545 50%, #160f2a 100%)',
						paddingTop: '56px',
						paddingBottom: '64px',
						opacity: heroOpacity,
						transform: `translateY(${heroTranslateY}px)`,
						pointerEvents: 'none',
						willChange: 'opacity, transform',
					}}
				>
					<div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(168,85,247,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.045) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
					<div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)' }} />

					<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
							<Typography component="h1" sx={{ fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' }, fontWeight: 800, color: '#ede9fe', textShadow: '0 2px 32px rgba(0,0,0,0.45)' }}>
								What do you want to listen to?
							</Typography>
						</motion.div>
						<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
							<Typography sx={{ fontSize: { xs: '0.875rem', sm: '0.975rem' }, color: 'rgba(196,181,253,0.7)', lineHeight: 1.75 }}>
								Browse our podcasts — immersive audio, one episode at a time.
							</Typography>
						</motion.div>
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4 pt-6">
					<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="flex w-full flex-wrap items-center gap-2 mb-6">

						<FormControl size="small" sx={{ minWidth: 130 }} variant="outlined">
							<InputLabel>Language</InputLabel>
							<Select value={filters.language} label="Language" onChange={e => handleFilterChange('language', e.target.value)} sx={{ borderRadius: '10px' }}>
								<MenuItem value="all"><em>All</em></MenuItem>
								{languages.map(lang => <MenuItem value={lang.name} key={lang.id}>{lang.name}</MenuItem>)}
							</Select>
						</FormControl>

						<FormControl size="small" sx={{ minWidth: 130 }} variant="outlined">
							<InputLabel>Category</InputLabel>
							<Select value={filters.category} label="Category" onChange={e => handleFilterChange('category', e.target.value)} sx={{ borderRadius: '10px' }}>
								<MenuItem value="all"><em>All</em></MenuItem>
								{categories?.items.map(cat => <MenuItem value={String(cat.id)} key={cat.id}>{cat.name}</MenuItem>)}
							</Select>
						</FormControl>

						<TextField
							size="small"
							placeholder="Search podcasts…"
							value={searchText}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
							sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
							slotProps={{ input: { startAdornment: (<InputAdornment position="start"><FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon></InputAdornment>) } }}
						/>

						{filteredData.length > 0 && (
							<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
								{filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
							</Typography>
						)}
					</motion.div>

					{filteredData.length > 0 ? (
						<motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" variants={cardContainer} initial="hidden" animate="show">
							{filteredData.map(podcast => (
								<motion.div variants={cardItem} key={podcast.id}>
									<PodcastCard podcast={podcast} />
								</motion.div>
							))}
						</motion.div>
					) : (
						<div className="flex flex-1 items-center justify-center py-20">
							<div className="flex flex-col items-center gap-3">
								<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:search-x</FuseSvgIcon>
								<Typography color="text.secondary" variant="h6">No podcasts found</Typography>
								<Typography color="text.disabled" variant="body2">Try adjusting your filters or search terms</Typography>
							</div>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default PodcastsView;