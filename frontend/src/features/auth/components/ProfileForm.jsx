import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Alert, CircularProgress, TextField, Button } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/authApi';

export const ProfileForm = ({ initialData, onSave, isLoading, error }) => {
    const [formData, setFormData] = useState({
        first_name: initialData?.first_name || '',
        last_name: initialData?.last_name || '',
        email: initialData?.email || ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>Personal Information</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField 
                        label="First Name" name="first_name" 
                        value={formData.first_name} onChange={handleChange} 
                    />
                    <TextField 
                        label="Last Name" name="last_name" 
                        value={formData.last_name} onChange={handleChange} 
                    />
                    <TextField 
                        label="Email (Read Only)" name="email" type="email" 
                        value={formData.email} disabled 
                    />
                    <Button type="submit" variant="contained" disabled={isLoading} sx={{ alignSelf: 'flex-start' }}>
                        {isLoading ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};
