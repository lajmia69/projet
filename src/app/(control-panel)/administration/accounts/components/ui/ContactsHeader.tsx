import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import { motion, AnimatePresence } from 'motion/react';
import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useSearch } from '../../hooks/useSearch';
import { useFilteredContacts } from '../../hooks/useFilteredContacts';
import { useContactsList } from '../../api/hooks/contacts/useContactsList';
import { useState, useEffect, useRef } from 'react';

function CountUp({ target }: { target: number }) {
	const [val, setVal] = useState(0);
	const frame = useRef<number>(null);
	useEffect(() => {
		let start: number | null = null;
		const tick = (ts: number) => {
			if (!start) start = ts;
			const p = Math.min((ts - start) / 700, 1);
			setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
			if (p < 1) frame.current = requestAnimationFrame(tick);
		};
		frame.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame.current!);
	}, [target]);
	return <>{val}</>;
}

const ROLE_CONFIG = {
	tutor:   { label: 'Tutors',   from: '#6366f1', to: '#3b82f6', icon: 'lucide:book-open-check' },
	student: { label: 'Students', from: '#ec4899', to: '#f43f5e', icon: 'lucide:graduation-cap'   }
};

const LEVEL_CONFIG = {
	primary:   { label: 'Primary',   from: '#0ea5e9', to: '#0284c7' },
	secondary: { label: 'Secondary', from: '#8b5cf6', to: '#7c3aed' }
};

function ContactsHeader() {
	const { searchText, setSearchText } = useSearch();
	const { data: filteredData } = useFilteredContacts();
	const { data: allContacts } = useContactsList();
	const [activeFilter, setActiveFilter] = useState<string | null>(null);

	const total        = allContacts?.length ?? 0;
	const filtered     = filteredData?.length ?? 0;
	const isFiltering  = searchText.length > 0;
	const tutorCount   = allContacts?.filter((c) => c.role === 'tutor').length ?? 0;
	const studentCount = allContacts?.filter((c) => c.role === 'student').length ?? 0;
	const primaryCount = allContacts?.filter((c) => c.schoolLevel === 'primary').length ?? 0;
	const secCount     = allContacts?.filter((c) => c.schoolLevel === 'secondary').length ?? 0;

	const statCards = [
		{ label: 'Total',    value: total,        icon: 'lucide:users',            from: '#6366f1', to: '#3b82f6' },
		{ label: 'Tutors',   value: tutorCount,   icon: 'lucide:book-open-check',  from: '#6366f1', to: '#3b82f6' },
		{ label: 'Students', value: studentCount, icon: 'lucide:graduation-cap',   from: '#ec4899', to: '#f43f5e' },
		{ label: 'Secondary',value: secCount,     icon: 'lucide:school',           from: '#8b5cf6', to: '#7c3aed' }
	];

	return (
		<div className="w-full">
			{/* Hero */}
			<Box
				className="relative overflow-hidden"
				sx={(t) => ({ background: `linear-gradient(135deg, ${t.palette.secondary.dark} 0%, ${t.palette.secondary.main} 50%, ${t.palette.primary.main} 100%)` })}
			>
				<svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]">
					<defs><pattern id="hg" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M 36 0 L 0 0 0 36" fill="none" stroke="white" strokeWidth="0.7" /></pattern></defs>
					<rect width="100%" height="100%" fill="url(#hg)" />
				</svg>
				<div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white opacity-[0.08] blur-3xl" />

				<div className="relative px-6 pt-5 pb-7 md:px-8">
					<PageBreadcrumb className="mb-4 [&_*]:!text-white/60" />

					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }} className="flex items-center gap-3">
							<Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
								sx={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)' }}>
								<FuseSvgIcon className="text-white" size={22}>lucide:users</FuseSvgIcon>
							</Box>
							<div>
								<Typography className="text-3xl font-black tracking-tight text-white md:text-4xl">Accounts</Typography>
								<Typography className="text-xs text-white/60 mt-0.5">
									{isFiltering
										? `${filtered} of ${total} results`
										: `${tutorCount} tutor${tutorCount !== 1 ? 's' : ''} · ${studentCount} student${studentCount !== 1 ? 's' : ''}`
									}
								</Typography>
							</div>
							<motion.div key={total} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
								className="flex h-7 min-w-[2.25rem] items-center justify-center rounded-full px-2 text-xs font-extrabold"
								style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
								{total}
							</motion.div>
						</motion.div>

						<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.15, duration: 0.4 } }} className="flex items-center gap-2">
							<Box
								className="flex h-10 items-center gap-2 rounded-xl px-3"
								sx={{ backgroundColor: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.22)', minWidth: 210, transition: 'all 0.2s', '&:focus-within': { backgroundColor: 'rgba(255,255,255,0.22)', borderColor: 'rgba(255,255,255,0.5)' } }}
							>
								<FuseSvgIcon sx={{ color: 'rgba(255,255,255,0.65)' }} size={15}>lucide:search</FuseSvgIcon>
								<Input
									placeholder="Search accounts…" disableUnderline fullWidth value={searchText}
									onChange={(ev) => setSearchText(ev.target.value)}
									sx={{ color: 'white', fontSize: '0.875rem', '& input::placeholder': { color: 'rgba(255,255,255,0.45)', opacity: 1 } }}
								/>
								<AnimatePresence>
									{searchText && (
										<motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
											onClick={() => setSearchText('')} className="flex shrink-0 items-center text-white/50 hover:text-white">
											<FuseSvgIcon size={13}>lucide:x</FuseSvgIcon>
										</motion.button>
									)}
								</AnimatePresence>
							</Box>

							<Tooltip title="Add new account" arrow>
								<Button
									variant="contained" component={NavLinkAdapter} to="/administration/accounts/new"
									startIcon={<FuseSvgIcon size={17}>lucide:user-plus</FuseSvgIcon>}
									className="h-10 shrink-0 rounded-xl px-4 font-extrabold"
									sx={{ backgroundColor: 'white', color: 'secondary.dark', boxShadow: '0 4px 18px rgba(0,0,0,0.2)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' } }}
								>
									Add
								</Button>
							</Tooltip>
						</motion.div>
					</div>
				</div>
			</Box>

			{/* Stats + filters */}
			<Box className="border-b px-6 py-4 md:px-8" sx={{ backgroundColor: 'background.paper', borderColor: 'divider' }}>
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{statCards.map(({ label, value, icon, from, to }, i) => (
						<motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.07, duration: 0.32 } }}>
							<Box className="relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3.5 transition-all hover:shadow-md"
								sx={{ borderColor: 'divider', backgroundColor: 'background.default' }}>
								<Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
									sx={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
									<FuseSvgIcon className="text-white" size={18}>{icon}</FuseSvgIcon>
								</Box>
								<div className="min-w-0">
									<Typography className="text-2xl font-black leading-none tabular-nums"><CountUp target={value} /></Typography>
									<Typography className="mt-0.5 text-[11px] font-medium truncate" color="text.secondary">{label}</Typography>
								</div>
								<Box className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-[0.06]"
									sx={{ background: `radial-gradient(circle, ${from}, transparent)` }} />
							</Box>
						</motion.div>
					))}
				</div>

				{/* Filter chips */}
				{total > 0 && (
					<motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.38 } }}
						className="mt-3 flex flex-wrap items-center gap-1.5">
						<Typography className="mr-1 text-[10px] font-bold uppercase tracking-widest" color="text.disabled">Filter</Typography>

						{/* All */}
						<Box component="button" onClick={() => setActiveFilter(null)}
							className="inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-all"
							sx={{ backgroundColor: activeFilter === null ? 'secondary.main' : 'action.hover', color: activeFilter === null ? 'secondary.contrastText' : 'text.secondary', border: '1px solid', borderColor: activeFilter === null ? 'secondary.main' : 'divider', '&:hover': { borderColor: 'secondary.main' } }}>
							All
						</Box>

						{/* Tutor / Student */}
						{(['tutor', 'student'] as const).map((r) => {
							const cfg = ROLE_CONFIG[r];
							const count = r === 'tutor' ? tutorCount : studentCount;
							if (!count) return null;
							return (
								<Box key={r} component="button" onClick={() => setActiveFilter(r === activeFilter ? null : r)}
									className="inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[11px] font-bold transition-all"
									sx={{ backgroundColor: activeFilter === r ? cfg.from + '1a' : 'action.hover', color: activeFilter === r ? cfg.from : 'text.secondary', border: '1px solid', borderColor: activeFilter === r ? cfg.from + '55' : 'divider', '&:hover': { backgroundColor: cfg.from + '14', color: cfg.from } }}>
									<FuseSvgIcon size={10}>{cfg.icon}</FuseSvgIcon>
									{cfg.label}
									<span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-black"
										style={{ backgroundColor: activeFilter === r ? cfg.from : 'rgba(0,0,0,0.08)', color: activeFilter === r ? 'white' : 'inherit' }}>
										{count}
									</span>
								</Box>
							);
						})}

						{/* Primary / Secondary */}
						{(primaryCount > 0 || secCount > 0) && (
							<>
								<span className="mx-0.5 text-gray-300 text-xs">|</span>
								{(['primary', 'secondary'] as const).map((lvl) => {
									const cfg = LEVEL_CONFIG[lvl];
									const count = lvl === 'primary' ? primaryCount : secCount;
									if (!count) return null;
									return (
										<Box key={lvl} component="button" onClick={() => setActiveFilter(lvl === activeFilter ? null : lvl)}
											className="inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold transition-all"
											sx={{ backgroundColor: activeFilter === lvl ? cfg.from + '1a' : 'action.hover', color: activeFilter === lvl ? cfg.from : 'text.secondary', border: '1px solid', borderColor: activeFilter === lvl ? cfg.from + '55' : 'divider', '&:hover': { backgroundColor: cfg.from + '14', color: cfg.from } }}>
											<span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.from }} />
											{cfg.label}
											<span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[9px] font-black"
												style={{ backgroundColor: activeFilter === lvl ? cfg.from : 'rgba(0,0,0,0.08)', color: activeFilter === lvl ? 'white' : 'inherit' }}>
												{count}
											</span>
										</Box>
									);
								})}
							</>
						)}

						{isFiltering && (
							<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
								className="ml-auto text-[11px] font-semibold" style={{ color: 'var(--mui-palette-text-secondary)' }}>
								{filtered} result{filtered !== 1 ? 's' : ''}
							</motion.span>
						)}
					</motion.div>
				)}
			</Box>
		</div>
	);
}

export default ContactsHeader;