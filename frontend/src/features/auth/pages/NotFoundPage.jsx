
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileQuestion } from 'lucide-react';

/**
 * NotFoundPage — 404 handler for unknown routes.
 * Shown to both authenticated and unauthenticated users.
 */
export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                px: 3,
                textAlign: 'center',
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
            >
                {/* Icon */}
                <Box
                    sx={{
                        width: 96,
                        height: 96,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(0,106,106,0.12) 0%, rgba(0,79,79,0.06) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    <FileQuestion size={48} color="#006A6A" />
                </Box>

                {/* 404 Number */}
                <Typography
                    sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 700,
                        fontSize: { xs: '72px', sm: '96px' },
                        lineHeight: 1,
                        background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        mb: 1,
                    }}
                >
                    404
                </Typography>

                <Typography
                    variant="h5"
                    sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1.5,
                    }}
                >
                    Page Not Found
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: 'text.secondary',
                        maxWidth: 380,
                        mx: 'auto',
                        lineHeight: 1.7,
                        mb: 4,
                    }}
                >
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Please check the URL or navigate back to a safe place.
                </Typography>

                {/* Action buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Box
                        component="button"
                        onClick={() => navigate(-1)}
                        sx={{
                            px: 3,
                            py: 1.25,
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'transparent',
                            color: 'text.secondary',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 500,
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                backgroundColor: 'rgba(0,106,106,0.04)',
                            },
                        }}
                    >
                        ← Go Back
                    </Box>

                    <Box
                        component="button"
                        onClick={() => navigate('/dashboard')}
                        sx={{
                            px: 3,
                            py: 1.25,
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                            color: '#fff',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                            },
                        }}
                    >
                        Go to Dashboard
                    </Box>
                </Box>
            </motion.div>
        </Box>
    );
};
