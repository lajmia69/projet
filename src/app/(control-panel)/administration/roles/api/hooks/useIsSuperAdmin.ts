/**
 * src/app/(control-panel)/administration/roles/hooks/useIsSuperAdmin.ts
 *
 * Returns true when the current user is a super_admin.
 *
 * HOW TO WIRE UP:
 * Replace the body with whatever your auth context exposes, for example:
 *
 *   import { useUser } from 'src/app/auth/AuthContext';   // your actual path
 *   export function useIsSuperAdmin(): boolean {
 *     const { user } = useUser();
 *     return user?.role === 'super_admin';
 *   }
 *
 * Until then this falls back to a localStorage check so you can test locally.
 */
export function useIsSuperAdmin(): boolean {
	if (typeof window === 'undefined') return false;

	try {
		// Adjust the key / shape to match what your auth stores
		const raw = localStorage.getItem('user') ?? localStorage.getItem('auth_user');
		if (!raw) return false;
		const parsed = JSON.parse(raw);
		const role: string =
			parsed?.role ??
			parsed?.data?.role ??
			parsed?.roles?.[0] ??
			'';
		return role === 'super_admin';
	} catch {
		return false;
	}
}