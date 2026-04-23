import EpisodeDetailView from '../../../components/views/EpisodeDetailView';

interface EpisodeDetailPageProps {
	params: { episodeId: string };
}

function EpisodeDetailPage({ params }: EpisodeDetailPageProps) {
	return <EpisodeDetailView episodeId={params.episodeId} />;
}

export default EpisodeDetailPage;