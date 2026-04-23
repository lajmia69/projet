import EpisodeDetailView from '../../../components/views/EpisodeDetailView';

interface EpisodeDetailPageProps {
	params: Promise<{ episodeId: string }>;
}

async function EpisodeDetailPage({ params }: EpisodeDetailPageProps) {
	const { episodeId } = await params;
	return <EpisodeDetailView episodeId={episodeId} />;
}

export default EpisodeDetailPage;