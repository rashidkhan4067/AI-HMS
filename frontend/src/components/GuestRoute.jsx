import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';

export const GuestRoute = () => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        // Render a blank themed page to prevent any login page blink/flash on mount
        return null;
    }

    if (isAuthenticated) {
        if (user?.must_complete_profile) {
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

        return <Navigate to={getDefaultDashboardPath(user?.role)} replace />;
    }

    return <Outlet />;
};
