import MainLayout from '@/components/MainLayout';
import AuthGuardRedirect from '@auth/AuthGuardRedirect';
import authRoles from '@auth/authRoles';

function Layout({ children }) {
	return (
		<AuthGuardRedirect auth={authRoles.member} loginRedirectUrl="/welcome">
			<MainLayout>{children}</MainLayout>
		</AuthGuardRedirect>
	);
}

export default Layout;
