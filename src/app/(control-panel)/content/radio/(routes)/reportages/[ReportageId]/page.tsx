import ReportageDetailView from '../../../components/views/ReportageDetailView';

interface ReportageDetailPageProps {
	params: Promise<{ reportageId: string }>;
}

async function ReportageDetailPage({ params }: ReportageDetailPageProps) {
	const { reportageId } = await params;
	return <ReportageDetailView reportageId={reportageId} />;
}

export default ReportageDetailPage;