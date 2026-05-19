import Image from 'next/image';

function PageLogo() {
	return (
		<Image
			src="/assets/images/logo_association.jpg"
			alt="Logo Association"
			width={180}
			height={90}
			className="h-auto w-auto max-h-24 max-w-[180px] object-contain"
			priority
		/>
	);
}

export default PageLogo;
