import { useEffect } from 'react';
import { createStudioProject } from './api'; // Hypothetical API call to create studio projects

const useValidatePodcast = (podcast) => {
    useEffect(() => {
        if (podcast.status === 'approved') {
            createStudioProject({
                project_type_id: 7, // Podcast
                podcast_id: podcast.id,
            });
        }
    }, [podcast]);
};

export default useValidatePodcast;
