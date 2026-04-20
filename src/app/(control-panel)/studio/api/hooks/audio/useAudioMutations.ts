import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { projectAudiosQueryKey } from './useGetProjectAudios';
import { useCurrentAccountId } from '../../useCurrentAccountId';
import { UpdateAudioFile } from '../../types';

// ── Upload (create) ────────────────────────────────────────────────────────

type UploadAudioPayload = {
	title: string;
	description?: string | null;
	production_project_id: number;
	file: File;
};

export function useUploadProjectAudio(projectId: number | string) {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: ({ title, description, production_project_id, file }: UploadAudioPayload) =>
			studioApiService.createAudioFile(accountId, { title, description, production_project_id }, file),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: projectAudiosQueryKey(accountId, projectId)
			});
		}
	});
}

// ── Update (rename / edit description) ────────────────────────────────────

export function useUpdateAudioFile(projectId: number | string) {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (data: UpdateAudioFile) => studioApiService.updateAudioFile(accountId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: projectAudiosQueryKey(accountId, projectId)
			});
		}
	});
}

// ── Delete ─────────────────────────────────────────────────────────────────

export function useDeleteAudioFile(projectId: number | string) {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (audioId: number) => studioApiService.deleteAudioFile(accountId, audioId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: projectAudiosQueryKey(accountId, projectId)
			});
		}
	});
}