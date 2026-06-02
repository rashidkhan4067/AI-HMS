import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Alert, CircularProgress, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../hooks/useAuth';

export const ChangePassword = () => {
    const { changePassword, isLoading, error } = useAuth();
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [localError, setLocalError] = useState(null);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        setSuccess(false);

        if (formData.new_password !== formData.confirm_password) {
            setLocalError("New passwords do not match.");
            return;
        }

        const isSuccess = await changePassword({
            old_password: formData.old_password,
            new_password: formData.new_password
        });
        
        if (isSuccess) {
            setSuccess(true);
            setFormData({ old_password: '', new_password: '', confirm_password: '' });
        }
    };

    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom color="error">Security Settings</Typography>
                {(error || localError) && <Alert severity="error" sx={{ mb: 2 }}>{localError || error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Password successfully changed!</Alert>}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField 
                        label="Current Password" name="old_password" 
                        type={showPassword ? 'text' : 'password'}
                        value={formData.old_password} onChange={handleChange} required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton 
                                        onClick={handleClickShowPassword} 
                                        edge="end"
                                        aria-label="toggle password visibility"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField 
                        label="New Password" name="new_password" 
                        type={showPassword ? 'text' : 'password'}
                        value={formData.new_password} onChange={handleChange} required 
                    />
                    <TextField 
                        label="Confirm New Password" name="confirm_password" 
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirm_password} onChange={handleChange} required 
                    />
                    <Button type="submit" variant="contained" color="error" disabled={isLoading} sx={{ alignSelf: 'flex-start' }}>
                        {isLoading ? <CircularProgress size={24} /> : 'Update Password'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};
