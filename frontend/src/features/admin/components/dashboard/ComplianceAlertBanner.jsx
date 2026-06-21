import React from 'react';
import { Card, Box, Typography, Chip, useTheme } from '@mui/material';

export const ComplianceAlertBanner = ({ expiringDoctorsCount, onResolve }) => {
    const theme = useTheme();

    if (expiringDoctorsCount <= 0) return null;

    return (
        <Card sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(186, 26, 26, 0.15)' : '#FEF2F2', 
            border: '1px solid',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(186, 26, 26, 0.3)' : '#FECACA', 
            boxShadow: 'none',
            p: 2, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            justifyContent: 'space-between', 
            gap: { xs: 2, sm: 3 },
            borderRadius: '8px' 
        }}>
            <Box>
                <Typography variant="subtitle2" sx={{ color: theme.palette.mode === 'dark' ? '#FF8787' : '#DC2626', fontWeight: 700 }}>
                    Attention Required: PMDC License Compliance Alerts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    There are {expiringDoctorsCount} physician(s) with expired or near-expiry PMDC registrations (under 60 days). Verify their compliance to prevent clinical scheduling blocks.
                </Typography>
            </Box>
            <Chip 
                label="Resolve Compliance" 
                onClick={onResolve} 
                sx={{ 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    bgcolor: 'primary.main',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    '&:hover': {
                        bgcolor: 'primary.dark'
                    }
                }} 
            />
        </Card>
    );
};

export default ComplianceAlertBanner;
