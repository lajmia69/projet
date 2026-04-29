import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDeleteAccount } from '@/app/(control-panel)/administration/accounts/api/hooks/accounts/useDeleteAccount';
import useUser from '@auth/useUser';
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
  const { data: currentUser } = useUser();
  const token = currentUser?.token;
  const { mutate: deleteAccount, isLoading: isDeleting } = useDeleteAccount(token as any, account.id);

  const handleDelete = (ev: React.MouseEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
    if (!token) return;
    // Prevent deleting the currently logged-in account
    if (currentUser?.id === account.id) return;
    // Simple confirmation before deletion
    const ok = window.confirm('Delete this account? This action cannot be undone.');
    if (ok) deleteAccount();
  };

	return (
		<>
            <ListItemButton
                className="border-divider border-b-1 px-4 py-4 md:px-8"
                sx={{ bgcolor: '#F2F0EF', border: '1px solid rgba(45,139,124,0.25)' }}
                component={NavLinkAdapter}
                to={`/administration/accounts/${account.id}`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={handleDelete}
                            disabled={isDeleting || !!(currentUser?.id === account.id)}
                            aria-label="Delete account"
                        >
                            <FuseSvgIcon>lucide:trash</FuseSvgIcon>
                        </IconButton>
                    </Box>
            </ListItemButton>
        </>
    );
}

export default AccountListItem;
