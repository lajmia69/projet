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
import { useSearchReportages, useReportageTypes, useSeasons, useDeleteReportage } from '../../api/hooks/Radiohooks';
import { Reportage, SearchReportages } from '../../api/types';
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

function ReportageCard({ reportage, onDelete }: { reportage: Reportage; onDelete: (id: number) => void }) {
	const [confirmOpen, setConfirmOpen] = useState(false);

	return (
		<>
			<Card
				sx={(theme) => ({
					display: 'flex', flexDirection: 'column', borderRadius: '18px', overflow: 'hidden',
					height: '100%', position: 'relative',
					border: theme.palette.mode === 'dark' ? '1px solid rgba(167,139,250,0.18)' : '1px solid rgba(139,92,246,0.18)',
					background: theme.palette.mode === 'dark'
						? 'linear-gradient(145deg, rgba(10,8,20,0.98) 0%, rgba(18,12,35,0.98) 100%)'
						: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
					boxShadow: theme.palette.mode === 'dark'
						? '0 0 0 1px rgba(167,139,250,0.08), 0 4px 24px rgba(139,92,246,0.1)'
						: '0 0 0 1px rgba(139,92,246,0.07), 0 4px 20px rgba(139,92,246,0.07)',
					transition: 'transform 0.25s ease, box-shadow 0.25s ease',
					'&:hover': {
						transform: 'translateY(-5px)',
						borderColor: theme.palette.mode === 'dark' ? 'rgba(167,139,250,0.4)' : 'rgba(139,92,246,0.4)',
						boxShadow: theme.palette.mode === 'dark'
							? '0 0 0 1px rgba(167,139,250,0.2), 0 8px 40px rgba(139,92,246,0.25)'
							: '0 0 0 1px rgba(139,92,246,0.18), 0 8px 40px rgba(139,92,246,0.18)',
					},
				})}
			>
				<div style={{ height: 3, width: '100%', background: 'linear-gradient(90deg, #6d28d9, #8b5cf6, #c4b5fd)' }} />

				{/* Delete button */}
				<div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
					<Tooltip title="Delete reportage" placement="top">
						<IconButton
							size="small"
							onClick={() => setConfirmOpen(true)}
							sx={(theme) => ({
								color: theme.palette.mode === 'dark' ? 'rgba(248,113,113,0.7)' : 'rgba(220,38,38,0.6)',
								backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)',
								border: theme.palette.mode === 'dark' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(239,68,68,0.15)',
								width: 28, height: 28,
								'&:hover': {
									backgroundColor: theme.palette.mode === 'dark' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.12)',
									color: theme.palette.mode === 'dark' ? '#f87171' : '#dc2626',
								},
							})}
						>
							<FuseSvgIcon size={14}>lucide:trash-2</FuseSvgIcon>
						</IconButton>
					</Tooltip>
				</div>

				<div className="flex flex-col flex-1 p-5 gap-3" style={{ position: 'relative', zIndex: 1 }}>
					{/* Chips */}
					<div className="flex flex-wrap gap-1.5 pr-10">
						{reportage.reportage_type?.name && (
							<Chip label={reportage.reportage_type.name} size="small" sx={(theme) => ({
								fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', height: 20,
								color: theme.palette.mode === 'dark' ? '#c4b5fd' : '#4c1d95',
								backgroundColor: theme.palette.mode === 'dark' ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.12)',
								border: '1px solid rgba(139,92,246,0.3)',
							})} />
						)}
						{reportage.season?.name && (
							<Chip label={reportage.season.name} size="small" sx={(theme) => ({
								fontSize: '0.68rem', fontWeight: 600, height: 20,
								color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
								backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
								border: '1px solid rgba(0,0,0,0.08)',
							})} />
						)}
					</div>

					{/* Title */}
					<Typography className="font-semibold line-clamp-2 leading-snug"
						dir={reportage.transcription?.language_orientation}
						sx={(theme) => ({ fontSize: '0.975rem', color: theme.palette.mode === 'dark' ? '#ede9fe' : '#1a1025', lineHeight: 1.45 })}>
						{reportage.name}
					</Typography>

					{reportage.transcription?.author && (
						<Typography className="line-clamp-1" dir={reportage.transcription?.language_orientation}
							sx={(theme) => ({ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.45)', fontSize: '0.82rem' })}>
							{reportage.transcription.author}
						</Typography>
					)}

					<div className="flex-1" />
					<div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)' }} />

					{/* Meta */}
					<div className="flex items-center gap-3 flex-wrap">
						{(reportage.streaming_version?.duration || reportage.hd_version?.duration) && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={{ color: '#8b5cf6' }}>lucide:clock</FuseSvgIcon>
								<Typography className="text-xs font-medium" sx={{ color: '#8b5cf6' }}>
									<DurationDisplay isoDuration={reportage.streaming_version?.duration || reportage.hd_version?.duration} format="short" />
								</Typography>
							</div>
						)}
						{reportage.language?.name && (
							<div className="flex items-center gap-1">
								<FuseSvgIcon size={12} sx={(t) => ({ color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' })}>lucide:globe</FuseSvgIcon>
								<Typography className="text-xs" sx={(t) => ({ color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' })}>
									{reportage.language.name}
								</Typography>
							</div>
						)}
						{reportage.is_published && (
							<Chip label="On Air" size="small" sx={(t) => ({
								ml: 'auto', height: 18, fontSize: '0.65rem', fontWeight: 700,
								color: t.palette.mode === 'dark' ? '#c4b5fd' : '#4c1d95',
								backgroundColor: t.palette.mode === 'dark' ? 'rgba(139,92,246,0.12)' : 'rgba(139,92,246,0.15)',
								border: '1px solid rgba(139,92,246,0.35)',
							})} />
						)}
					</div>

					{/* Creator + CTA */}
					<div className="flex items-center justify-between gap-2 pt-0.5">
						{reportage.created_by?.full_name && (
							<div className="flex items-center gap-1.5 min-w-0">
								<FuseSvgIcon size={13} sx={(t) => ({ color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', flexShrink: 0 })}>lucide:newspaper</FuseSvgIcon>
								<Typography className="text-xs truncate" sx={(t) => ({ fontWeight: 500, color: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' })}>
									{reportage.created_by.full_name}
								</Typography>
							</div>
						)}
						<Button component={Link} to={`/content/radio/reportage/${reportage.id}`} size="small" variant="contained"
							sx={(t) => ({
								borderRadius: '9px', fontSize: '0.73rem', fontWeight: 700, textTransform: 'none',
								paddingX: '14px', paddingY: '5px', flexShrink: 0, minWidth: 'unset',
								background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', color: '#fff',
								boxShadow: t.palette.mode === 'dark' ? '0 0 14px rgba(139,92,246,0.45)' : '0 0 12px rgba(139,92,246,0.3)',
								'&:hover': { background: 'linear-gradient(135deg, #5b21b6, #6d28d9)', transform: 'scale(1.04)' },
							})}
							endIcon={<FuseSvgIcon size={13}>{reportage.transcription?.language_orientation === 'rtl' ? 'lucide:arrow-left' : 'lucide:arrow-right'}</FuseSvgIcon>}>
							Watch
						</Button>
					</div>
				</div>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '16px', minWidth: 320 } }}>
				<DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>
					Delete reportage?
				</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ fontSize: '0.875rem' }}>
						<strong>{reportage.name}</strong> will be permanently removed. This action cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
					<Button onClick={() => setConfirmOpen(false)} variant="outlined" size="small" sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 600 }}>
						Cancel
					</Button>
					<Button
						onClick={() => { onDelete(reportage.id); setConfirmOpen(false); }}
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

function ReportageView() {
	const { data: account } = useUser();
	const searchParams: SearchReportages = { limit: 50, offset: 0 };

	const { data: reportages, isLoading } = useSearchReportages(account?.id, account?.token?.access, searchParams);
	const { data: reportageTypesData } = useReportageTypes(account?.id, account?.token?.access);
	const { data: seasons } = useSeasons(account?.id, account?.token?.access);
	const { mutate: deleteReportage } = useDeleteReportage(account?.id, account?.token?.access);

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
		if (!reportages?.items) return [];
		return reportages.items.filter((r) => {
			const matchSearch = r.name?.toLowerCase().includes(searchText.toLowerCase());
			const matchType = selectedType === 'all' || String(r.reportage_type?.id) === selectedType;
			const matchSeason = selectedSeason === 'all' || String(r.season?.id) === selectedSeason;
			return matchSearch && matchType && matchSeason;
		});
	}, [reportages, searchText, selectedType, selectedSeason]);

	if (isLoading) return <FuseLoading />;

	return (
		<Root
			scroll="page"
			header={
				<div style={{
					position: 'relative', width: '100%', overflow: 'hidden',
					background: 'linear-gradient(160deg, #0d0a1a 0%, #1a0e35 50%, #100a20 100%)',
					paddingTop: '56px', paddingBottom: '64px',
					opacity: 1 - progress, transform: `translateY(${-(progress * 24)}px)`,
					pointerEvents: 'none', willChange: 'opacity, transform',
				}}>
					<div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(139,92,246,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.045) 1px, transparent 1px)`, backgroundSize: '52px 52px' }} />
					<div style={{ position: 'absolute', top: '-100px', left: '-120px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.18) 0%, transparent 65%)' }} />
					<div className="relative flex flex-col items-center justify-center px-6 text-center" style={{ zIndex: 1 }}>
						<motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.06, duration: 0.5 } }}>
							<Typography component="h1" sx={{ fontSize: { xs: '1.85rem', sm: '2.5rem', md: '3.1rem' }, fontWeight: 800, color: '#ede9fe', textShadow: '0 2px 32px rgba(0,0,0,0.55)' }}>
								Reportage
							</Typography>
						</motion.div>
						<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.45 } }} className="mt-4 max-w-lg">
							<Typography sx={{ fontSize: '0.975rem', color: 'rgba(221,214,254,0.65)', lineHeight: 1.75 }}>
								Browse all reportages — in-depth stories from the field.
							</Typography>
						</motion.div>
						{reportages?.count != null && (
							<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.24, duration: 0.4 } }} className="mt-5">
								<div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '999px', border: '1px solid rgba(139,92,246,0.25)', backgroundColor: 'rgba(139,92,246,0.08)' }}>
									<FuseSvgIcon size={13} sx={{ color: 'rgba(221,214,254,0.55)' }}>lucide:newspaper</FuseSvgIcon>
									<Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: 'rgba(221,214,254,0.6)' }}>
										{reportages.count} reportages available
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
								{reportageTypesData?.items.map((t) => <MenuItem value={String(t.id)} key={t.id}>{t.name}</MenuItem>)}
							</Select>
						</FormControl>

						<FormControl size="small" sx={{ minWidth: 140 }} variant="outlined">
							<InputLabel>Season</InputLabel>
							<Select value={selectedSeason} label="Season" onChange={(e: SelectChangeEvent) => setSelectedSeason(e.target.value)} sx={{ borderRadius: '10px' }}>
								<MenuItem value="all"><em>All</em></MenuItem>
								{seasons?.items.map((s) => <MenuItem value={String(s.id)} key={s.id}>{s.name}</MenuItem>)}
							</Select>
						</FormControl>

						<TextField size="small" placeholder="Search reportages…" value={searchText}
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
							{filteredData.map((reportage) => (
								<motion.div variants={cardItem} key={reportage.id}>
									<ReportageCard
										reportage={reportage}
										onDelete={(id) => deleteReportage(id)}
									/>
								</motion.div>
							))}
						</motion.div>
					) : (
						<div className="flex flex-1 items-center justify-center py-20">
							<div className="flex flex-col items-center gap-3">
								<FuseSvgIcon size={40} sx={{ color: 'text.disabled' }}>lucide:search-x</FuseSvgIcon>
								<Typography color="text.secondary" className="text-xl font-medium">No reportages found</Typography>
								<Typography color="text.disabled" className="text-sm">Try adjusting your filters</Typography>
							</div>
						</div>
					)}
				</div>
			}
		/>
	);
}

export default ReportageView;