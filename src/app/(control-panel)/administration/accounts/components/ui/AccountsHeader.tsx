import Input from '@mui/material/Input';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import Button from '@mui/material/Button';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useSearch } from '../../hooks/useSearch';
import { useFilteredAccounts } from '../../hooks/useFilteredAccounts';
import useUser from '@auth/useUser';

/**
 * The account header.
 */
function AccountsHeader() {
	const { searchText, setSearchText } = useSearch();
	const { data: account } = useUser();
	const { data: filteredData } = useFilteredAccounts(account.token);

	return (
		<div className="w-full">
			{/* Breadcrumb row */}
			<div className="px-4 py-2 md:px-6">
				<PageBreadcrumb className="text-sm" />
			</div>

			{/* Blue gradient banner */}
			<Box
				className="relative flex w-full items-center px-6 py-5 md:px-8"
				sx={{
					background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 40%, #0A2472 100%)'
				}}
			>
				{/* Left: icon + title */}
				<div className="flex flex-auto items-center gap-4">
					{/* Icon container */}
					<motion.div
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1, transition: { delay: 0.1 } }}
					>
						<Box
							className="flex h-14 w-14 items-center justify-center rounded-xl"
							sx={{
								backgroundColor: 'rgba(255,255,255,0.15)',
								backdropFilter: 'blur(4px)'
							}}
						>
							<FuseSvgIcon
								className="text-white"
								size={28}
							>
								lucide:users
							</FuseSvgIcon>
						</Box>
					</motion.div>

					{/* Title + count */}
					<div className="flex flex-col">
						<motion.div
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1, transition: { delay: 0.15 } }}
						>
							<Typography
								className="text-3xl font-extrabold leading-tight tracking-tight text-white"
								variant="h4"
							>
								Accounts
							</Typography>
						</motion.div>
						<motion.div
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1, transition: { delay: 0.2 } }}
						>
							<Typography
								className="text-sm font-medium"
								sx={{ color: 'rgba(255,255,255,0.7)' }}
							>
								{`${filteredData?.length ?? 0} accounts`}
							</Typography>
						</motion.div>
					</div>
				</div>

				{/* Right: search + add */}
				<div className="flex items-center gap-3">
					{/* Search input */}
					<motion.div
						initial={{ y: -10, opacity: 0 }}
						animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
					>
						<Box
							className="flex h-10 min-w-56 items-center gap-2 rounded-lg border border-white/30 px-3"
							sx={{
								backgroundColor: 'rgba(255,255,255,0.12)',
								backdropFilter: 'blur(4px)'
							}}
						>
							<FuseSvgIcon
								size={18}
								sx={{ color: 'rgba(255,255,255,0.7)' }}
							>
								lucide:search
							</FuseSvgIcon>
							<Input
								placeholder="Search accounts..."
								className="flex flex-1 text-white placeholder-white/60"
								disableUnderline
								fullWidth
								value={searchText}
								slotProps={{
									input: {
										'aria-label': 'Search',
										style: { color: 'white' }
									}
								}}
								sx={{
									'& input::placeholder': {
										color: 'rgba(255,255,255,0.6)',
										opacity: 1
									}
								}}
								onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setSearchText(ev.target.value)}
							/>
						</Box>
					</motion.div>

					{/* Add button */}
					<motion.div
						initial={{ y: -10, opacity: 0 }}
						animate={{ y: 0, opacity: 1, transition: { delay: 0.25 } }}
					>
						<Button
							variant="contained"
							component={NavLinkAdapter}
							to="/administration/accounts/new"
							startIcon={<FuseSvgIcon>lucide:user-plus</FuseSvgIcon>}
							sx={{
								backgroundColor: 'white',
								color: '#1565C0',
								fontWeight: 700,
								'&:hover': {
									backgroundColor: 'rgba(255,255,255,0.9)'
								},
								borderRadius: '8px',
								textTransform: 'none',
								paddingX: 2.5,
								height: 40
							}}
						>
							Add
						</Button>
					</motion.div>
				</div>
			</Box>
		</div>
	);
}

export default AccountsHeader;