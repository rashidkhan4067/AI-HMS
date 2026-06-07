import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { GlobalLoader } from '../../../shared/components/ui';
import { RegisterForm } from '../components/RegisterForm';
import { BlockedRegisterView } from '../components/BlockedRegisterView';
import { DoctorApplicationForm } from '../components/DoctorApplicationForm';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { api } from '../../../lib/api';

/**
 * RegisterPage — Authentication Signup page with controlled onboarding guards.
 */
export const RegisterPage = () => {
    const [searchParams] = useSearchParams();
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    const [visitMode, setVisitMode] = useState(null); // doctor_apply, staff_invite, patient, blocked
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
                            setVisitMode('blocked');
                        }
                    } catch {
                        setVisitMode('blocked');
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
