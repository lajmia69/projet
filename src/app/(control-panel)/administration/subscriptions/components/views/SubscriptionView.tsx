'use client';

import useParams from '@fuse/hooks/useParams';
import FuseLoading from '@fuse/core/FuseLoading';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/system/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { format } from 'date-fns/format';
import useNavigate from '@fuse/hooks/useNavigate';
import { useSnackbar } from 'notistack';
import useUser from '@auth/useUser';
import { useAccount } from '../../api/hooks/useAccount';
import { useToggleSubscription } from '../../api/hooks/useToggleSubscription';
import { Subscription } from '../../api/types';

function SubscriptionView() {
	const routeParams = useParams<{ accountId: string }>();
	const { accountId } = routeParams;
	const { data: currentAccount } = useUser();
	const token = currentAccount.token;
	const { data: account, isLoading, isError } = useAccount(token, parseInt(accountId));
	const { mutate: toggleSubscription, isPending } = useToggleSubscription(token);
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();

	if (isLoading) return <FuseLoading className="min-h-screen" />;

	if (isError) {
		setTimeout(() => {
			navigate('/administration/subscriptions');
			enqueueSnackbar('NOT FOUND', { variant: 'error' });
		}, 0);
		return null;
	}

	if (!account) return null;

	const subscriptions = account.subscriptions ?? [];
	const hasSubscriptions = subscriptions.length > 0;

	function handleToggle(subscription: Subscription) {
		toggleSubscription(
			{ subscriptionId: subscription.id, accountId: account.id, is_active: !subscription.is_active },
			{
				onSuccess: () =>
					enqueueSnackbar(
						`Subscription ${!subscription.is_active ? 'activated' : 'deactivated'} successfully`,
						{ variant: 'success' }
					),
				onError: () =>
					enqueueSnackbar('Failed to update subscription', { variant: 'error' })
			}
		);
	}

	return (
		<div className="flex flex-auto flex-col overflow-y-auto">
			{/* Hero banner */}
			<Box
				className="relative w-full"
				style={{
					background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 40%, #0A2472 100%)',
					minHeight: 110
				}}
			>
				<div
					style={{
						position: 'absolute', inset: 0,
						backgroundImage:
							'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)',
						pointerEvents: 'none'
					}}
				/>
			</Box>

			{/* Avatar row */}
			<div className="flex items-end px-8" style={{ marginTop: -44 }}>
				<div style={{
					padding: 4, borderRadius: '50%',
					background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
				}}>
					<Avatar
						src={account.avatar_url}
						alt={account.avatar_alt}
						style={{
							width: 88, height: 88, fontSize: 32, fontWeight: 700,
							background: 'linear-gradient(135deg, #1565C0, #0A2472)', color: '#fff'
						}}
					>
						{account.username?.charAt(0)?.toUpperCase()}
					</Avatar>
				</div>
			</div>

			{/* Account info */}
			<div className="px-8 pt-4 pb-2">
				<Typography
					variant="h5"
					className="font-extrabold tracking-tight"
					style={{ color: '#1e293b' }}
				>
					{account.full_name}
				</Typography>
				{account.username && (
					<Typography className="text-sm font-medium mt-0.5" style={{ color: '#64748b' }}>
						@{account.username}
					</Typography>
				)}
				<Typography className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>
					{account.email}
				</Typography>
			</div>

			<Divider style={{ margin: '12px 32px', borderColor: '#f1f5f9' }} />

			{/* Subscriptions section */}
			<div className="px-8 pb-6">
				<Typography
					className="text-xs font-semibold uppercase tracking-wider mb-4"
					style={{ color: '#94a3b8' }}
				>
					Subscriptions
				</Typography>

				{!hasSubscriptions ? (
					<div
						className="flex flex-col items-center justify-center rounded-xl py-10 gap-2"
						style={{ background: '#f8fafc', border: '1.5px dashed #e2e8f0' }}
					>
						<FuseSvgIcon size={32} style={{ color: '#cbd5e1' }}>
							lucide:credit-card
						</FuseSvgIcon>
						<Typography className="text-sm font-medium" style={{ color: '#94a3b8' }}>
							No subscriptions found for this account
						</Typography>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{subscriptions.map((subscription) => (
							<div
								key={subscription.id}
								className="rounded-xl p-5"
								style={{
									background: '#fff',
									border: '1.5px solid #e2e8f0',
									boxShadow: '0 1px 6px rgba(0,0,0,0.05)'
								}}
							>
								{/* Card header */}
								<div className="flex items-start justify-between mb-3">
									<div>
										<Typography
											className="font-bold text-base"
											style={{ color: '#1e293b' }}
										>
											{subscription.reference}
										</Typography>
										{subscription.level?.name && (
											<Chip
												label={subscription.level.name}
												size="small"
												style={{
													marginTop: 4,
													backgroundColor: '#eff6ff',
													color: '#1d4ed8',
													border: '1px solid #bfdbfe',
													fontWeight: 600,
													fontSize: 11
												}}
											/>
										)}
									</div>

									{/* Toggle */}
									<FormControlLabel
										control={
											<Switch
												checked={subscription.is_active}
												onChange={() => handleToggle(subscription)}
												disabled={isPending}
												color="success"
											/>
										}
										label={
											<Typography
												className="text-xs font-semibold"
												style={{
													color: subscription.is_active ? '#16a34a' : '#64748b'
												}}
											>
												{subscription.is_active ? 'Active' : 'Inactive'}
											</Typography>
										}
										labelPlacement="start"
										sx={{ ml: 0, gap: 1 }}
									/>
								</div>

								<Divider style={{ borderColor: '#f1f5f9', marginBottom: 12 }} />

								{/* Dates */}
								<div className="flex flex-col gap-2">
									<InfoRow
										icon="lucide:calendar-check"
										label="Start Date"
										value={
											subscription.start_date
												? format(new Date(subscription.start_date), 'MMMM d, yyyy')
												: '—'
										}
									/>
									<InfoRow
										icon="lucide:calendar-x"
										label="End Date"
										value={
											subscription.end_date
												? format(new Date(subscription.end_date), 'MMMM d, yyyy')
												: '—'
										}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

type InfoRowProps = { icon: string; label: string; value: string };

function InfoRow({ icon, label, value }: InfoRowProps) {
	return (
		<div className="flex items-center gap-3">
			<FuseSvgIcon size={14} style={{ color: '#94a3b8', flexShrink: 0 }}>
				{icon}
			</FuseSvgIcon>
			<Typography className="text-xs" style={{ color: '#94a3b8', minWidth: 70 }}>
				{label}
			</Typography>
			<Typography className="text-sm font-medium" style={{ color: '#1e293b' }}>
				{value}
			</Typography>
		</div>
	);
}

export default SubscriptionView;