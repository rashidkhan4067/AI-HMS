import React from 'react';
import { Box, Card, CardContent, Container, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export const AuthLayout = ({ children, title, subtitle, iconColor = 'primary' }) => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default', py: 4 }}>
            <Container maxWidth="xs">
                <Card elevation={1} sx={{ borderRadius: 4, p: 2 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                            <LocalHospitalIcon color={iconColor} sx={{ fontSize: 48 }} />
                        </Box>
                        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" color="primary">
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {subtitle}
                        </Typography>
                        
                        {children}
                        
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};
