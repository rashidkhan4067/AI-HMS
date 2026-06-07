import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { GlobalLoader } from '../shared/components/ui';

export const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <GlobalLoader message="Authenticating session..." />;
    }

    if (!isAuthenticated) {
        // Redirect to /auth/login and preserve the current path in location state
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // If Google SSO user still needs to complete their profile, redirect them
    if (user?.must_complete_profile && location.pathname !== '/auth/complete-profile') {
        return <Navigate to="/auth/complete-profile" replace />;
    }

    const hasAccess = !allowedRoles || (user && allowedRoles.includes(user.role));

    if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

