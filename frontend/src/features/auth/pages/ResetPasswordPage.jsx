import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, Check, Loader2, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';
import { resetPasswordSchema } from '../schemas/authSchemas';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { authApi } from '../services/authApi';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

export const ResetPasswordPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');

    // Get reset token passed from OTP verification page
    const { token } = location.state || {};

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (!token) {
            navigate(typeParam ? `/forgot-password?type=${typeParam}` : '/forgot-password', { replace: true });
        }
    }, [token, navigate, typeParam]);

    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting, touchedFields },
    } = useForm({
        resolver: zodResolver(resetPasswordSchema),
        mode: 'onBlur',
        defaultValues: { password: '', confirmPassword: '' },
    });

    const isPasswordSuccess = touchedFields.password && !errors.password;
    const isConfirmPasswordSuccess = touchedFields.confirmPassword && !errors.confirmPassword && watch('confirmPassword');

    const passwordVal = watch('password') || '';
    const confirmPasswordVal = watch('confirmPassword') || '';

    // Check if passwords match (and are not empty) for the live match indicator
    const passwordsMatch = passwordVal && confirmPasswordVal && passwordVal === confirmPasswordVal;

    const onSubmit = async (data) => {
        setSubmitError('');
        try {
            await authApi.resetPassword(token, data.password, data.confirmPassword);
            setIsSuccess(true);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate(typeParam ? `/login?type=${typeParam}` : '/login');
            }, 2000);
        } catch (err) {
            setSubmitError(
                err.response?.data?.detail || 
                err.message || 
                'Failed to reset password. Please try again.'
            );
        }
    };

    if (!token) {
        return null; // Don't flash layout before redirecting
    }

    const inputSx = {
        '& .MuiOutlinedInput-root': { fontFamily: "'DM Sans', sans-serif" },
        '& .MuiInputLabel-root':   { fontFamily: "'DM Sans', sans-serif" },
    };

    return (
        <AuthLayout
            title={isSuccess ? 'Password Reset Successful' : 'Reset Password'}
            subtitle={
                isSuccess
                    ? (typeParam === 'patient'
                        ? 'Your patient account has been successfully updated.'
                        : 'Your clinical account has been successfully updated.')
                    : (typeParam === 'patient'
                        ? 'Choose a strong password for your patient portal.'
                        : 'Choose a strong security password for your clinical portal.')
            }
        >
            <AnimatePresence mode="wait">
                {!isSuccess ? (
                    <motion.div
                        key="reset-form"
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 15 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Box
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
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

                            {/* New Password */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography
                                    component="label"
                                    htmlFor="reset-password"
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
                                    New Password
                                </Typography>
                                <TextField
                                    {...register('password')}
                                    id="reset-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Enter new password"
                                    error={!!errors.password}
                                    className={isPasswordSuccess ? 'Mui-success' : ''}
                                    helperText={errors.password?.message}
                                    disabled={isSubmitting}
                                    inputProps={{
                                        'aria-describedby': errors.password ? 'reset-password-error' : undefined,
                                    }}
                                    InputProps={{
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
                                    }}
                                    FormHelperTextProps={{ id: 'reset-password-error', role: 'alert', 'aria-live': 'polite' }}
                                    sx={inputSx}
                                    fullWidth
                                />
                            </Box>

                            {/* Password Strength Meter */}
                            <PasswordStrengthMeter password={passwordVal} />

                            {/* Confirm Password */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography
                                    component="label"
                                    htmlFor="confirm-password"
                                    sx={{
                                        fontSize: '14px', // text-sm
                                        fontWeight: 500, // font-medium
                                        color: errors.confirmPassword 
                                            ? 'error.main' 
                                            : isConfirmPasswordSuccess 
                                                ? '#059669' 
                                                : isDark ? 'text.secondary' : '#374151',
                                        fontFamily: "'DM Sans', sans-serif",
                                        display: 'block',
                                        mb: 0.75, // mb-1.5 (6px)
                                    }}
                                >
                                    Confirm Password
                                </Typography>
                                <TextField
                                    {...register('confirmPassword')}
                                    id="confirm-password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    placeholder="Re-enter password"
                                    error={!!errors.confirmPassword}
                                    className={isConfirmPasswordSuccess ? 'Mui-success' : ''}
                                    helperText={errors.confirmPassword?.message}
                                    disabled={isSubmitting}
                                    inputProps={{
                                        'aria-describedby': errors.confirmPassword ? 'confirm-password-error' : undefined,
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <Box sx={{ mr: 1, color: errors.confirmPassword ? 'error.main' : isConfirmPasswordSuccess ? '#059669' : 'text.disabled', display: 'flex' }}>
                                                <Lock size={18} />
                                            </Box>
                                        ),
                                        endAdornment: (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                {/* Live Match Indicator */}
                                                {passwordsMatch && (
                                                    <Box sx={{ color: '#1D6B35', display: 'flex', mr: 0.5 }} aria-label="Passwords match">
                                                        <Check size={18} strokeWidth={3} />
                                                    </Box>
                                                )}
                                                <Box
                                                    component="button"
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </Box>
                                            </Box>
                                        ),
                                    }}
                                    FormHelperTextProps={{ id: 'confirm-password-error', role: 'alert', 'aria-live': 'polite' }}
                                    sx={inputSx}
                                    fullWidth
                                />
                            </Box>

                            {/* Submit Button */}
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
                                    mt: 1,
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
                                        <span>Updating password…</span>
                                    </Box>
                                ) : (
                                    <>
                                        <span>Set New Password</span>
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
                        </Box>
                    </motion.div>
                ) : (
                    <motion.div
                        key="success-state"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
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
                                <Typography variant="h6" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: 'text.primary', mb: 1 }}>
                                    Password Reset Complete
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>
                                    {typeParam === 'patient'
                                        ? 'Redirecting to patient login portal...'
                                        : 'Redirecting to clinical login portal...'}
                                </Typography>
                            </Box>

                            <CircularProgress size={24} sx={{ color: 'primary.main', mt: 1 }} />
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
};
