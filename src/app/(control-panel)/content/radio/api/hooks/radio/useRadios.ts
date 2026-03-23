import { useQuery } from '@tanstack/react-query';
import { radioApi } from '../../services/radioApiService';
import { SearchRadios } from '../../types';

// ─── List (search) ───────────────────────────────────────────────────────────

export const searchRadiosQueryKey = (currentAccountId: string, search: SearchRadios) => [
	'radio',
	'search',
	currentAccountId,
	search
];

export const useSearchRadios = (
	currentAccountId: string,
	accessToken: string,
	search: SearchRadios
) => {
	return useQuery({
		queryKey: searchRadiosQueryKey(currentAccountId, search),
		queryFn: () => radioApi.searchRadios(currentAccountId, accessToken, search),
		enabled: !!currentAccountId && !!accessToken
	});
};

// ─── Full list ───────────────────────────────────────────────────────────────

export const radiosQueryKey = (currentAccountId: string) => ['radio', 'list', currentAccountId];

export const useRadios = (currentAccountId: string, accessToken: string) => {
	return useQuery({
		queryKey: radiosQueryKey(currentAccountId),
		queryFn: () => radioApi.getRadios(currentAccountId, accessToken),
		enabled: !!currentAccountId && !!accessToken
	});
};

// ─── Detail ──────────────────────────────────────────────────────────────────

export const radioQueryKey = (currentAccountId: string, radioId: string) => [
	'radio',
	'detail',
	currentAccountId,
	radioId
];

export const useRadio = (currentAccountId: string, radioId: string, accessToken: string) => {
	return useQuery({
		queryKey: radioQueryKey(currentAccountId, radioId),
		queryFn: () => radioApi.getRadio(currentAccountId, radioId, accessToken),
		enabled: !!currentAccountId && !!radioId && !!accessToken
	});
};