import React, { useState } from 'react';
import { TextField, Button, Box, Typography, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../hooks/useAuth';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Abstracted logic via custom hook
    const { login, isLoading, error } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {error && <Typography color="error" variant="body2">{error}</Typography>}
            <TextField 
                label="Email Address" 
                variant="outlined"
                type="email" 
                fullWidth
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
            <TextField 
                label="Password" 
                variant="outlined"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 1 }} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
        </Box>
    );
};
