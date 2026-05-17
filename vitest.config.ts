import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/__tests__/setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: [
				'src/**/*.{test,spec}.{ts,tsx}',
				'src/**/types/**',
				'src/**/*.d.ts',
			],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@auth': path.resolve(__dirname, 'src/@auth'),
			'@i18n': path.resolve(__dirname, 'src/@i18n'),
			'@fuse': path.resolve(__dirname, 'src/@fuse'),
			'@history': path.resolve(__dirname, 'src/@history'),
			'@mock-utils': path.resolve(__dirname, 'src/@mock-utils'),
			'@schema': path.resolve(__dirname, 'src/@schema'),
		},
	},
});
