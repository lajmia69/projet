import ky from 'ky';

/**
 * Reads the access token from wherever your auth state stores it.
 * Update this function if you use Zustand, a cookie, or a React context
 * instead of localStorage.
 */
const getAccessToken = (): string => {
	return localStorage.getItem('accessToken') ?? '';
};

/**
 * A single ky instance shared by every API service.
 *
 * Benefits over the old authHeader() helper:
 *  - The Authorization header is injected automatically — you can never
 *    accidentally forget it on a new endpoint.
 *  - Token expiry is handled in one place (the 401 hook below).
 *  - No accessToken argument threading through every hook and service.
 */
export const apiClient = ky.create({
	prefixUrl: 'https://radio.backend.ecocloud.tn/',
	hooks: {
		beforeRequest: [
			(request) => {
				const token = getAccessToken();
				if (token) {
					request.headers.set('Authorization', `Bearer ${token}`);
				} else {
					console.warn('[apiClient] No access token found — request may be rejected with 401.');
				}
			},
		],
		afterResponse: [
			/**
			 * If the server returns 401, the token has expired or is invalid.
			 * Redirect to the login page so the user can re-authenticate.
			 * Adjust the redirect path to match your router setup.
			 */
			(_request, _options, response) => {
				if (response.status === 401) {
					console.error('[apiClient] 401 Unauthorized — clearing token and redirecting to login.');
					localStorage.removeItem('accessToken');
					// window.location.href = '/login'; // ← uncomment when ready
				}
			},
		],
	},
});
