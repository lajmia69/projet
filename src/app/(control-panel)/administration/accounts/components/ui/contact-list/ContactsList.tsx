import { motion } from 'motion/react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import FuseLoading from '@fuse/core/FuseLoading';
import ContactListItem from './ContactListItem';
import { useFilteredContacts } from '../../../hooks/useFilteredContacts';
import { useGroupedContacts } from '../../../hooks/useGroupedContacts';
import { Contact, GroupedContacts } from '../../../api/types';

function ContactsList() {
	const { data: filteredContacts, isLoading } = useFilteredContacts();
	const { data: groupedFilteredContacts, isLoading: isGroupedLoading } = useGroupedContacts();

	if (isLoading || isGroupedLoading) {
		return <div className="flex flex-1 items-center justify-center py-24"><FuseLoading /></div>;
	}

	if (!filteredContacts?.length) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
				className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-28 text-center"
			>
				<div className="relative flex h-28 w-44 items-center justify-center">
					{[
						{ color: '#6366f1', icon: 'lucide:book-open-check', left: 0,  top: 14 },
						{ color: '#ec4899', icon: 'lucide:graduation-cap',  left: 46, top: 0  },
						{ color: '#8b5cf6', icon: 'lucide:user',            left: 92, top: 14 }
					].map(({ color, icon, left, top }, i) => (
						<Box key={i} className="absolute flex items-center justify-center rounded-full border-2"
							sx={{ width: 52, height: 52, left, top, borderColor: 'background.paper', backgroundColor: color + '18' }}>
							<FuseSvgIcon size={22} sx={{ color }}>{icon}</FuseSvgIcon>
						</Box>
					))}
					<Box className="absolute -bottom-2 right-0 flex h-9 w-9 items-center justify-center rounded-full shadow-lg"
						sx={(t) => ({ backgroundColor: t.palette.secondary.main, color: 'white', border: '2px solid', borderColor: 'background.paper' })}>
						<FuseSvgIcon size={16}>lucide:plus</FuseSvgIcon>
					</Box>
				</div>

				<div className="max-w-xs">
					<Typography className="text-2xl font-extrabold tracking-tight">No accounts yet</Typography>
					<Typography className="mt-2 text-sm leading-relaxed" color="text.secondary">
						Add tutors and students to manage your academic community.
					</Typography>
				</div>

				<Button variant="contained" color="secondary" component={NavLinkAdapter} to="/administration/accounts/new"
					startIcon={<FuseSvgIcon size={18}>lucide:user-plus</FuseSvgIcon>}
					className="rounded-xl px-6 py-2.5 font-bold shadow-lg">
					Add First Account
				</Button>
			</motion.div>
		);
	}

	let globalIndex = 0;

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2 } }}
			className="flex max-h-full w-full flex-auto flex-col overflow-y-auto">
			{Object.entries(groupedFilteredContacts).map(([letter, group]: [string, GroupedContacts]) => {
				const contacts: Contact[] = group.children ?? [];
				return (
					<div key={letter} className="px-4 pb-2 md:px-6">
						<div className="sticky top-0 z-10 flex items-center gap-3 py-3">
							<Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black"
								sx={(t) => ({ background: `linear-gradient(135deg, ${t.palette.secondary.main}, ${t.palette.primary.main})`, color: 'white', boxShadow: `0 2px 8px ${t.palette.secondary.main}44` })}>
								{letter}
							</Box>
							<Box className="h-px flex-1" sx={{ backgroundColor: 'divider' }} />
							<Typography className="text-[11px] font-bold tabular-nums" color="text.disabled">{contacts.length}</Typography>
						</div>
						<div className="flex flex-col gap-2">
							{contacts.map((contact) => <ContactListItem key={contact.id} contact={contact} index={globalIndex++} />)}
						</div>
					</div>
				);
			})}
			<div className="h-8" />
		</motion.div>
	);
}

export default ContactsList;