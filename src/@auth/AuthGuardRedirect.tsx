'use client';

import React, { useCallback, useEffect, useState } from 'react';
import FuseUtils from '@fuse/utils';
import {
	getSessionRedirectUrl,
	resetSessionRedirectUrl,
	setSessionRedirectUrl
} from '@fuse/core/FuseAuthorization/sessionRedirectUrl';
import { FuseRouteObjectType } from '@fuse/core/FuseLayout/FuseLayout';
import usePathname from '@fuse/hooks/usePathname';
import FuseLoading from '@fuse/core/FuseLoading';
import useNavigate from '@fuse/hooks/useNavigate';
import useUser from './useUser';

type AuthGuardProps = {
	auth: FuseRouteObjectType['auth'];
	children: React.ReactNode;
	loginRedirectUrl?: string;
};

function AuthGuardRedirect({ auth, children, loginRedirectUrl = '/' }: AuthGuardProps) {
	const { data: user, isGuest, isLoading } = useUser();
	const userRole = user?.role;
	const navigate = useNavigate();

	const [accessGranted, setAccessGranted] = useState<boolean>(false);
	const pathname = usePathname();

	const handleRedirection = useCallback(() => {
		const redirectUrl = getSessionRedirectUrl() || loginRedirectUrl;

		if (isGuest) {
			navigate('/sign-in');
		} else {
			const safeUrl = redirectUrl === pathname ? '/401' : redirectUrl;
			navigate(safeUrl);
			resetSessionRedirectUrl();
		}
	}, [isGuest, loginRedirectUrl, navigate, pathname]);

	useEffect(() => {
		if (isLoading) return;

		// ── DEBUG LOGS ──────────────────────────────────────────────────────
		// This will show you exactly what permissions are in your DB record
		console.log('🔐 Auth Debug:', {
			pathname,
			isGuest,
			userRole,
			hasPermission: FuseUtils.hasPermission(auth, userRole),
			fullUserData: user // Inspect this object in the console!
		});
		// ────────────────────────────────────────────────────────────────────

		const isOnlyGuestAllowed = Array.isArray(auth) && auth.length === 0;
		const userHasPermission = FuseUtils.hasPermission(auth, userRole);
		const ignoredPaths = ['/', '/callback', '/sign-in', '/sign-out', '/logout', '/404', '/401'];

		if (!auth || (auth && userHasPermission) || (isOnlyGuestAllowed && isGuest)) {
			setAccessGranted(true);
			return;
		}

		if (!userHasPermission) {
			if (isGuest && !ignoredPaths.includes(pathname)) {
				setSessionRedirectUrl(pathname);
			} else if (!isGuest && !ignoredPaths.includes(pathname)) {
				if (isOnlyGuestAllowed) {
					setSessionRedirectUrl('/');
				} else {
					setSessionRedirectUrl('/401');
				}
			}
		}

		handleRedirection();
	}, [auth, userRole, isGuest, isLoading, pathname, handleRedirection, user]);

	return accessGranted ? children : <FuseLoading />;
}

export default AuthGuardRedirect;