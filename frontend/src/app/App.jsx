import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeModeProvider } from './theme/ThemeModeContext';
import { AppRoutes } from './routes';
import { AuthProvider } from '../context/AuthContext';
import { CookieConsent } from '../shared/components/ui/CookieConsent';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
          <CssBaseline />
          <BrowserRouter>
              <AuthProvider>
                  <AppRoutes />
                  <CookieConsent />
              </AuthProvider>
          </BrowserRouter>
      </ThemeModeProvider>
    </QueryClientProvider>
  )
}

export default App;

