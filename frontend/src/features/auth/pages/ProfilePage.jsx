import { useEffect, useState } from 'react';
import { Box, CircularProgress, Snackbar, Alert, Card, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import { ShieldCheck } from 'lucide-react';
import { ProfileForm } from '../components/ProfileForm';
import { ChangePassword } from '../components/ChangePassword';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../../../shared/components/ui';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Map role value to professional readable string
const ROLE_TITLE_MAP = {
    ADMIN: 'System Administrator',
    DOCTOR: 'Medical Professional',
    NURSE: 'Clinical Nurse',
    RECEPTIONIST: 'Front Desk Receptionist',
    PHARMACIST: 'Clinical Pharmacist',
    LAB_TECHNICIAN: 'Laboratory Analyst',
    RADIOLOGIST: 'Radiology Specialist',
    PATIENT: 'Registered Patient'
};

const getRoleTitle = (role) => ROLE_TITLE_MAP[role] || role;

// Map role value to Material Design 3 style custom theme styles
const ROLE_STYLE_MAP = {
    ADMIN: { bg: 'rgba(186, 26, 26, 0.06)', border: 'rgba(186, 26, 26, 0.15)', text: '#BA1A1A' },
    DOCTOR: { bg: 'rgba(0, 106, 106, 0.06)', border: 'rgba(0, 106, 106, 0.15)', text: '#006A6A' },
    NURSE: { bg: 'rgba(13, 110, 253, 0.06)', border: 'rgba(13, 110, 253, 0.15)', text: '#0D6EFD' },
    RECEPTIONIST: { bg: 'rgba(217, 119, 6, 0.06)', border: 'rgba(217, 119, 6, 0.15)', text: '#D97706' },
    PHARMACIST: { bg: 'rgba(79, 70, 229, 0.06)', border: 'rgba(79, 70, 229, 0.15)', text: '#4F46E5' },
    LAB_TECHNICIAN: { bg: 'rgba(8, 145, 178, 0.06)', border: 'rgba(8, 145, 178, 0.15)', text: '#0891B2' },
    RADIOLOGIST: { bg: 'rgba(124, 58, 237, 0.06)', border: 'rgba(124, 58, 237, 0.15)', text: '#7C3AED' },
    PATIENT: { bg: 'rgba(22, 163, 74, 0.06)', border: 'rgba(22, 163, 74, 0.15)', text: '#16A34A' }
};

const getRoleStyles = (role) => ROLE_STYLE_MAP[role] || { bg: 'rgba(107, 114, 128, 0.06)', border: 'rgba(107, 114, 128, 0.15)', text: '#6B7280' };

/**
 * ProfilePage — User profile dashboard inside the application layout.
 * Features a Google Account-style centered layout (max-width 840px):
 *  - Header Section: Page title and subtext.
 *  - Basic info Card: Controlled by ProfileForm.jsx.
 *  - Registry details Card: Displays read-only department, ID, role, and joined date in unified horizontal rows.
 *  - Security settings Card: Controlled by ChangePassword.jsx.
 */
export const ProfilePage = () => {
    const { 
        getProfile, 
        updateProfile, 
        profile, 
        error 
    } = useAuth();
    
    const [successMsg, setSuccessMsg] = useState('');
    const [localLoading, setLocalLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLocalLoading(true);
            await getProfile();
            setLocalLoading(false);
        };
        fetchProfile();
    }, [getProfile]);

    const handleSaveProfile = async (formData) => {
        setLocalLoading(true);
        const isSuccess = await updateProfile(formData);
        setLocalLoading(false);
        if (isSuccess) {
            setSuccessMsg("Profile updated successfully!");
        }
    };

    if (!profile && localLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                <CircularProgress size={40} />
            </Box>
        );
    }

    const roleStyles = getRoleStyles(profile?.role);

    return (
        <Box 
            sx={{ 
                maxWidth: 840, 
                margin: '0 auto', 
                p: { xs: 1.5, sm: 2, md: 0 },
                animation: `${slideUp} 0.4s cubic-bezier(0.4, 0, 0.2, 1)`,
                display: 'flex',
                flexDirection: 'column',
                gap: 4
            }}
        >
            <PageHeader 
                title="Personal info" 
                subtitle="Info about you and your preferences in Al Shifaa systems."
            />

            {/* Basic Info Card (Avatar, Name, Phone, Email) */}
            <ProfileForm 
                initialData={profile} 
                onSave={handleSaveProfile} 
                isLoading={localLoading} 
                error={error} 
            />

            {/* Registry Details Card (Read-Only) */}
            <Card 
                sx={{ 
                    borderRadius: '20px', 
                    border: '1px solid', 
                    borderColor: 'divider',
                    boxShadow: 'none',
                    overflow: 'hidden'
                }}
            >
                <Box 
                    sx={{ 
                        p: { xs: 2.5, sm: 4 }, 
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            fontWeight: 700, 
                            fontFamily: "'Outfit', sans-serif", 
                            fontSize: '18px',
                            color: 'text.primary'
                        }}
                    >
                        Registry details
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'text.secondary', 
                            fontFamily: "'DM Sans', sans-serif", 
                            fontSize: '13.5px', 
                            mt: 0.5 
                        }}
                    >
                        Your official clinical records and employee identifier registered in the database.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Department Row */}
                    <Box 
                        sx={{ 
                            px: { xs: 2.5, sm: 4 },
                            py: 2.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 4 },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.15s ease'
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                fontFamily: "'Outfit', sans-serif",
                                width: { xs: '100%', sm: '220px' },
                                flexShrink: 0
                            }}
                        >
                            Assigned department
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 500, 
                                color: 'text.primary', 
                                fontFamily: "'DM Sans', sans-serif"
                            }}
                        >
                            {profile?.department_name || 'General Operations'}
                        </Typography>
                    </Box>

                    {/* Employee ID Row */}
                    <Box 
                        sx={{ 
                            px: { xs: 2.5, sm: 4 },
                            py: 2.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 4 },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.15s ease'
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                fontFamily: "'Outfit', sans-serif",
                                width: { xs: '100%', sm: '220px' },
                                flexShrink: 0
                            }}
                        >
                            Employee identifier
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 500, 
                                color: 'text.primary', 
                                fontFamily: "'DM Sans', sans-serif"
                            }}
                        >
                            {profile?.employee_id || 'Not Assigned'}
                        </Typography>
                    </Box>

                    {/* Role Row */}
                    <Box 
                        sx={{ 
                            px: { xs: 2.5, sm: 4 },
                            py: 2.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 4 },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.15s ease'
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                fontFamily: "'Outfit', sans-serif",
                                width: { xs: '100%', sm: '220px' },
                                flexShrink: 0
                            }}
                        >
                            Account role
                        </Typography>
                        <Box 
                            sx={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                px: 2,
                                py: 0.5,
                                borderRadius: '100px',
                                bgcolor: roleStyles.bg,
                                border: `1px solid ${roleStyles.border}`,
                                color: roleStyles.text,
                                fontSize: '12px',
                                fontWeight: 600,
                                fontFamily: "'Outfit', sans-serif",
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                        >
                            <ShieldCheck size={13} />
                            {getRoleTitle(profile?.role)}
                        </Box>
                    </Box>

                    {/* Joined Date Row */}
                    <Box 
                        sx={{ 
                            px: { xs: 2.5, sm: 4 },
                            py: 2.5,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: { xs: 1, sm: 4 },
                            '&:hover': { bgcolor: 'action.hover' },
                            transition: 'background-color 0.15s ease'
                        }}
                    >
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 600, 
                                color: 'text.secondary', 
                                fontFamily: "'Outfit', sans-serif",
                                width: { xs: '100%', sm: '220px' },
                                flexShrink: 0
                            }}
                        >
                            Member since
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                fontWeight: 500, 
                                color: 'text.primary', 
                                fontFamily: "'DM Sans', sans-serif"
                            }}
                        >
                            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        </Typography>
                    </Box>
                </Box>
            </Card>

            {/* Change Password Card */}
            <ChangePassword />

            <Snackbar 
                open={!!successMsg} 
                autoHideDuration={4000} 
                onClose={() => setSuccessMsg('')}
            >
                <Alert severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
                    {successMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};
