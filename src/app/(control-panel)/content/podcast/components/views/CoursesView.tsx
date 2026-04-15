'use client';
import _ from 'lodash';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import { motion } from 'motion/react';
import { ChangeEvent, useEffect, useState } from 'react';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { InputLabel } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Podcast, SearchPodcasts, CreatePodcastPayload } from '../../api/types';
import { useSearchPodcasts } from '../../api/hooks/Usesearchpodcasts';
import { usePodcastCategories } from '../../api/hooks/categories/Podcastcategoryhooks';
import { useCreatePodcast } from '../../api/hooks/Podcastmutations';
import { podcastApi } from '../../api/services/podcastApiService';
import useUser from '@auth/useUser';
import PodcastCard from '../ui/Podcastcard';

function usePodcastLanguages(currentAccountId: string, accessToken: string) {
	return useQuery({
		queryKey: ['podcast', 'languages', currentAccountId],
		queryFn: () => podcastApi.getLanguages(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});
}

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

type CreateForm = { name: string; description: string; language_id: string; podcast_category_id: string; };
const emptyForm: CreateForm = { name: '', description: '', language_id: '', podcast_category_id: '' };
type FormErrors = Partial<Record<keyof CreateForm, string>>;

function toSlug(name: string): string {
	return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

function CoursesView() {
	const { data: account } = useUser();
	const searchParams: SearchPodcasts = { limit: 20, offset: 0 };

	const { data: podcasts, isLoading } = useSearchPodcasts(account.id, account.token.access, searchParams);
	const { data: categories } = usePodcastCategories(account.id, account.token.access);
	const { data: languages } = usePodcastLanguages(account.id, account.token.access);
	const { mutate: createPodcast, isPending: isCreating } = useCreatePodcast(account.id, account.token.access);

	const [filteredData, setFilteredData] = useState<Podcast[]>([]);
	const [searchText, setSearchText] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [scrollY, setScrollY] = useState(0);
	const [addOpen, setAddOpen] = useState(false);
	const [form, setForm] = useState<CreateForm>(emptyForm);
	const [formErrors, setFormErrors] = useState<FormErrors>({});

	useEffect(() => {
		const onScroll = () => setScrollY(window.scrollY);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const progress = Math.min(1, Math.max(0, (scrollY - FADE_START) / (FADE_END - FADE_START)));
	const heroOpacity = 1 - progress;
	const heroTranslateY = -(progress * 24);

	useEffect(() => {
		if (!podcasts?.items) return;
		const arr = searchText.length === 0 && selectedCategory === 'all'
			? podcasts.items
			: _.filter(podcasts.items, (p) => {
				if (selectedCategory !== 'all' && String(p.podcast_category?.id) !== selectedCategory) return false;
				return p.name?.toLowerCase().includes(searchText.toLowerCase());
			});
		setFilteredData(arr);
	}, [podcasts, searchText, selectedCategory]);

	const handleOpenAdd = () => { setForm(emptyForm); setFormErrors({}); setAddOpen(true); };
	const handleCloseAdd = () => { if (isCreating) return; setAddOpen(false); };
	const setField = (field: keyof CreateForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

	const validate = (): boolean => {
		const errors: FormErrors = {};
		if (!form.name.trim()) errors.name = 'Name is required';
		if (!form.language_id) errors.language_id = 'Language is required';
		if (!form.podcast_category_id) errors.podcast_category_id = 'Category is required';
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmitAdd = () => {
		if (!validate()) return;
		const payload: CreatePodcastPayload = {
			name: form.name.trim(),
			slug: toSlug(form.name),
			description: form.description.trim(),
			transcription: {},
			language_id: Number(form.language_id),
			podcast_category_id: Number(form.podcast_category_id),
			tags: []
		};
		createPodcast(payload, { onSuccess: () => setAddOpen(false) });
	};

	if (isLoading) return <FuseLoading />;

	return (
		<>
			<Root
				scroll="page"
				header={
					<div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: 'linear-gradient(160deg, #1c2537 0%, #1e2d45 50%, #192132 100%)', paddingTop: '56px', paddingBottom: '64px', opacity: heroOpacity, transform: `translateY(${heroTranslateY}px)`, pointerEvents: 'none', willChange: 'opacity, transform' }}>
						<div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(148,163,184,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.045) 1px, transparent 1px)`, backgroundSize: '52px 52px', pointerEvents: 'none' }} />
						<div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,116,139,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
						<div style={{ position: 'absolute', bottom: '-120px', right: '-100px', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(71,85,105,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
						<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '580px', height: '160px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(59,130,246,0.055) 0%, transparent 70%)', pointerEvents: 'none' }} />
						<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
							<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
								<Typography component="h1" sx={{ fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' }, fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.15, color: '#dde6f0', textShadow: '0 2px 32px rgba(0,0,0,0.45)' }}>
									What do you want to listen today?
								</Typography>
							</motion.div>
							<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
								<Typography sx={{ fontSize: { xs: '0.875rem', sm: '0.975rem' }, color: 'rgba(148,163,184,0.7)', lineHeight: 1.75 }}>
									Explore our podcast episodes — discover new ideas, one episode at a time.
								</Typography>
							</motion.div>
							{podcasts?.count != null && (
								<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.24, duration: 0.4 } }} className="mt-5">
									<div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '999px', border: '1px solid rgba(148,163,184,0.18)', backgroundColor: 'rgba(148,163,184,0.07)' }}>
										<FuseSvgIcon size={13} sx={{ color: 'rgba(148,163,184,0.5)' }}>lucide:mic</FuseSvgIcon>
										<Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: 'rgba(148,163,184,0.65)', letterSpacing: '0.025em' }}>
											{podcasts.count} episodes available
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
								<InputLabel id="cat-label">Category</InputLabel>
								<Select labelId="cat-label" value={selectedCategory} label="Category" onChange={(e: SelectChangeEvent) => setSelectedCategory(e.target.value)} sx={{ borderRadius: '10px' }}>
									<MenuItem value="all"><em>All</em></MenuItem>
									{categories?.items.map((cat) => <MenuItem value={String(cat.id)} key={cat.id}>{cat.name}</MenuItem>)}
								</Select>
							</FormControl>

							<TextField
								size="small" placeholder="Search episodes…" value={searchText}
								onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
								sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
								slotProps={{ input: { startAdornment: (<InputAdornment position="start"><FuseSvgIcon size={16} color="disabled">lucide:search</FuseSvgIcon></InputAdornment>) } }}
							/>

							{filteredData.length > 0 && (
								<Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'text.secondary' }}>
									{filteredData.length} result{filteredData.length !== 1 ? 's' : ''}
								</Typography>
							)}

							<Button onClick={handleOpenAdd} variant="contained" size="small"
								startIcon={<FuseSvgIcon size={15}>lucide:plus</FuseSvgIcon>}
								sx={(theme) => ({ ml: 'auto', borderRadius: '10px', textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', boxShadow: theme.palette.mode === 'dark' ? '0 0 14px rgba(59,130,246,0.45)' : '0 0 12px rgba(59,130,246,0.3)', '&:hover': { background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' } })}>
								Add Podcast
							</Button>
						</motion.div>

						{filteredData.length > 0 ? (
							<motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" variants={cardContainer} initial="hidden" animate="show">
								{filteredData.map((podcast) => (
									<motion.div variants={cardItem} key={podcast.id}>
										<PodcastCard podcast={podcast} />
									</motion.div>
								))}
							</motion.div>
						) : (
							<div className="flex flex-1 items-center justify-center">
								<div className="flex flex-col items-center gap-3 py-16">
									<FuseSvgIcon size={40} sx={{ color: 'text.disabled' }}>lucide:search-x</FuseSvgIcon>
									<Typography color="text.secondary" className="text-xl font-medium">No episodes found</Typography>
									<Typography color="text.disabled" className="text-sm">Try adjusting your filters</Typography>
								</div>
							</div>
						)}
					</div>
				}
			/>

			{/* ── Add Dialog ── */}
			<Dialog open={addOpen} onClose={handleCloseAdd} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '20px' } }}>
				<DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 1.5 }}>
					<FuseSvgIcon size={20} sx={{ color: '#3b82f6' }}>lucide:mic-2</FuseSvgIcon>
					New Podcast
				</DialogTitle>
				<Divider />
				<DialogContent sx={{ pt: '24px !important', display: 'flex', flexDirection: 'column', gap: 3 }}>
					<TextField label="Podcast name" value={form.name} onChange={(e) => setField('name', e.target.value)}
						error={!!formErrors.name} helperText={formErrors.name} fullWidth required size="small"
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />

					<TextField label="Description" value={form.description} onChange={(e) => setField('description', e.target.value)}
						fullWidth multiline minRows={3} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />

					<div className="flex gap-3">
						<FormControl size="small" fullWidth required error={!!formErrors.language_id}>
							<InputLabel>Language</InputLabel>
							<Select value={form.language_id} label="Language" onChange={(e) => setField('language_id', e.target.value)} sx={{ borderRadius: '10px' }}>
								{languages?.items.map((lang) => <MenuItem value={String(lang.id)} key={lang.id}>{lang.name}</MenuItem>)}
							</Select>
							{formErrors.language_id && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.language_id}</Typography>}
						</FormControl>

						<FormControl size="small" fullWidth required error={!!formErrors.podcast_category_id}>
							<InputLabel>Category</InputLabel>
							<Select value={form.podcast_category_id} label="Category" onChange={(e) => setField('podcast_category_id', e.target.value)} sx={{ borderRadius: '10px' }}>
								{categories?.items.map((cat) => <MenuItem value={String(cat.id)} key={cat.id}>{cat.name}</MenuItem>)}
							</Select>
							{formErrors.podcast_category_id && <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>{formErrors.podcast_category_id}</Typography>}
						</FormControl>
					</div>
				</DialogContent>
				<Divider />
				<DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
					<Button onClick={handleCloseAdd} variant="outlined" disabled={isCreating} sx={{ borderRadius: '10px', textTransform: 'none' }}>Cancel</Button>
					<Button onClick={handleSubmitAdd} variant="contained" disabled={isCreating}
						startIcon={isCreating ? <CircularProgress size={14} color="inherit" /> : <FuseSvgIcon size={15}>lucide:check</FuseSvgIcon>}
						sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
						{isCreating ? 'Creating…' : 'Create Podcast'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default CoursesView;
