import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Typography, TextField, MenuItem, Checkbox,
    FormControlLabel, Alert, CircularProgress, Link,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    User, Mail, Building2, CreditCard, Phone, ShieldCheck,
    CheckCircle2, AlertCircle, ArrowRight, Loader2,
} from 'lucide-react';
import { completeProfileSchema } from '../schemas/authSchemas';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';
import { AuthContext } from '../../../context/AuthContext';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { ROLE_REDIRECTS } from '../constants/roles';
import { api } from '../../../lib/api';

/* ── Input shared styles ── */
const inputSx = {
    '& .MuiOutlinedInput-root': { fontFamily: "'DM Sans', sans-serif" },
    '& .MuiInputLabel-root':   { fontFamily: "'DM Sans', sans-serif" },
};

/* ── Field Label ── */
const FieldLabel = ({ htmlFor, error, success, isDark, children }) => (
    <Typography
        component="label"
        htmlFor={htmlFor}
        sx={{
            fontSize: '13px',
            fontWeight: 500,
            color: error
                ? 'error.main'
                : success
                ? '#059669'
                : isDark ? 'rgba(224,242,241,0.75)' : '#374151',
            fontFamily: "'DM Sans', sans-serif",
            display: 'block',
            mb: 0.6,
            letterSpacing: '0.01em',
        }}
    >
        {children}
    </Typography>
);

/* ── Read-only info tile ── */
const ReadOnlyTile = ({ icon: Icon, label, value, isDark }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.25,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,106,106,0.1)',
            backgroundColor: isDark ? 'rgba(0,106,106,0.06)' : 'rgba(0,106,106,0.04)',
        }}
    >
        <Box sx={{ color: '#006A6A', display: 'flex', flexShrink: 0 }}>
            <Icon size={16} />
        </Box>
        <Box sx={{ overflow: 'hidden' }}>
            <Typography sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                color: 'text.disabled',
                lineHeight: 1.2,
                mb: 0.15,
            }}>
                {label}
            </Typography>
            <Typography sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: isDark ? '#E0F2F1' : '#111827',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {value || '—'}
            </Typography>
        </Box>
    </Box>
);

/* ── Main Page ── */
export const CompleteProfilePage = () => {
    const { user, completeProfile, isLoading, error: contextError } = useContext(AuthContext);
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const navigate = useNavigate();

    const [departments, setDepartments] = useState([]);
    const [deptLoading, setDeptLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // If user has already completed profile, redirect them
    useEffect(() => {
        if (user && user.must_complete_profile === false) {
            const redirect = ROLE_REDIRECTS[user.role] || '/dashboard';
            navigate(redirect, { replace: true });
        }
    }, [user, navigate]);

    // Fetch departments list on mount
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('v1/auth/departments/');
                setDepartments(res.data);
            } catch {
                // Fallback static list if API fails
                setDepartments([
                    { id: 'cardiology',    name: 'Cardiology' },
                    { id: 'emergency',     name: 'Emergency' },
                    { id: 'general',       name: 'General Medicine' },
                    { id: 'neurology',     name: 'Neurology' },
                    { id: 'orthopedics',   name: 'Orthopedics' },
                    { id: 'pediatrics',    name: 'Pediatrics' },
                ]);
            } finally {
                setDeptLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields },
        watch,
    } = useForm({
        resolver: zodResolver(completeProfileSchema),
        mode: 'onBlur',
        defaultValues: {
            department: '',
            employeeId: '',
            phone: '',
            termsAccepted: false,
        },
    });

    const deptVal = watch('department');
    const empIdVal = watch('employeeId');
    const phoneVal = watch('phone');
    const termsVal = watch('termsAccepted');

    const isDeptSuccess  = touchedFields.department  && !errors.department  && deptVal;
    const isEmpIdSuccess = touchedFields.employeeId  && !errors.employeeId  && empIdVal;
    const isPhoneSuccess = touchedFields.phone       && !errors.phone       && phoneVal;

    const onSubmit = async (data) => {
        setSubmitError(null);
        try {
            const updatedUser = await completeProfile({
                department: data.department,
                employee_id: data.employeeId || undefined,
                phone: data.phone || undefined,
            });
            setIsSuccess(true);
            // Brief success flash, then navigate
            setTimeout(() => {
                const redirect = ROLE_REDIRECTS[updatedUser?.role] || '/dashboard';
                navigate(redirect, { replace: true });
            }, 1800);
        } catch (err) {
            const msg = typeof err === 'string'
                ? err
                : err?.detail || err?.department?.[0] || 'Could not complete your profile. Please try again.';
            setSubmitError(msg);
        }
    };

    /* ── Success State ── */
    if (isSuccess) {
        return (
            <AuthLayout title="Profile Complete" subtitle="Welcome to Al Shifaa HMS.">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2.5, py: 3 }}>
                        <Box sx={{
                            width: 80, height: 80, borderRadius: '50%',
                            backgroundColor: 'rgba(0,106,106,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CheckCircle2 size={44} color="#006A6A" />
                        </Box>
                        <Box>
                            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '22px', color: isDark ? '#E0F2F1' : '#161D1D', mb: 0.75 }}>
                                You're all set!
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.6, maxWidth: 300 }}>
                                Your profile has been saved. Redirecting you to your dashboard…
                            </Typography>
                        </Box>
                        <CircularProgress size={28} sx={{ color: '#006A6A', mt: 1 }} />
                    </Box>
                </motion.div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Complete Your Profile"
            subtitle="Your Google account was linked. Fill in a few details to activate your workspace."
        >
            {/* Pre-filled read-only identity tiles */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
                <ReadOnlyTile icon={User}  label="Full Name"      value={user?.full_name} isDark={isDark} />
                <ReadOnlyTile icon={Mail}  label="Email Address"  value={user?.email}     isDark={isDark} />
            </Box>

            {/* Error alert */}
            <AnimatePresence>
                {(submitError || contextError) && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Alert
                            severity="error"
                            sx={{ mb: 2, borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}
                        >
                            {submitError || (typeof contextError === 'string' ? contextError : contextError?.detail)}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                {/* Department */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <FieldLabel htmlFor="cp-department" error={!!errors.department} success={isDeptSuccess} isDark={isDark}>
                        Department <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                    </FieldLabel>
                    <TextField
                        {...register('department')}
                        id="cp-department"
                        select
                        disabled={deptLoading}
                        defaultValue=""
                        error={!!errors.department}
                        helperText={errors.department ? (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                                <span>{errors.department.message}</span>
                            </Box>
                        ) : undefined}
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ mr: 1, color: errors.department ? 'error.main' : isDeptSuccess ? '#059669' : 'text.disabled', display: 'flex' }}>
                                    {deptLoading ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : <Building2 size={17} />}
                                </Box>
                            ),
                        }}
                        sx={inputSx}
                    >
                        <MenuItem value="" disabled sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.disabled' }}>
                            — Select your department —
                        </MenuItem>
                        {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id} sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                                {dept.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {/* Employee ID */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <FieldLabel htmlFor="cp-employee-id" error={!!errors.employeeId} success={isEmpIdSuccess} isDark={isDark}>
                        Employee / Badge ID <Box component="span" sx={{ fontSize: '11px', color: 'text.disabled', fontWeight: 400 }}>(optional)</Box>
                    </FieldLabel>
                    <TextField
                        {...register('employeeId')}
                        id="cp-employee-id"
                        placeholder="e.g. HMS-2024-001"
                        error={!!errors.employeeId}
                        helperText={errors.employeeId ? (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                                <span>{errors.employeeId.message}</span>
                            </Box>
                        ) : undefined}
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ mr: 1, color: errors.employeeId ? 'error.main' : isEmpIdSuccess ? '#059669' : 'text.disabled', display: 'flex' }}>
                                    <CreditCard size={17} />
                                </Box>
                            ),
                        }}
                        sx={inputSx}
                    />
                </Box>

                {/* Phone */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <FieldLabel htmlFor="cp-phone" error={!!errors.phone} success={isPhoneSuccess} isDark={isDark}>
                        Phone Number <Box component="span" sx={{ fontSize: '11px', color: 'text.disabled', fontWeight: 400 }}>(optional)</Box>
                    </FieldLabel>
                    <TextField
                        {...register('phone')}
                        id="cp-phone"
                        placeholder="+92 300 1234567"
                        error={!!errors.phone}
                        helperText={errors.phone ? (
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                                <span>{errors.phone.message}</span>
                            </Box>
                        ) : undefined}
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ mr: 1, color: errors.phone ? 'error.main' : isPhoneSuccess ? '#059669' : 'text.disabled', display: 'flex' }}>
                                    <Phone size={17} />
                                </Box>
                            ),
                        }}
                        sx={inputSx}
                    />
                </Box>

                {/* Terms of Service */}
                <Box
                    sx={{
                        p: 1.75,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: errors.termsAccepted
                            ? 'error.main'
                            : termsVal
                            ? 'rgba(0,106,106,0.35)'
                            : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        backgroundColor: termsVal
                            ? isDark ? 'rgba(0,106,106,0.08)' : 'rgba(0,106,106,0.04)'
                            : 'transparent',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                {...register('termsAccepted')}
                                id="cp-terms"
                                size="small"
                                sx={{
                                    color: errors.termsAccepted ? 'error.main' : 'text.disabled',
                                    '&.Mui-checked': { color: '#006A6A' },
                                    p: 0.5,
                                }}
                            />
                        }
                        label={
                            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: isDark ? 'rgba(224,242,241,0.8)' : '#4B5563' }}>
                                I agree to the{' '}
                                <Link component={RouterLink} to="/terms" underline="hover" sx={{ color: '#006A6A', fontWeight: 600, '&:hover': { color: '#004F4F' } }}>
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link component={RouterLink} to="/privacy" underline="hover" sx={{ color: '#006A6A', fontWeight: 600, '&:hover': { color: '#004F4F' } }}>
                                    Privacy Policy
                                </Link>
                            </Typography>
                        }
                        sx={{ m: 0, alignItems: 'flex-start', gap: 0.5 }}
                    />
                    {errors.termsAccepted && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main', mt: 0.75, ml: 3.5 }}>
                            <AlertCircle size={13} />
                            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'error.main' }}>
                                {errors.termsAccepted.message}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Submit Button */}
                <Box
                    component={motion.button}
                    type="submit"
                    disabled={isLoading}
                    whileHover={isLoading ? {} : { scale: 1.01 }}
                    whileTap={isLoading ? {} : { scale: 0.99 }}
                    sx={{
                        mt: 0.5,
                        height: 46,
                        borderRadius: '12px',
                        border: 'none',
                        background: isLoading
                            ? (isDark ? 'rgba(0,106,106,0.4)' : 'rgba(0,106,106,0.5)')
                            : 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                        color: '#FFFFFF',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        transition: 'all 0.2s ease',
                        boxShadow: isLoading ? 'none' : '0 4px 12px rgba(0,106,106,0.25)',
                        '&:hover': {
                            background: isLoading
                                ? undefined
                                : 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                        },
                    }}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            <span>Saving…</span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck size={17} />
                            <span>Activate My Account</span>
                            <motion.span
                                animate={{ x: [0, 3, 0] }}
                                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                                style={{ display: 'flex', alignItems: 'center' }}
                            >
                                <ArrowRight size={16} />
                            </motion.span>
                        </>
                    )}
                </Box>
            </Box>

            {/* CSS keyframe for spinner */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </AuthLayout>
    );
};
