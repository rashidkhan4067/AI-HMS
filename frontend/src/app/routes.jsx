import { Routes, Route, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardLayout } from '../shared/components/layout/DashboardLayout';
import { AuthRoutes, ProtectedAuthRoutes } from '../features/auth/routes';
import { useAuth } from '../features/auth/hooks/useAuth';
import { mainNavigation } from './navigation.jsx';
import { Typography, Snackbar, Alert, Box } from '@mui/material';
import { ForbiddenPage } from '../features/auth/pages/ForbiddenPage';
import { Unauthorized } from '../components/Unauthorized';
import { NotFoundPage } from '../features/auth/pages/NotFoundPage';
import { PrivacyPage } from '../features/auth/pages/PrivacyPage';
import { TermsPage } from '../features/auth/pages/TermsPage';
import { useState } from 'react';

// Temporary Dashboard Components until Milestone 2
const Dashboard             = () => <Typography variant="h4">Welcome to the Dashboard</Typography>;
const AdminDashboard        = () => <Typography variant="h4">Admin Dashboard Workspace</Typography>;
const DoctorDashboard       = () => <Typography variant="h4">Doctor Dashboard Workspace</Typography>;
const NurseDashboard        = () => <Typography variant="h4">Nurse Dashboard Workspace</Typography>;
const ReceptionistDashboard = () => <Typography variant="h4">Receptionist Dashboard Workspace</Typography>;
const PharmacistDashboard   = () => <Typography variant="h4">Pharmacist Dashboard Workspace</Typography>;
const LabDashboard          = () => <Typography variant="h4">Lab Dashboard Workspace</Typography>;
const RadiologyDashboard     = () => <Typography variant="h4">Radiology Dashboard Workspace</Typography>;

const PatientDashboard = () => {
    const location = useLocation();
    const [toastMessage, setToastMessage] = useState(location.state?.successMessage || '');

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: '#006A6A', mb: 2 }}>
                Patient Dashboard Workspace
            </Typography>
            <Typography variant="body1" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>
                Welcome to your Al Shifaa health portal.
            </Typography>
            <Snackbar
                open={!!toastMessage}
                autoHideDuration={6000}
                onClose={() => setToastMessage('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" onClose={() => setToastMessage('')} sx={{ width: '100%', borderRadius: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// All valid backend roles
const CLINICAL_ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'PATIENT'];

export const AppRoutes = () => {
    const { logout } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            {AuthRoutes}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms"   element={<TermsPage />} />

            {/* Unauthorized Landing Page */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Shared Protected Routes (General Dashboard & Profile) */}
            <Route element={<ProtectedRoute allowedRoles={CLINICAL_ROLES} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/forbidden" element={<ForbiddenPage />} />
                    {ProtectedAuthRoutes}
                </Route>
            </Route>

            {/* Role-Specific Clinical Dashboards */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/*"         element={<AdminDashboard />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                    <Route path="/doctor/*"         element={<DoctorDashboard />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['NURSE']} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/nurse/dashboard" element={<NurseDashboard />} />
                    <Route path="/nurse/*"         element={<NurseDashboard />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
                    <Route path="/receptionist/*"         element={<ReceptionistDashboard />} />
                    <Route path="/reception/dashboard"    element={<ReceptionistDashboard />} />
                    <Route path="/reception/*"            element={<ReceptionistDashboard />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['PHARMACIST']} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
                    <Route path="/pharmacist/*"         element={<PharmacistDashboard />} />
                    <Route path="/pharmacy/dashboard"   element={<PharmacistDashboard />} />
                    <Route path="/pharmacy/*"           element={<PharmacistDashboard />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['LAB_TECHNICIAN']} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/lab/dashboard" element={<LabDashboard />} />
                    <Route path="/lab/*"         element={<LabDashboard />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['RADIOLOGIST']} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/radiology/dashboard" element={<RadiologyDashboard />} />
                    <Route path="/radiology/*"         element={<RadiologyDashboard />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
                <Route element={<DashboardLayout navItems={mainNavigation} onLogout={logout} />}>
                    <Route path="/patient/dashboard" element={<PatientDashboard />} />
                    <Route path="/patient/*"         element={<PatientDashboard />} />
                </Route>
            </Route>

            {/* 404 Catch-All — render proper Not Found page */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};
