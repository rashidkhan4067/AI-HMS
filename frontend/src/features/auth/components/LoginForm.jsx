import { useState } from 'react';
import { Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom';
import {
    Box, Alert, Typography, Link, Checkbox,
    FormControlLabel, TextField, Divider,
    CircularProgress,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, ArrowRight, Loader2, CheckCircle2, X } from 'lucide-react';
import { loginSchema } from '../schemas/authSchemas';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { useGoogleAuth } from '../../../hooks/useGoogleAuth';

/* ── Google SSO SVG logo ── */
const GoogleLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
);

/**
 * LoginForm — MD3 Clinical redesign.
 * Uses React Hook Form + Zod. Validates on blur.
 * Tracks login failures; shows warning banner at 3, locks at 5.
 */
export const LoginForm = ({ onEmailBlur }) => {
    const { mode } = useThemeMode();
    const isDark   = mode === 'dark';
    const { login, isLoading, error, getLockStatus } = useAuth();
    const { googleLogin, isLoading: isGoogleLoading, error: googleError } = useGoogleAuth();

    const location = useLocation();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const applyParam = searchParams.get('apply');
    const [successToast, setSuccessToast] = useState(location.state?.successMessage || '');

    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting, touchedFields },
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: { email: '', password: '', rememberMe: false },
    });

    const lockStatus = getLockStatus();
    const isBusy     = isLoading || isSubmitting;

    const getGlobalError = () => {
        if (!error) return null;
        if (typeof error === 'string') return error;
        return error.detail || error.non_field_errors?.[0] || 'Authentication failed.';
    };
    const globalError = getGlobalError();

    const onSubmit = async (data) => {
        await login(data.email, data.password);
    };



    /* Input wrapper style */
    const inputSx = {
        '& .MuiOutlinedInput-root': { fontFamily: "'DM Sans', sans-serif" },
        '& .MuiInputLabel-root':   { fontFamily: "'DM Sans', sans-serif" },
    };

    const isEmailSuccess = touchedFields.email && !errors.email;
    const isPasswordSuccess = touchedFields.password && !errors.password;

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            aria-busy={isBusy}
            sx={{ display: 'flex', flexDirection: 'column' }}
            noValidate
        >
            {/* ── Lockout warning banner ── */}
            <AnimatePresence>
                {lockStatus.isWarning && (
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{   opacity: 0, height: 0 }}
                        sx={{ mb: 2 }}
                    >
                        <Alert
                            severity="warning"
                            icon={<AlertTriangle size={16} />}
                            sx={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}
                        >
                            <strong>{lockStatus.attemptsLeft} attempt{lockStatus.attemptsLeft !== 1 ? 's' : ''} remaining</strong> before your account is temporarily locked.
                        </Alert>
                    </Box>
                )}
            </AnimatePresence>

            {/* ── Global auth error ── */}
            {globalError && (
                <Box sx={{ mb: 2 }}>
                    <Alert
                        severity="error"
                        role="alert"
                        aria-live="polite"
                        sx={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}
                    >
                        {globalError}
                    </Alert>
                </Box>
            )}


            {/* ── Email ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2, mt: 1 }}>
                <Typography
                    component="label"
                    htmlFor="login-email"
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
                    Email address
                </Typography>
                <TextField
                    {...register('email', {
                        onBlur: (e) => {
                            if (onEmailBlur) onEmailBlur(e.target.value);
                        }
                    })}
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder={typeParam === 'patient' ? 'patient@email.com' : 'doctor@hospital.pk'}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={isBusy}
                    className={isEmailSuccess ? 'Mui-success' : ''}
                    slotProps={{
                        htmlInput: {
                            'aria-describedby': errors.email ? 'login-email-error' : undefined,
                        },
                        input: {
                            startAdornment: (
                                <Box sx={{ mr: 1, color: errors.email ? 'error.main' : isEmailSuccess ? '#059669' : 'text.disabled', display: 'flex' }}>
                                    <Mail size={18} />
                                </Box>
                            ),
                        },
                        formHelperText: { id: 'login-email-error', role: 'alert', 'aria-live': 'polite' },
                    }}
                    sx={inputSx}
                />
            </Box>

            {/* ── Password ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1.5 }}>
                <Typography
                    component="label"
                    htmlFor="login-password"
                    sx={{
                        fontSize: '14px', // text-sm
                        fontWeight: 500, // font-medium
                        color: errors.password 
                            ? 'error.main' 
                            : isPasswordSuccess 
                                ? '#059669' 
                                : isDark ? 'text.secondary' : '#374151',
                        fontFamily: "'DM Sans', sans-serif",
                        display: 'block',
                        mb: 0.75, // mb-1.5 (6px)
                    }}
                >
                    Password
                </Typography>
                <TextField
                    {...register('password')}
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    disabled={isBusy}
                    className={isPasswordSuccess ? 'Mui-success' : ''}
                    slotProps={{
                        htmlInput: {
                            'aria-describedby': errors.password ? 'login-password-error' : undefined,
                        },
                        input: {
                            startAdornment: (
                                <Box sx={{ mr: 1, color: errors.password ? 'error.main' : isPasswordSuccess ? '#059669' : 'text.disabled', display: 'flex' }}>
                                    <Lock size={18} />
                                </Box>
                            ),
                            endAdornment: (
                                <Box
                                    component="button"
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    sx={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        p: 0.5,
                                        display: 'flex',
                                        color: 'text.disabled',
                                        '&:hover': { color: 'primary.main' },
                                        transition: 'color 0.2s',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </Box>
                            ),
                        },
                        formHelperText: { id: 'login-password-error', role: 'alert', 'aria-live': 'polite' },
                    }}
                    sx={inputSx}
                />
            </Box>

            {/* ── Remember Me + Forgot Password ── */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    {...field}
                                    checked={field.value}
                                    id="remember-me"
                                    size="small"
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'text.secondary' }}>
                                    Remember this device
                                </Typography>
                            }
                        />
                    )}
                />
                <Link
                    component={RouterLink}
                    to={typeParam ? `/forgot-password?type=${typeParam}` : applyParam ? `/forgot-password?apply=${applyParam}` : "/forgot-password"}
                    underline="hover"
                    sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'primary.main',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Forgot password?
                </Link>
            </Box>

            {/* ── Sign In CTA ── */}
            <Box
                component={motion.button}
                type="submit"
                disabled={isBusy}
                whileHover={isBusy ? {} : "hover"}
                sx={{
                    width: '100%',
                    height: 44, // h-11 (44px)
                    borderRadius: '12px', // rounded-xl (12px)
                    border: 'none',
                    cursor: isBusy ? 'not-allowed' : 'pointer',
                    background: isBusy
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
                    opacity: isBusy ? 0.9 : 1,
                    mb: 2, // mb-4
                    '&:hover': {
                        background: isBusy ? 'rgba(0,106,106,0.5)' : 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                    },
                    '&:active': {
                        background: isBusy ? 'rgba(0,106,106,0.5)' : 'linear-gradient(135deg, #004848 0%, #002F2F 100%)',
                    }
                }}
                aria-label="Sign in to your account"
                aria-busy={isBusy}
            >
                {isBusy ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Loader2 size={16} className="animate-spin" style={{ color: '#fff' }} />
                        <span>Signing in…</span>
                    </Box>
                ) : (
                    <>
                        <span>Sign in</span>
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
                    </>
                )}
            </Box>

            {/* ── Divider ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Divider sx={{ flex: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#E5E7EB', borderBottomWidth: 1 }} />
                <Typography variant="caption" sx={{ color: isDark ? '#A3B3B3' : '#6B7280', fontWeight: 600, fontSize: '11px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.5px' }}>
                    OR
                </Typography>
                <Divider sx={{ flex: 1, borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : '#E5E7EB', borderBottomWidth: 1 }} />
            </Box>

            {/* ── Google SSO ── */}
            <Box
                component="button"
                type="button"
                onClick={googleLogin}
                disabled={isBusy || isGoogleLoading}
                sx={{
                    width: '100%',
                    height: 44, // h-11 (44px)
                    borderRadius: '12px', // rounded-xl (12px)
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : '#D1D5DB', // border border-gray-300
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF !important', // bg-white
                    cursor: (isBusy || isGoogleLoading) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500, // font-medium
                    fontSize: '14px', // text-sm
                    color: isDark ? '#E0F2F1' : '#374151', // text-gray-700
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    mb: 1.5,
                    opacity: (isBusy || isGoogleLoading) ? 0.7 : 1,
                    '&:hover': {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F9FAFB !important', // hover:bg-gray-50
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.4)' : '#9CA3AF', // hover:border-gray-400
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', // hover:shadow-sm
                    },
                }}
                style={{
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
                }}
                aria-label="Continue with Google"
            >
                {isGoogleLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Connecting to Google...</span>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ mr: 1.25, display: 'flex', alignItems: 'center' }}>
                            <GoogleLogo />
                        </Box>
                        Continue with Google
                    </>
                )}
            </Box>

            {/* Google SSO specific error box */}
            {googleError && (
                <Box
                    sx={{
                        mb: 2,
                        p: 1.5,
                        borderRadius: '12px',
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: isDark ? '#FCA5A5' : '#DC2626',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '13px',
                            fontWeight: 500,
                            textAlign: 'center'
                        }}
                    >
                        {googleError}
                    </Typography>
                </Box>
            )}

            {/* ── Register link ── */}
            <Typography variant="body2" sx={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', mb: 3 }}>
                Don't have an account?{' '}
                <Link
                    component={RouterLink}
                    to={typeParam === 'patient' ? "/register?type=patient" : applyParam === 'doctor' ? "/register?apply=doctor" : "/register"}
                    underline="hover"
                    sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        '&:hover .arrow-icon': {
                            transform: 'translateX(3px)',
                        },
                    }}
                >
                    <span>Create an account</span>
                    <Box
                        component="span"
                        className="arrow-icon"
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            transition: 'transform 0.2s ease',
                        }}
                    >
                        <ArrowRight size={14} />
                    </Box>
                </Link>
            </Typography>
            
            {/* Success toast */}
            <AnimatePresence>
                {successToast && (
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '12px', p: 2, px: 2.5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: 360 }}
                    >
                        <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '13px', fontWeight: 500, flex: 1, fontFamily: "'DM Sans', sans-serif" }}>
                            {successToast}
                        </Typography>
                        <Box component="button" type="button" onClick={() => setSuccessToast('')} sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0.5, display: 'flex', color: '#065F46', opacity: 0.6, '&:hover': { opacity: 1 }, ml: 1 }}>
                            <X size={14} />
                        </Box>
                    </Box>
                )}
            </AnimatePresence>
        </Box>
    );
};
