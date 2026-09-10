import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppProvider, useApp } from './data/store';
import { getAppTheme } from './theme/theme';
import AppRoutes from './routes';

function ThemedApp() {
  const { state } = useApp();
  const theme = React.useMemo(() => getAppTheme(state.themeMode), [state.themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
}
