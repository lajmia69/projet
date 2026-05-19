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

import LessonCard from '../ui/LessonCard';
import { SearchLessons } from '../../api/types';
import { useLanguages } from '../../api/hooks/languages/useLanguages';
import { useModules } from '../../../../content/(lesson)/api/hooks/lessons/Lessonmetahooks';
import useUser from '@auth/useUser';
import { useSearchLessons } from '../../api/hooks/lessons/useSearchLessons';

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

function LessonsView() {
	const { data: account } = useUser();

	const { data: languages } = useLanguages(account?.id, account?.token?.access);
	const { data: modules } = useModules(account?.id, account?.token?.access);

	const searchParams: SearchLessons = { limit: 50, offset: 0 };
	const { data: lessons, isLoading } = useSearchLessons(
		account?.id,
		account?.token?.access,
		searchParams
	);

	const [searchText, setSearchText] = useState('');
	const [filters, setFilters] = useState({ language: 'all', module: 'all' });
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const onScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const progress = Math.min(1, Math.max(0, (scrollY - FADE_START) / (FADE_END - FADE_START)));

	const filteredData = useMemo(() => {
		if (!lessons?.items) return [];
		return lessons.items.filter((lesson) => {
			const matchesSearch = lesson.name?.toLowerCase().includes(searchText.toLowerCase());
			const matchesLang = filters.language === 'all' || lesson.language?.name === filters.language;
			const matchesModule = filters.module === 'all' || String(lesson.module?.id) === filters.module;
			return matchesSearch && matchesLang && matchesModule;
		});
	}, [lessons, searchText, filters]);

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
						background: 'linear-gradient(135deg, #1A2E38 0%, #2D8B7C 100%)',
						paddingTop: '56px',
						paddingBottom: '64px',
						opacity: 1 - progress,
						transform: `translateY(${-(progress * 24)}px)`,
						pointerEvents: 'none',
						willChange: 'opacity, transform',
					}}
				>
					{/* Grid overlay */}
					<div style={{
						position: 'absolute', inset: 0,
						backgroundImage: `linear-gradient(rgba(232,228,218,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(232,228,218,0.06) 1px, transparent 1px)`,
						backgroundSize: '52px 52px',
					}} />
					{/* Radial glow — navy left */}
					<div style={{
						position: 'absolute', top: '-100px', left: '-120px',
						width: '500px', height: '500px', borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(45,139,124,0.22) 0%, transparent 65%)',
					}} />
					{/* Seafoam accent orb — right */}
					<div style={{
						position: 'absolute', bottom: '-60px', right: '-60px',
						width: '360px', height: '360px', borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(232,228,218,0.18) 0%, transparent 65%)',
					}} />

					<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
							<Typography component="h1" sx={{
								fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' },
								fontWeight: 800, color: '#E8E4DA',
								textShadow: '0 2px 32px rgba(0,0,0,0.55)',
							}}>
								Explore Lessons
							</Typography>
						</motion.div>
						<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
							<Typography sx={{ fontSize: { xs: '0.875rem', sm: '0.975rem' }, color: 'rgba(232,228,218,0.72)', lineHeight: 1.75 }}>
								Browse our lessons — explore content, one session at a time.
							</Typography>
						</motion.div>
						{lessons?.count != null && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.24, duration: 0.4 } }} className="mt-5">
								<div style={{
									display: 'inline-flex', alignItems: 'center', gap: '6px',
									padding: '4px 14px', borderRadius: '999px',
									border: '1px solid rgba(45,139,124,0.35)',
									backgroundColor: 'rgba(45,139,124,0.12)',
								}}>
									<FuseSvgIcon size={13} sx={{ color: 'rgba(45,139,124,0.75)' }}>lucide:book-open</FuseSvgIcon>
									<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(45,139,124,0.85)' }}>
										{lessons.count} lesson{lessons.count !== 1 ? 's' : ''} available
									</Typography>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4 pt-6">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
						className="flex w-full flex-wrap items-center gap-2 mb-6"
					>
						<FormControl size="small" sx={{ minWidth: 130 }} variant="outlined">
							<InputLabel>Language</InputLabel>
							<Select
								value={filters.language}
								label="Language"
								onChange={e => handleFilterChange('language', e.target.value)}
								sx={{ borderRadius: '10px' }}
							>
								<MenuItem value="all"><em>All</em></MenuItem>
								{languages?.items.map(lang => (
									<MenuItem value={lang.name} key={lang.id}>{lang.name}</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl size="small" sx={{ minWidth: 130 }} variant="outlined">
							<InputLabel>Module</InputLabel>
							<Select
								value={filters.module}
								label="Module"
								onChange={e => handleFilterChange('module', e.target.value)}
								sx={{ borderRadius: '10px' }}
							>
								<MenuItem value="all"><em>All</em></MenuItem>
								{modules?.items.map(mod => (
									<MenuItem value={String(mod.id)} key={mod.id}>{mod.name}</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							size="small"
							placeholder="Search lessons…"
							value={searchText}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
							sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
							slotProps={{
								input: {
									startAdornment: (
										<InputAdornment position="start">
											<FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon>
										</InputAdornment>
									),
								},
							}}
						/>

						{filteredData.length > 0 && (
							<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary', ml: 1 }}>
								{filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
							</Typography>
						)}
					</motion.div>

					{filteredData.length > 0 ? (
						<motion.div
							className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
							variants={cardContainer}
							initial="hidden"
							animate="show"
						>
							{filteredData.map(lesson => (
								<motion.div variants={cardItem} key={lesson.id}>
									<LessonCard lesson={lesson} />
								</motion.div>
							))}
						</motion.div>
					) : (
						<div className="flex flex-1 items-center justify-center py-20">
							<div className="flex flex-col items-center gap-3">
								<FuseSvgIcon size={48} sx={{ color: 'text.disabled' }}>lucide:search-x</FuseSvgIcon>
								<Typography color="text.secondary" variant="h6">No lessons found</Typography>
								<Typography color="text.disabled" variant="body2">Try adjusting your filters or search terms</Typography>
							</div>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default LessonsView;
