import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export const ProtectedRoute = ({ allowedRoles }) => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role;

        // Verify if the token has expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            return <Navigate to="/login" replace />;
        }

        // Verify RBAC
        if (allowedRoles && !allowedRoles.includes(userRole)) {
            return <Navigate to="/dashboard" replace />; // Redirect to a safe fallback
        }

    } catch (err) {
        // Invalid token
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
