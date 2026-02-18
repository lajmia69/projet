'use client';

import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useParams from '@fuse/hooks/useParams';
import FuseLoading from '@fuse/core/FuseLoading';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/system/Box';
import Tooltip from '@mui/material/Tooltip';
import { format } from 'date-fns/format';
import { motion } from 'motion/react';
import useNavigate from '@fuse/hooks/useNavigate';
import { useContact } from '../../api/hooks/contacts/useContact';
import { useCountries } from '../../api/hooks/countries/useCountries';
import ContactForm from '../forms/ContactForm';
import { useSnackbar } from 'notistack';
import {
	UserRole, SchoolLevel,
	SECONDARY_SECTIONS, sectionsForGrades,
	studentPlacementLabel, contactFullName
} from '../../api/types';

const SEC_COLORS: Record<string, { from: string; to: string; bg: string; text: string }> = {
	Scientific: { from: '#6366f1', to: '#3b82f6', bg: '#eef2ff', text: '#4338ca' },
	Letters:    { from: '#f59e0b', to: '#d97706', bg: '#fffbeb', text: '#b45309' },
	Sports:     { from: '#22c55e', to: '#16a34a', bg: '#f0fdf4', text: '#15803d' },
	IT:         { from: '#8b5cf6', to: '#7c3aed', bg: '#f5f3ff', text: '#6d28d9' },
	Science:    { from: '#0ea5e9', to: '#0284c7', bg: '#f0f9ff', text: '#0369a1' },
	Economics:  { from: '#ec4899', to: '#db2777', bg: '#fdf2f8', text: '#9d174d' },
	Maths:      { from: '#ef4444', to: '#dc2626', bg: '#fff1f2', text: '#b91c1c' },
	Technique:  { from: '#f97316', to: '#ea580c', bg: '#fff7ed', text: '#c2410c' }
};

function SectionCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
	return (
		<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { delay, duration: 0.35 } }}>
			<Box className="overflow-hidden rounded-2xl border" sx={{ backgroundColor: 'background.paper', borderColor: 'divider' }}>
				{children}
			</Box>
		</motion.div>
	);
}

function SectionHead({ icon, label, gradient }: { icon: string; label: string; gradient?: string }) {
	return (
		<Box className="flex items-center gap-2 border-b px-4 py-3" sx={{ borderColor: 'divider', backgroundColor: 'action.hover' }}>
			{gradient ? (
				<Box className="flex h-5 w-5 items-center justify-center rounded-md" sx={{ background: gradient }}>
					<FuseSvgIcon className="text-white" size={11}>{icon}</FuseSvgIcon>
				</Box>
			) : (
				<FuseSvgIcon size={13} color="action">{icon}</FuseSvgIcon>
			)}
			<Typography className="text-[11px] font-bold uppercase tracking-widest" color="text.secondary">{label}</Typography>
		</Box>
	);
}

function InfoRow({ icon, children, alignTop = false }: { icon: string; children: React.ReactNode; alignTop?: boolean }) {
	return (
		<div className={`flex gap-3 px-4 py-3 ${alignTop ? 'items-start' : 'items-center'}`}>
			<Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" sx={{ backgroundColor: 'action.selected' }}>
				<FuseSvgIcon size={15} color="action">{icon}</FuseSvgIcon>
			</Box>
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}

function ContactView() {
	const { data: countries } = useCountries();
	const routeParams = useParams<{ contactId: string }>();
	const isNew = routeParams.contactId === 'new';
	const { contactId } = routeParams;
	const { data: contact, isLoading, isError } = useContact(contactId);
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();

	function getCountryByIso(iso: string) { return countries?.find((c) => c.iso === iso); }

	if (isNew) return <ContactForm isNew />;
	if (isLoading) return <FuseLoading className="min-h-screen" />;
	if (isError) {
		setTimeout(() => { navigate('/administration/accounts'); enqueueSnackbar('NOT FOUND', { variant: 'error' }); }, 0);
		return null;
	}
	if (!contact) return null;

	const role = (contact.role ?? '') as UserRole;
	const isTutor = role === 'tutor';
	const isStudent = role === 'student';

	const fullName = contactFullName(contact);
	const initials = [contact.firstName, contact.lastName].filter(Boolean).map((n) => n![0]).join('').toUpperCase() || '?';

	const roleBadge = {
		tutor:   { label: 'Tutor',   from: '#6366f1', to: '#3b82f6', icon: 'lucide:book-open-check' },
		student: { label: 'Student', from: '#ec4899', to: '#f43f5e', icon: 'lucide:graduation-cap' }
	}[role] ?? null;

	// Student
	const schoolLevel = (contact.schoolLevel ?? '') as SchoolLevel;
	const grade = contact.grade;
	const section = contact.section ?? '';
	const placementLabel = studentPlacementLabel(schoolLevel, grade, section);
	const sectionColors = SEC_COLORS[section];

	// Tutor
	const tutorSchoolLevel = (contact.tutorSchoolLevel ?? '') as SchoolLevel;
	const tutorGrades = contact.tutorGrades ?? [];
	const tutorSections = contact.tutorSections ?? [];

	// Group tutor grades by level for display
	const tutorGradesBySection = tutorSchoolLevel === 'secondary'
		? tutorGrades.map((g) => ({
			grade: g,
			sections: tutorSections.filter((s) => (SECONDARY_SECTIONS[g] ?? []).includes(s))
		}))
		: tutorGrades.map((g) => ({ grade: g, sections: [] }));

	const primaryEmail = contact.emails?.find((e) => e.email)?.email;
	const primaryPhone = contact.phoneNumbers?.find((p) => p.phoneNumber)?.phoneNumber;

	return (
		<div className="relative flex flex-auto flex-col overflow-y-auto">
			{/* Cover */}
			<Box className="relative min-h-44 w-full sm:min-h-56" sx={{ backgroundColor: 'background.default' }}>
				{contact.background ? (
					<img className="absolute inset-0 h-full w-full object-cover" src={contact.background} alt="" />
				) : (
					<Box
						className="absolute inset-0"
						sx={(theme) => ({
							background: roleBadge
								? `linear-gradient(135deg, ${roleBadge.from}44, ${theme.palette.secondary.main}33, ${theme.palette.primary.main}22)`
								: `linear-gradient(135deg, ${theme.palette.secondary.main}55, ${theme.palette.primary.main}33)`
						})}
					/>
				)}
				<Box className="absolute inset-0" sx={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.28) 100%)' }} />
				<svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]">
					<defs><pattern id="cv" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth="0.6" /></pattern></defs>
					<rect width="100%" height="100%" fill="url(#cv)" />
				</svg>
				<div className="absolute top-4 right-4">
					<Tooltip title="Edit profile" arrow>
						<Button
							size="small" component={NavLinkAdapter} to={`/administration/accounts/${contactId}/edit`}
							startIcon={<FuseSvgIcon size={15}>lucide:square-pen</FuseSvgIcon>}
							sx={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontWeight: 700, fontSize: '0.75rem', '&:hover': { backgroundColor: 'rgba(255,255,255,0.28)' } }}
						>
							Edit
						</Button>
					</Tooltip>
				</div>
			</Box>

			{/* Body */}
			<div className="flex flex-col gap-4 -mt-12 px-5 pb-10 sm:px-8">
				{/* Identity */}
				<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }} className="flex flex-col gap-3">
					<Box
						className="inline-flex rounded-full p-[3px] shadow-xl"
						sx={{
							background: roleBadge
								? `linear-gradient(135deg, ${roleBadge.from}, ${roleBadge.to})`
								: (t) => `linear-gradient(135deg, ${t.palette.secondary.main}, ${t.palette.primary.main})`,
							width: 'fit-content'
						}}
					>
						<Avatar src={contact.avatar} alt={fullName}
							sx={(t) => ({ width: 100, height: 100, fontSize: '2rem', fontWeight: 800, border: '3px solid', borderColor: 'background.paper', backgroundColor: t.palette.secondary.main + '22', color: t.palette.secondary.dark })}>
							{initials}
						</Avatar>
					</Box>

					<div>
						<Typography className="text-2xl font-black tracking-tight sm:text-3xl">{fullName}</Typography>
						{roleBadge && (
							<Box
								className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
								sx={{ background: `linear-gradient(135deg, ${roleBadge.from}, ${roleBadge.to})` }}
							>
								<FuseSvgIcon className="text-white" size={12}>{roleBadge.icon}</FuseSvgIcon>
								<Typography className="text-xs font-bold text-white">{roleBadge.label}</Typography>
							</Box>
						)}
						{isTutor && contact.tutorSubject && (
							<Box
								className="mt-1.5 ml-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-1"
								sx={{ borderColor: 'divider', backgroundColor: 'action.hover' }}
							>
								<FuseSvgIcon size={12} color="action">lucide:book</FuseSvgIcon>
								<Typography className="text-xs font-semibold" color="text.secondary">{contact.tutorSubject}</Typography>
							</Box>
						)}
					</div>

					{/* Quick actions */}
					<div className="flex flex-wrap gap-2">
						{primaryEmail && (
							<Tooltip title="Send email" arrow>
								<Box component="a" href={`mailto:${primaryEmail}`}
									className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-all"
									sx={{ backgroundColor: 'action.hover', color: 'text.secondary', border: '1px solid', borderColor: 'divider', textDecoration: 'none', '&:hover': { backgroundColor: 'secondary.main', color: 'white', borderColor: 'secondary.main' } }}>
									<FuseSvgIcon size={11}>lucide:mail</FuseSvgIcon>Message
								</Box>
							</Tooltip>
						)}
						{primaryPhone && (
							<Tooltip title="Call" arrow>
								<Box component="a" href={`tel:+216${primaryPhone}`}
									className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold transition-all"
									sx={{ backgroundColor: 'action.hover', color: 'text.secondary', border: '1px solid', borderColor: 'divider', textDecoration: 'none', '&:hover': { backgroundColor: 'success.main', color: 'white', borderColor: 'success.main' } }}>
									<FuseSvgIcon size={11}>lucide:phone</FuseSvgIcon>Call
								</Box>
							</Tooltip>
						)}
					</div>
				</motion.div>

				{/* ── Tutor card ── */}
				{isTutor && (tutorGrades.length > 0 || contact.tutorSubject) && (
					<SectionCard delay={0.1}>
						<SectionHead icon="lucide:book-open-check" label="Teaching Assignments" gradient="linear-gradient(135deg, #6366f1, #3b82f6)" />
						<div className="px-4 py-4 flex flex-col gap-4">
							{contact.tutorSubject && (
								<div className="flex items-center gap-2">
									<Box className="flex h-8 w-8 items-center justify-center rounded-xl" sx={{ backgroundColor: 'action.selected' }}>
										<FuseSvgIcon size={15} color="action">lucide:book</FuseSvgIcon>
									</Box>
									<div>
										<Typography className="text-[10px] font-bold uppercase tracking-wider" color="text.disabled">Subject</Typography>
										<Typography className="text-sm font-bold">{contact.tutorSubject}</Typography>
									</div>
								</div>
							)}

							{tutorGrades.length > 0 && (
								<div>
									<Typography className="mb-2 text-[10px] font-extrabold uppercase tracking-widest" color="text.disabled">
										{tutorSchoolLevel === 'primary' ? 'Primary Grades' : 'Secondary Years'} · {tutorGrades.length} selected
									</Typography>
									<div className="flex flex-wrap gap-2">
										{tutorGrades.sort((a,b) => a-b).map((g) => {
											const secsForGrade = tutorSchoolLevel === 'secondary'
												? tutorSections.filter((s) => (SECONDARY_SECTIONS[g] ?? []).includes(s))
												: [];
											return (
												<div key={g}>
													<Box
														className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2"
														sx={{ background: tutorSchoolLevel === 'primary' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
													>
														<Typography className="text-sm font-black text-white">{tutorSchoolLevel === 'primary' ? `Gr. ${g}` : `Yr. ${g}`}</Typography>
													</Box>
													{secsForGrade.map((s) => {
														const c = SEC_COLORS[s];
														return c ? (
															<Box key={s} className="ml-1 inline-flex items-center gap-1 rounded-xl px-2.5 py-2" sx={{ backgroundColor: c.bg, color: c.text }}>
																<span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.from }} />
																<Typography className="text-xs font-semibold">{s}</Typography>
															</Box>
														) : null;
													})}
												</div>
											);
										})}
									</div>
								</div>
							)}
						</div>
					</SectionCard>
				)}

				{/* ── Student placement card ── */}
				{isStudent && placementLabel && (
					<SectionCard delay={0.1}>
						<SectionHead icon="lucide:graduation-cap" label="Academic Placement" gradient="linear-gradient(135deg, #ec4899, #f43f5e)" />
						<div className="px-4 py-4 flex flex-wrap items-center gap-3">
							<Box className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2" sx={{ backgroundColor: 'action.selected' }}>
								<FuseSvgIcon size={14} color="action">{schoolLevel === 'primary' ? 'lucide:pencil-ruler' : 'lucide:school'}</FuseSvgIcon>
								<Typography className="text-xs font-bold capitalize">{schoolLevel}</Typography>
							</Box>
							<FuseSvgIcon size={14} color="disabled">lucide:chevron-right</FuseSvgIcon>
							<Box className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white"
								sx={{ background: schoolLevel === 'primary' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
								{grade}
							</Box>
							{section && sectionColors && (
								<>
									<FuseSvgIcon size={14} color="disabled">lucide:chevron-right</FuseSvgIcon>
									<Box className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2" sx={{ backgroundColor: sectionColors.bg, color: sectionColors.text }}>
										<span className="h-2 w-2 rounded-full" style={{ backgroundColor: sectionColors.from }} />
										<Typography className="text-sm font-bold">{section}</Typography>
									</Box>
								</>
							)}
						</div>
					</SectionCard>
				)}

				{/* ── Contact details card ── */}
				{(contact.emails?.some((e) => e.email) || contact.phoneNumbers?.some((p) => p.phoneNumber) || contact.address || contact.birthday) && (
					<SectionCard delay={0.18}>
						<SectionHead icon="lucide:contact" label="Contact Details" />
						<div className="divide-y" style={{ borderColor: 'var(--mui-palette-divider)' }}>
							{contact.emails?.some((e) => e.email) && (
								<InfoRow icon="lucide:mail">
									<div className="flex flex-col gap-1">
										{contact.emails?.map((item) => item.email && (
											<div key={item.email} className="flex flex-wrap items-center gap-2">
												<a className="text-sm font-semibold hover:underline" href={`mailto:${item.email}`}
													style={{ color: 'var(--mui-palette-secondary-main)' }} target="_blank" rel="noreferrer">
													{item.email}
												</a>
												{item.label && <Chip label={item.label} size="small" variant="outlined" sx={{ height: 20 }} />}
											</div>
										))}
									</div>
								</InfoRow>
							)}

							{contact.phoneNumbers?.some((p) => p.phoneNumber) && (
								<InfoRow icon="lucide:phone">
									<div className="flex flex-wrap items-center gap-2">
										<Box
											className="flex items-center gap-1.5 rounded-lg border px-2 py-1"
											sx={{ borderColor: 'divider', backgroundColor: 'action.hover' }}
										>
											<Box
												className="h-3.5 w-5 overflow-hidden rounded-sm"
												sx={{ background: "url('/assets/images/administration/accounts/flags.png') no-repeat 0 0", backgroundSize: '24px 3876px', backgroundPosition: '-1px -2145px' }}
											/>
											<Typography className="text-xs font-bold">+216</Typography>
										</Box>
										<Typography className="font-mono text-sm font-semibold">
											{contact.phoneNumbers[0].phoneNumber}
										</Typography>
									</div>
								</InfoRow>
							)}

							{contact.address && (
								<InfoRow icon="lucide:map-pin">
									<Typography className="text-sm">{contact.address}</Typography>
								</InfoRow>
							)}

							{contact.birthday && (
								<InfoRow icon="lucide:cake">
									<Typography className="text-sm">{format(new Date(contact.birthday), 'MMMM d, y')}</Typography>
								</InfoRow>
							)}
						</div>
					</SectionCard>
				)}

				{/* ── Notes ── */}
				{contact.notes && (
					<SectionCard delay={0.26}>
						<SectionHead icon="lucide:align-left" label="Notes" />
						<div className="px-4 py-4">
							<div className="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: contact.notes }} />
						</div>
					</SectionCard>
				)}
			</div>
		</div>
	);
}

export default ContactView;