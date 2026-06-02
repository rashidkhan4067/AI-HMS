import React, { useState } from 'react';
import { TextField, Button, Box, Typography, InputAdornment, IconButton, MenuItem, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../hooks/useAuth';

export const RegisterForm = () => {
    const [formData, setFormData] = useState({
        email: '', password: '', first_name: '', last_name: '', role: 'PATIENT'
    });
    const [showPassword, setShowPassword] = useState(false);
    
    // Abstracted logic via custom hook
    const { register, isLoading, error, success } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleRegister = async (e) => {
        e.preventDefault();
        await register(formData);
    };

    return (
        <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            {success && <Typography color="secondary" variant="body2">Registration successful! Redirecting...</Typography>}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField name="first_name" label="First Name" variant="outlined" fullWidth onChange={handleChange} required />
                <TextField name="last_name" label="Last Name" variant="outlined" fullWidth onChange={handleChange} required />
            </Box>
            
            <TextField name="email" label="Email Address" type="email" variant="outlined" fullWidth onChange={handleChange} required />
            
            <TextField 
                name="password" 
                label="Password" 
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                onChange={handleChange} 
                required 
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            
            <TextField
                select
                name="role"
                label="Role"
                value={formData.role}
                onChange={handleChange}
                fullWidth
                variant="outlined"
            >
                <MenuItem value="PATIENT">Patient</MenuItem>
                <MenuItem value="DOCTOR">Doctor</MenuItem>
                <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
            </TextField>

            <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 1 }} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
        </Box>
    );
};
