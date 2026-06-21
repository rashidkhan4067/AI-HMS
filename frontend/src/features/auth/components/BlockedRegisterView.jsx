import { Box, Typography, Button, Link } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Stethoscope, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

export const BlockedRegisterView = () => {
    const navigate = useNavigate();
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    const cardVariants = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
        hover: { 
            y: -6, 
            borderColor: '#006A6A',
            boxShadow: isDark 
                ? '0 12px 30px rgba(0, 106, 106, 0.15)' 
                : '0 12px 24px rgba(0, 106, 106, 0.08)',
            transition: { duration: 0.25, ease: 'easeInOut' }
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                py: 1,
            }}
        >
            <Typography
                component="h1"
                sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: '26px',
                    lineHeight: 1.25,
                    color: isDark ? '#E0F2F1' : '#161D1D',
                    textAlign: 'center',
                    mb: 1,
                    letterSpacing: '-0.5px'
                }}
            >
                Create an Account
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: isDark ? 'text.secondary' : '#6B7280',
                    fontSize: '14px',
                    textAlign: 'center',
                    mb: 4.5,
                    maxWidth: 420
                }}
            >
                Choose the account type that matches your needs to proceed with registration.
            </Typography>

            {/* Account Selection Cards */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 3,
                    width: '100%',
                    mb: 4.5,
                }}
            >
                {/* Patient Card */}
                <Box
                    component={motion.div}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 3,
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E5E7EB',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/register?type=patient')}
                >
                    <Box>
                        {/* Icon Badge */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                backgroundColor: 'rgba(0, 106, 106, 0.08)',
                                color: '#006A6A',
                                mb: 2.5,
                            }}
                        >
                            <User size={22} />
                        </Box>

                        <Typography
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                fontSize: '18px',
                                color: isDark ? '#E0F2F1' : '#111827',
                                mb: 1.25,
                            }}
                        >
                            Patient Portal
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: isDark ? 'text.secondary' : '#4B5563',
                                fontSize: '13px',
                                lineHeight: 1.5,
                                mb: 3,
                            }}
                        >
                            Access medical reports, check lab results, book doctor consultations, and track health history.
                        </Typography>
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/register?type=patient"
                        variant="outlined"
                        fullWidth
                        endIcon={<ArrowRight size={14} />}
                        sx={{
                            height: 40,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: '13px',
                            borderColor: '#006A6A',
                            color: '#006A6A',
                            '&:hover': {
                                borderColor: '#005858',
                                backgroundColor: 'rgba(0, 106, 106, 0.04)',
                            },
                        }}
                    >
                        Register as Patient
                    </Button>
                </Box>

                {/* Doctor Card */}
                <Box
                    component={motion.div}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 3,
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E5E7EB',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FFFFFF',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/register?apply=doctor')}
                >
                    <Box>
                        {/* Icon Badge */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                backgroundColor: 'rgba(0, 106, 106, 0.08)',
                                color: '#006A6A',
                                mb: 2.5,
                            }}
                        >
                            <Stethoscope size={22} />
                        </Box>

                        <Typography
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                fontSize: '18px',
                                color: isDark ? '#E0F2F1' : '#111827',
                                mb: 1.25,
                            }}
                        >
                            Doctors & Network
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: isDark ? 'text.secondary' : '#4B5563',
                                fontSize: '13px',
                                lineHeight: 1.5,
                                mb: 3,
                            }}
                        >
                            Submit professional credentials and PMDC license to join Al Shifaa care team and manage your practice.
                        </Typography>
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/register?apply=doctor"
                        variant="outlined"
                        fullWidth
                        endIcon={<ArrowRight size={14} />}
                        sx={{
                            height: 40,
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: '13px',
                            borderColor: '#006A6A',
                            color: '#006A6A',
                            '&:hover': {
                                borderColor: '#005858',
                                backgroundColor: 'rgba(0, 106, 106, 0.04)',
                            },
                        }}
                    >
                        Apply as a Doctor
                    </Button>
                </Box>
            </Box>

            {/* Staff Invitation Info Box */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: 1.5,
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB',
                    border: '1px dashed',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#E5E7EB',
                    width: '100%',
                    mb: 4.5,
                }}
            >
                <Box sx={{ color: isDark ? '#008b8b' : '#006A6A', display: 'flex', mt: 0.25 }}>
                    <Info size={16} />
                </Box>
                <Box>
                    <Typography
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: '13px',
                            color: isDark ? '#E0F2F1' : '#374151',
                            mb: 0.5,
                        }}
                    >
                        Hospital staff member?
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: isDark ? 'text.secondary' : '#6B7280',
                            fontSize: '12.5px',
                            lineHeight: 1.45,
                        }}
                    >
                        Staff accounts (Nurses, Receptionists, Pharmacists, etc.) are prepared by administrators. Please check your email for the invitation link.
                    </Typography>
                </Box>
            </Box>

            {/* Back to Login Link */}
            <Link
                component={RouterLink}
                to="/login"
                underline="hover"
                sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    color: isDark ? 'text.secondary' : '#6B7280',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 1,
                    textDecoration: 'none',
                    '&:hover': {
                        color: '#006A6A',
                    },
                    '&:hover .arrow-icon': {
                        transform: 'translateX(-3px)',
                    },
                }}
            >
                <Box
                    component="span"
                    className="arrow-icon"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        transition: 'transform 0.2s ease',
                    }}
                >
                    <ArrowLeft size={14} />
                </Box>
                <span>Back to Sign In</span>
            </Link>
        </Box>
    );
};
