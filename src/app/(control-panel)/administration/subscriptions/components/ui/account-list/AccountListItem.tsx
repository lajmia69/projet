import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import ListItemButton from '@mui/material/ListItemButton';
import Chip from '@mui/material/Chip';
import { Account } from '../../../api/types';

type Props = { account: Account };

function AccountListItem({ account }: Props) {
	const activeSubscription = account.subscriptions?.find((s) => s.is_active);
	const hasAnySubscription = (account.subscriptions?.length ?? 0) > 0;

	return (
		<ListItemButton
			className="border-divider border-b-1 px-4 py-4 md:px-8"
			sx={{ bgcolor: 'background.paper' }}
			component={NavLinkAdapter}
			to={`/administration/subscriptions/${account.id}/view`}
		>
			<ListItemAvatar>
				<Avatar alt={account.full_name} src={account.avatar_url}>
					{account.full_name?.charAt(0)}
				</Avatar>
			</ListItemAvatar>
			<ListItemText
				classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
				primary={account.full_name}
				secondary={
					<Typography component="span" variant="body2" color="text.secondary">
						{account.email}
					</Typography>
				}
			/>
			{hasAnySubscription ? (
				<Chip
					label={activeSubscription ? 'Active' : 'Inactive'}
					size="small"
					sx={{
						ml: 2,
						flexShrink: 0,
						backgroundColor: activeSubscription ? '#dcfce7' : '#f1f5f9',
						color: activeSubscription ? '#16a34a' : '#64748b',
						border: `1px solid ${activeSubscription ? '#bbf7d0' : '#e2e8f0'}`,
						fontWeight: 600,
						fontSize: 11
					}}
				/>
			) : (
				<Chip
					label="No subscription"
					size="small"
					sx={{
						ml: 2,
						flexShrink: 0,
						backgroundColor: '#fef9c3',
						color: '#854d0e',
						border: '1px solid #fde68a',
						fontWeight: 600,
						fontSize: 11
					}}
				/>
			)}
		</ListItemButton>
	);
}

export default AccountListItem;