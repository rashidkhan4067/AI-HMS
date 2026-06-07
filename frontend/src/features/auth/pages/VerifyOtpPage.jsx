import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Box, Typography, Link, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';
import OtpInputGroup from '../components/OtpInputGroup';
import { authApi } from '../services/authApi';
import { useOtpTimer } from '../hooks/useOtpTimer';

const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 2) {
        return `${name[0]}***@${domain}`;
    }
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
};

export const VerifyOtpPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');

    // Extract state passed from ForgotPasswordPage
    const { email } = location.state || {};

    const [otpValues, setOtpValues] = useState(Array(6).fill(''));
    const [isVerifying, setIsVerifying] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [resendMessage, setResendMessage] = useState('');

    const timer = useOtpTimer(45);

    const handleVerify = useCallback(async (code) => {
        setIsVerifying(true);
        setErrorMessage('');
        setResendMessage('');
        setHasError(false);

        try {
            const res = await authApi.verifyOtp(email, code);
            // OTP verified, redirect to reset password
            setIsVerifying(false);
            navigate(typeParam ? `/reset-password?type=${typeParam}` : '/reset-password', { state: { token: res.token } });
        } catch (err) {
            setIsVerifying(false);
            setHasError(true);
            setErrorMessage(err.response?.data?.detail || 'Invalid verification code. Please try again.');
            
            // Clear inputs after shake animation finishes (approx 600ms)
            setTimeout(() => {
                setOtpValues(Array(6).fill(''));
                setHasError(false);
            }, 600);
        }
    }, [email, navigate]);

    // Auto-submit OTP when all 6 digits are entered
    const otpCode = otpValues.join('');
    useEffect(() => {
        if (otpCode.length === 6 && !isVerifying) {
            const t = setTimeout(() => {
                handleVerify(otpCode);
            }, 0);
            return () => clearTimeout(t);
        }
    }, [otpCode, isVerifying, handleVerify]);


    // Redirect to forgot password if no email exists
    const timerStart = timer.start;
    useEffect(() => {
        if (!email) {
            navigate(typeParam ? `/forgot-password?type=${typeParam}` : '/forgot-password', { replace: true });
        } else {
            timerStart();
        }
    }, [email, navigate, timerStart]);

    const timerIsExpired = timer.isExpired;
    const handleResend = async () => {
        if (!email || !timerIsExpired) return;
        setErrorMessage('');
        setResendMessage('');
        try {
            await authApi.forgotPassword(email);
            setResendMessage('Verification code resent successfully.');
            timerStart();
            setOtpValues(Array(6).fill(''));
        } catch (err) {
            setErrorMessage(err.response?.data?.detail || 'Failed to resend verification code.');
        }
    };

    if (!email) {
        return null; // Don't flash layout before redirecting
    }



    return (
        <AuthLayout
            title="Verify Identity"
            subtitle={typeParam === 'patient'
                ? "Please enter the 6-digit security code sent to your registered email."
                : "Please enter the 6-digit clinical security code sent to your registered email."
            }
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, mt: 1 }}>
                {errorMessage && (
                    <Alert
                        severity="error"
                        role="alert"
                        aria-live="polite"
                        sx={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}
                    >
                        {errorMessage}
                    </Alert>
                )}

                {resendMessage && (
                    <Alert
                        severity="success"
                        role="status"
                        aria-live="polite"
                        sx={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}
                    >
                        {resendMessage}
                    </Alert>
                )}

                {/* Destination email info */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', mb: 0.5 }}>
                        Enter the code sent to:
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 600,
                            color: 'primary.main',
                        }}
                    >
                        {maskEmail(email)}
                    </Typography>
                </Box>

                {/* 6-Digit OTP Group */}
                <Box sx={{ py: 1 }}>
                    <OtpInputGroup
                        value={otpValues}
                        onChange={setOtpValues}
                        hasError={hasError}
                        disabled={isVerifying}
                    />
                </Box>

                {/* Verification/Loading Status */}
                <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 24 }}>
                    <AnimatePresence mode="wait">
                        {isVerifying && (
                            <motion.div
                                key="verifying"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                <CircularProgress size={14} sx={{ color: 'primary.main' }} />
                                <Typography variant="caption" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: 'primary.main' }}>
                                    Verifying code...
                                </Typography>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>

                {/* Timer/Resend */}
                <Box sx={{ textAlign: 'center' }}>
                    {timer.isExpired ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>
                                Didn't receive the email?
                            </Typography>
                            <Link
                                component="button"
                                onClick={handleResend}
                                underline="hover"
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 600,
                                    color: 'primary.main',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                }}
                            >
                                Resend Code
                            </Link>
                        </Box>
                    ) : (
                        <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>
                            Resend code in <Box component="span" sx={{ fontWeight: 600, color: 'text.primary', fontFamily: "'JetBrains Mono', monospace" }}>{timer.formatted}</Box>
                        </Typography>
                    )}
                </Box>

                {/* Back Link */}
                <Box sx={{ display: 'flex', justifyContent: 'center', borderTop: '1px solid', borderColor: 'divider', pt: 2.5 }}>
                    <Link
                        component={RouterLink}
                        to={typeParam ? `/forgot-password?type=${typeParam}` : "/forgot-password"}
                        underline="hover"
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'primary.main',
                        }}
                    >
                        Try a different email
                    </Link>
                </Box>
            </Box>
        </AuthLayout>
    );
};
