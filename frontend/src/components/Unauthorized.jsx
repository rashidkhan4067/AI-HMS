import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.default',
            }}
        >
            <Typography 
                variant="h3" 
                sx={{ 
                    fontWeight: 700, 
                    mb: 2, 
                    fontFamily: 'Outfit, sans-serif',
                    color: 'error.main'
                }}
            >
                Access Denied
            </Typography>
            <Typography 
                variant="body1" 
                sx={{ 
                    color: 'text.secondary', 
                    mb: 4, 
                    fontFamily: 'DM Sans, sans-serif' 
                }}
            >
                You don't have permission to access this page.
            </Typography>
            <Button
                variant="contained"
                onClick={() => navigate(-1)}
                sx={{ 
                    borderRadius: '100px', 
                    px: 4, 
                    py: 1.5,
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600
                }}
            >
                Go Back
            </Button>
        </Box>
    );
};
export default Unauthorized;
