import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeModeProvider } from './theme/ThemeModeContext';
import { AppRoutes } from './routes';
import { AuthProvider } from '../context/AuthContext';
import { CookieConsent } from '../shared/components/ui/CookieConsent';

function App() {
  return (
    <ThemeModeProvider>
        <CssBaseline />
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
                <CookieConsent />
            </AuthProvider>
        </BrowserRouter>
    </ThemeModeProvider>
  )
}

export default App;
