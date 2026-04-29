import { FuseThemesType } from '@fuse/core/FuseSettings/FuseSettings';

/**
 * The lightPaletteText object defines the text color palette for the light theme.
 */
export const lightPaletteText = {
	primary: 'rgb(17, 24, 39)',
	secondary: 'rgb(107, 114, 128)',
	disabled: 'rgb(149, 156, 169)'
};

/**
 * The darkPaletteText object defines the text color palette for the dark theme.
 */
export const darkPaletteText = {
	primary: 'rgb(255,255,255)',
	secondary: 'rgb(148, 163, 184)',
	disabled: 'rgb(156, 163, 175)'
};

/**
 * Shared neutral ramp & status colours
 * Light theme - Warm Stone
 */
const neutralsLightTheme = {
	grey: {
		50: '#FAF9F7',
		100: '#F0EDE8',
		200: '#E2DCD2',
		300: '#D4C9B8',
		400: '#BEB7A3',
		500: '#A69884',
		600: '#8A7D66',
		700: '#6E6149',
		800: '#524A36',
		900: '#3D3629',
		A100: '#F0EDE8',
		A200: '#E2DCD2',
		A400: '#A69884',
		A700: '#6E6149'
	},
	success: { main: '#059669', light: '#34D399', dark: '#047857', contrastText: '#FFFFFF' },
	info: { main: '#06B6D4', light: '#22D3EE', dark: '#0891B2', contrastText: '#FFFFFF' },
	warning: { main: '#F59E0B', light: '#FBBF24', dark: '#B45309', contrastText: '#1F232B' },
	error: { main: '#EF4444', light: '#F87171', dark: '#B91C1C', contrastText: '#FFFFFF' }
};

/**
 * Shared neutral ramp & status colours
 * Dark theme - Deep Slate
 */
const neutralsDarkTheme = {
	grey: {
		50: '#0D0E10',
		100: '#12131A',
		200: '#181A22',
		300: '#1F2130',
		400: '#2A2D3F',
		500: '#6B7280',
		600: '#8A8F99',
		700: '#A5ABB5',
		800: '#CDD1D9',
		900: '#E5E7EB',
		A100: '#12131A',
		A200: '#181A22',
		A400: '#2A2D3F',
		A700: '#6B7280'
	},
	success: { main: '#34D399', light: '#6EE7B7', dark: '#10B981', contrastText: '#022F22' },
	info: { main: '#22D3EE', light: '#67E8F9', dark: '#06B6D4', contrastText: '#042F2E' },
	warning: { main: '#FBBF24', light: '#FDE68A', dark: '#D97706', contrastText: '#422006' },
	error: { main: '#F87171', light: '#FECACA', dark: '#B91C1C', contrastText: '#FFFFFF' }
};

/**
 * The themesConfig object is a configuration object for the color themes of the Fuse application.
 */
export const themesConfig: FuseThemesType = {
	default: {
		palette: {
			mode: 'light',
			primary: { main: '#2D8B7C', light: '#3DA898', dark: '#1C4A52', contrastText: '#FFFFFF' },
			secondary: { main: '#1C4A52', light: '#2D8B7C', dark: '#1A2E38', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#1A2E38', secondary: '#1C4A52', disabled: '#8FA5A8' },
			background: { default: '#E8E4DA', paper: '#F4F1EA' },
			divider: '#C8C3B8',
			action: {
				active: '#1C4A52',
				hover: 'rgba(45, 139, 124, 0.08)',
				selected: 'rgba(45, 139, 124, 0.16)',
				disabled: '#C8C3B8',
				disabledBackground: '#EDE9E0',
				focus: 'rgba(45, 139, 124, 0.12)'
			}
		}
	},
	defaultDark: {
		palette: {
			mode: 'dark',
			primary: {
				main: '#2D8B7C',
				light: '#3DA898',
				dark: '#1C4A52',
				contrastText: '#E8E4DA'
			},
			secondary: {
				main: '#3DA898',
				light: '#5CBFAD',
				dark: '#2D8B7C',
				contrastText: '#1A2E38'
			},
			...neutralsDarkTheme,
			text: {
				primary: '#E8E4DA',
				secondary: '#B8C8CB',
				disabled: '#5A7A80'
			},
			background: {
				default: '#1A2E38',
				paper: '#1C4A52'
			},
			divider: '#2A5560',
			action: {
				active: '#3DA898',
				hover: 'rgba(45, 139, 124, 0.12)',
				selected: 'rgba(45, 139, 124, 0.24)',
				disabled: 'rgba(45, 139, 124, 0.3)',
				disabledBackground: 'rgba(45, 139, 124, 0.12)',
				focus: 'rgba(45, 139, 124, 0.24)'
			}
		}
	},
	defaultNavbar: {
		palette: {
			mode: 'dark',
			...neutralsDarkTheme,
			primary: { main: '#2D8B7C', light: '#3DA898', dark: '#1C4A52', contrastText: '#E8E4DA' },
			secondary: { main: '#3DA898', light: '#5CBFAD', dark: '#2D8B7C', contrastText: '#1A2E38' },
            text: { primary: '#E8E4DA', secondary: '#B8C8CB', disabled: '#5A7A80' },
            background: { default: '#1A2E38', paper: '#1C4A52' },
			divider: '#2A5560',
			action: {
				active: '#3DA898',
				hover: 'rgba(45, 139, 124, 0.14)',
				selected: 'rgba(45, 139, 124, 0.24)',
				disabled: '#5A7A80',
				disabledBackground: '#1C4A52',
				focus: 'rgba(45, 139, 124, 0.20)'
			}
		}
	},
	legacyDefault: {
		palette: {
			mode: 'light',
			divider: 'rgba(0, 0, 0, 0.12)',
			text: {
				primary: '#212121',
				secondary: '#5F6368'
			},
			common: {
				black: '#000000',
				white: '#FFFFFF'
			},
			primary: {
				light: '#536D89',
				main: '#0A74DA',
				dark: '#00418A',
				contrastText: '#FFFFFF'
			},
			secondary: {
				light: '#6BC9F7',
				main: '#00A4EF',
				dark: '#0078D7',
				contrastText: '#FFFFFF'
			},
			background: {
				paper: '#F4F4F4',
				default: '#E8E8E8'
			},
			error: {
				light: '#FFCDD2',
				main: '#D32F2F',
				dark: '#B71C1C',
				contrastText: '#FFFFFF'
			}
		}
	},
	legacyDark: {
		palette: {
			mode: 'dark',
			divider: 'rgba(255, 255, 255, 0.12)',
			text: {
				primary: '#E0E0E0',
				secondary: '#B0BEC5'
			},
			common: {
				black: '#000000',
				white: '#FFFFFF'
			},
			primary: {
				light: '#536D89',
				main: '#0A74DA',
				dark: '#00418A',
				contrastText: '#FFFFFF'
			},
			secondary: {
				light: '#6BC9F7',
				main: '#00A4EF',
				dark: '#0078D7',
				contrastText: '#FFFFFF'
			},
			background: {
				paper: '#1E1E1E',
				default: '#121212'
			},
			error: {
				light: '#FFCDD2',
				main: '#D32F2F',
				dark: '#B71C1C',
				contrastText: '#FFFFFF'
			}
		}
	},
	navyTealPalette: {
		palette: {
			mode: 'light',
			primary: { main: '#0F3C6E', light: '#365E92', dark: '#08254A', contrastText: '#FFFFFF' },
			secondary: { main: '#00B4A6', light: '#33C7BB', dark: '#00867B', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#0F3C6E', secondary: '#4B5563', disabled: '#9CA3AF' },
			background: { default: '#F6F8FA', paper: '#FFFFFF' },
			divider: '#E5E7EB',
			action: {
				active: '#4B5563',
				hover: '#E5E7EB',
				selected: '#D1D5DB',
				disabled: '#BFC4CC',
				disabledBackground: '#F6F7F8',
				focus: '#D1D5DB'
			}
		}
	},
	indigoAmberPalette: {
		palette: {
			mode: 'light',
			primary: { main: '#21255F', light: '#40448A', dark: '#15183C', contrastText: '#FFFFFF' },
			secondary: { main: '#FFB547', light: '#FFC66D', dark: '#D89330', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#21255F', secondary: '#4B5563', disabled: '#9CA3AF' },
			background: { default: '#F7F8FC', paper: '#FFFFFF' },
			divider: '#E5E7EB',
			action: {
				active: '#4B5563',
				hover: '#E5E7EB',
				selected: '#D1D5DB',
				disabled: '#BFC4CC',
				disabledBackground: '#F6F7F8',
				focus: '#D1D5DB'
			}
		}
	},
	darkBlueSilver: {
		palette: {
			mode: 'light',
			primary: {
				main: '#0D47A1',
				light: '#5472D3',
				dark: '#002171',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#B0BEC5',
				light: '#E2F1F8',
				dark: '#808E95',
				contrastText: lightPaletteText.primary
			},
			background: {
				paper: '#FFFFFF',
				default: '#f1f5f9'
			},
			text: lightPaletteText,
			divider: '#d8d9da'
		}
	},
	darkBlueSilverDark: {
		palette: {
			mode: 'dark',
			primary: {
				main: '#0D47A1',
				light: '#5472D3',
				dark: '#002171',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#B0BEC5',
				light: '#E2F1F8',
				dark: '#808E95',
				contrastText: lightPaletteText.primary
			},
			background: {
				default: '#263238',
				paper: '#2d3940'
			},
			text: darkPaletteText,
			divider: '#42474d'
		}
	},
	slateCrimson: {
		palette: {
			mode: 'light',
			primary: {
				main: '#37474F',
				light: '#62727B',
				dark: '#102027',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#D32F2F',
				light: '#FF6659',
				dark: '#9A0007',
				contrastText: darkPaletteText.primary
			},
			background: {
				default: '#e6e6e6',
				paper: '#f2f2f2'
			},
			text: lightPaletteText,
			divider: '#d9d9d9'
		}
	},
	slateCrimsonDark: {
		palette: {
			mode: 'dark',
			primary: {
				main: '#37474F',
				light: '#62727B',
				dark: '#102027',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#D32F2F',
				light: '#FF6659',
				dark: '#9A0007',
				contrastText: darkPaletteText.primary
			},
			background: {
				default: '#212121',
				paper: '#2e2e2e'
			},
			text: darkPaletteText,
			divider: '#3a3d40'
		}
	},
	emeraldGold: {
		palette: {
			mode: 'light',
			primary: {
				main: '#00695C',
				light: '#439889',
				dark: '#003D33',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#FFD740',
				light: '#FFFF74',
				dark: '#C8A600',
				contrastText: lightPaletteText.primary
			},
			background: {
				default: '#dcf2f2',
				paper: '#f2fdfa'
			},
			text: lightPaletteText,
			divider: '#b3c4c3'
		}
	},
	emeraldGoldDark: {
		palette: {
			mode: 'dark',
			primary: {
				main: '#00695C',
				light: '#439889',
				dark: '#003D33',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#FFD740',
				light: '#FFFF74',
				dark: '#C8A600',
				contrastText: lightPaletteText.primary
			},
			background: {
				default: '#004D40',
				paper: '#00544a'
			},
			text: darkPaletteText,
			divider: '#2d6360'
		}
	},
	indigoCoral: {
		palette: {
			mode: 'light',
			primary: {
				main: '#283593',
				light: '#5F5FC4',
				dark: '#001064',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#FF7043',
				light: '#FFA270',
				dark: '#C63F17',
				contrastText: lightPaletteText.primary
			},
			background: {
				default: '#eaebfb',
				paper: '#f6f7fd'
			},
			text: lightPaletteText,
			divider: '#dcdcf2'
		}
	},
	indigoCoralDark: {
		palette: {
			mode: 'dark',
			primary: {
				main: '#283593',
				light: '#5F5FC4',
				dark: '#001064',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#FF7043',
				light: '#FFA270',
				dark: '#C63F17',
				contrastText: lightPaletteText.primary
			},
			background: {
				default: '#1A237E',
				paper: '#283593'
			},
			text: darkPaletteText,
			divider: '#4d557e'
		}
	},
	charcoalTeal: {
		palette: {
			mode: 'light',
			primary: {
				main: '#094a43',
				light: '#28635a',
				dark: '#004a41',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#009688',
				light: '#52C7B8',
				dark: '#00675B',
				contrastText: darkPaletteText.primary
			},
			background: {
				default: '#edf6fa',
				paper: '#f7fcfc'
			},
			text: lightPaletteText,
			divider: '#cee5f0'
		}
	},
	charcoalTealDark: {
		palette: {
			mode: 'dark',
			primary: {
				main: '#455A64',
				light: '#718792',
				dark: '#1C313A',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				main: '#009688',
				light: '#52C7B8',
				dark: '#00675B',
				contrastText: darkPaletteText.primary
			},
			background: {
				default: '#000000',
				paper: '#102027'
			},
			text: darkPaletteText,
			divider: '#2d383d'
		}
	},
	skyBlueOrange: {
		palette: {
			mode: 'light',
			primary: {
				main: '#64B5F6',
				light: '#9Be7FF',
				dark: '#2286C3',
				contrastText: lightPaletteText.primary
			},
			secondary: {
				main: '#faa528',
				light: '#f6ad3f',
				dark: '#cb8721',
				contrastText: lightPaletteText.primary
			},
			background: {
				default: '#F5F5F5',
				paper: '#FFFFFF'
			},
			text: lightPaletteText,
			divider: '#e9e6e0'
		}
	},
	skyBlueOrangeDark: {
		palette: {
			mode: 'dark',
			primary: {
				main: '#64B5F6',
				light: '#9Be7FF',
				dark: '#2286C3',
				contrastText: lightPaletteText.primary
			},
			secondary: {
				main: '#faa528',
				light: '#f6ad3f',
				dark: '#cb8721',
				contrastText: lightPaletteText.primary
			},
			background: {
				default: '#1a1a1a',
				paper: '#333333'
			},
			text: darkPaletteText,
			divider: '#544949'
		}
	},
	softGreenMaroon: {
		palette: {
			mode: 'light',
			primary: {
				main: '#81C784',
				light: '#B2F2B6',
				dark: '#519657',
				contrastText: lightPaletteText.primary
			},
			secondary: {
				main: '#D81B60',
				light: '#FF5C8D',
				dark: '#A00037',
				contrastText: darkPaletteText.primary
			},
			background: {
				default: '#f5f5f5',
				paper: '#fafcfa'
			},
			text: lightPaletteText,
			divider: '#dadeda'
		}
	},
	softGreenMaroonDark: {
		palette: {
			mode: 'dark',
			primary: {
				main: '#81C784',
				light: '#B2F2B6',
				dark: '#519657',
				contrastText: lightPaletteText.primary
			},
			secondary: {
				main: '#D81B60',
				light: '#FF5C8D',
				dark: '#A00037',
				contrastText: darkPaletteText.primary
			},
			background: {
				default: '#1a1a1a',
				paper: '#323332'
			},
			text: darkPaletteText,
			divider: '#505250'
		}
	},
	coolGreyPink: {
		palette: {
			mode: 'light',
			primary: {
				main: '#dde6eb',
				light: '#FFFFFF',
				dark: '#9EA7AA',
				contrastText: lightPaletteText.primary
			},
			secondary: {
				main: '#F06292',
				light: '#FF94C2',
				dark: '#BA2D65',
				contrastText: darkPaletteText.primary
			},
			background: {
				default: '#F5F5F5',
				paper: '#FFFFFF'
			},
			text: lightPaletteText,
			divider: '#e1e1e1'
		}
	},
	coolGreyPinkDark: {
		palette: {
			mode: 'dark',
			primary: {
				main: '#dde6eb',
				light: '#FFFFFF',
				dark: '#9EA7AA',
				contrastText: lightPaletteText.primary
			},
			secondary: {
				main: '#F06292',
				light: '#FF94C2',
				dark: '#BA2D65',
				contrastText: darkPaletteText.primary
			},
			background: {
				default: '#1a1a1a',
				paper: '#292929'
			},
			text: darkPaletteText,
			divider: '#424242'
		}
	},
legacy: {
palette: {
	mode: 'light',
	divider: '#e2e8f0',
	text: lightPaletteText,
	common: {
		black: 'rgb(17, 24, 39)',
		white: 'rgb(255, 255, 255)'
	},
	primary: {
		main: '#059669',
		light: '#34D399',
		dark: '#047857',
		contrastText: '#FFFFFF'
	},
	secondary: {
		main: '#F59E0B',
		light: '#FBBF24',
		dark: '#D97706',
		contrastText: '#1F232B'
	},
	background: {
		paper: '#FFFFFF',
		default: '#FEF3C7'
	},
	error: {
		light: '#FECACA',
		main: '#EF4444',
		dark: '#B91C1C'
	}
}
},
	light1: {
		palette: {
			mode: 'light',
			divider: '#e2e8f0',
			text: lightPaletteText,
			primary: {
				light: '#b3d1d1',
				main: '#006565',
				dark: '#003737',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#ffecc0',
				main: '#FFBE2C',
				dark: '#ff9910',
				contrastText: lightPaletteText.primary
			},
			background: {
				paper: '#FFFFFF',
				default: '#F0F7F7'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
	light2: {
		palette: {
			mode: 'light',
			divider: '#e2e8f0',
			text: lightPaletteText,
			primary: {
				light: '#BBE2DA',
				main: '#1B9E85',
				dark: '#087055',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#FFD0C1',
				main: '#FF6231',
				dark: '#FF3413',
				contrastText: darkPaletteText.primary
			},
			background: {
				paper: '#FFFFFF',
				default: '#F2F8F1'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
	light3: {
		palette: {
			mode: 'light',
			divider: '#e2e8f0',
			text: lightPaletteText,
			primary: {
				light: '#D3C0CD',
				main: '#6B2C57',
				dark: '#3C102C',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#C3C2D2',
				main: '#36336A',
				dark: '#16143C',
				contrastText: darkPaletteText.primary
			},
			background: {
				paper: '#FFFFFF',
				default: '#FAFAFE'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
	light4: {
		palette: {
			mode: 'light',
			divider: '#e2e8f0',
			text: lightPaletteText,
			primary: {
				light: '#C6C9CD',
				main: '#404B57',
				dark: '#1C232C',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#C2C8D2',
				main: '#354968',
				dark: '#16213A',
				contrastText: darkPaletteText.primary
			},
			background: {
				paper: '#FFFFFF',
				default: '#F5F4F6'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
	light5: {
		palette: {
			mode: 'light',
			divider: '#e2e8f0',
			text: lightPaletteText,
			primary: {
				light: '#C4C4C4',
				main: '#3A3A3A',
				dark: '#181818',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#EFEFED',
				main: '#CBCAC3',
				dark: '#ACABA1',
				contrastText: lightPaletteText.primary
			},
			background: {
				paper: '#EFEEE7',
				default: '#FAF8F2'
			},
			error: {
				light: '#F7EAEA',
				main: '#EBCECE',
				dark: '#E3B9B9'
			}
		}
	},
	dark1: {
		palette: {
			mode: 'dark',
			divider: 'rgba(241,245,249,.12)',
			text: darkPaletteText,
			primary: {
				light: '#C2C2C3',
				main: '#323338',
				dark: '#131417',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#B8E1D9',
				main: '#129B7F',
				dark: '#056D4F',
				contrastText: darkPaletteText.primary
			},
			background: {
				paper: '#262526',
				default: '#1E1D1E'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
	dark2: {
		palette: {
			mode: 'dark',
			divider: 'rgba(241,245,249,.12)',
			text: darkPaletteText,
			primary: {
				light: '#C9CACE',
				main: '#4B4F5A',
				dark: '#23262E',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#F8F5F2',
				main: '#E6DED5',
				dark: '#D5C8BA',
				contrastText: lightPaletteText.primary
			},
			background: {
				paper: '#31343E',
				default: '#2A2D35'
			},
			error: {
				light: '#F7EAEA',
				main: '#EBCECE',
				dark: '#E3B9B9'
			}
		}
	},
	dark3: {
		palette: {
			mode: 'dark',
			divider: 'rgba(241,245,249,.12)',
			text: darkPaletteText,
			primary: {
				light: '#C2C8D2',
				main: '#354968',
				dark: '#16213A',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#F4CFCA',
				main: '#D55847',
				dark: '#C03325',
				contrastText: darkPaletteText.primary
			},
			background: {
				paper: '#23354E',
				default: '#1B2A3F'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
	dark4: {
		palette: {
			mode: 'dark',
			divider: 'rgba(241,245,249,.12)',
			text: darkPaletteText,
			primary: {
				light: '#CECADF',
				main: '#5A4E93',
				dark: '#2E2564',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#B3EBD6',
				main: '#00BC77',
				dark: '#009747',
				contrastText: darkPaletteText.primary
			},
			background: {
				paper: '#22184B',
				default: '#180F3D'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
	dark5: {
		palette: {
			mode: 'dark',
			divider: 'rgba(241,245,249,.12)',
			text: darkPaletteText,
			primary: {
				light: '#CCD7E2',
				main: '#56789D',
				dark: '#2B486F',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#D7D3ED',
				main: '#796CC4',
				dark: '#493DA2',
				contrastText: darkPaletteText.primary
			},
			background: {
				paper: '#465261',
				default: '#232931'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
	dark6: {
		palette: {
			mode: 'dark',
			divider: 'rgba(241,245,249,.12)',
			text: darkPaletteText,
			primary: {
				light: '#BEBFC8',
				main: '#252949',
				dark: '#0D0F21',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#CBD7FE',
				main: '#5079FC',
				dark: '#2749FA',
				contrastText: darkPaletteText.primary
			},
			background: {
				paper: '#2D3159',
				default: '#202441'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
	dark7: {
		palette: {
			mode: 'dark',
			divider: 'rgba(241,245,249,.12)',
			text: darkPaletteText,
			primary: {
				light: '#BCC8CD',
				main: '#204657',
				dark: '#0B202C',
				contrastText: darkPaletteText.primary
			},
			secondary: {
				light: '#B3EBC5',
				main: '#00BD3E',
				dark: '#00981B',
				contrastText: darkPaletteText.primary
			},
			background: {
				paper: '#1C1E27',
				default: '#15171E'
			},
			error: {
				light: '#ffcdd2',
				main: '#f44336',
				dark: '#b71c1c'
			}
		}
	},
greyDark: {
	palette: {
		mode: 'dark',
		divider: 'rgba(241,245,249,.12)',
		text: darkPaletteText,
		primary: {
			main: '#F97316',
			light: '#FB923C',
			dark: '#EA580C',
			contrastText: '#FFFFFF'
		},
		secondary: {
			main: '#22D3EE',
			light: '#67E8F9',
			dark: '#06B6D4',
			contrastText: '#042F2E'
		},
		background: {
			paper: '#1C1917',
			default: '#0C0A09'
		},
		error: {
			light: '#ffcdd2',
			main: '#F43F5E',
			dark: '#BE123C'
		}
	}
},
	auroraViolet: {
		palette: {
			mode: 'light',
			primary: { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6', contrastText: '#FFFFFF' },
			secondary: { main: '#06B6D4', light: '#22D3EE', dark: '#0891B2', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#1E1B4B', secondary: '#4B5563', disabled: '#9CA3AF' },
			background: { default: '#F8FAFC', paper: '#FFFFFF' },
			divider: '#E2E8F0',
			action: {
				active: '#4B5563',
				hover: 'rgba(124, 58, 237, 0.08)',
				selected: 'rgba(124, 58, 237, 0.16)',
				disabled: '#BFC4CC',
				disabledBackground: '#F6F7F8',
				focus: 'rgba(124, 58, 237, 0.12)'
			}
		}
	},
	auroraVioletDark: {
		palette: {
			mode: 'dark',
			primary: { main: '#A78BFA', light: '#C4B5FD', dark: '#7C3AED', contrastText: '#1E1B4B' },
			secondary: { main: '#22D3EE', light: '#67E8F9', dark: '#06B6D4', contrastText: '#1E1B4B' },
			...neutralsDarkTheme,
			text: { primary: '#F1F5F9', secondary: '#94A3B8', disabled: '#64748B' },
			background: { default: '#0F0E1A', paper: '#1A1729' },
			divider: '#2D2A3E',
			action: {
				active: '#C4B5FD',
				hover: 'rgba(167, 139, 250, 0.12)',
				selected: 'rgba(167, 139, 250, 0.24)',
				disabled: 'rgba(167, 139, 250, 0.3)',
				disabledBackground: 'rgba(167, 139, 250, 0.12)',
				focus: 'rgba(167, 139, 250, 0.24)'
			}
		}
	},
	midnightEmerald: {
		palette: {
			mode: 'light',
			primary: { main: '#059669', light: '#34D399', dark: '#047857', contrastText: '#FFFFFF' },
			secondary: { main: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#064E3B', secondary: '#374151', disabled: '#9CA3AF' },
			background: { default: '#F0FDF4', paper: '#FFFFFF' },
			divider: '#D1FAE5',
			action: {
				active: '#059669',
				hover: 'rgba(5, 150, 105, 0.08)',
				selected: 'rgba(5, 150, 105, 0.16)',
				disabled: '#BFC4CC',
				disabledBackground: '#F0FDF4',
				focus: 'rgba(5, 150, 105, 0.12)'
			}
		}
	},
	midnightEmeraldDark: {
		palette: {
			mode: 'dark',
			primary: { main: '#34D399', light: '#6EE7B7', dark: '#059669', contrastText: '#022F22' },
			secondary: { main: '#A78BFA', light: '#C4B5FD', dark: '#8B5CF6', contrastText: '#1E1B4B' },
			...neutralsDarkTheme,
			text: { primary: '#ECFDF5', secondary: '#A7F3D0', disabled: '#6EE7B7' },
			background: { default: '#031712', paper: '#052B1F' },
			divider: '#064E3B',
			action: {
				active: '#34D399',
				hover: 'rgba(52, 211, 153, 0.12)',
				selected: 'rgba(52, 211, 153, 0.24)',
				disabled: 'rgba(52, 211, 153, 0.3)',
				disabledBackground: 'rgba(52, 211, 153, 0.12)',
				focus: 'rgba(52, 211, 153, 0.24)'
			}
		}
	},
	cosmicCoral: {
		palette: {
			mode: 'light',
			primary: { main: '#EC4899', light: '#F472B6', dark: '#DB2777', contrastText: '#FFFFFF' },
			secondary: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#831843', secondary: '#4B5563', disabled: '#9CA3AF' },
			background: { default: '#FDF2F8', paper: '#FFFFFF' },
			divider: '#FCE7F3',
			action: {
				active: '#EC4899',
				hover: 'rgba(236, 72, 153, 0.08)',
				selected: 'rgba(236, 72, 153, 0.16)',
				disabled: '#BFC4CC',
				disabledBackground: '#FDF2F8',
				focus: 'rgba(236, 72, 153, 0.12)'
			}
		}
	},
	cosmicCoralDark: {
		palette: {
			mode: 'dark',
			primary: { main: '#F472B6', light: '#F9A8D4', dark: '#EC4899', contrastText: '#831843' },
			secondary: { main: '#FBBF24', light: '#FDE68A', dark: '#F59E0B', contrastText: '#78350F' },
			...neutralsDarkTheme,
			text: { primary: '#FDF2F8', secondary: '#FCE7F3', disabled: '#F9A8D4' },
			background: { default: '#1F0918', paper: '#361328' },
			divider: '#831843',
			action: {
				active: '#F472B6',
				hover: 'rgba(244, 114, 182, 0.12)',
				selected: 'rgba(244, 114, 182, 0.24)',
				disabled: 'rgba(244, 114, 182, 0.3)',
				disabledBackground: 'rgba(244, 114, 182, 0.12)',
				focus: 'rgba(244, 114, 182, 0.24)'
			}
	},
	},

	royalAmethyst: {
		palette: {
			mode: 'light',
			primary: { main: '#6366F1', light: '#818CF8', dark: '#4F46E5', contrastText: '#FFFFFF' },
			secondary: { main: '#14B8A6', light: '#2DD4BF', dark: '#0D9488', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#312E81', secondary: '#4B5563', disabled: '#9CA3AF' },
			background: { default: '#EEF2FF', paper: '#FFFFFF' },
			divider: '#E0E7FF',
			action: {
				active: '#6366F1',
				hover: 'rgba(99, 102, 241, 0.08)',
				selected: 'rgba(99, 102, 241, 0.16)',
				disabled: '#BFC4CC',
				disabledBackground: '#EEF2FF',
				focus: 'rgba(99, 102, 241, 0.12)'
			}
		}
},

	royalAmethystDark: {
		palette: {
			mode: 'dark',
			primary: { main: '#818CF8', light: '#A5B4FC', dark: '#6366F1', contrastText: '#312E81' },
			secondary: { main: '#2DD4BF', light: '#5EEAD4', dark: '#14B8A6', contrastText: '#042F2E' },
			...neutralsDarkTheme,
			text: { primary: '#E0E7FF', secondary: '#C7D2FE', disabled: '#A5B4FC' },
			background: { default: '#0B0A1F', paper: '#151328' },
			divider: '#312E81',
			action: {
				active: '#818CF8',
				hover: 'rgba(129, 140, 248, 0.12)',
				selected: 'rgba(129, 140, 248, 0.24)',
				disabled: 'rgba(129, 140, 248, 0.3)',
				disabledBackground: 'rgba(129, 140, 248, 0.12)',
				focus: 'rgba(129, 140, 248, 0.24)'
			}
		}
	},
	frostedOnyx: {
		palette: {
			mode: 'light',
			primary: { main: '#1E293B', light: '#334155', dark: '#0F172A', contrastText: '#FFFFFF' },
			secondary: { main: '#0EA5E9', light: '#38BDF8', dark: '#0284C7', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#0F172A', secondary: '#475569', disabled: '#94A3B8' },
			background: { default: '#F8FAFC', paper: '#FFFFFF' },
			divider: '#E2E8F0',
			action: {
				active: '#1E293B',
				hover: 'rgba(30, 41, 59, 0.08)',
				selected: 'rgba(30, 41, 59, 0.16)',
				disabled: '#CBD5E1',
				disabledBackground: '#F1F5F9',
				focus: 'rgba(30, 41, 59, 0.12)'
			}
		}
	},
	frostedOnyxDark: {
		palette: {
			mode: 'dark',
			primary: { main: '#334155', light: '#475569', dark: '#1E293B', contrastText: '#F8FAFC' },
			secondary: { main: '#38BDF8', light: '#7DD3FC', dark: '#0EA5E9', contrastText: '#0C1929' },
			...neutralsDarkTheme,
			text: { primary: '#F1F5F9', secondary: '#CBD5E1', disabled: '#64748B' },
			background: { default: '#030712', paper: '#0A1628' },
			divider: '#1E3A5F',
			action: {
				active: '#38BDF8',
				hover: 'rgba(56, 189, 248, 0.12)',
				selected: 'rgba(56, 189, 248, 0.24)',
				disabled: 'rgba(56, 189, 248, 0.3)',
				disabledBackground: 'rgba(56, 189, 248, 0.12)',
				focus: 'rgba(56, 189, 248, 0.24)'
			}
		}
	},
	neonMint: {
		palette: {
			mode: 'light',
			primary: { main: '#10B981', light: '#34D399', dark: '#059669', contrastText: '#FFFFFF' },
			secondary: { main: '#F43F5E', light: '#FB7185', dark: '#E11D48', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#064E3B', secondary: '#374151', disabled: '#9CA3AF' },
			background: { default: '#ECFDF5', paper: '#FFFFFF' },
			divider: '#D1FAE5',
			action: {
				active: '#10B981',
				hover: 'rgba(16, 185, 129, 0.08)',
				selected: 'rgba(16, 185, 129, 0.16)',
				disabled: '#BFC4CC',
				disabledBackground: '#ECFDF5',
				focus: 'rgba(16, 185, 129, 0.12)'
			}
		}
	},
	neonMintDark: {
		palette: {
			mode: 'dark',
			primary: { main: '#34D399', light: '#6EE7B7', dark: '#10B981', contrastText: '#022F22' },
			secondary: { main: '#FB7185', light: '#FDA4AF', dark: '#F43F5E', contrastText: '#881337' },
			...neutralsDarkTheme,
			text: { primary: '#ECFDF5', secondary: '#A7F3D0', disabled: '#6EE7B7' },
			background: { default: '#031A12', paper: '#052B1C' },
			divider: '#065F46',
			action: {
				active: '#34D399',
				hover: 'rgba(52, 211, 153, 0.12)',
				selected: 'rgba(52, 211, 153, 0.24)',
				disabled: 'rgba(52, 211, 153, 0.3)',
				disabledBackground: 'rgba(52, 211, 153, 0.12)',
				focus: 'rgba(52, 211, 153, 0.24)'
			}
		}
	},
	obsidianRose: {
		palette: {
			mode: 'light',
			primary: { main: '#18181B', light: '#3F3F46', dark: '#09090B', contrastText: '#FFFFFF' },
			secondary: { main: '#E11D48', light: '#FB7185', dark: '#BE123C', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#09090B', secondary: '#52525B', disabled: '#A1A1AA' },
			background: { default: '#FAFAFA', paper: '#FFFFFF' },
			divider: '#E4E4E7',
			action: {
				active: '#18181B',
				hover: 'rgba(24, 24, 27, 0.06)',
				selected: 'rgba(24, 24, 27, 0.12)',
				disabled: '#D4D4D8',
				disabledBackground: '#FAFAFA',
				focus: 'rgba(24, 24, 27, 0.08)'
			}
		}
	},
	obsidianRoseDark: {
		palette: {
			mode: 'dark',
			primary: { main: '#52525B', light: '#71717A', dark: '#3F3F46', contrastText: '#FAFAFA' },
			secondary: { main: '#FB7185', light: '#FDA4AF', dark: '#E11D48', contrastText: '#881337' },
			...neutralsDarkTheme,
			text: { primary: '#FAFAFA', secondary: '#E4E4E7', disabled: '#A1A1AA' },
			background: { default: '#09090B', paper: '#18181B' },
			divider: '#27272A',
			action: {
				active: '#FB7185',
				hover: 'rgba(251, 113, 133, 0.12)',
				selected: 'rgba(251, 113, 133, 0.24)',
				disabled: 'rgba(251, 113, 133, 0.3)',
				disabledBackground: 'rgba(251, 113, 133, 0.12)',
				focus: 'rgba(251, 113, 133, 0.24)'
			}
		}
	},
	gradientPro: {
		palette: {
			mode: 'light',
			primary: { main: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED', contrastText: '#FFFFFF' },
			secondary: { main: '#F97316', light: '#FB923C', dark: '#EA580C', contrastText: '#FFFFFF' },
			...neutralsLightTheme,
			text: { primary: '#1E1B4B', secondary: '#4B5563', disabled: '#9CA3AF' },
			background: { default: '#FAF5FF', paper: '#FFFFFF' },
			divider: '#EDE9FE',
			action: {
				active: '#8B5CF6',
				hover: 'rgba(139, 92, 246, 0.08)',
				selected: 'rgba(139, 92, 246, 0.16)',
				disabled: '#BFC4CC',
				disabledBackground: '#FAF5FF',
				focus: 'rgba(139, 92, 246, 0.12)'
			}
		}
	},
	gradientProDark: {
		palette: {
			mode: 'dark',
			primary: { main: '#A78BFA', light: '#C4B5FD', dark: '#8B5CF6', contrastText: '#1E1B4B' },
			secondary: { main: '#FB923C', light: '#FDBA74', dark: '#F97316', contrastText: '#7C2D12' },
			...neutralsDarkTheme,
			text: { primary: '#F5F3FF', secondary: '#DDD6FE', disabled: '#A78BFA' },
			background: { default: '#130D24', paper: '#1F1833' },
			divider: '#3B2975',
			action: {
				active: '#A78BFA',
				hover: 'rgba(167, 139, 250, 0.12)',
				selected: 'rgba(167, 139, 250, 0.24)',
				disabled: 'rgba(167, 139, 250, 0.3)',
				disabledBackground: 'rgba(167, 139, 250, 0.12)',
				focus: 'rgba(167, 139, 250, 0.24)'
			}
		}
	}
};

export default themesConfig;