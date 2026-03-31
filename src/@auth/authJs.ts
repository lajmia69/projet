import NextAuth from 'next-auth';
import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import vercelKVDriver from 'unstorage/drivers/vercel-kv';
import { UnstorageAdapter } from '@auth/unstorage-adapter';
import type { NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
import { authLoginUser, authGetUserAccount } from './authApi';

const storage = createStorage({
	driver: process.env.VERCEL
		? vercelKVDriver({
				url: process.env.AUTH_KV_REST_API_URL,
				token: process.env.AUTH_KV_REST_API_TOKEN,
				env: false
			})
		: memoryDriver()
});

export const providers: Provider[] = [
	Credentials({
		async authorize(formInput) {
			if (formInput.formType === 'signin') {
				if (formInput.password && formInput.email) {
					const response = await authLoginUser(
						formInput.email.toString(),
						formInput.password.toString()
					);

					const token = await response.json();

					if (!token) {
						throw new Error('Invalid credentials.');
					}

					// Fetch account once here, at login time
					let account = null;
					try {
						const accountResponse = await authGetUserAccount({
							id: token.id,
							access: token.access,
							refresh: token.refresh
						});
						account = await accountResponse.json();
					} catch (e) {
						console.error('Failed to fetch account during login:', e);
					}

					return {
						id: token.id,
						name: token.access,    // access token
						email: token.refresh,  // refresh token
						account                // store account data here
					};
				}
			}

			if (formInput.formType === 'signup') {
				if (formInput.password === '' || formInput.email === '') {
					return null;
				}
			}

			return {
				email: formInput?.email as string
			};
		}
	})
];

const config = {
	theme: { logo: '/assets/images/logo/logo.svg' },
	adapter: UnstorageAdapter(storage),
	pages: {
		signIn: '/sign-in'
	},
	providers,
	basePath: '/auth',
	trustHost: true,
	callbacks: {
		authorized() {
			return true;
		},
		jwt({ token, trigger, user, account: oauthAccount }) {
			if (trigger === 'update') {
				token.name = user?.name;
			}

			if (oauthAccount?.provider === 'keycloak') {
				return { ...token, accessToken: oauthAccount.access_token };
			}

			// On first sign-in, user object is available — store account in token
			if (user) {
				token.accountData = (user as any).account ?? null;
			}

			return token;
		},
		async session({ session, token }) {
			if (token.accessToken && typeof token.accessToken === 'string') {
				session.accessToken = token.accessToken;
			}

			if (session) {
				// Use account data already stored in token — no backend call needed
				const account = token.accountData as any;

				if (account) {
					session.db = {
						id: account.id,
						email: account.user.email,
						role: account.role,
						displayName: account.full_name,
						photoURL: account.avatar_url,
						account: account,
						token: {
							id: token.sub,
							access: token.name,
							refresh: token.email
						}
					};
				} else {
					// Fallback: try fetching once if somehow missing
					try {
						const accountResponse = await authGetUserAccount({
							id: token.sub,
							access: token.name,
							refresh: token.email
						});
						const fetchedAccount = await accountResponse.json();
						token.accountData = fetchedAccount;

						session.db = {
							id: fetchedAccount.id,
							email: fetchedAccount.user.email,
							role: fetchedAccount.role,
							displayName: fetchedAccount.full_name,
							photoURL: fetchedAccount.avatar_url,
							account: fetchedAccount,
							token: {
								id: token.sub,
								access: token.name,
								refresh: token.email
							}
						};
					} catch (error) {
						console.error('Failed to fetch account in session callback:', error);
						return session;
					}
				}

				return session;
			}

			return null;
		}
	},
	experimental: {
		enableWebAuthn: true
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60 // 30 days
	},
	debug: process.env.NODE_ENV !== 'production'
} satisfies NextAuthConfig;

export type AuthJsProvider = {
	id: string;
	name: string;
	style?: {
		text?: string;
		bg?: string;
	};
};

export const authJsProviderMap: AuthJsProvider[] = providers
	.map((provider) => {
		const providerData = typeof provider === 'function' ? provider() : provider;
		return {
			id: providerData.id,
			name: providerData.name,
			style: {
				text: (providerData as { style?: { text: string } }).style?.text,
				bg: (providerData as { style?: { bg: string } }).style?.bg
			}
		};
	})
	.filter((provider) => provider.id !== 'credentials');

export const { handlers, auth, signIn, signOut } = NextAuth(config);