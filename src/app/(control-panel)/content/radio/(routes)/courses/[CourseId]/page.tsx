import RadioView from '../../../components/views/RadioView';

interface RadioDetailPageProps {
	params: Promise<{ courseId: string }>;
}

async function RadioDetailPage({ params }: RadioDetailPageProps) {
	const { courseId } = await params;
	return <RadioView radioId={courseId} />;
}

export default RadioDetailPage;