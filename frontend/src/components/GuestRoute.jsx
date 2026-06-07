import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export const GuestRoute = ({ children }) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    console.log("GuestRoute: rendering...", { isLoading, isAuthenticated, user });

    if (isLoading) {
        console.log("GuestRoute: still loading, rendering null");
        // Render a blank themed page to prevent any login page blink/flash on mount
        return null;
    }

    if (isAuthenticated) {
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
