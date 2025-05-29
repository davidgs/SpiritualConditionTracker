/**
 * Complete Material UI theme color definitions
 * This provides properly structured theme colors following MUI documentation
 */

// Primary color palettes with proper light/main/dark variants
export const primaryColors = {
  blue: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#3b82f6', // main
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1565c0',
    900: '#0d47a1',
    light: '#64b5f6',
    main: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  purple: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6', // main
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
    light: '#a78bfa',
    main: '#8b5cf6',
    dark: '#6d28d9',
    contrastText: '#ffffff',
  },
  green: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // main
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    light: '#34d399',
    main: '#10b981',
    dark: '#059669',
    contrastText: '#ffffff',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // main
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    light: '#f87171',
    main: '#ef4444',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // main
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    light: '#fb923c',
    main: '#f97316',
    dark: '#ea580c',
    contrastText: '#ffffff',
  },
  teal: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // main
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    light: '#2dd4bf',
    main: '#14b8a6',
    dark: '#0d9488',
    contrastText: '#ffffff',
  },
};

// Complete palettes for secondary colors
export const secondaryColors = {
  light: {
    secondary: {
      light: '#7c3aed',
      main: '#6d28d9',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    success: {
      light: '#4ade80',
      main: '#22c55e',
      dark: '#16a34a',
      contrastText: '#ffffff',
    },
    error: {
      light: '#f87171',
      main: '#ef4444',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    warning: {
      light: '#fbbf24',
      main: '#f59e0b',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    info: {
      light: '#60a5fa',
      main: '#3b82f6',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
  },
  dark: {
    secondary: {
      light: '#a78bfa',
      main: '#8b5cf6',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    success: {
      light: '#86efac',
      main: '#34d399',
      dark: '#10b981',
      contrastText: '#ffffff',
    },
    error: {
      light: '#fca5a5',
      main: '#f87171',
      dark: '#ef4444',
      contrastText: '#ffffff',
    },
    warning: {
      light: '#fcd34d',
      main: '#fbbf24',
      dark: '#f59e0b',
      contrastText: '#ffffff',
    },
    info: {
      light: '#93c5fd',
      main: '#60a5fa',
      dark: '#3b82f6',
      contrastText: '#ffffff',
    },
  },
};

// Background and text colors for light and dark modes
export const backgroundColors = {
  light: {
    default: '#f0f2f5',
    paper: '#ffffff',
    appBar: '#ffffff',
    drawer: '#ffffff',
    dialog: '#ffffff',
    card: '#ffffff',
    tooltip: 'rgba(97, 97, 97, 0.92)',
  },
  dark: {
    default: '#111827',
    paper: '#1f2937',
    appBar: '#1f2937',
    drawer: '#0f172a',
    dialog: '#1f2937',
    card: '#1f2937',
    tooltip: 'rgba(20, 20, 20, 0.92)',
  },
};

export const textColors = {
  light: {
    primary: '#121212',
    secondary: '#4b5563',
    disabled: '#9ca3af',
    hint: '#6b7280',
  },
  dark: {
    primary: '#f3f4f6',
    secondary: '#d1d5db',
    disabled: '#6b7280',
    hint: '#9ca3af',
  },
};

/**
 * Generate a complete Material UI theme palette
 * 
 * @param {string} colorName - Name of the primary color (blue, purple, etc.)
 * @param {string} mode - 'light' or 'dark'
 * @returns {Object} Complete MUI theme palette object
 */
export function generateCompletePalette(colorName, mode) {
  const isDark = mode === 'dark';
  const primaryColor = primaryColors[colorName] || primaryColors.blue;
  const secondaryColor = secondaryColors[isDark ? 'dark' : 'light'];
  const backgrounds = backgroundColors[isDark ? 'dark' : 'light'];
  const text = textColors[isDark ? 'dark' : 'light'];
  
  return {
    mode: isDark ? 'dark' : 'light',
    primary: {
      ...primaryColor,
      // Adjust main color for dark mode to maintain visibility
      main: isDark ? primaryColor[400] : primaryColor[500],
    },
    secondary: secondaryColor.secondary,
    error: secondaryColor.error,
    warning: secondaryColor.warning,
    info: secondaryColor.info,
    success: secondaryColor.success,
    background: backgrounds,
    text: text,
    divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    action: {
      active: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
      hover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      hoverOpacity: 0.08,
      selected: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)',
      selectedOpacity: 0.16,
      disabled: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
      disabledBackground: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      disabledOpacity: 0.38,
      focus: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
    },
  };
}

/**
 * Get a comprehensive theme object configuration with all components
 * 
 * @param {string} colorName - Primary color name
 * @param {string} mode - 'light' or 'dark'
 * @returns {Object} Complete theme configuration
 */
export function getCompleteTheme(colorName, mode) {
  const isDark = mode === 'dark';
  const palette = generateCompletePalette(colorName, mode);
  const primaryColor = primaryColors[colorName] || primaryColors.blue;
  
  // Get colors for UI tinting
  const bgColor = isDark ? palette.background.default : palette.background.default;
  const paperColor = palette.background.paper;
  const cardColor = palette.background.card;
  
  return {
    palette,
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 600,
        fontSize: '2.375rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 600,
        fontSize: '1.875rem',
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.25rem',
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: '0.9375rem',
        lineHeight: 1.5,
      },
      subtitle2: {
        fontSize: '0.875rem',
        lineHeight: 1.57,
      },
      body1: {
        fontSize: '0.9375rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.57,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
      caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
      },
      overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            backgroundColor: bgColor,
            backgroundImage: isDark 
              ? `linear-gradient(160deg, ${bgColor} 0%, ${bgColor} 90%, ${palette.primary.dark}20 100%)`
              : `linear-gradient(160deg, ${bgColor} 0%, ${bgColor} 90%, ${palette.primary.light}20 100%)`,
            transition: 'background-color 0.3s ease, background-image 0.3s ease',
            minHeight: '100vh',
          },
          // Apply color to scrollbar for browsers that support it
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? '#374151' : palette.primary.light,
            borderRadius: '4px',
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
          },
        }),
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark 
              ? '0 1px 3px 0 rgba(0,0,0,0.3)' 
              : '0 1px 3px 0 rgba(0,0,0,0.1)',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          },
          colorPrimary: {
            backgroundColor: isDark 
              ? palette.background.appBar 
              : primaryColor[50],
            color: isDark ? '#ffffff' : primaryColor[800],
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            boxShadow: 'none',
            padding: '6px 16px',
            transition: 'all 0.2s ease',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            '&:hover': {
              boxShadow: '0 2px 4px 0 rgba(0,0,0,0.05)',
            },
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: primaryColor.light,
            },
          },
          containedError: {
            backgroundColor: isDark ? '#f87171' : '#ef4444',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: isDark ? '#ef4444' : '#dc2626',
            },
          },
          containedSuccess: {
            backgroundColor: isDark ? '#34d399' : '#22c55e',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: isDark ? '#10b981' : '#16a34a',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            transition: 'all 0.2s ease',
          },
          rounded: {
            borderRadius: 12,
          },
          outlined: {
            borderWidth: 1,
          },
          elevation1: {
            boxShadow: isDark 
              ? '0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)' 
              : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
          },
          elevation2: {
            boxShadow: isDark 
              ? '0 2px 4px rgba(0,0,0,0.2), 0 2px 3px rgba(0,0,0,0.3)' 
              : '0 2px 4px rgba(0,0,0,0.1), 0 2px 3px rgba(0,0,0,0.06)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark 
              ? '0 2px 8px 0 rgba(0,0,0,0.3)' 
              : '0 2px 8px 0 rgba(0,0,0,0.08)',
            backgroundImage: 'none',
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            backgroundColor: isDark 
              ? 'rgba(0,0,0,0.1)' 
              : `${primaryColor[50]}`,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryColor[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: primaryColor.main,
              borderWidth: 2,
            },
          },
          notchedOutline: {
            transition: 'all 0.2s ease',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: 0,
            backgroundColor: isDark 
              ? palette.background.drawer 
              : '#ffffff',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: 20,
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: '16px 20px',
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: isDark 
                ? 'rgba(255,255,255,0.08)' 
                : `${primaryColor[50]}`,
              '&:hover': {
                backgroundColor: isDark 
                  ? 'rgba(255,255,255,0.12)' 
                  : `${primaryColor[100]}`,
              },
            },
            '&:hover': {
              backgroundColor: isDark 
                ? 'rgba(255,255,255,0.05)' 
                : `${primaryColor[50]}33`, // 20% opacity
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          colorPrimary: {
            backgroundColor: isDark 
              ? primaryColor[700] 
              : primaryColor[100],
            color: isDark ? '#ffffff' : primaryColor[800],
            '&:hover': {
              backgroundColor: isDark 
                ? primaryColor[600] 
                : primaryColor[200],
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
            '& .MuiSwitch-switchBase': {
              padding: 0,
              margin: 2,
              transitionDuration: '300ms',
              '&.Mui-checked': {
                transform: 'translateX(16px)',
                color: '#fff',
                '& + .MuiSwitch-track': {
                  backgroundColor: primaryColor.main,
                  opacity: 1,
                  border: 0,
                },
                '&.Mui-disabled + .MuiSwitch-track': {
                  opacity: 0.5,
                },
              },
              '&.Mui-disabled .MuiSwitch-thumb': {
                color: isDark ? '#555' : '#bbb',
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                opacity: isDark ? 0.3 : 0.1,
              },
            },
            '& .MuiSwitch-thumb': {
              boxSizing: 'border-box',
              width: 22,
              height: 22,
            },
            '& .MuiSwitch-track': {
              borderRadius: 26 / 2,
              backgroundColor: isDark ? '#39393D' : '#E9E9EA',
              opacity: 1,
            },
          },
        },
      },
    },
  };
}

export default primaryColors;