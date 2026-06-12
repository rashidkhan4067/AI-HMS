import { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { XCircle } from 'lucide-react';
import { GlobalLoader } from '../../../shared/components/ui';
import { RegisterForm } from '../components/RegisterForm';
import { BlockedRegisterView } from '../components/BlockedRegisterView';
import { DoctorApplicationForm } from '../components/DoctorApplicationForm';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { useAuth } from '../hooks/useAuth';
import { api } from '../../../lib/api';

/**
 * RegisterPage — Authentication Signup page with controlled onboarding guards.
 */
export const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const { isAuthenticated, user, logout } = useAuth();

    const [visitMode, setVisitMode] = useState(null); // doctor_apply, staff_invite, patient, blocked, invite_invalid
    const [inviteData, setInviteData] = useState(null);
    const [loading, setLoading] = useState(true);

    const inviteToken = searchParams.get('invite');
    const typeParam   = searchParams.get('type');
    const applyParam  = searchParams.get('apply');

    useEffect(() => {
        const determineMode = async () => {
            setLoading(true);
            try {
                if (typeParam === 'patient') {
                    setVisitMode('patient');
                    setLoading(false);
                    return;
                }

                if (inviteToken) {
                    try {
                        const res = await api.post('v1/auth/validate-invite/', { token: inviteToken });
                        if (res.data?.valid) {
                            setInviteData({
                                email: res.data.email,
                                role: res.data.role,
                                roleLabel: res.data.role_label,
                                departmentId: res.data.department_id,
                                departmentName: res.data.department_name,
                                token: inviteToken,
                            });
                            setVisitMode('staff_invite');
                        } else {
                            setVisitMode('invite_invalid');
                        }
                    } catch {
                        setVisitMode('invite_invalid');
                    }
                    setLoading(false);
                    return;
                }

                if (applyParam === 'doctor') {
                    setVisitMode('doctor_apply');
                    setLoading(false);
                    return;
                }

                // If no conditions met, block registration
                setVisitMode('blocked');
            } catch {
                setVisitMode('blocked');
            } finally {
                setLoading(false);
            }
        };

        determineMode();
    }, [inviteToken, typeParam, applyParam]);

    if (loading) {
        return <GlobalLoader message="Verifying your invitation..." />;
    }

    // Active session detected screen to prevent session conflicts
    if (isAuthenticated && inviteToken) {
        const handleLogoutAndRegister = () => {
            // Logout and redirect back to this exact page so they can register
            logout(window.location.pathname + window.location.search);
        };

        return (
            <AuthLayout title="Active Session Detected" subtitle="Please sign out of your current account to accept the invitation.">
                <Box sx={{ textAlign: 'center', py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mb: 3.5, color: isDark ? 'text.secondary' : '#4B5563', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, maxWidth: 380 }}>
                        You are currently signed in as <strong>{user?.email}</strong>. To register your new staff account, you must sign out of your current session.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleLogoutAndRegister}
                        sx={{
                            background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                            fontFamily: "'DM Sans', sans-serif",
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '10px',
                            px: 4,
                            py: 1.25,
                            boxShadow: 'none',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #005A5A 0%, #003F3F 100%)',
                            }
                        }}
                    >
                        Sign Out & Continue
                    </Button>
                </Box>
            </AuthLayout>
        );
    }

    if (visitMode === 'invite_invalid') {
        return (
            <AuthLayout title={null} subtitle={null}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        py: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444',
                            mb: 3,
                        }}
                    >
                        <XCircle size={36} />
                    </Box>

                    <Typography
                        variant="h5"
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: '22px',
                            color: isDark ? '#E0F2F1' : '#111827',
                            mb: 1.5,
                        }}
                    >
                        Invalid or Expired Invitation
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: isDark ? 'text.secondary' : '#6B7280',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            mb: 4,
                            maxWidth: 360,
                        }}
                    >
                        This invitation link is invalid, has expired, or has already been used. Please contact your hospital administrator to obtain a new onboarding link.
                    </Typography>

                    <Button
                        component={RouterLink}
                        to="/login"
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                            fontFamily: "'DM Sans', sans-serif",
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: '10px',
                            px: 4,
                            py: 1,
                            boxShadow: 'none',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #005A5A 0%, #003F3F 100%)',
                            },
                        }}
                    >
                        Back to Sign In
                    </Button>
                </Box>
            </AuthLayout>
        );
    }

    if (visitMode === 'blocked') {
        return (
            <AuthLayout title={null} subtitle={null}>
                <BlockedRegisterView />
            </AuthLayout>
        );
    }

    if (visitMode === 'doctor_apply') {
        return (
            <AuthLayout
                title="Join Al Shifaa Network"
                subtitle="Submit your application to join Pakistan's leading clinical network."
            >
                <DoctorApplicationForm />
            </AuthLayout>
        );
    }

    // Determine layout titles for patient and staff invite registration
    const pageTitle = visitMode === 'patient' ? 'Patient Portal Registration' : 'Complete Your Registration';
    const pageSubtitle = visitMode === 'patient'
        ? 'Create your account to book appointments and access your health records.'
        : 'Your account has been prepared by your hospital administrator.';

    return (
        <AuthLayout title={pageTitle} subtitle={pageSubtitle}>
            <RegisterForm visitMode={visitMode} inviteData={inviteData} />
        </AuthLayout>
    );
};
