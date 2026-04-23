import EmissionDetailView from '../../../components/views/EmissionDetailView';

interface EmissionDetailPageProps {
	params: Promise<{ emissionId: string }>;
}

async function EmissionDetailPage({ params }: EmissionDetailPageProps) {
	const { emissionId } = await params;
	return <EmissionDetailView emissionId={emissionId} />;
}

export default EmissionDetailPage;