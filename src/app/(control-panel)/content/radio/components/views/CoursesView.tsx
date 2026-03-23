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
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { InputLabel } from '@mui/material';
import { Radio, SearchRadios } from '../../api/types';
import { useSearchRadios } from '../../api/hooks/radio/useRadios';
import { useRadioCategories } from '../../api/hooks/categories/Radiocategoryhooks';
import useUser from '@auth/useUser';
import RadioCard from '../ui/RadioCard';

const Root = styled(FusePageSimple)(() => ({
	'& .FusePageSimple-header': {
		background: 'transparent',
		border: 'none',
		boxShadow: 'none',
		padding: 0
	},
	'& .FusePageSimple-contentWrapper': { overflow: 'visible !important' },
	'& .FusePageSimple-content': { overflow: 'visible !important' },
	'& .FusePageSimple-rootWrapper': { overflow: 'visible !important' }
}));

const cardContainer = { show: { transition: { staggerChildren: 0.05 } } };
const cardItem = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

const FADE_START = 20;
const FADE_END = 180;

function CoursesView() {
	const { data: account } = useUser();
	const searchParams: SearchRadios = { limit: 20, offset: 0 };

	const { data: radios, isLoading } = useSearchRadios(
		account.id,
		account.token.access,
		searchParams
	);
	const { data: categories } = useRadioCategories(account.id, account.token.access);

	const [filteredData, setFilteredData] = useState<Radio[]>([]);
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

	useEffect(() => {
		if (!radios?.items) return;
		const arr =
			searchText.length === 0 && selectedCategory === 'all'
				? radios.items
				: _.filter(radios.items, (r) => {
						if (selectedCategory !== 'all' && String(r.category?.id) !== selectedCategory)
							return false;
						return r.name?.toLowerCase().includes(searchText.toLowerCase());
					});
		setFilteredData(arr);
	}, [radios, searchText, selectedCategory]);

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
						background: 'linear-gradient(160deg, #1c1a0f 0%, #2d2408 50%, #1a1505 100%)',
						paddingTop: '56px',
						paddingBottom: '64px',
						opacity: heroOpacity,
						transform: `translateY(${heroTranslateY}px)`,
						pointerEvents: 'none',
						willChange: 'opacity, transform'
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundImage: `
								linear-gradient(rgba(245,158,11,0.045) 1px, transparent 1px),
								linear-gradient(90deg, rgba(245,158,11,0.045) 1px, transparent 1px)
							`,
							backgroundSize: '52px 52px',
							pointerEvents: 'none'
						}}
					/>
					<div
						style={{
							position: 'absolute',
							top: '-100px',
							left: '-120px',
							width: '500px',
							height: '500px',
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(180,83,9,0.18) 0%, transparent 65%)',
							pointerEvents: 'none'
						}}
					/>
					<div
						style={{
							position: 'absolute',
							bottom: '-120px',
							right: '-100px',
							width: '560px',
							height: '560px',
							borderRadius: '50%',
							background: 'radial-gradient(circle, rgba(120,53,15,0.22) 0%, transparent 65%)',
							pointerEvents: 'none'
						}}
					/>
					<div
						style={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							width: '580px',
							height: '160px',
							borderRadius: '50%',
							background: 'radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)',
							pointerEvents: 'none'
						}}
					/>

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
									color: '#fef3c7',
									textShadow: '0 2px 32px rgba(0,0,0,0.55)'
								}}
							>
								What do you want to hear today?
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
									color: 'rgba(253,230,138,0.65)',
									lineHeight: 1.75
								}}
							>
								Explore our radio programs — discover new ideas, one broadcast at a time.
							</Typography>
						</motion.div>

						{radios?.count != null && (
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
										border: '1px solid rgba(245,158,11,0.25)',
										backgroundColor: 'rgba(245,158,11,0.08)'
									}}
								>
									<FuseSvgIcon
										size={13}
										sx={{ color: 'rgba(253,230,138,0.55)' }}
									>
										lucide:radio
									</FuseSvgIcon>
									<Typography
										sx={{
											fontSize: '0.74rem',
											fontWeight: 600,
											color: 'rgba(253,230,138,0.6)',
											letterSpacing: '0.025em'
										}}
									>
										{radios.count} programs available
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
							sx={{ minWidth: 140 }}
							variant="outlined"
						>
							<InputLabel id="cat-label">Category</InputLabel>
							<Select
								labelId="cat-label"
								value={selectedCategory}
								label="Category"
								onChange={(e: SelectChangeEvent) => setSelectedCategory(e.target.value)}
								sx={{ borderRadius: '10px' }}
							>
								<MenuItem value="all">
									<em>All</em>
								</MenuItem>
								{categories?.items.map((cat) => (
									<MenuItem
										value={String(cat.id)}
										key={cat.id}
									>
										{cat.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<TextField
							size="small"
							placeholder="Search programs…"
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
									)
								}
							}}
						/>

						{filteredData.length > 0 && (
							<Typography
								sx={{ ml: 'auto', fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary' }}
							>
								{filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
							</Typography>
						)}
					</motion.div>

					{/* Grid */}
					{filteredData.length > 0 ? (
						<motion.div
							className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
							variants={cardContainer}
							initial="hidden"
							animate="show"
						>
							{filteredData.map((radio) => (
								<motion.div
									variants={cardItem}
									key={radio.id}
								>
									<RadioCard radio={radio} />
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
									No programs found
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

export default CoursesView;