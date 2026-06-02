import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/index.js';
import { AppRoutes } from './routes';

function App() {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    </ThemeProvider>
  )
}

export default App;
