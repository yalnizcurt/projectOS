import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563eb', // Indigo-600
        light: '#60a5fa',
        dark: '#1d4ed8',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0ea5e9', // Sky-500
        light: '#38bdf8',
        dark: '#0284c7',
        contrastText: '#ffffff',
      },
      success: {
        main: '#10b981', // Emerald-500 (Green)
        light: '#d1fae5',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#f59e0b', // Amber-500 (Amber)
        light: '#fef3c7',
        dark: '#d97706',
        contrastText: '#ffffff',
      },
      error: {
        main: '#ef4444', // Red-500 (Red)
        light: '#fee2e2',
        dark: '#dc2626',
        contrastText: '#ffffff',
      },
      background: {
        default: mode === 'dark' ? '#0b0f19' : '#f8fafc',
        paper: mode === 'dark' ? '#111827' : '#ffffff',
        subtle: mode === 'dark' ? '#1f2937' : '#f1f5f9',
      },
      text: {
        primary: mode === 'dark' ? '#f9fafb' : '#0f172a',
        secondary: mode === 'dark' ? '#9ca3af' : '#64748b',
      },
      divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
      rag: {
        green: {
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#065f46',
          badge: '#10b981',
        },
        amber: {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
          badge: '#f59e0b',
        },
        red: {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
          badge: '#ef4444',
        },
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 800, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.015em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { fontSize: '0.925rem', lineHeight: 1.55 },
      body2: { fontSize: '0.85rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600 },
      caption: { fontSize: '0.75rem', letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 12,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0',
            padding: '12px 16px',
            fontSize: '0.85rem',
          },
          head: {
            fontWeight: 700,
            backgroundColor: mode === 'dark' ? '#111827' : '#f8fafc',
            color: mode === 'dark' ? '#9ca3af' : '#475569',
            textTransform: 'uppercase',
            fontSize: '0.725rem',
            letterSpacing: '0.05em',
          },
        },
      },
    },
  });

export const defaultTheme = getAppTheme('light');
