'use client';

import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useParams from '@fuse/hooks/useParams';
import FuseLoading from '@fuse/core/FuseLoading';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/system/Box';
import { format } from 'date-fns/format';
import useNavigate from '@fuse/hooks/useNavigate';
import { useSnackbar } from 'notistack';
import useUser from '@auth/useUser';
import { useSubscription } from '../../api/hooks/subscriptions/useSubscription';
import SubscriptionForm from '../forms/SubscriptionForm';

function SubscriptionView() {
	const routeParams = useParams<{ subscriptionId: string }>();
	const isNew = routeParams.subscriptionId === 'new';
	const { subscriptionId } = routeParams;
	const { data: currentAccount } = useUser();
	const { data: subscription, isLoading, isError } = useSubscription(
		currentAccount.token,
		parseInt(subscriptionId)
	);
	const navigate = useNavigate();
	const { enqueueSnackbar } = useSnackbar();

	if (isNew) {
		return <SubscriptionForm isNew />;
	}

	if (isLoading) {
		return <FuseLoading className="min-h-screen" />;
	}

	if (isError) {
		setTimeout(() => {
			navigate('/administration/subscriptions');
			enqueueSnackbar('NOT FOUND', { variant: 'error' });
		}, 0);
		return null;
	}

	if (!subscription) {
		return null;
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
						position: 'absolute',
						inset: 0,
						backgroundImage:
							'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%)',
						pointerEvents: 'none'
					}}
				/>
			</Box>

			{/* Top actions row */}
			<div className="flex items-center justify-between px-8 pt-4">
				<div className="flex items-center gap-3">
					<Chip
						label={subscription.is_active ? 'Active' : 'Inactive'}
						size="small"
						sx={{
							backgroundColor: subscription.is_active ? '#dcfce7' : '#f1f5f9',
							color: subscription.is_active ? '#16a34a' : '#64748b',
							border: `1px solid ${subscription.is_active ? '#bbf7d0' : '#e2e8f0'}`,
							fontWeight: 600,
							fontSize: 12
						}}
					/>
					{subscription.level?.name && (
						<Chip
							label={subscription.level.name}
							size="small"
							style={{
								backgroundColor: '#eff6ff',
								color: '#1d4ed8',
								border: '1px solid #bfdbfe',
								fontWeight: 600,
								fontSize: 11
							}}
						/>
					)}
				</div>

				<Button
					variant="contained"
					component={NavLinkAdapter}
					to={`/administration/subscriptions/${subscriptionId}/edit`}
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

			{/* Profile info */}
			<div className="px-8 pt-4 pb-6">
				<div className="mb-4">
					<Typography
						variant="h5"
						className="font-extrabold tracking-tight"
						style={{ color: '#1e293b', lineHeight: 1.2 }}
					>
						{subscription.reference}
					</Typography>
				</div>

				<Divider style={{ borderColor: '#f1f5f9', marginBottom: 16 }} />

				<div className="flex flex-col">
					{subscription.level?.name && (
						<InfoRow icon="lucide:layers" label="Level" value={subscription.level.name} />
					)}

					{subscription.start_date && (
						<InfoRow
							icon="lucide:calendar-check"
							label="Start Date"
							value={format(new Date(subscription.start_date), 'MMMM d, yyyy')}
						/>
					)}

					{subscription.end_date && (
						<InfoRow
							icon="lucide:calendar-x"
							label="End Date"
							value={format(new Date(subscription.end_date), 'MMMM d, yyyy')}
						/>
					)}

					{subscription.account_id && (
						<InfoRow
							icon="lucide:user"
							label="Account ID"
							value={String(subscription.account_id)}
						/>
					)}
				</div>

				<div className="mt-6 flex items-center gap-2">
					<div
						style={{
							width: 8,
							height: 8,
							borderRadius: '50%',
							backgroundColor: subscription.is_active ? '#22c55e' : '#94a3b8'
						}}
					/>
					<Typography
						className="text-xs font-semibold"
						style={{ color: subscription.is_active ? '#16a34a' : '#64748b' }}
					>
						{subscription.is_active ? 'Active subscription' : 'Inactive subscription'}
					</Typography>
				</div>
			</div>
		</div>
	);
}

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
			<div
				style={{
					width: 36,
					height: 36,
					borderRadius: 8,
					backgroundColor: '#f1f5f9',
					border: '1px solid #e2e8f0',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexShrink: 0
				}}
			>
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

export default SubscriptionView;