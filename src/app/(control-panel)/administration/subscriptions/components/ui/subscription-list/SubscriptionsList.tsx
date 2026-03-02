import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import FuseLoading from '@fuse/core/FuseLoading';
import useUser from '@auth/useUser';
import { useFilteredSubscriptions } from '../../../hooks/useFilteredSubscriptions';
import { useGroupedSubscriptions } from '../../../hooks/useGroupedSubscriptions';
import { Subscription, GroupedSubscriptions } from '../../../api/types';
import SubscriptionListItem from './SubscriptionListItem';

function SubscriptionsList() {
	const { data: currentAccount } = useUser();
	const { data: filteredSubscriptions, isLoading } = useFilteredSubscriptions(currentAccount.token);
	const { data: groupedSubscriptions, isLoading: isGroupedLoading } = useGroupedSubscriptions(currentAccount.token);

	if (isLoading || isGroupedLoading) {
		return <FuseLoading />;
	}

	if (filteredSubscriptions?.length === 0) {
		return (
			<div className="flex h-full flex-1 items-center justify-center">
				<Typography color="text.secondary" variant="h5">
					There are no subscriptions!
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
			{Object.entries(groupedSubscriptions).map(([key, group]: [string, GroupedSubscriptions]) => (
				<div key={key} className="relative">
					<div
						className="sticky top-0 z-10 flex items-center gap-4 px-4 py-2 md:px-8"
						style={{
							background: '#f8fafc',
							borderTop: '1px solid #e2e8f0',
							borderBottom: '1px solid #e2e8f0'
						}}
					>
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
						<div style={{ flex: 1, height: 1, background: '#e2e8f0', borderRadius: 1 }} />
					</div>

					<List className="m-0 w-full p-0">
						{group?.children?.map((item: Subscription) => (
							<SubscriptionListItem key={item.id} subscription={item} />
						))}
					</List>
				</div>
			))}
		</motion.div>
	);
}

export default SubscriptionsList;