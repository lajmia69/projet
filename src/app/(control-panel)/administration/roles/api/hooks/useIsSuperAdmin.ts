/**
 *
 * Returns true when the current user is a super_admin.
 *
 * TODO: Replace the body with your actual auth context, for example:
 *
 *   import { useUser } from 'src/app/auth/AuthContext';
 *   export function useIsSuperAdmin(): boolean {
 *     const { user } = useUser();
 *     return user?.role === 'super_admin';
 *   }
 */
export function useIsSuperAdmin(): boolean {
	if (typeof window === 'undefined') return false;

	try {
		// Adjust the key/shape to match what your auth stores
		const raw =
			localStorage.getItem('user') ??
			localStorage.getItem('auth_user') ??
			localStorage.getItem('fuse_user');

		if (!raw) {
			// No auth data found — default to allowed so the UI is usable.
			// Wire up your real auth context above when ready.
			return true;
		}

		const parsed = JSON.parse(raw);
		const role: string =
			parsed?.role ??
			parsed?.data?.role ??
			parsed?.roles?.[0] ??
			'';

		return role === 'super_admin';
	} catch {
		return true;
	}
}