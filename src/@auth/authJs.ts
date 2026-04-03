import NextAuth from 'next-auth';
// import { User } from '@auth/user';
import { createStorage } from 'unstorage';
import memoryDriver from 'unstorage/drivers/memory';
import vercelKVDriver from 'unstorage/drivers/vercel-kv';
import { UnstorageAdapter } from '@auth/unstorage-adapter';
import type { NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Credentials from 'next-auth/providers/credentials';
// import Facebook from 'next-auth/providers/facebook';
// import Google from 'next-auth/providers/google';
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
			/**
			 * !! This is just for demonstration purposes
			 * You can create your own validation logic here
			 * !! Do not use this in production
			 */

			/**
			 * Sign in
			 */
			if (formInput.formType === 'signin') {
				if (formInput.password && formInput.email) {
					const response = await authLoginUser(formInput.email.toString(), formInput.password.toString());

					const token = await response.json();

					if (!token) {
						// No user found, so this is their first attempt to login
						// Optionally, this is also the place you could do a user registration
						throw new Error('Invalid credentials.');
					}

					// console.log(token);
					return {
						id: token.id,
						name: token.access,
						email: token.refresh
					};
				}
			}

			/**
			 * Sign up
			 */
			if (formInput.formType === 'signup') {
				if (formInput.password === '' || formInput.email === '') {
					return null;
				}
			}

			/**
			 * Response Success with email
			 */
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
			/** Checkout information to how to use middleware for authorization
			 * https://next-auth.js.org/configuration/nextjs#middleware
			 */
			return true;
		},
		jwt({ token, trigger, account, user }) {
			if (trigger === 'update') {
				token.name = user.name;
			}

			if (account?.provider === 'keycloak') {
				return { ...token, accessToken: account.access_token };
			}

			return token;
		},
		async session({ session, token }) {
			if (token.accessToken && typeof token.accessToken === 'string') {
				session.accessToken = token.accessToken;
			}

			if (session) {
				try {
					/**
					 * Get the session user from database
					 */
					// const response = await authGetDbUserByEmail(session.user.email);

					// const userDbData = (await response.json()) as User;

					const accountResponse = await authGetUserAccount({
						id: token.sub,
						access: token.name,
						refresh: token.email
					});

					const account = await accountResponse.json();

					// const response = await authGetDbUserByEmail(session.user.email);

					// const userDbData = (await response.json()) as User;
					// console.log(account);
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

					return session;
				} catch (error) {
					const errorStatus = error?.status;

					/** If user not found, create a new user */
					if (errorStatus === 404) {
						// const newUserResponse = await authCreateDbUser({
						// 	email: session.user.email,
						// 	role: ['admin'],
						// 	displayName: session.user.name,
						// 	photoURL: session.user.image
						// });

						// const newUser = (await newUserResponse.json()) as User;

						// console.error('Error fetching user data:', error);

						// session.db = newUser;

						return session;
					}

					throw error;
				}
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
