import { useEffect, useState } from 'react';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { keyframes } from '@mui/system';
import { ProfileForm } from '../components/ProfileForm';
import { ChangePassword } from '../components/ChangePassword';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../../../shared/components/ui';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

/**
 * ProfilePage — User profile page within the dashboard layout shell.
 * Renders account configurations and credentials updates with slide-up micro-animations.
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

    return (
        <Box 
            sx={{ 
                maxWidth: 800, 
                margin: '0 auto', 
                p: { xs: 2, md: 0 },
                animation: `${slideUp} 0.4s cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
        >
            <PageHeader 
                title="Account Settings" 
                subtitle="Manage your personal information and security preferences below."
            />

            <ProfileForm 
                initialData={profile} 
                onSave={handleSaveProfile} 
                isLoading={localLoading} 
                error={error} 
            />
            
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
