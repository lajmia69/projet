'use client';

import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useParams from '@fuse/hooks/useParams';
import FuseLoading from '@fuse/core/FuseLoading';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/system/Box';
import useNavigate from '@fuse/hooks/useNavigate';
import ContactForm from '../forms/ContactForm';
import { useSnackbar } from 'notistack';
import { useAccount } from '@/app/(control-panel)/administration/accounts/api/hooks/accounts/useAccount';
import useUser from '@auth/useUser';

/**
 * The account view.
 */
function AccountView() {
	const routeParams = useParams<{ accountId: string }>();
	const isNew = routeParams.accountId === 'new';
	const { accountId } = routeParams;
	const { data: currentAccount } = useUser();
	const { data: account, isLoading, isError } = useAccount(currentAccount.token, parseInt(accountId));
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();

	if (isNew) {
		return <ContactForm isNew />;
	}

	if (isLoading) {
		return <FuseLoading className="min-h-screen" />;
	}

	if (isError) {
		setTimeout(() => {
			navigate('/administration/accounts');
			enqueueSnackbar('NOT FOUND', { variant: 'error' });
		}, 0);
		return null;
	}

	if (!account) {
		return null;
	}

	return (
		<div className="flex flex-auto flex-col overflow-y-auto">

			{/* ── Hero banner ── */}
			<Box
				className="relative w-full"
				style={{
					background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 40%, #0A2472 100%)',
					minHeight: 110
				}}
			>
				{/* subtle pattern overlay */}
				<div
					style={{
						position: 'absolute', inset: 0,
						backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)',
						pointerEvents: 'none'
					}}
				/>
			</Box>

			{/* ── Avatar row — sits right below banner ── */}
			<div
				className="flex items-end justify-between px-8"
				style={{ marginTop: -44 }}
			>
				{/* Avatar with white ring */}
				<div style={{
					padding: 4,
					borderRadius: '50%',
					background: 'white',
					boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
				}}>
					<Avatar
						src={account.avatar_url}
						alt={account.avatar_alt}
						style={{
							width: 88,
							height: 88,
							fontSize: 32,
							fontWeight: 700,
							background: 'linear-gradient(135deg, #1565C0, #0A2472)',
							color: '#fff'
						}}
					>
						{account?.username?.charAt(0)?.toUpperCase()}
					</Avatar>
				</div>

				{/* Edit button — right side, same row as avatar, clear of the X */}
				<div style={{ paddingBottom: 6 }}>
					<Button
						variant="contained"
						component={NavLinkAdapter}
						to={`/administration/accounts/${accountId}/edit`}
						startIcon={<FuseSvgIcon size={16}>lucide:square-pen</FuseSvgIcon>}
						style={{
							background: 'linear-gradient(135deg, #1565C0, #0D47A1)',
							color: '#fff',
							fontWeight: 600,
							textTransform: 'none',
							borderRadius: 8,
							boxShadow: '0 2px 8px rgba(13,71,161,0.3)'
						}}
					>
						Edit
					</Button>
				</div>
			</div>

			{/* ── Profile info ── */}
			<div className="px-8 pt-4 pb-6">

				{/* Name + username + roles */}
				<div className="mb-4">
					<Typography
						variant="h5"
						className="font-extrabold tracking-tight"
						style={{ color: '#1e293b', lineHeight: 1.2 }}
					>
						{account.full_name}
					</Typography>

					{account.username && (
						<Typography
							className="mt-0.5 text-sm font-medium"
							style={{ color: '#64748b' }}
						>
							@{account.username}
						</Typography>
					)}

					{account?.roles?.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1.5">
							{account.roles.map((role) => (
								<Chip
									key={role.id}
									label={role.name}
									size="small"
									style={{
										backgroundColor: '#eff6ff',
										color: '#1d4ed8',
										border: '1px solid #bfdbfe',
										fontWeight: 600,
										fontSize: 11
									}}
								/>
							))}
						</div>
					)}
				</div>

				<Divider style={{ borderColor: '#f1f5f9', marginBottom: 16 }} />

				{/* Info rows */}
				<div className="flex flex-col">

					{account.first_name && (
						<InfoRow icon="lucide:user" label="First Name" value={account.first_name} />
					)}

					{account.last_name && (
						<InfoRow icon="lucide:user-check" label="Last Name" value={account.last_name} />
					)}

					{account.email && (
						<InfoRow
							icon="lucide:mail"
							label="Email"
							value={
								<a
									href={`mailto:${account.email}`}
									style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: 500 }}
								>
									{account.email}
								</a>
							}
						/>
					)}

					{account.phone && (
						<InfoRow icon="lucide:phone" label="Phone" value={account.phone} />
					)}

					{account.address && (
						<InfoRow icon="lucide:map-pin" label="Address" value={account.address} />
					)}

					{account.biography && (
						<InfoRow
							icon="lucide:align-left"
							label="Biography"
							value={
								<div
									className="prose dark:prose-invert max-w-none"
									dangerouslySetInnerHTML={{ __html: account.biography }}
								/>
							}
							alignTop
						/>
					)}

				</div>

				{/* Status badge */}
				<div className="mt-6 flex items-center gap-2">
					<div style={{
						width: 8, height: 8, borderRadius: '50%',
						backgroundColor: account.is_active ? '#22c55e' : '#94a3b8'
					}} />
					<Typography
						className="text-xs font-semibold"
						style={{ color: account.is_active ? '#16a34a' : '#64748b' }}
					>
						{account.is_active ? 'Active account' : 'Inactive account'}
					</Typography>
				</div>

			</div>
		</div>
	);
}

/* ── Reusable info row ── */
type InfoRowProps = {
	icon: string;
	label: string;
	value: React.ReactNode;
	alignTop?: boolean;
};

function InfoRow({ icon, label, value, alignTop = false }: InfoRowProps) {
	return (
		<div
			className={`flex gap-4 py-3 ${alignTop ? 'items-start' : 'items-center'}`}
			style={{ borderBottom: '1px solid #f8fafc' }}
		>
			<div style={{
				width: 36, height: 36, borderRadius: 8,
				backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0',
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				flexShrink: 0
			}}>
				<FuseSvgIcon size={16} style={{ color: '#475569' }}>{icon}</FuseSvgIcon>
			</div>
			<div className="flex flex-col min-w-0">
				<Typography
					className="text-xs font-semibold uppercase tracking-wider"
					style={{ color: '#94a3b8', marginBottom: 2 }}
				>
					{label}
				</Typography>
				<Typography
					className="text-sm font-medium"
					style={{ color: '#1e293b', wordBreak: 'break-word' }}
					component="div"
				>
					{value}
				</Typography>
			</div>
		</div>
	);
}

export default AccountView;