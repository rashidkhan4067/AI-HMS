import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GppBadIcon from '@mui/icons-material/GppBad';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useAuth } from '../hooks/useAuth';

/**
 * ForbiddenPage — Centered access-denied view matching Google security layouts.
 * Uses a glassmorphic Card container with pulsing warning indicators and customized RBAC details.
 */
export const ForbiddenPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
                p: 3,
            }}
        >
            <Card
                component={motion.div}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                elevation={0}
                sx={{
                    maxWidth: 500,
                    width: '100%',
                    textAlign: 'center',
                    p: { xs: 4, sm: 5 },
                    position: 'relative',
                    overflow: 'visible', // allows shadow/glow to extend
                }}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3.5, p: 0 }}>
                    {/* Glowing shield icon */}
                    <Box
                        component={motion.div}
                        animate={{
                            scale: [1, 1.08, 1],
                            boxShadow: [
                                '0 0 0px rgba(186, 26, 26, 0)',
                                '0 0 20px rgba(186, 26, 26, 0.4)',
                                '0 0 0px rgba(186, 26, 26, 0)'
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            bgcolor: 'error.light',
                            opacity: 0.95,
                            mb: 1,
                        }}
                    >
                        <GppBadIcon sx={{ fontSize: 64, color: 'error.main' }} />
                    </Box>

                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700, 
                            color: 'text.primary',
                            fontFamily: 'Outfit, sans-serif',
                            letterSpacing: '-0.75px'
                        }}
                    >
                        Access Denied
                    </Typography>

                    {user ? (
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'text.secondary',
                                fontFamily: 'Outfit, sans-serif',
                                lineHeight: 1.6,
                                fontSize: '15px'
                            }}
                        >
                            Your current account role <strong style={{ color: '#ba1a1a' }}>{user.role}</strong> does not have the required permissions to view this clinic department. If you need access, please contact your systems administrator.
                        </Typography>
                    ) : (
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'text.secondary',
                                fontFamily: 'Outfit, sans-serif',
                                lineHeight: 1.6,
                                fontSize: '15px'
                            }}
                        >
                            You do not have the required permissions to view this page. If you believe this is an error, please contact your system administrator.
                        </Typography>
                    )}

                    {/* HIPAA/RBAC indicator banner */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5, 
                            p: 2, 
                            borderRadius: '12px', 
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'action.hover',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}
                    >
                        <InfoOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'Outfit', textAlign: 'left', lineHeight: 1.4 }}>
                            HIPAA auditing is enabled. Access attempts are logged under secure audit trails.
                        </Typography>
                    </Box>

                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => navigate('/dashboard')}
                        sx={{ 
                            mt: 2,
                            px: 4.5,
                            py: 1.5,
                            fontSize: '15px',
                            fontWeight: 600,
                            fontFamily: 'Outfit, sans-serif',
                            borderRadius: '100px'
                        }}
                    >
                        Back to Dashboard
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};
