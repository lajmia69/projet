import { Contact, ContactEmail, ContactPhoneNumber } from '../types';

export function ContactEmailModel(data: Partial<ContactEmail>): ContactEmail {
	return { email: '', label: 'Home', ...data };
}

export function ContactPhoneModel(data: Partial<ContactPhoneNumber>): ContactPhoneNumber {
	return { country: 'tn', phoneNumber: '', label: 'Mobile', ...data };
}

function ContactModel(data: Partial<Contact>): Contact {
	return {
		id: '',
		avatar: '',
		background: '',
		firstName: '',
		lastName: '',
		emails: [ContactEmailModel({})],
		phoneNumbers: [ContactPhoneModel({})],
		role: '',
		birthday: '',
		address: '',
		notes: '',
		tags: [],
		...data
	};
}

export default ContactModel;