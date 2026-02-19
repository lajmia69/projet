import { useContact } from '../../api/hooks/contacts/useContact';
import { contactFullName } from '../../api/types';

type ContactTitleProps = {
	contactId?: string;
};

function ContactTitle(props: ContactTitleProps) {
	const { contactId } = props;
	const { data: contact } = useContact(contactId);

	return contact ? contactFullName(contact) : 'Contact';
}

export default ContactTitle;
