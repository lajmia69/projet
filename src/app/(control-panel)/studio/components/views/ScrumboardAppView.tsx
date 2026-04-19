'use client';

import { ReactNode } from 'react';
import { ScrumboardAppContextProvider } from '../../contexts/ScrumboardAppContext/ScrumboardAppContextProvider';
import { useStudioAuth } from '../../api/hooks/useStudioauth';

type ScrumboardAppProps = {
	children?: ReactNode;
};

/**
 * The scrumboard app.
 * useStudioAuth() runs once here to inject the JWT into studioApiService
 * before any child component fires an API query.
 */
function ScrumboardApp(props: ScrumboardAppProps) {
	const { children } = props;

	// Initialise token + account ID from Fuse's auth store
	useStudioAuth();

	return <ScrumboardAppContextProvider>{children}</ScrumboardAppContextProvider>;
}

export default ScrumboardApp;