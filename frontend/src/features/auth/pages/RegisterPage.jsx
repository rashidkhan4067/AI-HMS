import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { Typography, Link, Box } from '@mui/material';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';

export const RegisterPage = () => {
    return (
        <AuthLayout 
            title="Register for AI-HMS" 
            subtitle="Create your account to access the hospital management system."
            iconColor="secondary"
        >
            <RegisterForm />
            <Box sx={{ mt: 3 }}>
                <Typography variant="body2">
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login" color="secondary" underline="hover">
                        Login here
                    </Link>
                </Typography>
            </Box>
        </AuthLayout>
    );
};
