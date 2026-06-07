import { useState } from 'react';
import { Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
    Stethoscope, Heart, Phone, Shield, Pill,
    FlaskConical, Scan,
} from 'lucide-react';
import { AuthLayout } from '../../../shared/components/layout/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { api } from '../../../lib/api';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';

/* ── Role → icon mapping ── */
const ROLE_ICONS = {
    DOCTOR:         Stethoscope,
    NURSE:          Heart,
    RECEPTIONIST:   Phone,
    ADMIN:          Shield,
    PHARMACIST:     Pill,
    LAB_TECHNICIAN: FlaskConical,
    RADIOLOGIST:    Scan,
};

/* ── Email format guard — only triggers API if it looks like a real email ── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * RoleBadge — animated pill shown below the heading when we know the user.
 */
const RoleBadge = ({ userPreview }) => {
    const RoleIcon = ROLE_ICONS[userPreview?.role] || Stethoscope;
    const label    = userPreview?.department
        ? `${userPreview.role_label} · ${userPreview.department}`
        : userPreview?.role_label;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{   opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'inline-block', marginBottom: 20 }}
        >
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
        </motion.div>
    );
};

/**
 * HeadingBlock — animated title + subtitle + optional role badge.
 * Re-animates whenever `animKey` changes (driven by email value).
 */
const HeadingBlock = ({ userPreview, isCheckingEmail, animKey, isDark, typeParam, applyParam }) => {
    const heading  = userPreview?.first_name ? `Welcome back, ${userPreview.first_name}` : 'Welcome back';
    
    let defaultSubtitle = 'Sign in to your clinical workspace';
    if (typeParam === 'patient') {
        defaultSubtitle = 'Sign in to your patient health portal';
    } else if (applyParam === 'doctor') {
        defaultSubtitle = 'Sign in to your doctor workspace';
    }

    const subtitle = userPreview && userPreview.role_label
        ? `${userPreview.role_label}${userPreview.department ? ` · ${userPreview.department}` : ''}`
        : defaultSubtitle;

    return (
        <Box sx={{ mb: 3 }}>
            {isCheckingEmail ? (
                /* Shimmer skeleton while fetching */
                <Box sx={{ mb: 0.75 }}>
                    <Box
                        sx={{
                            height:       32,
                            width:        192,
                            borderRadius: '8px',
                            background:   isDark
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(0,0,0,0.07)',
                            animation:    'pulse 1.4s ease-in-out infinite',
                            '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%':      { opacity: 0.4 },
                            },
                        }}
                    />
                    <Box
                        sx={{
                            height:       16,
                            width:        260,
                            borderRadius: '6px',
                            background:   isDark
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.05)',
                            animation:    'pulse 1.4s ease-in-out 0.2s infinite',
                            mt:           1,
                        }}
                    />
                </Box>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={animKey}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{   opacity: 0, y:  8 }}
                        transition={{ duration: 0.25 }}
                    >
                        {/* h1 heading */}
                        <Box
                            component="h1"
                            sx={{
                                fontFamily:    "'DM Sans', sans-serif",
                                fontWeight:    600,
                                fontSize:      '26px',
                                letterSpacing: '-0.5px',
                                color:         isDark ? '#E0F2F1' : '#161D1D',
                                mt:            0,
                                mb:            0.5,
                                lineHeight:    1.25,
                            }}
                        >
                            {heading}
                        </Box>

                        {/* Subtitle */}
                        <Box
                            component="p"
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                color:      isDark ? 'text.secondary' : '#6B7280',
                                fontSize:   '14px',
                                lineHeight: 1.5,
                                m:          0,
                            }}
                        >
                            {subtitle}
                        </Box>
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Role badge — only when we have a preview */}
            <AnimatePresence>
                {!isCheckingEmail && userPreview && userPreview.role !== 'PATIENT' && (
                    <RoleBadge userPreview={userPreview} />
                )}
            </AnimatePresence>
        </Box>
    );
};

/**
 * LoginPage — Al Shifaa HMS clinical login portal.
 *
 * Owns the email-check state so the heading personalises
 * after the user blurs a valid email address.
 */
export const LoginPage = () => {
    const { mode } = useThemeMode();
    const isDark   = mode === 'dark';
    const [searchParams] = useSearchParams();
    const typeParam = searchParams.get('type');
    const applyParam = searchParams.get('apply');

    const [userPreview,     setUserPreview]     = useState(null);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [checkedEmail,    setCheckedEmail]    = useState('');   // drives animation key
    const [detectedShowcaseMode, setDetectedShowcaseMode] = useState(null);

    const handleEmailBlur = async (emailValue) => {
        const email = (emailValue || '').trim();

        // Guard: skip empty or malformed
        if (!email || !EMAIL_RE.test(email)) {
            setUserPreview(null);
            setDetectedShowcaseMode(null);
            return;
        }

        // Skip redundant re-checks for same email
        if (email === checkedEmail && userPreview) return;

        setIsCheckingEmail(true);
        try {
            const res = await api.post('v1/auth/check-email/', { email });
            if (res.data?.exists) {
                setUserPreview(res.data);
                const userRole = res.data.role;
                if (userRole === 'PATIENT') {
                    setDetectedShowcaseMode('patient');
                } else if (userRole === 'DOCTOR') {
                    setDetectedShowcaseMode('doctor');
                } else if (['NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'ADMIN'].includes(userRole)) {
                    setDetectedShowcaseMode('staff');
                } else {
                    setDetectedShowcaseMode('general');
                }
            } else {
                setUserPreview(null);
                setDetectedShowcaseMode(null);
            }
            setCheckedEmail(email);
        } catch {
            setUserPreview(null);
            setDetectedShowcaseMode(null);
        } finally {
            setIsCheckingEmail(false);
        }
    };

    /* animKey changes every time the personalization changes → triggers AnimatePresence */
    const animKey = userPreview ? `preview-${userPreview.first_name}` : 'default';

    return (
        <AuthLayout
            /* Pass null title/subtitle — we render our own animated block */
            title={null}
            subtitle={null}
            showcaseMode={detectedShowcaseMode || undefined}
            headingSlot={
                <HeadingBlock
                    userPreview={userPreview}
                    isCheckingEmail={isCheckingEmail}
                    animKey={animKey}
                    isDark={isDark}
                    typeParam={typeParam}
                    applyParam={applyParam}
                />
            }
        >
            <LoginForm onEmailBlur={handleEmailBlur} />
        </AuthLayout>
    );
};
