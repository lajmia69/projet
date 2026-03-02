import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import ListItemButton from '@mui/material/ListItemButton';
// import { Contact } from '../../../api/types';
import { Account } from '@/app/(control-panel)/administration/accounts/api/types';

type AccountListItemPropsType = {
	account: Account;
};

/**
 * The account list item.
 */
function AccountListItem(props: AccountListItemPropsType) {
	const { account } = props;

	return (
		<>
			<ListItemButton
				className="border-divider border-b-1 px-4 py-4 md:px-8"
				sx={{ bgcolor: 'background.paper' }}
				component={NavLinkAdapter}
				to={`/administration/accounts/${account.id}`}
			>
				<ListItemAvatar>
					<Avatar
						alt={account.full_name}
						src={account.avatar_url}
					/>
				</ListItemAvatar>
				<ListItemText
					classes={{ root: 'm-0', primary: 'font-medium leading-5 truncate' }}
					primary={account.full_name}
					secondary={
						<Typography
							className="inline"
							component="span"
							variant="body2"
							color="text.secondary"
						>
							{account.email}
						</Typography>
					}
				/>
			</ListItemButton>
		</>
	);
}

export default AccountListItem;
