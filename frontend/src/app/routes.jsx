import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardLayout } from '../shared/components/layout/DashboardLayout';
import { AdminLayout } from '../shared/components/layout/AdminLayout';
import { AuthRoutes, ProtectedAuthRoutes } from '../features/auth/routes';
import { useAuth } from '../features/auth/hooks/useAuth';
import { mainNavigation } from './navigation.jsx';
import { Typography, Snackbar, Alert, Box } from '@mui/material';
import { ForbiddenPage } from '../features/auth/pages/ForbiddenPage';
import { Unauthorized } from '../components/Unauthorized';
import { NotFoundPage } from '../features/auth/pages/NotFoundPage';
import { PrivacyPage } from '../features/auth/pages/PrivacyPage';
import { TermsPage } from '../features/auth/pages/TermsPage';
import { LandingPage } from '../pages/LandingPage';
import { AdminDashboardOverview } from '../features/admin/pages/AdminDashboardOverview';
import { AdminInvitations } from '../features/admin/pages/AdminInvitations';
import { AdminApplications } from '../features/admin/pages/AdminApplications';
import { AdminUsers } from '../features/admin/pages/AdminUsers';
import { AdminAudits } from '../features/admin/pages/AdminAudits';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { PatientDashboard } from '../features/patient/pages/PatientDashboard';
import { DoctorDashboard } from '../features/doctor/pages/DoctorDashboard';

const Dashboard = () => {
    const { user } = useAuth();
    if (!user) return null;

    const roleRedirectMap = {
        'ADMIN': '/admin/dashboard',
        'DOCTOR': '/doctor/dashboard',
        'NURSE': '/nurse/dashboard',
        'RECEPTIONIST': '/receptionist/dashboard',
        'PHARMACIST': '/pharmacist/dashboard',
        'LAB_TECHNICIAN': '/lab/dashboard',
        'RADIOLOGIST': '/radiology/dashboard',
        'PATIENT': '/patient/dashboard',
    };

    const target = roleRedirectMap[user.role] || '/unauthorized';
    return <Navigate to={target} replace />;
};
const NurseDashboard        = () => <Typography variant="h4">Nurse Dashboard Workspace</Typography>;
const ReceptionistDashboard = () => <Typography variant="h4">Receptionist Dashboard Workspace</Typography>;
const PharmacistDashboard   = () => <Typography variant="h4">Pharmacist Dashboard Workspace</Typography>;
const LabDashboard          = () => <Typography variant="h4">Lab Dashboard Workspace</Typography>;
const RadiologyDashboard     = () => <Typography variant="h4">Radiology Dashboard Workspace</Typography>;

// All valid backend roles
const CLINICAL_ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'PATIENT'];

export const AppRoutes = () => {
    const { logout } = useAuth();

    return (
        <Routes>
            {/* Root Route — Landing Page */}
            <Route path="/" element={<LandingPage />} />

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

            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboardOverview />} />
                    <Route path="/admin/invites"   element={<AdminInvitations />} />
                    <Route path="/admin/applications" element={<AdminApplications />} />
                    <Route path="/admin/users"       element={<AdminUsers />} />
                    <Route path="/admin/audits"      element={<AdminAudits />} />
                    <Route path="/admin/profile"     element={<ProfilePage />} />
                    {/* Fallback to System Overview */}
                    <Route path="/admin"           element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/*"         element={<Navigate to="/admin/dashboard" replace />} />
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
