import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studioApiService } from '../../services/studioApiService';
import { projectAudiosQueryKey } from './useGetProjectAudios';
import { useCurrentAccountId } from '../../useCurrentAccountId';
import { CreateAudioFile, UpdateAudioFile } from '../../types';

// ── Upload (create) ────────────────────────────────────────────────────────

type UploadAudioPayload = {
	payload: CreateAudioFile;
	file: File;
};

export function useUploadProjectAudio(_projectId?: number | string) {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: ({ payload, file }: UploadAudioPayload) =>
			studioApiService.createAudioFile(accountId, payload, file),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: projectAudiosQueryKey(accountId)
			});
		}
	});
}

// ── Update metadata (rename / edit description) ────────────────────────────

export function useUpdateAudioFile(_projectId?: number | string) {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (data: UpdateAudioFile) => studioApiService.updateAudioFile(accountId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: projectAudiosQueryKey(accountId)
			});
		}
	});
}

// ── Delete ─────────────────────────────────────────────────────────────────

export function useDeleteAudioFile(_projectId?: number | string) {
	const queryClient = useQueryClient();
	const accountId = useCurrentAccountId();

	return useMutation({
		mutationFn: (audioId: number) => studioApiService.deleteAudioFile(accountId, audioId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: projectAudiosQueryKey(accountId)
			});
		}
	});
}