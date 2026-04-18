import { redirect } from 'next/navigation';
import BoardsView from '../components/views/BoardsView';

function LessonApp() {
    redirect(`/studio/boards`);
    return null;
}

export default BoardsView;