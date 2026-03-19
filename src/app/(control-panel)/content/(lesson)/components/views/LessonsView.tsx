'use client';
import _ from 'lodash';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { motion } from 'motion/react';
import { ChangeEvent, useEffect, useState } from 'react';
import { InputLabel } from '@mui/material';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import LessonCard from '../ui/LessonCard';
import { Lesson, SearchLessons } from '../../api/types';
import { useLanguages } from '@/app/(control-panel)/(platform)/(lesson)/api/hooks/languages/useLanguages';
import useUser from '@auth/useUser';
import { useSearchLessons } from '@/app/(control-panel)/(platform)/(lesson)/api/hooks/lessons/useSearchLessons';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': {
		background: 'transparent',
		border: 'none',
		boxShadow: 'none',
		padding: 0,
	},
	// Kill every nested overflow so window is the ONE scroll owner
	'& .FusePageSimple-contentWrapper': {
		overflow: 'visible !important',
	},
	'& .FusePageSimple-content': {
		overflow: 'visible !important',
	},
	'& .FusePageSimple-rootWrapper': {
		overflow: 'visible !important',
	},
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
	const { data: languages } = useLanguages(account.id, account.token.access);
	const searchLesson: SearchLessons = { limit: 10, offset: 0 };
	const { data: lessons, isLoading } = useSearchLessons(account.id, account.token.access, searchLesson);

	const [filteredData, setFilteredData] = useState<Lesson[]>([]);
	const [searchText, setSearchText] = useState('');
	const [selectedLanguage, setSelectedLanguage] = useState('all');
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const onScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const progress = Math.min(1, Math.max(0, (scrollY - FADE_START) / (FADE_END - FADE_START)));
	const heroOpacity = 1 - progress;
	const heroTranslateY = -(progress * 24);

	useEffect(() => {
		if (!lessons?.items) return;
		const arr =
			searchText.length === 0 && selectedLanguage === 'all'
				? lessons.items
				: _.filter(lessons.items, (lesson) => {
						if (selectedLanguage !== 'all' && lesson.language?.name !== selectedLanguage) return false;
						return lesson.name?.toLowerCase().includes(searchText.toLowerCase());
					});
		setFilteredData(arr);
	}, [lessons, searchText, selectedLanguage]);

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
					{/* Grid texture */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundImage: `
								linear-gradient(rgba(148,163,184,0.045) 1px, transparent 1px),
								linear-gradient(90deg, rgba(148,163,184,0.045) 1px, transparent 1px)
							`,
							backgroundSize: '52px 52px',
							pointerEvents: 'none',
						}}
					/>

					{/* Orb top-left */}
					<div
						style={{
							position: 'absolute',
							top: '-100px',
							left: '-120px',
							width: '500px',
							height: '500px',
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(100,116,139,0.15) 0%, transparent 65%)',
							pointerEvents: 'none',
						}}
					/>

					{/* Orb bottom-right */}
					<div
						style={{
							position: 'absolute',
							bottom: '-120px',
							right: '-100px',
							width: '560px',
							height: '560px',
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(71,85,105,0.2) 0%, transparent 65%)',
							pointerEvents: 'none',
						}}
					/>

					{/* Faint blue halo */}
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							width: '580px',
							height: '160px',
							borderRadius: '50%',
							background: 'radial-gradient(ellipse, rgba(59,130,246,0.055) 0%, transparent 70%)',
							pointerEvents: 'none',
						}}
					/>

					{/* Text */}
					<div
						className="relative flex flex-col items-center justify-center px-6 text-center"
						style={{ zIndex: 1 }}
					>
						<motion.div
							initial={{ opacity: 0, y: 24 }}
							animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}
						>
							<Typography
								component="h1"
								sx={{
									fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' },
									fontWeight: 800,
									letterSpacing: '-0.025em',
									lineHeight: 1.15,
									color: '#dde6f0',
									textShadow: '0 2px 32px rgba(0,0,0,0.45)',
								}}
							>
								What do you want to learn today?
							</Typography>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }}
							className="mt-4 max-w-lg"
						>
							<Typography
								sx={{
									fontSize: { xs: '0.875rem', sm: '0.975rem' },
									color: 'rgba(148,163,184,0.7)',
									lineHeight: 1.75,
								}}
							>
								Browse our lessons — step through real content, one session at a time.
							</Typography>
						</motion.div>

						{lessons?.count != null && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0, transition: { delay: 0.24, duration: 0.4 } }}
								className="mt-5"
							>
								<div
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: '6px',
										padding: '4px 14px',
										borderRadius: '999px',
										border: '1px solid rgba(148,163,184,0.18)',
										backgroundColor: 'rgba(148,163,184,0.07)',
									}}
								>
									<FuseSvgIcon
										size={13}
										sx={{ color: 'rgba(148,163,184,0.5)' }}
									>
										lucide:library
									</FuseSvgIcon>
									<Typography
										sx={{
											fontSize: '0.74rem',
											fontWeight: 600,
											color: 'rgba(148,163,184,0.65)',
											letterSpacing: '0.025em',
										}}
									>
										{lessons.count} lessons available
									</Typography>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			}
			content={
				<div className="mx-auto flex w-full flex-1 flex-col p-4 pt-6">
					{/* Filter bar */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
						className="flex w-full flex-wrap items-center gap-2 mb-6"
					>
						<FormControl
							size="small"
							sx={{ minWidth: 130 }}
							variant="outlined"
						>
							<InputLabel id="lang-label">Language</InputLabel>
							<Select
								labelId="lang-label"
								value={selectedLanguage}
								label="Language"
								onChange={(e: SelectChangeEvent) => setSelectedLanguage(e.target.value)}
								sx={{ borderRadius: '10px' }}
							>
								<MenuItem value="all">
									<em>All</em>
								</MenuItem>
								{languages?.items.map((lang) => (
									<MenuItem
										value={lang.name}
										key={lang.id}
									>
										{lang.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl
							size="small"
							sx={{ minWidth: 130 }}
							variant="outlined"
						>
							<InputLabel id="subj-label">Subject</InputLabel>
							<Select
								labelId="subj-label"
								value={selectedLanguage}
								label="Subject"
								onChange={(e: SelectChangeEvent) => setSelectedLanguage(e.target.value)}
								sx={{ borderRadius: '10px' }}
							>
								<MenuItem value="all">
									<em>All</em>
								</MenuItem>
								{languages?.items.map((lang) => (
									<MenuItem
										value={lang.name}
										key={lang.id}
									>
										{lang.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl
							size="small"
							sx={{ minWidth: 130 }}
							variant="outlined"
						>
							<InputLabel id="trim-label">Trimester</InputLabel>
							<Select
								labelId="trim-label"
								value={selectedLanguage}
								label="Trimester"
								onChange={(e: SelectChangeEvent) => setSelectedLanguage(e.target.value)}
								sx={{ borderRadius: '10px' }}
							>
								<MenuItem value="all">
									<em>All</em>
								</MenuItem>
								{languages?.items.map((lang) => (
									<MenuItem
										value={lang.name}
										key={lang.id}
									>
										{lang.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl
							size="small"
							sx={{ minWidth: 130 }}
							variant="outlined"
						>
							<InputLabel id="mod-label">Module</InputLabel>
							<Select
								labelId="mod-label"
								value={selectedLanguage}
								label="Module"
								onChange={(e: SelectChangeEvent) => setSelectedLanguage(e.target.value)}
								sx={{ borderRadius: '10px' }}
							>
								<MenuItem value="all">
									<em>All</em>
								</MenuItem>
								{languages?.items.map((lang) => (
									<MenuItem
										value={lang.name}
										key={lang.id}
									>
										{lang.name}
									</MenuItem>
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
											<FuseSvgIcon
												size={16}
												color="disabled"
											>
												lucide:search
											</FuseSvgIcon>
										</InputAdornment>
									),
								},
							}}
						/>

						{filteredData.length > 0 && (
							<Typography
								sx={{
									ml: 'auto',
									fontSize: '0.78rem',
									fontWeight: 600,
									color: 'text.secondary',
								}}
							>
								{filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
							</Typography>
						)}
					</motion.div>

					{/* Card grid */}
					{filteredData.length > 0 ? (
						<motion.div
							className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
							variants={cardContainer}
							initial="hidden"
							animate="show"
						>
							{filteredData.map((lesson) => (
								<motion.div
									variants={cardItem}
									key={lesson.id}
								>
									<LessonCard lesson={lesson} />
								</motion.div>
							))}
						</motion.div>
					) : (
						<div className="flex flex-1 items-center justify-center">
							<div className="flex flex-col items-center gap-3 py-16">
								<FuseSvgIcon
									size={40}
									sx={{ color: 'text.disabled' }}
								>
									lucide:search-x
								</FuseSvgIcon>
								<Typography
									color="text.secondary"
									className="text-xl font-medium"
								>
									No lessons found
								</Typography>
								<Typography
									color="text.disabled"
									className="text-sm"
								>
									Try adjusting your filters
								</Typography>
							</div>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default LessonsView;