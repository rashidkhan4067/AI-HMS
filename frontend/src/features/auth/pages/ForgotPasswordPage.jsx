import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Typography, Link, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Send, Loader2, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';
import { forgotPasswordSchema } from '../schemas/authSchemas';
import { authApi } from '../services/authApi';
import { useOtpTimer } from '../hooks/useOtpTimer';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

const maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 2) {
        return `${name[0]}***@${domain}`;
    }
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
};

export const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [sentEmail, setSentEmail] = useState('');

    const timer = useOtpTimer(60);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, touchedFields },
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        mode: 'onBlur',
        defaultValues: { email: '' },
    });

    const isEmailSuccess = touchedFields.email && !errors.email;

    const onSubmit = async (data) => {
        setSubmitError('');
        try {
            await authApi.forgotPassword(data.email);
            setSentEmail(data.email);
            setIsSuccess(true);
            timer.start();
        } catch (err) {
            setSubmitError(
                err.response?.data?.detail || 
                err.message || 
                'Failed to send verification code. Please try again.'
            );
        }
    };

    const handleResend = async () => {
        if (!sentEmail || !timer.isExpired) return;
        setSubmitError('');
        try {
            await authApi.forgotPassword(sentEmail);
            timer.start();
        } catch (err) {
            setSubmitError(
                err.response?.data?.detail || 
                'Failed to resend code. Please try again.'
            );
        }
    };


    const inputSx = {
        '& .MuiOutlinedInput-root': { fontFamily: "'DM Sans', sans-serif" },
        '& .MuiInputLabel-root':   { fontFamily: "'DM Sans', sans-serif" },
    };

    return (
        <AuthLayout
            title={isSuccess ? 'Code Sent Successfully' : 'Forgot Password?'}
            subtitle={
                isSuccess
                    ? (typeParam === 'patient'
                        ? 'Check your inbox for the verification code.'
                        : 'Check your clinical inbox for the verification code.')
                    : (typeParam === 'patient'
                        ? 'Enter your registered email to receive a password reset OTP.'
                        : 'Enter your registered clinical email to receive a password reset OTP.')
            }
        >
            <AnimatePresence mode="wait">
                {!isSuccess ? (
                    <motion.div
                        key="request-form"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Box
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                        >
                            {submitError && (
                                <Alert
                                    severity="error"
                                    role="alert"
                                    aria-live="polite"
                                    sx={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}
                                >
                                    {submitError}
                                </Alert>
                            )}

                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography
                                    component="label"
                                    htmlFor="forgot-email"
                                    sx={{
                                        fontSize: '14px', // text-sm
                                        fontWeight: 500, // font-medium
                                        color: errors.email 
                                            ? 'error.main' 
                                            : isEmailSuccess 
                                                ? '#059669' 
                                                : isDark ? 'text.secondary' : '#374151',
                                        fontFamily: "'DM Sans', sans-serif",
                                        display: 'block',
                                        mb: 0.75, // mb-1.5 (6px)
                                    }}
                                >
                                    Email Address
                                </Typography>
                                <TextField
                                    {...register('email')}
                                    id="forgot-email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder={typeParam === 'patient' ? 'patient@email.com' : 'doctor@hospital.pk'}
                                    error={!!errors.email}
                                    className={isEmailSuccess ? 'Mui-success' : ''}
                                    helperText={errors.email?.message}
                                    disabled={isSubmitting}
                                    inputProps={{
                                        'aria-describedby': errors.email ? 'forgot-email-error' : undefined,
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <Box sx={{ mr: 1, color: errors.email ? 'error.main' : isEmailSuccess ? '#059669' : 'text.disabled', display: 'flex' }}>
                                                <Mail size={18} />
                                            </Box>
                                        ),
                                    }}
                                    FormHelperTextProps={{ id: 'forgot-email-error', role: 'alert', 'aria-live': 'polite' }}
                                    sx={inputSx}
                                    fullWidth
                                />
                            </Box>

                            <Box
                                component={motion.button}
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={isSubmitting ? {} : "hover"}
                                sx={{
                                    width: '100%',
                                    height: 44, // h-11 (44px)
                                    borderRadius: '12px', // rounded-xl (12px)
                                    border: 'none',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    background: isSubmitting
                                        ? 'rgba(0,106,106,0.5)'
                                        : 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                                    color: '#FFFFFF',
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    transition: 'all 0.2s ease',
                                    opacity: isSubmitting ? 0.9 : 1,
                                    '&:hover': {
                                        background: isSubmitting ? 'rgba(0,106,106,0.5)' : 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                                    },
                                    '&:active': {
                                        background: isSubmitting ? 'rgba(0,106,106,0.5)' : 'linear-gradient(135deg, #004848 0%, #002F2F 100%)',
                                    }
                                }}
                                aria-busy={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Loader2 size={16} className="animate-spin" style={{ color: '#fff' }} />
                                        <span>Sending code…</span>
                                    </Box>
                                ) : (
                                    <>
                                        <span>Send Reset Code</span>
                                        <Box
                                            component={motion.span}
                                            variants={{
                                                hover: { x: 3 }
                                            }}
                                            transition={{ duration: 0.2 }}
                                            sx={{ display: 'flex', alignItems: 'center' }}
                                        >
                                            <Send size={16} />
                                        </Box>
                                    </>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                <Link
                                    component={RouterLink}
                                    to={typeParam ? `/login?type=${typeParam}` : "/login"}
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
                                    <ArrowLeft size={16} />
                                    Back to login
                                </Link>
                            </Box>
                        </Box>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success-state"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 1 }}>
                            {/* Animated SVG Checkmark */}
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(29, 107, 53, 0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <motion.path
                                        d="M5 13l4 4L19 7"
                                        stroke="#1D6B35"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                    />
                                </svg>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body1" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, color: 'text.primary', mb: 1 }}>
                                    OTP has been sent to
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontWeight: 600,
                                        color: 'primary.main',
                                        backgroundColor: isDark ? 'rgba(0,106,106,0.12)' : 'rgba(0,106,106,0.06)',
                                        px: 2,
                                        py: 0.75,
                                        borderRadius: '8px',
                                        display: 'inline-block',
                                        letterSpacing: '0.2px',
                                    }}
                                >
                                    {maskEmail(sentEmail)}
                                </Typography>
                            </Box>

                            {submitError && (
                                <Alert
                                    severity="error"
                                    sx={{ width: '100%', borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}
                                >
                                    {submitError}
                                </Alert>
                            )}

                            {/* Resend Cooldown UI */}
                            <Box sx={{ textAlign: 'center', width: '100%' }}>
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

                            {/* CTA to Enter Code */}
                            <Box
                                component={motion.button}
                                onClick={() => navigate(typeParam ? `/verify-otp?type=${typeParam}` : '/verify-otp', { state: { email: sentEmail } })}
                                whileHover="hover"
                                sx={{
                                    width: '100%',
                                    height: 44, // h-11 (44px)
                                    borderRadius: '12px', // rounded-xl (12px)
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                                    color: '#FFFFFF',
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                                    },
                                    '&:active': {
                                        background: 'linear-gradient(135deg, #004848 0%, #002F2F 100%)',
                                    }
                                }}
                            >
                                <span>Enter Verification Code</span>
                                <Box
                                    component={motion.span}
                                    variants={{
                                        hover: { x: 3 }
                                    }}
                                    transition={{ duration: 0.2 }}
                                    sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                    <ArrowRight size={16} />
                                </Box>
                            </Box>

                            <Link
                                component={RouterLink}
                                to={typeParam ? `/login?type=${typeParam}` : "/login"}
                                underline="hover"
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: 'text.secondary',
                                }}
                            >
                                Back to login
                            </Link>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};
