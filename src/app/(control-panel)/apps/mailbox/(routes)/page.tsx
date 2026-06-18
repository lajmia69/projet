import { redirect } from 'next/navigation';

function MailboxApp() {
	redirect('/apps/mailbox/inbox');
	return null;
}

export default MailboxApp;
