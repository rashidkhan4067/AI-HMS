import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { Typography, Link, Box } from '@mui/material';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';

export const LoginPage = () => {
    return (
        <AuthLayout 
            title="AI-HMS Login" 
            subtitle="Please sign in to access your portal."
        >
            <LoginForm />
            <Box sx={{ mt: 3 }}>
                <Typography variant="body2">
                    Don't have an account?{' '}
                    <Link component={RouterLink} to="/register" color="secondary" underline="hover">
                        Register here
                    </Link>
                </Typography>
            </Box>
        </AuthLayout>
    );
};
