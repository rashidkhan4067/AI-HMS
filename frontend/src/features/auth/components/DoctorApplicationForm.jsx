import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, TextField, MenuItem, Checkbox, FormControlLabel, Button, Alert, Divider, IconButton, Link } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    User, Mail, Phone, Calendar, Briefcase, FileText, CheckCircle2,
    UploadCloud, AlertCircle, ArrowRight, Loader2, ClipboardList, Check, Trash2
} from 'lucide-react';
import StepProgressBar from './StepProgressBar';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { api } from '../../../lib/api';

/* ── Zod Schemas for Doctor Application ── */
const docStep1Schema = z.object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters').trim(),
    email: z.string().min(1, 'Email is required').email('Invalid email address').trim().toLowerCase(),
    phone: z.string().min(7, 'Invalid phone number').max(15, 'Invalid phone number').regex(/^\d+$/, 'Digits only'),
    countryCode: z.string().min(1),
    dob: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { errorMap: () => ({ message: 'Please select a gender' }) }),
    city: z.string().min(2, 'City is required').trim(),
});

const docStep2Schema = z.object({
    specialization: z.string().min(1, 'Please select your specialization'),
    pmdcNumber: z.string().min(3, 'PMDC Registration Number is required').trim(),
    experienceYears: z.coerce.number().min(0, 'Experience years must be positive').max(60, 'Invalid experience years'),
    currentHospital: z.string().optional().or(z.literal('')),
});

const docStep3Schema = z.object({
    termsAccepted: z.boolean().refine(v => v === true, 'You must accept the Terms of Service'),
});

const slideVariants = (direction) => ({
    initial: { opacity: 0, x: direction === 'forward' ? 40 : -40 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit:    { opacity: 0, x: direction === 'forward' ? -40 : 40, transition: { duration: 0.25, ease: 'easeIn' } },
});

const inputSx = {
    '& .MuiOutlinedInput-root': { fontFamily: "'DM Sans', sans-serif" },
    '& .MuiInputLabel-root':   { fontFamily: "'DM Sans', sans-serif" },
};

export const DoctorApplicationForm = () => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState('forward');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [globalError, setGlobalError] = useState('');

    /* ── Document Upload State ── */
    const [pmdcFile, setPmdcFile] = useState(null);
    const [pmdcFileError, setPmdcFileError] = useState('');
    const [cnicFile, setCnicFile] = useState(null);
    const [cnicFileError, setCnicFileError] = useState('');

    /* ── Form Data State ── */
    const [step1Data, setStep1Data] = useState({});
    const [step2Data, setStep2Data] = useState({});

    /* ── Step Forms ── */
    const form1 = useForm({
        resolver: zodResolver(docStep1Schema),
        mode: 'onBlur',
        defaultValues: { fullName: '', email: '', phone: '', countryCode: '+92', dob: '', gender: '', city: '' }
    });

    const form2 = useForm({
        resolver: zodResolver(docStep2Schema),
        mode: 'onBlur',
        defaultValues: { specialization: '', pmdcNumber: '', experienceYears: '', currentHospital: '' }
    });

    const form3 = useForm({
        resolver: zodResolver(docStep3Schema),
        defaultValues: { termsAccepted: false }
    });

    const validateFileUpload = (file, setError) => {
        if (!file) {
            setError('File is required.');
            return false;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size cannot exceed 5MB.');
            return false;
        }
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'jpg', 'jpeg'].includes(ext)) {
            setError('Only PDF and JPG/JPEG files are accepted.');
            return false;
        }
        setError('');
        return true;
    };

    const handlePmdcChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (validateFileUpload(file, setPmdcFileError)) {
                setPmdcFile(file);
            } else {
                setPmdcFile(null);
            }
        }
    };

    const handleCnicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (validateFileUpload(file, setCnicFileError)) {
                setCnicFile(file);
            } else {
                setCnicFile(null);
            }
        }
    };

    const goNext = (data) => {
        setDirection('forward');
        if (step === 1) {
            setStep1Data(data);
            setStep(2);
        } else if (step === 2) {
            let valid = true;
            if (!pmdcFile) {
                setPmdcFileError('PMDC certificate is required.');
                valid = false;
            }
            if (!cnicFile) {
                setCnicFileError('CNIC document is required.');
                valid = false;
            }
            if (!valid) return;
            setStep2Data(data);
            setStep(3);
        }
    };

    const goBack = () => {
        setDirection('backward');
        setStep(prev => Math.max(1, prev - 1));
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        setGlobalError('');
        try {
            const formData = new FormData();
            formData.append('full_name', step1Data.fullName);
            formData.append('email', step1Data.email);
            formData.append('phone', `${step1Data.countryCode}${step1Data.phone}`);
            formData.append('dob', step1Data.dob);
            formData.append('gender', step1Data.gender);
            formData.append('city', step1Data.city);
            formData.append('specialization', step2Data.specialization);
            formData.append('pmdc_number', step2Data.pmdcNumber);
            formData.append('experience_years', step2Data.experienceYears);
            if (step2Data.currentHospital) {
                formData.append('current_hospital', step2Data.currentHospital);
            }
            formData.append('pmdc_certificate', pmdcFile);
            formData.append('cnic_document', cnicFile);

            await api.post('v1/auth/apply-doctor/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsSuccess(true);
        } catch (err) {
            const errData = err.response?.data;
            let msg = 'Submission failed. Please check your inputs.';
            if (errData) {
                if (typeof errData === 'string') msg = errData;
                else msg = errData.detail || Object.values(errData).flat().join(' ');
            }
            setGlobalError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2.5, py: 2 }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(0,106,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={44} color="#006A6A" />
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '22px', mb: 0.75, color: isDark ? '#E0F2F1' : '#161D1D' }}>
                            Application Submitted
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', lineHeight: 1.6, maxWidth: 320 }}>
                            Our team will review your credentials and contact you within 2-3 business days.
                        </Typography>
                    </Box>
                    <Button
                        component={RouterLink}
                        to="/login"
                        variant="contained"
                        sx={{ mt: 1, px: 4, py: 1.25, borderRadius: '12px', background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', textTransform: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
                    >
                        Back to Login
                    </Button>
                </Box>
            </motion.div>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <StepProgressBar steps={['Personal Info', 'Credentials', 'Review & Submit']} currentStep={step} completedSteps={Array.from({ length: step - 1 }, (_, i) => i + 1)} />

            {globalError && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                    {globalError}
                </Alert>
            )}

            <AnimatePresence mode="wait">
                {/* ═══ STEP 1 — Personal Information ═══ */}
                {step === 1 && (
                    <motion.div key="step1" {...slideVariants(direction)} initial="initial" animate="animate" exit="exit">
                        <Box component="form" onSubmit={form1.handleSubmit(goNext)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} noValidate>
                            
                            {/* Full Name */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="doc-fullname" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                    Full Name
                                </Typography>
                                <TextField
                                    {...form1.register('fullName')}
                                    id="doc-fullname"
                                    placeholder="Dr. John Smith"
                                    error={!!form1.formState.errors.fullName}
                                    helperText={form1.formState.errors.fullName?.message}
                                    slotProps={{ input: { startAdornment: <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}><User size={18} /></Box> } }}
                                    sx={inputSx}
                                />
                            </Box>

                            {/* Date of Birth & Gender row */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {/* Date of Birth */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Typography component="label" htmlFor="doc-dob" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                        Date of Birth
                                    </Typography>
                                    <TextField
                                        {...form1.register('dob')}
                                        id="doc-dob"
                                        type="date"
                                        error={!!form1.formState.errors.dob}
                                        helperText={form1.formState.errors.dob?.message}
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
                                    <Typography component="label" htmlFor="doc-gender" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", mb: 0.75 }}>Gender</Typography>
                                    <TextField
                                        {...form1.register('gender')}
                                        select
                                        SelectProps={{ displayEmpty: true }}
                                        id="doc-gender"
                                        defaultValue=""
                                        error={!!form1.formState.errors.gender}
                                        helperText={form1.formState.errors.gender?.message}
                                        sx={inputSx}
                                    >
                                        <MenuItem value="" disabled sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.disabled' }}>Select gender</MenuItem>
                                        <MenuItem value="MALE" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Male</MenuItem>
                                        <MenuItem value="FEMALE" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Female</MenuItem>
                                        <MenuItem value="OTHER" sx={{ fontFamily: "'DM Sans', sans-serif" }}>Other</MenuItem>
                                    </TextField>
                                </Box>
                            </Box>

                            {/* Email & City row */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {/* Email */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Typography component="label" htmlFor="doc-email" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", display: 'block', mb: 0.75 }}>
                                        Personal Email
                                    </Typography>
                                    <TextField
                                        {...form1.register('email')}
                                        id="doc-email"
                                        type="email"
                                        placeholder="doctor@gmail.com"
                                        error={!!form1.formState.errors.email}
                                        helperText={form1.formState.errors.email?.message}
                                        slotProps={{ input: { startAdornment: <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}><Mail size={18} /></Box> } }}
                                        sx={inputSx}
                                    />
                                </Box>

                                {/* City */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Typography component="label" htmlFor="doc-city" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", mb: 0.75 }}>City of Practice</Typography>
                                    <TextField
                                        {...form1.register('city')}
                                        id="doc-city"
                                        placeholder="Lahore"
                                        error={!!form1.formState.errors.city}
                                        helperText={form1.formState.errors.city?.message}
                                        sx={inputSx}
                                    />
                                </Box>
                            </Box>

                            {/* Phone */}
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'start' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: 96, flexShrink: 0 }}>
                                    <Typography component="label" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", mb: 0.75 }}>Code</Typography>
                                    <Box component="select" {...form1.register('countryCode')} sx={{ height: 44, borderRadius: '12px', border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#E5E7EB', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF', color: isDark ? '#E0F2F1' : '#111827', pl: 1.5, pr: 2, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', outline: 'none' }}>
                                        <option value="+92">🇵🇰 +92</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                        <option value="+971">🇦🇪 +971</option>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Typography component="label" htmlFor="doc-phone" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", mb: 0.75 }}>Phone Number</Typography>
                                    <TextField
                                        {...form1.register('phone')}
                                        id="doc-phone"
                                        placeholder="3001234567"
                                        error={!!form1.formState.errors.phone}
                                        helperText={form1.formState.errors.phone?.message}
                                        slotProps={{ input: { startAdornment: <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}><Phone size={18} /></Box> } }}
                                        sx={inputSx}
                                    />
                                </Box>
                            </Box>

                            {/* Next CTA */}
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ mt: 1, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', textTransform: 'none', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                            >
                                <span>Continue</span>
                                <ArrowRight size={16} />
                            </Button>

                            <Typography variant="body2" sx={{ textAlign: 'center', fontFamily: "'DM Sans', sans-serif", color: 'text.secondary', mt: 1 }}>
                                Already have an account?{' '}
                                <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </motion.div>
                )}

                {/* ═══ STEP 2 — Professional Credentials ═══ */}
                {step === 2 && (
                    <motion.div key="step2" {...slideVariants(direction)} initial="initial" animate="animate" exit="exit">
                        <Box component="form" onSubmit={form2.handleSubmit(goNext)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} noValidate>
                            
                            {/* Specialization */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="doc-specialization" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", mb: 0.75 }}>Medical Specialization</Typography>
                                <TextField
                                    {...form2.register('specialization')}
                                    select
                                    id="doc-specialization"
                                    defaultValue=""
                                    error={!!form2.formState.errors.specialization}
                                    helperText={form2.formState.errors.specialization?.message}
                                    slotProps={{ input: { startAdornment: <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}><Briefcase size={18} /></Box> } }}
                                    sx={inputSx}
                                >
                                    <MenuItem value="">— Select Specialization —</MenuItem>
                                    {['Cardiology', 'Neurology', 'Orthopedics', 'General Practice', 'Pediatrics', 'Gynecology', 'Dermatology', 'Radiology', 'Pathology', 'Other'].map(spec => (
                                        <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            {/* PMDC Number */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography component="label" htmlFor="doc-pmdc" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", mb: 0.75 }}>PMDC Registration Number</Typography>
                                <TextField
                                    {...form2.register('pmdcNumber')}
                                    id="doc-pmdc"
                                    placeholder="PMDC-12345-D"
                                    error={!!form2.formState.errors.pmdcNumber}
                                    helperText={form2.formState.errors.pmdcNumber?.message || "Your Pakistan Medical & Dental Council license number"}
                                    slotProps={{ input: { startAdornment: <Box sx={{ mr: 1, color: 'text.disabled', display: 'flex' }}><FileText size={18} /></Box> } }}
                                    sx={inputSx}
                                />
                            </Box>

                            {/* Experience & Hospital */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: 120 }}>
                                    <Typography component="label" htmlFor="doc-exp" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", mb: 0.75 }}>Experience</Typography>
                                    <TextField
                                        {...form2.register('experienceYears')}
                                        id="doc-exp"
                                        type="number"
                                        placeholder="5"
                                        error={!!form2.formState.errors.experienceYears}
                                        helperText={form2.formState.errors.experienceYears?.message}
                                        sx={inputSx}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Typography component="label" htmlFor="doc-hospital" sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", mb: 0.75 }}>Current Hospital</Typography>
                                    <TextField
                                        {...form2.register('currentHospital')}
                                        id="doc-hospital"
                                        placeholder="Mayo Clinic (optional)"
                                        error={!!form2.formState.errors.currentHospital}
                                        helperText={form2.formState.errors.currentHospital?.message}
                                        sx={inputSx}
                                    />
                                </Box>
                            </Box>

                            {/* Document Upload Zone */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 500, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                                    Required Documents
                                </Typography>
                                
                                {/* PMDC Certificate Upload */}
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontFamily: "'DM Sans', sans-serif" }}>PMDC Certificate (PDF/JPG, Max 5MB)</Typography>
                                    <Box
                                        sx={{
                                            border: pmdcFileError ? '1px dashed #D32F2F' : '1px dashed rgba(0, 106, 106, 0.4)',
                                            borderRadius: '12px',
                                            p: 2,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: isDark ? 'rgba(0,106,106,0.02)' : 'rgba(0,106,106,0.01)',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: '#006A6A', backgroundColor: isDark ? 'rgba(0,106,106,0.05)' : 'rgba(0,106,106,0.03)' }
                                        }}
                                        onClick={() => document.getElementById('pmdc-upload-input').click()}
                                    >
                                        <input
                                            id="pmdc-upload-input"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg"
                                            style={{ display: 'none' }}
                                            onChange={handlePmdcChange}
                                        />
                                        {pmdcFile ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Check size={16} color="#059669" />
                                                <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500 }}>
                                                    {pmdcFile.name}
                                                </Typography>
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPmdcFile(null); }} sx={{ color: 'error.main' }}>
                                                    <Trash2 size={14} />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                <UploadCloud size={20} color="#006A6A" />
                                                <Typography variant="caption" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>Click to upload PMDC certificate</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    {pmdcFileError && (
                                        <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: "'DM Sans', sans-serif" }}>
                                            <AlertCircle size={12} /> {pmdcFileError}
                                        </Typography>
                                    )}
                                </Box>

                                {/* CNIC Upload */}
                                <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontFamily: "'DM Sans', sans-serif" }}>CNIC Document (PDF/JPG, Max 5MB)</Typography>
                                    <Box
                                        sx={{
                                            border: cnicFileError ? '1px dashed #D32F2F' : '1px dashed rgba(0, 106, 106, 0.4)',
                                            borderRadius: '12px',
                                            p: 2,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: isDark ? 'rgba(0,106,106,0.02)' : 'rgba(0,106,106,0.01)',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: '#006A6A', backgroundColor: isDark ? 'rgba(0,106,106,0.05)' : 'rgba(0,106,106,0.03)' }
                                        }}
                                        onClick={() => document.getElementById('cnic-upload-input').click()}
                                    >
                                        <input
                                            id="cnic-upload-input"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg"
                                            style={{ display: 'none' }}
                                            onChange={handleCnicChange}
                                        />
                                        {cnicFile ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <Check size={16} color="#059669" />
                                                <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500 }}>
                                                    {cnicFile.name}
                                                </Typography>
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setCnicFile(null); }} sx={{ color: 'error.main' }}>
                                                    <Trash2 size={14} />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                <UploadCloud size={20} color="#006A6A" />
                                                <Typography variant="caption" sx={{ fontFamily: "'DM Sans', sans-serif", color: 'text.secondary' }}>Click to upload CNIC document</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    {cnicFileError && (
                                        <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: "'DM Sans', sans-serif" }}>
                                            <AlertCircle size={12} /> {cnicFileError}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            {/* Nav Buttons */}
                            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
                                <Button
                                    variant="outlined"
                                    onClick={goBack}
                                    sx={{ flex: 1, height: 44, borderRadius: '12px', textTransform: 'none', fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    ← Back
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{ flex: 2, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', textTransform: 'none', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                                >
                                    <span>Continue</span>
                                    <ArrowRight size={16} />
                                </Button>
                            </Box>
                        </Box>
                    </motion.div>
                )}

                {/* ═══ STEP 3 — Review & Submit ═══ */}
                {step === 3 && (
                    <motion.div key="step3" {...slideVariants(direction)} initial="initial" animate="animate" exit="exit">
                        <Box component="form" onSubmit={form3.handleSubmit(handleFinalSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }} noValidate>
                            
                            {/* Summary Card */}
                            <Box
                                sx={{
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,106,106,0.12)',
                                    borderRadius: '12px',
                                    p: 2.5,
                                    backgroundColor: isDark ? 'rgba(0,106,106,0.02)' : 'rgba(0,106,106,0.01)',
                                }}
                            >
                                <Typography variant="subtitle2" sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: 'primary.main', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ClipboardList size={18} /> Review Your Details
                                </Typography>
                                
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>Name</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{step1Data.fullName}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>Email</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{step1Data.email}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>Phone</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{step1Data.countryCode} {step1Data.phone}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>City</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{step1Data.city}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>Specialization</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{step2Data.specialization}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>PMDC License</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{step2Data.pmdcNumber}</Typography>
                                    </Box>
                                </Box>
                                
                                <Divider sx={{ my: 1.5 }} />

                                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1, fontFamily: "'DM Sans', sans-serif" }}>Uploaded Documents</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircle2 size={14} color="#059669" />
                                        <span>PMDC: {pmdcFile?.name}</span>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircle2 size={14} color="#059669" />
                                        <span>CNIC: {cnicFile?.name}</span>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Terms Checkbox */}
                            <Controller
                                name="termsAccepted"
                                control={form3.control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Checkbox {...field} checked={field.value} size="small" color="primary" />}
                                        label={
                                            <Typography variant="body2" sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'text.secondary' }}>
                                                I confirm that the above clinical credentials are correct and belong to me under PMDC guidelines.
                                            </Typography>
                                        }
                                    />
                                )}
                            />
                            {form3.formState.errors.termsAccepted && (
                                <Typography variant="caption" sx={{ color: 'error.main', mt: -1.5, display: 'flex', alignItems: 'center', gap: 0.5, fontFamily: "'DM Sans', sans-serif" }}>
                                    <AlertCircle size={12} /> {form3.formState.errors.termsAccepted.message}
                                </Typography>
                            )}

                            {/* Submit & Back */}
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <Button
                                    variant="outlined"
                                    onClick={goBack}
                                    disabled={isSubmitting}
                                    sx={{ flex: 1, height: 44, borderRadius: '12px', textTransform: 'none', fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    ← Back
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isSubmitting}
                                    sx={{ flex: 2, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)', textTransform: 'none', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Submitting…</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Submit Application</span>
                                            <Check size={16} />
                                        </>
                                    )}
                                </Button>
                            </Box>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};
