import EmissionDetailView from '../../../components/views/EmissionDetailView';

interface EmissionDetailPageProps {
	params: { emissionId: string };
}

function EmissionDetailPage({ params }: EmissionDetailPageProps) {
	return <EmissionDetailView emissionId={params.emissionId} />;
}

export default EmissionDetailPage;