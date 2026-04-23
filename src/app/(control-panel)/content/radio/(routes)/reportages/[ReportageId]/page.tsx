import ReportageDetailView from '../../../components/views/ReportageDetailView';

interface ReportageDetailPageProps {
	params: { reportageId: string };
}

function ReportageDetailPage({ params }: ReportageDetailPageProps) {
	return <ReportageDetailView reportageId={params.reportageId} />;
}

export default ReportageDetailPage;