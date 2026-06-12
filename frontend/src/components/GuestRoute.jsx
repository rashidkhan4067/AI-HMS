import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { GlobalLoader } from '../shared/components/ui';

export const GuestRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    console.log("GuestRoute: rendering...", { isLoading, isAuthenticated, user });

    if (isLoading) {
        console.log("GuestRoute: still loading, rendering GlobalLoader");
        return <GlobalLoader message="Verifying secure credentials..." />;
    }

    const inviteToken = new URLSearchParams(window.location.search).get('invite');
    
    if (isAuthenticated && !inviteToken) {
        if (user?.must_complete_profile) {
            console.log("GuestRoute: redirecting to complete-profile");
            return <Navigate to="/auth/complete-profile" replace />;
        }

        // Redirect to their default dashboard based on role
        const getDefaultDashboardPath = (role) => {
            switch (role) {
                case 'ADMIN': return '/admin/dashboard';
                case 'DOCTOR': return '/doctor/dashboard';
                case 'NURSE': return '/nurse/dashboard';
                case 'RECEPTIONIST': return '/receptionist/dashboard';
                case 'PHARMACIST': return '/pharmacist/dashboard';
                case 'LAB_TECHNICIAN': return '/lab/dashboard';
                case 'RADIOLOGIST': return '/radiology/dashboard';
                case 'PATIENT': return '/patient/dashboard';
                default: return '/dashboard';
            }
        };

        const destPath = getDefaultDashboardPath(user?.role);
        console.log("GuestRoute: authenticated, redirecting to", destPath);
        return <Navigate to={destPath} replace />;
    }

    console.log("GuestRoute: unauthenticated, rendering page");
    return children;
};
