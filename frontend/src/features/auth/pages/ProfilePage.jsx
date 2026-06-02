import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import { ProfileForm } from '../components/ProfileForm';
import { ChangePassword } from '../components/ChangePassword';
import { authApi } from '../services/authApi';
import { useAuth } from '../hooks/useAuth';

export const ProfilePage = () => {
    const { updateProfile, isLoading, error } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await authApi.getProfile();
                setProfileData(data);
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setFetching(false);
            }
        };
        loadProfile();
    }, []);

    const handleSaveProfile = async (formData) => {
        const isSuccess = await updateProfile(formData);
        if (isSuccess) {
            setSuccessMsg("Profile updated successfully!");
        }
    };

    if (fetching) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ maxWidth: 800, margin: '0 auto' }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                Account Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Manage your personal information and security preferences below.
            </Typography>

            <ProfileForm 
                initialData={profileData} 
                onSave={handleSaveProfile} 
                isLoading={isLoading} 
                error={error} 
            />
            
            <ChangePassword />

            <Snackbar 
                open={!!successMsg} 
                autoHideDuration={4000} 
                onClose={() => setSuccessMsg('')}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    {successMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};
