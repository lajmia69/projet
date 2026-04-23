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
import { SearchPodcasts } from '../../api/types';
import { useSearchPodcasts } from '../../api/hooks/Usesearchpodcasts';
import { usePodcastCategories } from '../../api/hooks/categories/Podcastcategoryhooks';
import useUser from '@auth/useUser';
import PodcastCard from '../ui/Podcastcard';

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

function PodcastsView() {
	const { data: account } = useUser();

	const searchParams: SearchPodcasts = { limit: 50, offset: 0 };
	const { data: podcasts, isLoading } = useSearchPodcasts(
		account?.id,
		account?.token?.access,
		searchParams
	);
	const { data: categories } = usePodcastCategories(account?.id, account?.token?.access);

	const [searchText, setSearchText] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
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
			const matchesCategory = selectedCategory === 'all' || String(podcast.podcast_category?.id) === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [podcasts, searchText, selectedCategory]);

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
						background: 'linear-gradient(160deg, #1c2537 0%, #1e2d45 50%, #192132 100%)',
						paddingTop: '56px',
						paddingBottom: '64px',
						opacity: heroOpacity,
						transform: `translateY(${heroTranslateY}px)`,
						pointerEvents: 'none',
						willChange: 'opacity, transform',
					}}
				>
					<div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(148,163,184,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.045) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
					<div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,116,139,0.15) 0%, transparent 65%)' }} />

					<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
							<Typography component="h1" sx={{ fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' }, fontWeight: 800, color: '#dde6f0', textShadow: '0 2px 32px rgba(0,0,0,0.45)' }}>
								What do you want to listen today?
							</Typography>
						</motion.div>
						<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
							<Typography sx={{ fontSize: { xs: '0.875rem', sm: '0.975rem' }, color: 'rgba(148,163,184,0.7)', lineHeight: 1.75 }}>
								Explore our podcast episodes — discover new ideas, one episode at a time.
							</Typography>
						</motion.div>
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4 pt-6">
					{/* Filter bar */}
					<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="flex w-full flex-wrap items-center gap-2 mb-6">

						<FormControl size="small" sx={{ minWidth: 140 }} variant="outlined">
							<InputLabel>Category</InputLabel>
							<Select value={selectedCategory} label="Category" onChange={e => setSelectedCategory(e.target.value)} sx={{ borderRadius: '10px' }}>
								<MenuItem value="all"><em>All</em></MenuItem>
								{categories?.items.map(cat => <MenuItem value={String(cat.id)} key={cat.id}>{cat.name}</MenuItem>)}
							</Select>
						</FormControl>

						<TextField
							size="small"
							placeholder="Search episodes…"
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

					{/* Card grid */}
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

export default PodcastsView;