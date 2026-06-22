import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { GlobalLoader } from '../shared/components/ui';

export const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        let loaderMessage = "Authenticating secure session...";
        const path = location.pathname;
        if (path.startsWith('/admin')) {
            loaderMessage = "Verifying Administrative Console Session...";
        } else if (path.startsWith('/doctor')) {
            loaderMessage = "Verifying Doctor Console Session...";
        } else if (path.startsWith('/nurse')) {
            loaderMessage = "Verifying Nurse Console Session...";
        } else if (path.startsWith('/patient')) {
            loaderMessage = "Accessing Patient Portal Session...";
        }
        return <GlobalLoader message={loaderMessage} />;
    }

    if (!isAuthenticated) {
        // Redirect to /auth/login and preserve the current path in location state
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    // If Google SSO user still needs to complete their profile, redirect them
    if (user?.must_complete_profile && location.pathname !== '/auth/complete-profile') {
        return <Navigate to="/auth/complete-profile" replace />;
    }

    const hasAccess = !allowedRoles || (user && (
        allowedRoles.includes(user.role) || 
        (user.cross_authorized_roles && allowedRoles.some(role => user.cross_authorized_roles.includes(role)))
    ));

    if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

