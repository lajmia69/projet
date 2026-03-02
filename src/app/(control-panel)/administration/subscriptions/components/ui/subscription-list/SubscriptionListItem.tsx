import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import ListItemButton from '@mui/material/ListItemButton';
import Chip from '@mui/material/Chip';
import { format } from 'date-fns/format';
import { Subscription } from '../../../api/types';

type SubscriptionListItemPropsType = {
	subscription: Subscription;
};

function SubscriptionListItem(props: SubscriptionListItemPropsType) {
	const { subscription } = props;

	return (
		<ListItemButton
			className="border-divider border-b-1 px-4 py-4 md:px-8"
			sx={{ bgcolor: 'background.paper' }}
			component={NavLinkAdapter}
			to={`/administration/subscriptions/${subscription.id}`}
		>
			<ListItemText
				classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
				primary={subscription.reference}
				secondary={
					<span className="flex flex-col gap-0.5 mt-0.5">
						<Typography
							component="span"
							variant="body2"
							color="text.secondary"
						>
							{subscription.level?.name ?? '—'}
						</Typography>
						<Typography
							component="span"
							variant="caption"
							color="text.secondary"
						>
							{subscription.start_date
								? format(new Date(subscription.start_date), 'MMM d, yyyy')
								: '—'}{' '}
							→{' '}
							{subscription.end_date
								? format(new Date(subscription.end_date), 'MMM d, yyyy')
								: '—'}
						</Typography>
					</span>
				}
			/>
			<Chip
				label={subscription.is_active ? 'Active' : 'Inactive'}
				size="small"
				sx={{
					ml: 2,
					flexShrink: 0,
					backgroundColor: subscription.is_active ? '#dcfce7' : '#f1f5f9',
					color: subscription.is_active ? '#16a34a' : '#64748b',
					border: `1px solid ${subscription.is_active ? '#bbf7d0' : '#e2e8f0'}`,
					fontWeight: 600,
					fontSize: 11
				}}
			/>
		</ListItemButton>
	);
}

export default SubscriptionListItem;