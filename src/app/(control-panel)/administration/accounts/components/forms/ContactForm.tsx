'use client';

import Button from '@mui/material/Button';
import Link from '@fuse/core/Link';
import useParams from '@fuse/hooks/useParams';
import { useCallback, useEffect } from 'react';
import FuseLoading from '@fuse/core/FuseLoading';
import _ from 'lodash';
import { Controller, useForm } from 'react-hook-form';
import Box from '@mui/system/Box';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import useNavigate from '@fuse/hooks/useNavigate';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputAdornment from '@mui/material/InputAdornment';
import { motion, AnimatePresence } from 'motion/react';

import ContactEmailSelector from './email-selector/ContactEmailSelector';
import ContactModel, { ContactEmailModel, ContactPhoneModel } from '../../api/models/ContactModel';
import { useContact } from '../../api/hooks/contacts/useContact';
import { useCreateContact } from '../../api/hooks/contacts/useCreateContact';
import { useUpdateContact } from '../../api/hooks/contacts/useUpdateContact';
import { useDeleteContact } from '../../api/hooks/contacts/useDeleteContact';
import { useSnackbar } from 'notistack';

import {
	UserRole,
	SchoolLevel,
	SECONDARY_SECTIONS,
	sectionsForGrades,
	TUTOR_SUBJECTS,
	TutorSubject,
	contactFullName,
	ROLE_LABELS,
} from '../../api/types';


// ─── Zod schema ───────────────────────────────────────────────────────────────

const schema = z.object({
	avatar: z.string().optional(),
	background: z.string().optional(),
	firstName: z.string().min(1, { message: 'First name is required' }),
	lastName: z.string().min(1, { message: 'Last name is required' }),
	emails: z.array(z.object({ email: z.string().min(1), label: z.string().optional() })),
	phoneNumber: z.string().optional(),
	role: z.enum(['super_admin', 'content_admin', 'member_admin', 'studio_admin', 'radio_content_creator', 'broadcast_content_creator', 'culture_content_creator', 'lesson_content_creator', 'member', 'studio_staff', '']).optional(),
	// Tutor
	tutorSubject: z.string().optional(),
	tutorSchoolLevel: z.enum(['primary', 'secondary', '']).optional(),
	tutorGrades: z.array(z.number()).optional(),
	tutorSections: z.array(z.string()).optional(),
	// Student
	schoolLevel: z.enum(['primary', 'secondary', '']).optional(),
	grade: z.number().nullable().optional(),
	section: z.string().optional(),
	// Extra
	birthday: z.string().optional(),
	address: z.string().optional(),
	notes: z.string().optional()
});

type FormType = z.infer<typeof schema>;

// ─── Section color map ────────────────────────────────────────────────────────

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

// ─── Reusable primitives ──────────────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: string; label: string }) {
	return (
		<div className="flex items-center gap-2">
			<FuseSvgIcon color="action" size={18}>{icon}</FuseSvgIcon>
			<Typography variant="caption" className="text-xs font-bold uppercase tracking-widest" color="text.secondary">
				{label}
			</Typography>
		</div>
	);
}

/** Large role toggle card */
interface RoleCardProps {
	value: UserRole;
	current: UserRole;
	icon: string;
	label: string;
	description: string;
	from: string;
	to: string;
	onClick: () => void;
}
function RoleCard({ value, current, icon, label, description, from, to, onClick }: RoleCardProps) {
	const selected = current === value;
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			className="relative flex flex-1 cursor-pointer flex-col items-center gap-3 overflow-hidden rounded-2xl border-2 p-6 text-center transition-all duration-200"
			sx={{
				borderColor: selected ? from : 'divider',
				backgroundColor: selected ? from + '0e' : 'background.paper',
				boxShadow: selected ? `0 0 0 3px ${from}2a` : 'none',
				'&:hover': { borderColor: from, backgroundColor: from + '07' }
			}}
		>
			<Box
				className="flex h-16 w-16 items-center justify-center rounded-2xl"
				sx={{ background: selected ? `linear-gradient(135deg, ${from}, ${to})` : 'action.hover' }}
			>
				<FuseSvgIcon sx={{ color: selected ? 'white' : 'text.secondary' }} size={32}>{icon}</FuseSvgIcon>
			</Box>
			<div>
				<Typography className="text-base font-extrabold">{label}</Typography>
				<Typography className="mt-0.5 text-xs" color="text.secondary">{description}</Typography>
			</div>
			<AnimatePresence>
				{selected && (
					<motion.div
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0, opacity: 0 }}
						className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full"
						style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
					>
						<FuseSvgIcon className="text-white" size={14}>lucide:check</FuseSvgIcon>
					</motion.div>
				)}
			</AnimatePresence>
		</Box>
	);
}

/** Bigger school level toggle */
interface LevelToggleProps {
	label: string;
	icon: string;
	subtitle: string;
	selected: boolean;
	from: string;
	to: string;
	onClick: () => void;
}
function LevelToggle({ label, icon, subtitle, selected, from, to, onClick }: LevelToggleProps) {
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3.5 transition-all duration-150"
			sx={{
				borderColor: selected ? from : 'divider',
				backgroundColor: selected ? from + '0e' : 'background.paper',
				color: selected ? from : 'text.secondary',
				'&:hover': { borderColor: from, color: from }
			}}
		>
			<Box
				className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
				sx={{ background: selected ? `linear-gradient(135deg, ${from}, ${to})` : 'action.hover' }}
			>
				<FuseSvgIcon sx={{ color: selected ? 'white' : 'text.secondary' }} size={20}>{icon}</FuseSvgIcon>
			</Box>
			<div className="text-left">
				<Typography className="text-sm font-bold leading-none">{label}</Typography>
				<Typography className="mt-0.5 text-xs" color="text.secondary">{subtitle}</Typography>
			</div>
		</Box>
	);
}

/** Large grade pill */
interface GradePillProps {
	grade: number;
	selected: boolean;
	multi?: boolean;
	from: string;
	to: string;
	onClick: () => void;
}
function GradePill({ grade, selected, multi = false, from, to, onClick }: GradePillProps) {
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			className="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl border-2 text-lg font-black transition-all duration-150"
			sx={{
				borderColor: selected ? from : 'divider',
				background: selected ? `linear-gradient(135deg, ${from}, ${to})` : 'background.paper',
				color: selected ? 'white' : 'text.secondary',
				boxShadow: selected ? `0 4px 14px ${from}44` : 'none',
				'&:hover': { borderColor: from, color: selected ? 'white' : from }
			}}
		>
			{grade}
			{multi && selected && (
				<Box
					className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full"
					sx={{ background: `linear-gradient(135deg, ${from}, ${to})`, border: '2px solid', borderColor: 'background.paper' }}
				>
					<FuseSvgIcon className="text-white" size={10}>lucide:check</FuseSvgIcon>
				</Box>
			)}
		</Box>
	);
}

/** Section / speciality chip */
interface SpecChipProps {
	label: string;
	selected: boolean;
	multi?: boolean;
	onClick: () => void;
}
function SpecChip({ label, selected, multi = false, onClick }: SpecChipProps) {
	const c = SEC_COLORS[label] ?? { from: '#64748b', to: '#475569', bg: '#f1f5f9', text: '#475569' };
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all duration-150"
			sx={{
				borderColor: selected ? c.from : 'divider',
				backgroundColor: selected ? c.bg : 'background.paper',
				color: selected ? c.text : 'text.secondary',
				boxShadow: selected ? `0 2px 10px ${c.from}30` : 'none',
				'&:hover': { borderColor: c.from, color: c.text, backgroundColor: c.bg }
			}}
		>
			{selected && (
				<Box
					className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
					sx={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
				>
					<FuseSvgIcon className="text-white" size={11}>lucide:check</FuseSvgIcon>
				</Box>
			)}
			{!selected && (
				<span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.from, opacity: 0.5 }} />
			)}
			{label}
		</Box>
	);
}

// ─── Main form ────────────────────────────────────────────────────────────────

type ContactFormProps = { isNew?: boolean };

function ContactForm({ isNew }: ContactFormProps) {
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();
	const routeParams = useParams<{ contactId: string }>();
	const { contactId } = routeParams;

	const { data: contact, isError } = useContact(contactId);
	const { mutate: createContact } = useCreateContact();
	const { mutate: updateContact } = useUpdateContact();
	const { mutate: deleteContact } = useDeleteContact();

	const { control, watch, reset, handleSubmit, setValue, formState } = useForm<FormType>({
		mode: 'all',
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;
	const form = watch();

	const role = (watch('role') ?? '') as UserRole;

	// Get all available roles from ROLE_LABELS (excluding empty string)
	const allRoles = Object.keys(ROLE_LABELS).filter(r => r !== '') as UserRole[];

	useEffect(() => {
		if (isNew) reset(ContactModel({}));
		else reset({
			...contact,
			phoneNumber: contact?.phoneNumbers?.[0]?.phoneNumber ?? '',
			emails: contact?.emails ?? [ContactEmailModel({})]
		});
		// eslint-disable-next-line
	}, [contact, reset, routeParams]);

	const onSubmit = useCallback(() => {
		const formData = {
			...form,
			emails: form.emails?.map((e) => ContactEmailModel(e)) || [],
			phoneNumbers: [ContactPhoneModel({ country: 'tn', phoneNumber: form.phoneNumber ?? '' })]
		};
		if (isNew) {
			createContact(ContactModel(formData as any), {
				onSuccess: (action) => navigate(`/administration/accounts/${action.id}`)
			});
		} else {
			updateContact({ id: contact.id, ...formData } as any);
		}
		// eslint-disable-next-line
	}, [form]);

	// Toggle helpers
	function handleRemoveContact() {
		if (!contact) return;
		deleteContact(contact.id, { onSuccess: () => navigate('/administration/accounts') });
	}

	const background = watch('background');
	const firstName = watch('firstName');
	const lastName = watch('lastName');
	const displayName = [firstName, lastName].filter(Boolean).join(' ') || '?';

	if (isError && !isNew) {
		setTimeout(() => { navigate('/administration/accounts'); enqueueSnackbar('NOT FOUND', { variant: 'error' }); }, 0);
		return null;
	}
	if (_.isEmpty(form)) return <FuseLoading className="min-h-screen" />;

	return (
		<>
			<div className="relative flex flex-auto flex-col items-center overflow-y-auto">
				{/* Cover */}
				<Box className="relative min-h-40 w-full sm:min-h-52" sx={{ backgroundColor: 'background.default' }}>
					{background && <img className="absolute inset-0 h-full w-full object-cover" src={background} alt="" />}
					<Box className="absolute inset-0" sx={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.18) 100%)' }} />
				</Box>

				<div className="w-full px-6 pb-10 sm:px-10">
					{/* Avatar */}
					<div className="-mt-14 mb-6 flex w-full items-end">
						<Controller
							control={control}
							name="avatar"
							render={({ field: { onChange, value } }) => (
								<Box
									sx={{ borderWidth: 4, borderStyle: 'solid', borderColor: 'background.paper', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
									className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full sm:h-32 sm:w-32"
								>
									<div className="absolute inset-0 z-10 bg-black/40" />
									<div className="absolute inset-0 z-20 flex items-center justify-center gap-1">
										<label htmlFor="button-avatar" className="flex cursor-pointer p-1.5">
											<input accept="image/*" className="hidden" id="button-avatar" type="file"
												onChange={async (e) => {
													const file = e?.target?.files?.[0];
													if (!file) return;
													const reader = new FileReader();
													reader.onload = () => {
														if (typeof reader.result === 'string')
															onChange(`data:${file.type};base64,${btoa(reader.result)}`);
													};
													reader.readAsBinaryString(file);
												}}
											/>
											<FuseSvgIcon className="text-white" size={20}>lucide:camera</FuseSvgIcon>
										</label>
										<IconButton size="small" onClick={() => onChange('')}>
											<FuseSvgIcon className="text-white" size={18}>lucide:trash</FuseSvgIcon>
										</IconButton>
									</div>
									<Avatar
										sx={{ backgroundColor: 'background.default', color: 'text.secondary' }}
										className="h-full w-full object-cover text-3xl font-bold"
										src={value}
										alt={displayName}
									>
										{firstName?.charAt(0)}
									</Avatar>
								</Box>
							)}
						/>
					</div>

					{/* ══ 1. ROLE ═══════════════════════════════════════════════ */}
					<SectionHeader icon="lucide:user-cog" label="Role" />

				<div className="mt-4">
						<Controller
							control={control}
							name="role"
							render={({ field }) => (
								<FormControl fullWidth>
									<FormLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.8rem' }}>Select Role *</FormLabel>
									<Select
										{...field}
										displayEmpty
										variant="outlined"
										sx={{ minHeight: 52 }}
										startAdornment={
											<InputAdornment position="start">
												<FuseSvgIcon color="action" size={20}>lucide:user-cog</FuseSvgIcon>
											</InputAdornment>
										}
										renderValue={(value) => {
											if (!value) return <span style={{ color: 'var(--mui-palette-text-disabled)' }}>Select a role…</span>;
											return ROLE_LABELS[value as UserRole] || value;
										}}
									>
										{allRoles.map((r) => (
											<MenuItem key={r} value={r}>
												{ROLE_LABELS[r]}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							)}
						/>
					</div>
					{/* ══ 2. IDENTITY ═══════════════════════════════════════════ */}
					<SectionHeader icon="lucide:user-round" label="Identity" />

					<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Controller
							control={control}
							name="firstName"
							render={({ field }) => (
								<FormControl className="w-full">
									<FormLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.8rem' }}>First Name *</FormLabel>
									<TextField
										{...field}
										placeholder="First name"
										error={!!errors.firstName}
										helperText={errors?.firstName?.message}
										variant="outlined"
										fullWidth
										slotProps={{ input: { startAdornment: <InputAdornment position="start"><FuseSvgIcon color="action">lucide:user</FuseSvgIcon></InputAdornment>, style: { minHeight: 52 } } }}
									/>
								</FormControl>
							)}
						/>
						<Controller
							control={control}
							name="lastName"
							render={({ field }) => (
								<FormControl className="w-full">
									<FormLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.8rem' }}>Last Name *</FormLabel>
									<TextField
										{...field}
										placeholder="Last name"
										error={!!errors.lastName}
										helperText={errors?.lastName?.message}
										variant="outlined"
										fullWidth
										slotProps={{ input: { startAdornment: <InputAdornment position="start"><FuseSvgIcon color="action">lucide:user</FuseSvgIcon></InputAdornment>, style: { minHeight: 52 } } }}
									/>
								</FormControl>
							)}
						/>
					</div>

					<Divider className="my-7" />

					{/* ══ 3. CONTACT DETAILS ════════════════════════════════════ */}
					<SectionHeader icon="lucide:contact-round" label="Contact Details" />

					<div className="mt-4 flex flex-col gap-4">
						{/* Email */}
						<Controller
							control={control}
							name="emails"
							render={({ field }) => (
								<FormControl className="w-full">
									<FormLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.8rem' }}>Email</FormLabel>
									<ContactEmailSelector
										{...field}
										value={field.value.map((e) => ContactEmailModel(e))}
										onChange={(val) => field.onChange(val)}
									/>
								</FormControl>
							)}
						/>

						{/* Phone — fixed +216 */}
						<Controller
							control={control}
							name="phoneNumber"
							render={({ field }) => (
								<FormControl className="w-full">
									<FormLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.8rem' }}>Phone Number</FormLabel>
									<TextField
										{...field}
										placeholder="20 000 000"
										variant="outlined"
										fullWidth
										slotProps={{
											input: {
												style: { minHeight: 52 },
												startAdornment: (
													<InputAdornment position="start">
														<Box
															className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 mr-1"
															sx={{ backgroundColor: 'action.hover', borderColor: 'divider' }}
														>
															{/* TN flag */}
															<Box
																className="h-4 w-6 overflow-hidden rounded-sm"
																sx={{
																	background: "url('/assets/images/administration/accounts/flags.png') no-repeat 0 0",
																	backgroundSize: '24px 3876px',
																	backgroundPosition: '-1px -2145px' // Tunisia flag position
																}}
															/>
															<Typography className="text-sm font-bold">+216</Typography>
														</Box>
													</InputAdornment>
												)
											}
										}}
									/>
								</FormControl>
							)}
						/>

						{/* Address */}
						<Controller
							control={control}
							name="address"
							render={({ field }) => (
								<FormControl className="w-full">
									<FormLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.8rem' }}>Address</FormLabel>
									<TextField
										{...field}
										placeholder="Address"
										variant="outlined"
										fullWidth
										slotProps={{ input: { style: { minHeight: 52 }, startAdornment: <InputAdornment position="start"><FuseSvgIcon color="action">lucide:map-pin</FuseSvgIcon></InputAdornment> } }}
									/>
								</FormControl>
							)}
						/>
					</div>

					<Divider className="my-7" />

					{/* ══ 4. ADDITIONAL INFO ════════════════════════════════════ */}
					<SectionHeader icon="lucide:info" label="Additional Info" />

					<div className="mt-4 flex flex-col gap-4">
						<Controller
							control={control}
							name="birthday"
							render={({ field: { value, onChange } }) => (
								<FormControl className="w-full">
									<FormLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.8rem' }}>Date of Birth</FormLabel>
									<DateTimePicker
										value={value ? new Date(value) : null}
										onChange={(val) => onChange(val?.toISOString())}
										slotProps={{
											textField: { fullWidth: true, variant: 'outlined', error: !!errors.birthday, helperText: errors?.birthday?.message },
											actionBar: { actions: ['clear', 'today'] }
										}}
										slots={{ openPickerIcon: () => <FuseSvgIcon>lucide:cake</FuseSvgIcon> }}
									/>
								</FormControl>
							)}
						/>

						<Controller
							control={control}
							name="notes"
							render={({ field }) => (
								<FormControl className="w-full">
									<FormLabel sx={{ mb: 1, fontWeight: 700, fontSize: '0.8rem' }}>Notes</FormLabel>
									<TextField
										{...field}
										placeholder="Add a note about this account…"
										variant="outlined"
										fullWidth
										multiline
										minRows={4}
										maxRows={10}
										slotProps={{ input: { className: 'items-start', startAdornment: <InputAdornment position="start" sx={{ mt: 1.5 }}><FuseSvgIcon color="action">lucide:align-left</FuseSvgIcon></InputAdornment> } }}
									/>
								</FormControl>
							)}
						/>
					</div>
				</div>
			</div>

			{/* Sticky footer */}
			<Box
				className="flex items-center gap-2 border-t py-3.5 pr-4 pl-3 sm:pr-10 sm:pl-8"
				sx={{ backgroundColor: 'background.default', borderColor: 'divider' }}
			>
				{!isNew && (
					<Button color="error" variant="outlined" size="small" onClick={handleRemoveContact}
						startIcon={<FuseSvgIcon size={16}>lucide:trash-2</FuseSvgIcon>}>
						Delete
					</Button>
				)}
				<div className="ml-auto flex items-center gap-2">
					<Button component={Link} to={`/administration/accounts/${contactId}`} variant="outlined" size="small">
						Cancel
					</Button>
					<Button
						variant="contained" color="secondary" size="small"
						disabled={_.isEmpty(dirtyFields) || !isValid}
						onClick={handleSubmit(onSubmit)}
						startIcon={<FuseSvgIcon size={16}>lucide:save</FuseSvgIcon>}
					>
						Save Changes
					</Button>
				</div>
			</Box>
		</>
	);
}

export default ContactForm;