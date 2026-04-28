import React from 'react';
import { MenuItem, Select, ListItemIcon, ListItemText, Typography, useTheme } from '@mui/material';

type ProjectOption = {
	value: string;
	logo: string;
	darkLogo: string;
	name: string;
	url: string;
};

const projectOptions: ProjectOption[] = [
	{
		value: 'Vitejs',
		logo: '/assets/images/logo/vite.svg',
		darkLogo: '/assets/images/logo/vite.svg',
		name: 'Vitejs',
		url: 'https://fuse-react-vitejs-skeleton.fusetheme.com'
	},
	{
		value: 'Nextjs',
		logo: '/assets/images/logo/nextjs.svg',
		darkLogo: '/assets/images/logo/nextjs-dark.svg',
		name: 'Nextjs',
		url: 'https://fuse-react-nextjs-skeleton.fusetheme.com'
	}
];

export default function MainProjectSelection() {
  return null;
}
