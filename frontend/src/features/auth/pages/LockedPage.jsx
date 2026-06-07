import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Box, Typography, Link, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

export const LockedPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    // Retrieve lock duration from state or sessionStorage
    const lockUntil = location.state?.lockUntil || parseInt(sessionStorage.getItem('lockUntil') || '0', 10);

    const [secondsLeft, setSecondsLeft] = useState(() => {
        const diff = lockUntil - Date.now();
        return Math.max(0, Math.ceil(diff / 1000));
    });

    useEffect(() => {
        const calculateLeft = () => {
            const diff = lockUntil - Date.now();
            return Math.max(0, Math.ceil(diff / 1000));
        };

        const initialLeft = calculateLeft();

        if (initialLeft <= 0) {
            sessionStorage.removeItem('lockUntil');
            sessionStorage.removeItem('loginAttempts');
            navigate(typeParam ? `/login?type=${typeParam}` : '/login', { replace: true });
            return;
        }

        const interval = setInterval(() => {
            const left = calculateLeft();
            setSecondsLeft(left);
            if (left <= 0) {
                clearInterval(interval);
                sessionStorage.removeItem('lockUntil');
                sessionStorage.removeItem('loginAttempts');
                navigate(typeParam ? `/login?type=${typeParam}` : '/login', { replace: true });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lockUntil, navigate]);


    // Format seconds into mm:ss
    const formattedTime = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

    // Lock icon animation variants (subtle rotation and scale pulse)
    const lockVariants = {
        pulse: {
            scale: [1, 1.05, 1],
            rotate: [0, -3, 3, -3, 3, 0],
            transition: {
                duration: 3,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 1,
            },
        },
    };

    return (
        <AuthLayout
            title="Account Temporarily Locked"
            subtitle={typeParam === 'patient'
                ? "Multiple failed authentication attempts detected. For security, your account has been locked."
                : "Multiple failed authentication attempts detected. For clinical security, this terminal has been locked."
            }
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3.5, py: 1 }}>
                
                {/* Pulsing Lock Icon */}
                <motion.div
                    variants={lockVariants}
                    animate="pulse"
                >
                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: '20px',
                            backgroundColor: 'rgba(186, 26, 26, 0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.5px solid rgba(186, 26, 26, 0.25)',
                            color: '#BA1A1A',
                            boxShadow: '0 8px 20px rgba(186, 26, 26, 0.08)',
                        }}
                    >
                        <ShieldAlert size={36} />
                    </Box>
                </motion.div>

                {/* Countdown display */}
                <Box sx={{ textAlign: 'center', width: '100%' }}>
                    {secondsLeft > 0 ? (
                        <>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', mb: 1 }}>
                                Please wait before attempting to sign in again:
                            </Typography>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontWeight: 700,
                                    fontSize: '36px',
                                    color: '#BA1A1A',
                                    letterSpacing: '1px',
                                    backgroundColor: isDark ? 'rgba(186,26,26,0.08)' : 'rgba(186,26,26,0.04)',
                                    py: 1,
                                    px: 3,
                                    borderRadius: '12px',
                                    display: 'inline-block',
                                }}
                                aria-live="assertive"
                            >
                                {formattedTime}
                            </Typography>
                        </>
                    ) : (
                        <Typography
                            variant="body1"
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                color: '#1D6B35',
                            }}
                        >
                            Lockout period expired. You can try signing in again.
                        </Typography>
                    )}
                </Box>

                {/* Support Card */}
                <Box
                    sx={{
                        width: '100%',
                        p: 2,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Typography variant="caption" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', textAlign: 'center' }}>
                        {typeParam === 'patient'
                            ? "If you have forgotten your credentials or need urgent access, please reach out to our support helpdesk."
                            : "If you have forgotten your credentials or need urgent clinical access, please reach out to the hospital IT desk."}
                    </Typography>
                    <Link
                        href={typeParam === 'patient' 
                            ? "mailto:support@alshifaa.pk?subject=Patient Portal Lockout Request"
                            : "mailto:support@alshifaa.pk?subject=HMS Terminal Lockout Request"
                        }
                        underline="hover"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'primary.main',
                        }}
                    >
                        <Mail size={14} />
                        Contact {typeParam === 'patient' ? 'Support' : 'IT Support'}
                    </Link>
                </Box>

                {/* Back to Login Button */}
                <Button
                    component={RouterLink}
                    to={typeParam ? `/login?type=${typeParam}` : "/login"}
                    variant={secondsLeft > 0 ? "outlined" : "contained"}
                    color="primary"
                    startIcon={<ArrowLeft size={16} />}
                    disabled={secondsLeft > 0}
                    sx={{
                        width: '100%',
                        height: 48,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: '15px',
                        borderColor: 'rgba(0, 106, 106, 0.3)',
                        '&:hover': {
                            borderColor: '#006A6A',
                            backgroundColor: secondsLeft > 0 ? 'transparent' : undefined,
                        },
                    }}
                >
                    Back to Login
                </Button>
            </Box>
        </AuthLayout>
    );
};
