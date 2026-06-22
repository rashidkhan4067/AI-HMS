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
import { DashboardOverview } from '../features/admin/pages/DashboardOverview';
import { Invitations } from '../features/admin/pages/Invitations';
import { Applications } from '../features/admin/pages/Applications';
import { Users } from '../features/admin/pages/Users';
import { Audits } from '../features/admin/pages/Audits';
import { Departments } from '../features/admin/pages/Departments';
import { Compliance } from '../features/admin/pages/Compliance';
import { Revenue } from '../features/admin/pages/Revenue';
import { IPD } from '../features/admin/pages/IPD';
import { Roster } from '../features/admin/pages/Roster';
import { Appointments } from '../features/admin/pages/Appointments';
import { DepartmentLogs } from '../features/admin/pages/DepartmentLogs';
import { ProfilePage } from '../features/auth/pages/ProfilePage';
import { PatientDashboard } from '../features/patient/pages/PatientDashboard';
import { DoctorDashboard } from '../features/doctor/pages/DoctorDashboard';
import { PharmacistDashboard } from '../features/pharmacy/pages/PharmacistDashboard';
import { ReceptionistDashboard } from '../features/receptionist/pages/ReceptionistDashboard';
import { NurseDashboard } from '../features/nurse/pages/NurseDashboard';
import { LabDashboard } from '../features/lab/pages/LabDashboard';
import { RadiologyDashboard } from '../features/radiology/pages/RadiologyDashboard';

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
                    <Route path="/admin/dashboard" element={<DashboardOverview />} />
                    <Route path="/admin/revenue"   element={<Revenue />} />
                    <Route path="/admin/compliance" element={<Compliance />} />
                    <Route path="/admin/ipd"       element={<IPD />} />
                    <Route path="/admin/roster"    element={<Roster />} />
                    <Route path="/admin/appointments" element={<Appointments />} />
                    <Route path="/admin/invites"   element={<Invitations />} />
                    <Route path="/admin/applications" element={<Applications />} />
                    <Route path="/admin/users"       element={<Users />} />
                    <Route path="/admin/departments" element={<Departments />} />
                    <Route path="/admin/audits"      element={<Audits />} />
                    <Route path="/admin/department-logs" element={<DepartmentLogs />} />
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
