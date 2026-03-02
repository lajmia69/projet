import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { GroupedAccounts } from '../../../api/types';
import FuseLoading from '@fuse/core/FuseLoading';
import { useFilteredAccounts } from '@/app/(control-panel)/administration/accounts/hooks/useFilteredAccounts';
import useUser from '@auth/useUser';
import { useGroupedAccounts } from '@/app/(control-panel)/administration/accounts/hooks/useGroupedAccounts';
import { Account } from '@/app/(control-panel)/administration/accounts/api/types';
import AccountListItem from '@/app/(control-panel)/administration/accounts/components/ui/account-list/AccountListItem';

/**
 * The accounts list.
 */
function AccountsList() {
	const { data: currentAccount } = useUser();
	const { data: filteredAccounts, isLoading } = useFilteredAccounts(currentAccount.token);
	const { data: groupedFilteredAccounts, isLoading: isGroupedAccountsLoading } = useGroupedAccounts(
		currentAccount.token
	);

	if (isLoading || isGroupedAccountsLoading) {
		return <FuseLoading />;
	}

	if (filteredAccounts?.length === 0) {
		return (
			<div className="flex h-full flex-1 items-center justify-center">
				<Typography
					color="text.secondary"
					variant="h5"
				>
					There are no accounts!
				</Typography>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ y: 20, opacity: 0 }}
			animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
			className="flex max-h-full w-full flex-auto flex-col"
		>
			{Object?.entries(groupedFilteredAccounts)?.map(([key, group]: [string, GroupedAccounts]) => {
				return (
					<div
						key={key}
						className="relative"
					>
						{/* Near-white neutral band */}
						<div
							className="sticky top-0 z-10 flex items-center gap-4 px-4 py-2 md:px-8"
							style={{
								background: '#f8fafc',
								borderTop: '1px solid #e2e8f0',
								borderBottom: '1px solid #e2e8f0'
							}}
						>
							{/* Letter badge */}
							<div
								style={{
									width: 34,
									height: 34,
									borderRadius: 8,
									background: '#ffffff',
									border: '1.5px solid #e2e8f0',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									flexShrink: 0,
									boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
								}}
							>
								<span
									style={{
										color: '#1e293b',
										fontSize: 17,
										fontWeight: 800,
										fontFamily: '"Inter", "Roboto", sans-serif',
										lineHeight: 1,
										textTransform: 'uppercase' as const
									}}
								>
									{key.toUpperCase()}
								</span>
							</div>

							{/* Thin divider line */}
							<div
								style={{
									flex: 1,
									height: 1,
									background: '#e2e8f0',
									borderRadius: 1
								}}
							/>
						</div>

						<List className="m-0 w-full p-0">
							{group?.children?.map((item: Account) => (
								<AccountListItem
									key={item.id}
									account={item}
								/>
							))}
						</List>
					</div>
				);
			})}
		</motion.div>
	);
}

export default AccountsList;