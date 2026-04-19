'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { studioApiService } from '../services/studioApiService';

/**
 * Reads the JWT from Fuse's axios default Authorization header and injects
 * it into studioApiService so every fetch() call gets the correct Bearer token.
 *
 * Fuse React sets axios.defaults.headers.common.Authorization after login.
 * Our studio service uses fetch() not axios, so this bridge is required.
 */
export function useStudioAuth() {
	useEffect(() => {
		const token = getTokenFromAxios();
		if (token) {
			studioApiService.setToken(token);
		} else {
			console.warn(
				'[useStudioAuth] No token found in axios.defaults.headers.common.Authorization.\n' +
				'Run this in the console to debug:\n' +
				'  import axios from "axios"; console.log(axios.defaults.headers.common.Authorization);'
			);
		}
		return () => { studioApiService.clearToken(); };
	}, []);
}

function getTokenFromAxios(): string {
	// Primary: axios default header (set by Fuse after login)
	const auth = axios.defaults.headers.common?.['Authorization'];
	if (auth && typeof auth === 'string') {
		return auth.replace(/^[Bb]earer\s+/, '');
	}

	// Fallback: localStorage
	const KEYS = [
		'jwt_access_token', 'access_token', 'accessToken',
		'authToken', 'token', 'jwt', 'auth_token'
	];
	for (const key of KEYS) {
		const val = localStorage.getItem(key) ?? sessionStorage.getItem(key);
		if (val && val.split('.').length === 3) return val;
		if (val && val.length > 20) return val;
	}

	return '';
}