import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box, Alert, Typography, Link, TextField,
    MenuItem, Checkbox, FormControlLabel, CircularProgress,
    Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    User, Mail, Phone, Briefcase, FileText,
    Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
    XCircle, X, ArrowRight, Loader2, ChevronDown,
    Calendar, Heart, Shield, Pill, FlaskConical, Scan, Stethoscope
} from 'lucide-react';
import {
    registerStep1Schema,
    registerStep2Schema,
    registerStep3Schema,
    staffInviteFormSchema,
    patientStep1Schema,
    patientStep2Schema,
} from '../schemas/authSchemas';
import { ROLES } from '../constants/roles';
import { useAuth } from '../hooks/useAuth';
import StepProgressBar from './StepProgressBar';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { api } from '../../../lib/api';

/* ── Slide animation variants ── */
const normalizePhoneNumber = (phone) => {
    let clean = (phone || '').replace(/\D/g, '');
    if (clean.startsWith('92') && clean.length === 12) {
        return `+${clean}`;
    }
    if (clean.startsWith('03') && clean.length === 11) {
        return `+92${clean.slice(1)}`;
    }
    if (clean.startsWith('3') && clean.length === 10) {
        return `+92${clean}`;
    }
    if (clean.length > 0 && !clean.startsWith('92')) {
        return `+92${clean}`;
    }
    return clean ? `+${clean}` : '';
};

const slideVariants = (direction) => ({
    initial: { opacity: 0, x: direction === 'forward' ? 40 : -40 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit:    { opacity: 0, x: direction === 'forward' ? -40 : 40, transition: { duration: 0.25, ease: 'easeIn' } },
});

const ROLE_ICONS = {
    DOCTOR:         Stethoscope,
    NURSE:          Heart,
    RECEPTIONIST:   Phone,
    ADMIN:          Shield,
    PHARMACIST:     Pill,
    LAB_TECHNICIAN: FlaskConical,
    RADIOLOGIST:    Scan,
};

const RoleBadge = ({ role, roleLabel, departmentName }) => {
    const RoleIcon = ROLE_ICONS[role] || Stethoscope;
    const label = departmentName ? `${roleLabel} · ${departmentName}` : roleLabel;

    return (
        <Box
            sx={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            '8px',
                px:             1.5,
                py:             0.5,
                borderRadius:   '9999px',
                backgroundColor: 'rgba(0,106,106,0.10)',
                border:         '1px solid rgba(0,106,106,0.18)',
                color:          '#006A6A',
                fontSize:       '12px',
                fontWeight:     500,
                fontFamily:     "'DM Sans', sans-serif",
                letterSpacing:  '0.1px',
                userSelect:     'none',
                mb:             2.5,
            }}
        >
            <RoleIcon size={12} />
            <Box
                component="span"
                sx={{
                    width:        8,
                    height:       8,
                    borderRadius: '50%',
                    background:   '#006A6A',
                    flexShrink:   0,
                    display:      'inline-block',
                }}
            />
            {label}
        </Box>
    );
};

const formatCNIC = (val) => {
    const clean = (val || '').replace(/\D/g, '');
    const part1 = clean.slice(0, 5);
    const part2 = clean.slice(5, 12);
    const part3 = clean.slice(12, 13);
    
    if (clean.length > 12) {
        return `${part1}-${part2}-${part3}`;
    } else if (clean.length > 5) {
        return `${part1}-${part2}`;
    }
    return part1;
};

const STEP_LABELS = ['Personal Info', 'Role & Dept', 'Security'];

const inputSx = {
    '& .MuiOutlinedInput-root': { fontFamily: "'DM Sans', sans-serif" },
    '& .MuiInputLabel-root':   { fontFamily: "'DM Sans', sans-serif" },
};

const errorAdornment = (hasError, isSuccess, size = 18) => ({
    color: hasError ? 'error.main' : isSuccess ? '#059669' : 'text.disabled',
    display: 'flex',
    mr: 1,
});

/**
 * RegisterForm — 3-step registration wizard.
 * Step 1: Personal Info | Step 2: Role & Dept | Step 3: Security
 */
export const RegisterForm = ({ visitMode, inviteData }) => {
    const navigate = useNavigate();
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const { register: authRegister, registerPatient, isLoading: authLoading, error: authError } = useAuth();

    const [step, setStep]           = useState(1);
    const [direction, setDirection] = useState('forward');
    const [showPass, setShowPass]   = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSuccess, setIsSuccess]     = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [departments, setDepartments]   = useState([]);
    const [deptLoading, setDeptLoading]   = useState(false);

    /* Collect data across steps */
    const [step1Data, setStep1Data] = useState({});
    const [step2Data, setStep2Data] = useState({});

    /* ── Step forms for original clinical ── */
    const form1 = useForm({
        resolver: zodResolver(registerStep1Schema),
        mode: 'onBlur',
        defaultValues: { fullName: '', email: inviteData?.email || '', phone: '' },
    });
    const form2 = useForm({
        resolver: zodResolver(registerStep2Schema),
        mode: 'onBlur',
        defaultValues: { role: 'DOCTOR', department: '', licenseNo: '' },
    });
    const form3 = useForm({
        resolver: zodResolver(registerStep3Schema),
        mode: 'onBlur',
        defaultValues: { password: '', confirmPassword: '', termsAccepted: false },
    });

    /* ── Forms for Staff Invite ── */
    const staffForm = useForm({
        resolver: zodResolver(staffInviteFormSchema),
        mode: 'onBlur',
        defaultValues: { fullName: '', email: inviteData?.email || '', phone: '', password: '', termsAccepted: false },
    });

    /* ── Forms for Patient ── */
    const patientForm1 = useForm({
        resolver: zodResolver(patientStep1Schema),
        mode: 'onBlur',
        defaultValues: { fullName: '', dob: '', gender: '', cnic: '', email: '', phone: '' },
    });
    const patientForm2 = useForm({
        resolver: zodResolver(patientStep2Schema),
        mode: 'onBlur',
        defaultValues: { password: '', confirmPassword: '', emergencyContactName: '', emergencyContactRelationship: '', emergencyContactPhone: '', termsAccepted: false },
    });

    useEffect(() => {
        if (inviteData?.email) {
            form1.setValue('email', inviteData.email);
            staffForm.setValue('email', inviteData.email);
        }
    }, [inviteData, form1, staffForm]);

    useEffect(() => {
        if (visitMode === 'patient') {
            form2.setValue('role', 'PATIENT');
        } else if (visitMode === 'staff_invite' && inviteData?.role) {
            form2.setValue('role', inviteData.role);
            if (inviteData.departmentId) {
                form2.setValue('department', inviteData.departmentId);
            }
        }
    }, [visitMode, inviteData, form2]);

    /* Success state helpers */
    const isFullNameSuccess   = form1.formState.touchedFields.fullName   && !form1.formState.errors.fullName;
    const isEmailSuccess      = form1.formState.touchedFields.email      && !form1.formState.errors.email;
    const isPhoneSuccess      = form1.formState.touchedFields.phone      && !form1.formState.errors.phone;
    const isPasswordSuccess   = form3.formState.touchedFields.password   && !form3.formState.errors.password;
    const isConfirmSuccess    = form3.formState.touchedFields.confirmPassword
                                && !form3.formState.errors.confirmPassword
                                && form3.watch('confirmPassword');

    const passwordValue = form3.watch('password');

    const goNext = (data) => {
        setDirection('forward');
        if (step === 1) { setStep1Data(data); setStep(2); }
        else if (step === 2) { setStep2Data(data); setStep(3); }
    };

    const goBack = () => {
        setDirection('backward');
        setStep((s) => Math.max(1, s - 1));
    };

    const onFinalSubmit = async (data) => {
        const nameParts  = step1Data.fullName.trim().split(' ');
        const first_name = nameParts[0] || '';
        const last_name  = nameParts.slice(1).join(' ') || '';
        const phone      = normalizePhoneNumber(step1Data.phone);

        const payload = {
            email:      step1Data.email,
            full_name:  step1Data.fullName,
            first_name,
            last_name,
            phone,
            password:   data.password,
            role:       visitMode === 'patient' ? 'PATIENT' : (step2Data.role || 'DOCTOR'),
        };

        if (visitMode === 'staff_invite' && inviteData?.token) {
            payload.invite_token = inviteData.token;
            payload.role = inviteData.role;
        }

        const ok = await authRegister(payload);
        if (ok) setIsSuccess(true);
    };

    const getGlobalError = () => {
        if (!authError) return null;
        if (typeof authError === 'string') return authError;
        return authError.detail || 'Registration failed. Please check your inputs.';
    };

    const isBusy = authLoading;

    /* ── 1. Staff Invitation Form View ── */
    if (visitMode === 'staff_invite') {
        const staffFullNameSuccess = staffForm.formState.touchedFields.fullName && !staffForm.formState.errors.fullName;
        const staffPhoneSuccess = staffForm.formState.touchedFields.phone && !staffForm.formState.errors.phone;
        const staffPasswordSuccess = staffForm.formState.touchedFields.password && !staffForm.formState.errors.password;
        const staffPasswordValue = staffForm.watch('password');

        const onStaffSubmit = async (data) => {
            setToastMessage('');
            const payload = {
                invite_token: inviteData?.token,
                email: inviteData?.email,
                full_name: data.fullName,
                phone: normalizePhoneNumber(data.phone),
                password: data.password,
            };

            try {
                const res = await api.post('v1/auth/register-invited/', payload);
                navigate('/auth/login', {
                    state: { successMessage: 'Account created successfully. You can now sign in.' }
                });
            } catch (err) {
                const errData = err.response?.data;
                let msg = 'This invitation link has expired. Please contact your administrator.';
                if (errData) {
                    if (typeof errData === 'string') {
                        msg = errData;
                    } else if (errData.detail) {
                        msg = errData.detail;
                    } else if (errData.invite_token) {
                        msg = 'This invitation link has expired. Please contact your administrator.';
                    } else {
                        msg = Object.values(errData).flat().join(' ');
                    }
                }
                setToastMessage(msg);
            }
        };

        return (
            <Box sx={{ width: '100%' }}>
                {/* Role Badge */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <RoleBadge
                        role={inviteData?.role}
                        roleLabel={inviteData?.roleLabel}
                        departmentName={inviteData?.departmentName}
                    />
                </Box>

                {toastMessage && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                        {toastMessage}
                    </Alert>
                )}

                <Box component="form" onSubmit={staffForm.handleSubmit(onStaffSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }} noValidate>
                    {/* Full Name */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography component="label" htmlFor="staff-fullname" sx={{ fontSize: '14px', fontWeight: 500, color: staffForm.formState.errors.fullName ? 'error.main' : staffFullNameSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                            Full Name
                        </Typography>
                        <TextField
                            {...staffForm.register('fullName')}
                            id="staff-fullname"
                            placeholder="Your full name"
                            error={!!staffForm.formState.errors.fullName}
                            className={staffFullNameSuccess ? 'Mui-success' : ''}
                            helperText={staffForm.formState.errors.fullName?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <Box sx={errorAdornment(!!staffForm.formState.errors.fullName, staffFullNameSuccess)}>
                                            <User size={18} />
                                        </Box>
                                    ),
                                },
                            }}
                            sx={inputSx}
                        />
                    </Box>

                    {/* Email */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography component="label" htmlFor="staff-email" sx={{ fontSize: '14px', fontWeight: 500, color: isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                            Personal Email
                        </Typography>
                        <TextField
                            {...staffForm.register('email')}
                            id="staff-email"
                            type="email"
                            disabled
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <Box sx={{ color: 'text.disabled', display: 'flex', mr: 1 }}>
                                            <Mail size={18} />
                                        </Box>
                                    ),
                                },
                            }}
                            sx={inputSx}
                        />
                    </Box>

                    {/* Phone Number */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography component="label" htmlFor="staff-phone" sx={{ fontSize: '14px', fontWeight: 500, color: staffForm.formState.errors.phone ? 'error.main' : staffPhoneSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                            Phone Number
                        </Typography>
                        <TextField
                            {...staffForm.register('phone')}
                            id="staff-phone"
                            placeholder="03001234567"
                            error={!!staffForm.formState.errors.phone}
                            className={staffPhoneSuccess ? 'Mui-success' : ''}
                            helperText={staffForm.formState.errors.phone?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <Box sx={errorAdornment(!!staffForm.formState.errors.phone, staffPhoneSuccess)}>
                                            <Phone size={18} />
                                        </Box>
                                    ),
                                },
                            }}
                            sx={inputSx}
                        />
                    </Box>

                    {/* Password */}
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography component="label" htmlFor="staff-password" sx={{ fontSize: '14px', fontWeight: 500, color: staffForm.formState.errors.password ? 'error.main' : staffPasswordSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                            Password
                        </Typography>
                        <TextField
                            {...staffForm.register('password')}
                            id="staff-password"
                            type={showPass ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            error={!!staffForm.formState.errors.password}
                            className={staffPasswordSuccess ? 'Mui-success' : ''}
                            helperText={staffForm.formState.errors.password?.message}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <Box sx={errorAdornment(!!staffForm.formState.errors.password, staffPasswordSuccess)}>
                                            <Lock size={18} />
                                        </Box>
                                    ),
                                    endAdornment: (
                                        <Box component="button" type="button" onClick={() => setShowPass(!showPass)} sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0.5, display: 'flex', color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
                                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </Box>
                                    ),
                                },
                            }}
                            sx={inputSx}
                        />
                    </Box>

                    {/* Password Strength Meter */}
                    <PasswordStrengthMeter password={staffPasswordValue} />

                    {/* Terms Checkbox */}
                    <FormControlLabel
                        control={<Checkbox {...staffForm.register('termsAccepted')} id="staff-terms" size="small" color="primary" />}
                        label={
                            <Typography variant="caption" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>
                                I accept the{' '}
                                <Link component={RouterLink} to="/terms" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms of Service</Link>
                                {' '}and{' '}
                                <Link component={RouterLink} to="/privacy" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Link>
                            </Typography>
                        }
                    />
                    {staffForm.formState.errors.termsAccepted && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: -1.5, color: 'error.main' }}>
                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                            <Typography variant="caption" sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                                {staffForm.formState.errors.termsAccepted.message}
                            </Typography>
                        </Box>
                    )}

                    {/* Create My Account Button */}
                    <Box component={motion.button} type="submit" disabled={isBusy} whileHover={isBusy ? {} : 'hover'} sx={{ mt: 1, height: 44, borderRadius: '12px', border: 'none', cursor: isBusy ? 'not-allowed' : 'pointer', background: isBusy ? 'rgba(0,106,106,0.5)' : 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, transition: 'all 0.2s ease', opacity: isBusy ? 0.9 : 1 }}>
                        {isBusy ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Loader2 size={16} className="animate-spin" style={{ color: '#fff' }} />
                                <span>Creating Account…</span>
                            </Box>
                        ) : (
                            <>
                                <span>Create My Account →</span>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        );
    }

    /* ── 2. Patient Registration Form View ── */
    if (visitMode === 'patient') {
        const patientFullNameSuccess = patientForm1.formState.touchedFields.fullName && !patientForm1.formState.errors.fullName;
        const patientEmailSuccess = patientForm1.formState.touchedFields.email && !patientForm1.formState.errors.email;
        const patientCnicSuccess = patientForm1.formState.touchedFields.cnic && !patientForm1.formState.errors.cnic;
        const patientPhoneSuccess = patientForm1.formState.touchedFields.phone && !patientForm1.formState.errors.phone;

        const patientPasswordSuccess = patientForm2.formState.touchedFields.password && !patientForm2.formState.errors.password;
        const patientConfirmSuccess = patientForm2.formState.touchedFields.confirmPassword && !patientForm2.formState.errors.confirmPassword && patientForm2.watch('confirmPassword');

        const pPasswordValue = patientForm2.watch('password');
        const pConfirmPasswordValue = patientForm2.watch('confirmPassword');
        const passwordsMatch = pPasswordValue && pConfirmPasswordValue && (pPasswordValue === pConfirmPasswordValue);

        const patientStep1Submit = (data) => {
            setDirection('forward');
            setStep1Data(data);
            setStep(2);
        };

        const patientStep2Submit = async (data) => {
            setToastMessage('');
            const payload = {
                email: step1Data.email,
                full_name: step1Data.fullName,
                dob: step1Data.dob,
                gender: step1Data.gender,
                cnic: step1Data.cnic,
                phone: normalizePhoneNumber(step1Data.phone),
                password: data.password,
                emergency_contact_name: data.emergencyContactName,
                emergency_contact_relationship: data.emergencyContactRelationship,
                emergency_contact_phone: normalizePhoneNumber(data.emergencyContactPhone)
            };

            try {
                await registerPatient(payload);
                navigate('/patient/dashboard', {
                    state: { successMessage: 'Welcome to Al Shifaa. Your health portal is ready.' }
                });
            } catch (err) {
                let msg = 'Patient registration failed. Please check your inputs.';
                if (err) {
                    msg = err.detail || Object.values(err).flat().join(' ');
                }
                setToastMessage(msg);
            }
        };

        const goPatientBack = () => {
            setDirection('backward');
            setStep(1);
        };

        return (
            <Box sx={{ width: '100%' }}>
                {/* Step Progress Bar */}
                <StepProgressBar
                    steps={['Personal Info', 'Account Security']}
                    currentStep={step}
                    completedSteps={step > 1 ? [1] : []}
                />

                {toastMessage && (
                    <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                        {toastMessage}
                    </Alert>
                )}

                <AnimatePresence mode="wait">
                    {/* STEP 1: Personal Information */}
                    {step === 1 && (
                        <motion.div key="patient-step1" {...slideVariants(direction)} initial="initial" animate="animate" exit="exit">
                            <Box component="form" onSubmit={patientForm1.handleSubmit(patientStep1Submit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }} noValidate>
                                
                                {/* Full Name */}
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography component="label" htmlFor="patient-fullname" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm1.formState.errors.fullName ? 'error.main' : patientFullNameSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                        Full Name
                                    </Typography>
                                    <TextField
                                        {...patientForm1.register('fullName')}
                                        id="patient-fullname"
                                        placeholder="Enter your full name"
                                        error={!!patientForm1.formState.errors.fullName}
                                        className={patientFullNameSuccess ? 'Mui-success' : ''}
                                        helperText={patientForm1.formState.errors.fullName?.message}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <Box sx={errorAdornment(!!patientForm1.formState.errors.fullName, patientFullNameSuccess)}>
                                                        <User size={18} />
                                                    </Box>
                                                ),
                                            },
                                        }}
                                        sx={inputSx}
                                    />
                                </Box>

                                {/* Date of Birth & Gender row */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {/* Date of Birth */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <Typography component="label" htmlFor="patient-dob" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm1.formState.errors.dob ? 'error.main' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                            Date of Birth
                                        </Typography>
                                        <TextField
                                            {...patientForm1.register('dob')}
                                            id="patient-dob"
                                            type="date"
                                            error={!!patientForm1.formState.errors.dob}
                                            helperText={patientForm1.formState.errors.dob?.message}
                                            onClick={(e) => {
                                                try {
                                                    if (e.target.showPicker) e.target.showPicker();
                                                } catch (err) {}
                                            }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}>
                                                            <Calendar size={18} />
                                                        </Box>
                                                    ),
                                                },
                                            }}
                                            sx={{
                                                ...inputSx,
                                                '& input::-webkit-calendar-picker-indicator': {
                                                    display: 'none',
                                                    WebkitAppearance: 'none',
                                                },
                                                '& input::-webkit-clear-button': {
                                                    display: 'none',
                                                    WebkitAppearance: 'none',
                                                },
                                            }}
                                        />
                                    </Box>

                                    {/* Gender */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <Typography component="label" htmlFor="patient-gender" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm1.formState.errors.gender ? 'error.main' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                            Gender
                                        </Typography>
                                        <TextField
                                            {...patientForm1.register('gender')}
                                            select
                                            SelectProps={{ displayEmpty: true }}
                                            id="patient-gender"
                                            defaultValue=""
                                            error={!!patientForm1.formState.errors.gender}
                                            helperText={patientForm1.formState.errors.gender?.message}
                                            sx={inputSx}
                                        >
                                            <MenuItem value="" disabled sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.disabled' }}>Select gender</MenuItem>
                                            <MenuItem value="MALE" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Male</MenuItem>
                                            <MenuItem value="FEMALE" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Female</MenuItem>
                                            <MenuItem value="OTHER" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Other</MenuItem>
                                        </TextField>
                                    </Box>
                                </Box>

                                {/* CNIC & Email row */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {/* CNIC */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <Typography component="label" htmlFor="patient-cnic" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm1.formState.errors.cnic ? 'error.main' : patientCnicSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                            CNIC Number
                                        </Typography>
                                        <TextField
                                            {...patientForm1.register('cnic')}
                                            id="patient-cnic"
                                            placeholder="XXXXX-XXXXXXX-X"
                                            error={!!patientForm1.formState.errors.cnic}
                                            className={patientCnicSuccess ? 'Mui-success' : ''}
                                            helperText={patientForm1.formState.errors.cnic?.message}
                                            onChange={(e) => {
                                                const formatted = formatCNIC(e.target.value);
                                                e.target.value = formatted;
                                                patientForm1.register('cnic').onChange(e);
                                            }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <Box sx={errorAdornment(!!patientForm1.formState.errors.cnic, patientCnicSuccess)}>
                                                            <FileText size={18} />
                                                        </Box>
                                                    ),
                                                },
                                            }}
                                            sx={inputSx}
                                        />
                                    </Box>

                                    {/* Email */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <Typography component="label" htmlFor="patient-email" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm1.formState.errors.email ? 'error.main' : patientEmailSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                            Email Address
                                        </Typography>
                                        <TextField
                                            {...patientForm1.register('email')}
                                            id="patient-email"
                                            type="email"
                                            placeholder="patient@example.com"
                                            error={!!patientForm1.formState.errors.email}
                                            className={patientEmailSuccess ? 'Mui-success' : ''}
                                            helperText={patientForm1.formState.errors.email?.message}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <Box sx={errorAdornment(!!patientForm1.formState.errors.email, patientEmailSuccess)}>
                                                            <Mail size={18} />
                                                        </Box>
                                                    ),
                                                },
                                            }}
                                            sx={inputSx}
                                        />
                                    </Box>
                                </Box>

                                {/* Phone Number */}
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography component="label" htmlFor="patient-phone" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm1.formState.errors.phone ? 'error.main' : patientPhoneSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                        Phone Number
                                    </Typography>
                                    <TextField
                                        {...patientForm1.register('phone')}
                                        id="patient-phone"
                                        placeholder="03001234567"
                                        error={!!patientForm1.formState.errors.phone}
                                        className={patientPhoneSuccess ? 'Mui-success' : ''}
                                        helperText={patientForm1.formState.errors.phone?.message}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <Box sx={errorAdornment(!!patientForm1.formState.errors.phone, patientPhoneSuccess)}>
                                                        <Phone size={18} />
                                                    </Box>
                                                ),
                                            },
                                        }}
                                        sx={inputSx}
                                    />
                                </Box>

                                {/* Continue Button */}
                                <Box component={motion.button} type="submit" whileHover="hover" sx={{ mt: 1, height: 44, borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, transition: 'all 0.2s ease' }}>
                                    <span>Continue</span>
                                    <Box component={motion.span} variants={{ hover: { x: 3 } }} transition={{ duration: 0.2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ArrowRight size={16} />
                                    </Box>
                                </Box>

                                <Typography variant="body2" sx={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>
                                    Already registered?{' '}
                                    <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600, color: 'primary.main' }}>Sign In</Link>
                                </Typography>
                            </Box>
                        </motion.div>
                    )}

                    {/* STEP 2: Account Security & Emergency Contact */}
                    {step === 2 && (
                        <motion.div key="patient-step2" {...slideVariants(direction)} initial="initial" animate="animate" exit="exit">
                            <Box component="form" onSubmit={patientForm2.handleSubmit(patientStep2Submit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }} noValidate>
                                
                                {/* Password */}
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography component="label" htmlFor="patient-password" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm2.formState.errors.password ? 'error.main' : patientPasswordSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                        Password
                                    </Typography>
                                    <TextField
                                        {...patientForm2.register('password')}
                                        id="patient-password"
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Create a strong password"
                                        error={!!patientForm2.formState.errors.password}
                                        className={patientPasswordSuccess ? 'Mui-success' : ''}
                                        helperText={patientForm2.formState.errors.password?.message}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <Box sx={errorAdornment(!!patientForm2.formState.errors.password, patientPasswordSuccess)}>
                                                        <Lock size={18} />
                                                    </Box>
                                                ),
                                                endAdornment: (
                                                    <Box component="button" type="button" onClick={() => setShowPass(!showPass)} sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0.5, display: 'flex', color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
                                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </Box>
                                                ),
                                            },
                                        }}
                                        sx={inputSx}
                                    />
                                </Box>

                                {/* Password Strength Meter */}
                                <PasswordStrengthMeter password={pPasswordValue} />

                                {/* Confirm Password */}
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography component="label" htmlFor="patient-confirm-password" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm2.formState.errors.confirmPassword ? 'error.main' : patientConfirmSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                        Confirm Password
                                    </Typography>
                                    <TextField
                                        {...patientForm2.register('confirmPassword')}
                                        id="patient-confirm-password"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repeat your password"
                                        error={!!patientForm2.formState.errors.confirmPassword}
                                        className={patientConfirmSuccess ? 'Mui-success' : ''}
                                        helperText={patientForm2.formState.errors.confirmPassword?.message}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <Box sx={errorAdornment(!!patientForm2.formState.errors.confirmPassword, patientConfirmSuccess)}>
                                                        <Lock size={18} />
                                                    </Box>
                                                ),
                                                endAdornment: (
                                                    <Box component="button" type="button" onClick={() => setShowConfirm(!showConfirm)} sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0.5, display: 'flex', color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
                                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </Box>
                                                ),
                                            },
                                        }}
                                        sx={inputSx}
                                    />
                                    {/* Password Match Indicator */}
                                    {pConfirmPasswordValue && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                            {passwordsMatch ? (
                                                <>
                                                    <CheckCircle2 size={14} color="#059669" />
                                                    <Typography variant="caption" sx={{ color: '#059669', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                                                        Passwords match
                                                    </Typography>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={14} color="#DC2626" />
                                                    <Typography variant="caption" sx={{ color: 'error.main', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                                                        Passwords do not match
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    )}
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                {/* Emergency Contact Header */}
                                <Typography variant="subtitle2" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: 'primary.main' }}>
                                    Emergency Contact Section
                                </Typography>

                                {/* Emergency Contact Name */}
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography component="label" htmlFor="patient-emergency-name" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm2.formState.errors.emergencyContactName ? 'error.main' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                        Emergency Contact Name
                                    </Typography>
                                    <TextField
                                        {...patientForm2.register('emergencyContactName')}
                                        id="patient-emergency-name"
                                        placeholder="Full name of emergency contact"
                                        error={!!patientForm2.formState.errors.emergencyContactName}
                                        helperText={patientForm2.formState.errors.emergencyContactName?.message}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}>
                                                        <User size={18} />
                                                    </Box>
                                                ),
                                            },
                                        }}
                                        sx={inputSx}
                                    />
                                </Box>

                                {/* Emergency Contact Relationship & Phone row */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {/* Relationship */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <Typography component="label" htmlFor="patient-relationship" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm2.formState.errors.emergencyContactRelationship ? 'error.main' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                            Relationship
                                        </Typography>
                                        <TextField
                                            {...patientForm2.register('emergencyContactRelationship')}
                                            select
                                            id="patient-relationship"
                                            defaultValue=""
                                            error={!!patientForm2.formState.errors.emergencyContactRelationship}
                                            helperText={patientForm2.formState.errors.emergencyContactRelationship?.message}
                                            sx={inputSx}
                                        >
                                            <MenuItem value="" disabled sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.disabled' }}>Select Relationship</MenuItem>
                                            <MenuItem value="Father" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Father</MenuItem>
                                            <MenuItem value="Mother" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Mother</MenuItem>
                                            <MenuItem value="Spouse" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Spouse</MenuItem>
                                            <MenuItem value="Sibling" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Sibling</MenuItem>
                                            <MenuItem value="Child" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Child</MenuItem>
                                            <MenuItem value="Other" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Other</MenuItem>
                                        </TextField>
                                    </Box>

                                    {/* Emergency Phone */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1.2 }}>
                                        <Typography component="label" htmlFor="patient-emergency-phone" sx={{ fontSize: '14px', fontWeight: 500, color: patientForm2.formState.errors.emergencyContactPhone ? 'error.main' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                            Emergency Contact Phone
                                        </Typography>
                                        <TextField
                                            {...patientForm2.register('emergencyContactPhone')}
                                            id="patient-emergency-phone"
                                            placeholder="03001234567"
                                            error={!!patientForm2.formState.errors.emergencyContactPhone}
                                            helperText={patientForm2.formState.errors.emergencyContactPhone?.message}
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}>
                                                            <Phone size={18} />
                                                        </Box>
                                                    ),
                                                },
                                            }}
                                            sx={inputSx}
                                        />
                                    </Box>
                                </Box>

                                {/* Terms Checkbox */}
                                <FormControlLabel
                                    control={<Checkbox {...patientForm2.register('termsAccepted')} id="patient-terms" size="small" color="primary" />}
                                    label={
                                        <Typography variant="caption" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>
                                            I accept the{' '}
                                            <Link component={RouterLink} to="/terms" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms of Service</Link>
                                            {' '}and{' '}
                                            <Link component={RouterLink} to="/privacy" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Link>
                                        </Typography>
                                    }
                                />
                                {patientForm2.formState.errors.termsAccepted && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: -1.5, color: 'error.main' }}>
                                        <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                        <Typography variant="caption" sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                                            {patientForm2.formState.errors.termsAccepted.message}
                                        </Typography>
                                    </Box>
                                )}

                                {/* Nav buttons */}
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Box component="button" type="button" onClick={goPatientBack} sx={{ flex: 1, height: 44, borderRadius: '12px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px', color: isDark ? '#E0F2F1' : '#4B5563', transition: 'all 0.2s ease', '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB', borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#D1D5DB' } }}>
                                        ← Back
                                    </Box>
                                    <Box component={motion.button} type="submit" disabled={isBusy} whileHover={isBusy ? {} : 'hover'} sx={{ flex: 2, height: 44, borderRadius: '12px', border: 'none', cursor: isBusy ? 'not-allowed' : 'pointer', background: isBusy ? 'rgba(0,106,106,0.5)' : 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, transition: 'all 0.2s ease', opacity: isBusy ? 0.9 : 1 }}>
                                        {isBusy ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Loader2 size={16} className="animate-spin" style={{ color: '#fff' }} />
                                                <span>Creating Account…</span>
                                            </Box>
                                        ) : (
                                            <>
                                                <span>Create Patient Account →</span>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        );
    }

    /* ── 3. Fallback View (Default 3-Step Form) ── */
    if (isSuccess) {
        const successTitle = 'Request Submitted';
        const successMessage = 'Your request is under review. Our admin team will verify your credentials and activate your account within 24–48 hours.';

        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2.5, py: 2 }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(29,107,53,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={44} color="#1D6B35" />
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '22px', mb: 0.75 }}>
                            {successTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.6, maxWidth: 300 }}>
                            {successMessage}
                        </Typography>
                    </Box>
                    <Box
                        component="button" type="button" onClick={() => navigate('/login')}
                        sx={{ mt: 1, px: 4, py: 1.25, borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '14px', cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
                    >
                        Back to Login
                    </Box>
                </Box>
            </motion.div>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <StepProgressBar steps={STEP_LABELS} currentStep={step} completedSteps={Array.from({ length: step - 1 }, (_, i) => i + 1)} />

            {getGlobalError() && (
                <Alert severity="error" aria-live="polite" sx={{ mb: 2, borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                    {getGlobalError()}
                </Alert>
            )}

            <AnimatePresence mode="wait">

                {/* ═══ STEP 1 — Personal Info ═══ */}
                {step === 1 && (
                    <motion.div key="step1" {...slideVariants(direction)} initial="initial" animate="animate" exit="exit">
                        <Box component="form" onSubmit={form1.handleSubmit(goNext)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }} noValidate>

                            {/* Full Name */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="reg-fullname" sx={{ fontSize: '14px', fontWeight: 500, color: form1.formState.errors.fullName ? 'error.main' : isFullNameSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                    Full Name
                                </Typography>
                                <TextField
                                    {...form1.register('fullName')}
                                    id="reg-fullname"
                                    placeholder="Dr. John Smith"
                                    error={!!form1.formState.errors.fullName}
                                    className={isFullNameSuccess ? 'Mui-success' : ''}
                                    helperText={form1.formState.errors.fullName ? (
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                            <span>{form1.formState.errors.fullName.message}</span>
                                        </Box>
                                    ) : undefined}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={errorAdornment(!!form1.formState.errors.fullName, isFullNameSuccess)}>
                                                    <User size={18} />
                                                </Box>
                                            ),
                                        },
                                    }}
                                    sx={inputSx}
                                />
                            </Box>

                            {/* Email */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="reg-email" sx={{ fontSize: '14px', fontWeight: 500, color: form1.formState.errors.email ? 'error.main' : isEmailSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                    Email Address
                                </Typography>
                                <TextField
                                    {...form1.register('email')}
                                    id="reg-email"
                                    type="email"
                                    placeholder="doctor@hospital.pk"
                                    disabled={isBusy}
                                    error={!!form1.formState.errors.email}
                                    className={isEmailSuccess ? 'Mui-success' : ''}
                                    helperText={form1.formState.errors.email ? (
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                            <span>{form1.formState.errors.email.message}</span>
                                        </Box>
                                    ) : undefined}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={errorAdornment(!!form1.formState.errors.email, isEmailSuccess)}>
                                                    <Mail size={18} />
                                                </Box>
                                            ),
                                        },
                                    }}
                                    sx={inputSx}
                                />
                            </Box>

                            {/* Phone Number */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="reg-phone" sx={{ fontSize: '14px', fontWeight: 500, color: form1.formState.errors.phone ? 'error.main' : isPhoneSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                    Phone Number
                                </Typography>
                                <TextField
                                    {...form1.register('phone')}
                                    id="reg-phone"
                                    placeholder="03001234567"
                                    error={!!form1.formState.errors.phone}
                                    className={isPhoneSuccess ? 'Mui-success' : ''}
                                    helperText={form1.formState.errors.phone ? (
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                            <span>{form1.formState.errors.phone.message}</span>
                                        </Box>
                                    ) : undefined}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={errorAdornment(!!form1.formState.errors.phone, isPhoneSuccess)}>
                                                    <Phone size={18} />
                                                </Box>
                                            ),
                                        },
                                    }}
                                    sx={inputSx}
                                />
                            </Box>

                            {/* Next button */}
                            <Box component={motion.button} type="submit" whileHover="hover" sx={{ mt: 1, height: 44, borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, transition: 'all 0.2s ease', '&:hover': { background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)' }, '&:active': { background: 'linear-gradient(135deg, #004848 0%, #002F2F 100%)' } }}>
                                <span>Continue</span>
                                <Box component={motion.span} variants={{ hover: { x: 3 } }} transition={{ duration: 0.2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                    <ArrowRight size={16} />
                                </Box>
                            </Box>

                            <Typography variant="body2" sx={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>
                                Already registered?{' '}
                                <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600, color: 'primary.main' }}>Sign In</Link>
                            </Typography>
                        </Box>
                    </motion.div>
                )}

                {/* ═══ STEP 2 — Role & Department ═══ */}
                {step === 2 && (
                    <motion.div key="step2" {...slideVariants(direction)} initial="initial" animate="animate" exit="exit">
                        <Box component="form" onSubmit={form2.handleSubmit(goNext)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }} noValidate>

                            {/* Role */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="reg-role" sx={{ fontSize: '14px', fontWeight: 500, color: form2.formState.errors.role ? 'error.main' : 'text.secondary', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                    Your Role
                                </Typography>
                                <TextField
                                    {...form2.register('role')}
                                    select
                                    id="reg-role"
                                    defaultValue="DOCTOR"
                                    error={!!form2.formState.errors.role}
                                    helperText={form2.formState.errors.role ? (
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                            <span>{form2.formState.errors.role.message}</span>
                                        </Box>
                                    ) : undefined}
                                    slotProps={{ input: { startAdornment: <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}><Briefcase size={18} /></Box> } }}
                                    sx={inputSx}
                                >
                                    {ROLES.filter(r => r.key !== 'ADMIN' && r.key !== 'PATIENT').map((r) => (
                                        <MenuItem key={r.key} value={r.key} sx={{ fontFamily: "'DM Sans', sans-serif" }}>{r.label}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* Department — fetched from API */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="reg-department" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                    Department{' '}
                                    <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400 }}>(optional)</Box>
                                </Typography>
                                <TextField
                                    {...form2.register('department')}
                                    select
                                    id="reg-department"
                                    defaultValue=""
                                    disabled={deptLoading}
                                    sx={inputSx}
                                >
                                    <MenuItem value="" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.disabled' }}>
                                        {deptLoading ? 'Loading departments…' : '— Select department —'}
                                    </MenuItem>
                                    {departments.map((d) => (
                                        <MenuItem key={d.id} value={d.id} sx={{ fontFamily: "'DM Sans', sans-serif" }}>{d.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* License / Badge */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="reg-license" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                    License / Badge Number{' '}
                                    <Box component="span" sx={{ color: 'text.disabled', fontWeight: 400 }}>(optional)</Box>
                                </Typography>
                                <TextField
                                    {...form2.register('licenseNo')}
                                    id="reg-license"
                                    placeholder="PMDC-12345"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}>
                                                    <FileText size={18} />
                                                </Box>
                                            ),
                                        },
                                    }}
                                    sx={inputSx}
                                />
                            </Box>

                            {/* Nav buttons */}
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Box component="button" type="button" onClick={goBack} sx={{ flex: 1, height: 44, borderRadius: '12px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px', color: isDark ? '#E0F2F1' : '#4B5563', transition: 'all 0.2s ease', '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB', borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#D1D5DB' } }}>
                                    ← Back
                                </Box>
                                <Box component={motion.button} type="submit" whileHover="hover" sx={{ flex: 2, height: 44, borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, transition: 'all 0.2s ease', '&:hover': { background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)' }, '&:active': { background: 'linear-gradient(135deg, #004848 0%, #002F2F 100%)' } }}>
                                    <span>Continue</span>
                                    <Box component={motion.span} variants={{ hover: { x: 3 } }} transition={{ duration: 0.2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                        <ArrowRight size={16} />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </motion.div>
                )}

                {/* ═══ STEP 3 — Security ═══ */}
                {step === 3 && (
                    <motion.div key="step3" {...slideVariants(direction)} initial="initial" animate="animate" exit="exit">
                        <Box component="form" onSubmit={form3.handleSubmit(onFinalSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }} noValidate>

                            {/* Password */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="reg-password" sx={{ fontSize: '14px', fontWeight: 500, color: form3.formState.errors.password ? 'error.main' : isPasswordSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                    Password
                                </Typography>
                                <TextField
                                    {...form3.register('password')}
                                    id="reg-password"
                                    type={showPass ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    error={!!form3.formState.errors.password}
                                    className={isPasswordSuccess ? 'Mui-success' : ''}
                                    helperText={form3.formState.errors.password ? (
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                            <span>{form3.formState.errors.password.message}</span>
                                        </Box>
                                    ) : undefined}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={errorAdornment(!!form3.formState.errors.password, isPasswordSuccess)}>
                                                    <Lock size={18} />
                                                </Box>
                                            ),
                                            endAdornment: (
                                                <Box component="button" type="button" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide password' : 'Show password'} sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0.5, display: 'flex', color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
                                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </Box>
                                            ),
                                        },
                                    }}
                                    sx={inputSx}
                                />
                            </Box>

                            {/* Live strength meter */}
                            <PasswordStrengthMeter password={passwordValue} />

                            {/* Confirm Password */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="reg-confirm-password" sx={{ fontSize: '14px', fontWeight: 500, color: form3.formState.errors.confirmPassword ? 'error.main' : isConfirmSuccess ? '#059669' : isDark ? 'text.secondary' : '#374151', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                    Confirm Password
                                </Typography>
                                <TextField
                                    {...form3.register('confirmPassword')}
                                    id="reg-confirm-password"
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Repeat your password"
                                    error={!!form3.formState.errors.confirmPassword}
                                    className={isConfirmSuccess ? 'Mui-success' : ''}
                                    helperText={form3.formState.errors.confirmPassword ? (
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'error.main' }}>
                                            <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                            <span>{form3.formState.errors.confirmPassword.message}</span>
                                        </Box>
                                    ) : undefined}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Box sx={errorAdornment(!!form3.formState.errors.confirmPassword, isConfirmSuccess)}>
                                                    <Lock size={18} />
                                                </Box>
                                            ),
                                            endAdornment: (
                                                <Box component="button" type="button" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'} sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0.5, display: 'flex', color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
                                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </Box>
                                            ),
                                        },
                                    }}
                                    sx={inputSx}
                                />
                            </Box>

                            {/* Terms checkbox */}
                            <FormControlLabel
                                control={<Checkbox {...form3.register('termsAccepted')} id="reg-terms" size="small" color="primary" />}
                                label={
                                    <Typography variant="caption" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>
                                        I accept the{' '}
                                        <Link component={RouterLink} to="/terms" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms of Service</Link>
                                        {' '}and{' '}
                                        <Link component={RouterLink} to="/privacy" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Link>
                                    </Typography>
                                }
                            />
                            {form3.formState.errors.termsAccepted && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: -1.5, color: 'error.main' }}>
                                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                    <Typography variant="caption" role="alert" aria-live="polite" sx={{ fontFamily: "'DM Sans', sans-serif" }}>
                                        {form3.formState.errors.termsAccepted.message}
                                    </Typography>
                                </Box>
                            )}

                            {/* Nav buttons */}
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Box component="button" type="button" onClick={goBack} sx={{ flex: 1, height: 44, borderRadius: '12px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px', color: isDark ? '#E0F2F1' : '#4B5563', transition: 'all 0.2s ease', '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB', borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#D1D5DB' } }}>
                                    ← Back
                                </Box>
                                <Box
                                    component={motion.button}
                                    type="submit"
                                    disabled={isBusy}
                                    whileHover={isBusy ? {} : 'hover'}
                                    sx={{ flex: 2, height: 44, borderRadius: '12px', border: 'none', cursor: isBusy ? 'not-allowed' : 'pointer', background: isBusy ? 'rgba(0,106,106,0.5)' : 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, transition: 'all 0.2s ease', opacity: isBusy ? 0.9 : 1 }}
                                    aria-busy={isBusy}
                                >
                                    {isBusy ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Loader2 size={16} className="animate-spin" style={{ color: '#fff' }} />
                                            <span>Requesting…</span>
                                        </Box>
                                    ) : (
                                        <>
                                            <span>Request Access</span>
                                            <Box component={motion.span} variants={{ hover: { x: 3 } }} transition={{ duration: 0.2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <ArrowRight size={16} />
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Server error toast */}
            <AnimatePresence>
                {toastMessage && (
                    <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '12px', p: 2, px: 2.5, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 1.5, maxWidth: 360 }}
                    >
                        <XCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '13px', fontWeight: 500, flex: 1, fontFamily: "'DM Sans', sans-serif" }}>
                            {toastMessage}
                        </Typography>
                        <Box component="button" type="button" onClick={() => setToastMessage('')} sx={{ background: 'none', border: 'none', cursor: 'pointer', p: 0.5, display: 'flex', color: '#991B1B', opacity: 0.6, '&:hover': { opacity: 1 }, ml: 1 }}>
                            <X size={14} />
                        </Box>
                    </Box>
                )}
            </AnimatePresence>
        </Box>
    );
};
