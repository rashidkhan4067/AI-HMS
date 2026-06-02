import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { DashboardLayout } from '../shared/components/layout/DashboardLayout';
import { AuthRoutes, ProtectedAuthRoutes } from '../features/auth/routes';
import { useAuth } from '../features/auth/hooks/useAuth';
import { mainNavigation } from './navigation.jsx';
import { Typography } from '@mui/material';

// Temporary Dashboard Component until Milestone 2
const Dashboard = () => <Typography variant="h4">Welcome to the Dashboard</Typography>;

export const AppRoutes = () => {
    const { logout } = useAuth();
    
    return (
        <Routes>
            {/* Public Routes */}
            {AuthRoutes}

            {/* Protected Routes (Dashboard Shell) */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT']} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    {ProtectedAuthRoutes}
                </Route>
            </Route>

            {/* Catch-All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};
