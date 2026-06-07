import { z } from 'zod';

/* ── Shared field schemas ── */
const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address');

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9!@#$%^&*]/, 'Must contain a number or symbol');

const pakistanPhoneSchema = z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(16, 'Phone number too long')
    .refine((val) => {
        const clean = val.replace(/\D/g, '');
        return /^(92)?(0?3)\d{9}$/.test(clean) || /^3\d{9}$/.test(clean);
    }, 'Enter a valid Pakistani mobile number (e.g. 0300-1234567)');

/* ── Login ── */
export const loginSchema = z.object({
    email:      emailSchema,
    password:   z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
    role:       z.string().optional(),
});

/* ── Register — Step 1: Personal Info ── */
export const registerStep1Schema = z.object({
    fullName:    z.string().min(2, 'Full name is required'),
    email:       emailSchema,
    phone:       pakistanPhoneSchema,
});

/* ── Register — Step 2: Role & Department ── */
export const registerStep2Schema = z.object({
    role:        z.string().min(1, 'Please select a role'),
    department:  z.string().optional(),
    licenseNo:   z.string().optional(),
});

/* ── Register — Step 3: Security ── */
export const registerStep3Schema = z
    .object({
        password:         passwordSchema,
        confirmPassword:  z.string().min(1, 'Please confirm your password'),
        termsAccepted:    z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path:    ['confirmPassword'],
    });

/* ── Forgot Password ── */
export const forgotPasswordSchema = z.object({
    email: emailSchema,
});

/* ── OTP Verification ── */
export const otpSchema = z.object({
    otp: z
        .string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

/* ── Reset Password ── */
export const resetPasswordSchema = z
    .object({
        password:        passwordSchema,
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path:    ['confirmPassword'],
    });

/* ── Complete Profile (Google SSO users) ── */
export const completeProfileSchema = z.object({
    department:  z.string().min(1, 'Please select a department'),
    employeeId:  z.string().optional(),
    phone:       z.string().optional(),
    termsAccepted: z.literal(true, {
        errorMap: () => ({ message: 'You must accept the Terms of Service to continue' }),
    }),
});

/* ── Staff Invite Form ── */
export const staffInviteFormSchema = z.object({
    fullName:    z.string().min(2, 'Full name is required'),
    email:       emailSchema,
    phone:       pakistanPhoneSchema,
    password:    passwordSchema,
    termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
});

/* ── Patient Registration — Step 1: Personal Info ── */
export const patientStep1Schema = z.object({
    fullName:    z.string().min(2, 'Full name is required'),
    dob:         z.string().min(1, 'Date of birth is required'),
    gender:      z.string().min(1, 'Please select a gender'),
    cnic:        z.string().regex(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must match format XXXXX-XXXXXXX-X'),
    email:       emailSchema,
    phone:       pakistanPhoneSchema,
});

/* ── Patient Registration — Step 2: Account Security & Emergency Contact ── */
export const patientStep2Schema = z
    .object({
        password:                     passwordSchema,
        confirmPassword:              z.string().min(1, 'Please confirm your password'),
        emergencyContactName:         z.string().min(2, 'Emergency contact name is required'),
        emergencyContactRelationship: z.string().min(1, 'Please select a relationship'),
        emergencyContactPhone:        pakistanPhoneSchema,
        termsAccepted:                z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path:    ['confirmPassword'],
    });

