import { useState, useEffect } from 'react';
import { Box, Typography, Card, Link } from '@mui/material';
import { Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Check, ArrowLeft } from 'lucide-react';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { BrandPanel } from '../../../components/auth/BrandPanel';

/* ─────────────────────────────────────────────
   Al Shifaa SVG Logo Mark
   ───────────────────────────────────────────── */
const AlShifaaLogo = ({ size = 40, white = false }) => {
    const primaryColor = white ? '#FFFFFF' : '#006A6A';
    const backingOpacity = white ? 0.22 : 0.12;
    const accentColor = white ? 'rgba(255, 255, 255, 0.75)' : '#4DB6AC';
    const waveColor = white ? '#004D40' : '#FFFFFF';

    return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Rounded hospital cross backing */}
            <rect x="16" y="4" width="16" height="40" rx="6" fill={primaryColor} fillOpacity={backingOpacity} />
            <rect x="4" y="16" width="40" height="16" rx="6" fill={primaryColor} fillOpacity={backingOpacity} />

            {/* Inner solid cross */}
            <rect x="18.5" y="7" width="11" height="34" rx="4" fill={primaryColor} />
            <rect x="7" y="18.5" width="34" height="11" rx="4" fill={primaryColor} />

            {/* Pulse wave (ECG) drawing inside cross */}
            <path
                d="M 12 24 L 20 24 L 22.5 17 L 25.5 31 L 28 21 L 30 24 L 36 24"
                stroke={waveColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Accent healing leaf / crescent in mint green */}
            <path
                d="M32 14c-3.5 0-7 2.5-7.5 6 2.5-0.5 5.5 1 6.5 3.5 1-2.5 3.5-4 7-4 0-3.5-2.5-5.5-6-5.5z"
                fill={accentColor}
            />
        </svg>
    );
};

/* ─────────────────────────────────────────────
   Main AuthLayout — Split Panel
   ───────────────────────────────────────────── */

const pageVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut', delay: 0.05 } },
};

const SHOWCASE_DATA = {
    patient: {
        tagline: "Trusted Healthcare. Seamless Management.",
        description: "Al Shifaa Patient Portal gives you secure, direct access to your electronic health records, lab reports, and seamless doctor scheduling.",
        stats: [
            { value: "100%", label: "Encrypted" },
            { value: "24/7", label: "Portal Access" },
            { value: "15 min", label: "Response" }
        ]
    },
    doctor: {
        tagline: "Trusted Healthcare. Seamless Management.",
        description: "Join Pakistan's leading digital health network. Streamline your clinic workflow, write digital prescriptions, and connect with patients easily.",
        stats: [
            { value: "500+", label: "Specialists" },
            { value: "90%", label: "Admin Saved" },
            { value: "PMDC", label: "Verified" }
        ]
    },
    staff: {
        tagline: "Trusted Healthcare. Seamless Management.",
        description: "Complete your onboarding registration to access Al Shifaa's unified Hospital Management System (HMS) and coordinate daily patient workflows.",
        stats: [
            { value: "HMS", label: "ERP Sync" },
            { value: "Role-Based", label: "Access Control" },
            { value: "Zero-Trust", label: "Audited System" }
        ]
    },
    general: {
        tagline: "Trusted Healthcare. Seamless Management.",
        description: "Enterprise-grade hospital operations platform built for Pakistan's leading clinical institutions.",
        stats: [
            { value: "1,200+", label: "Patients served" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "ISO 27001", label: "Certified" }
        ]
    }
};

export const AuthLayout = ({ children, title, subtitle, headingSlot, showcaseMode: propShowcaseMode, panelVariant }) => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Determine the panel variant based on prop or route path
    let activeVariant = panelVariant;
    if (!activeVariant) {
        const path = location.pathname;
        if (path.includes('/register')) {
            activeVariant = 'register';
        } else if (path.includes('/forgot-password') || path.includes('/forgotpassword')) {
            activeVariant = 'forgot_password';
        } else if (path.includes('/verify-otp') || path.includes('/verifyotp') || path.includes('/otp')) {
            activeVariant = 'otp';
        } else if (path.includes('/reset-password') || path.includes('/resetpassword')) {
            activeVariant = 'reset_password';
        } else {
            activeVariant = 'login';
        }
    }

    return (
        <Box
            component={motion.div}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            sx={{
                minHeight: '100dvh',
                height: { md: '100dvh' },
                display: 'flex',
                backgroundColor: isDark ? '#0F1515' : '#F4FBFB',
                position: 'relative',
                overflowX: 'hidden',
                overflowY: { xs: 'auto', md: 'hidden' },
            }}
        >
            {/* Back to Home floating link */}
            <Box
                sx={{
                    position: 'absolute',
                    top: { xs: 16, md: 24 },
                    right: { xs: 16, md: 24 },
                    zIndex: 10,
                }}
            >
                <Link
                    component={RouterLink}
                    to="/"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        fontSize: '13px',
                        fontFamily: "'Inter', 'DM Sans', sans-serif",
                        fontWeight: 600,
                        color: isDark ? '#BEC9C8' : '#4A6363',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            color: '#006A6A',
                            transform: 'translateX(-2px)',
                        }
                    }}
                >
                    <ArrowLeft size={14} />
                    <span>Back to Website</span>
                </Link>
            </Box>

            {/* ── Subtle background mesh (right side only) ── */}
            <Box
                sx={{
                    position: 'fixed',
                    top: '5%',
                    right: '-5%',
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    background: isDark
                        ? 'radial-gradient(circle, rgba(0,106,106,0.08) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(0,106,106,0.06) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                }}
            />

            {/* ══════════════════════════════════════════
                LEFT PANEL — Contextual Brand Panel
            ══════════════════════════════════════════ */}
            <BrandPanel variant={activeVariant} />

            {/* ══════════════════════════════════════════
                RIGHT PANEL — Auth Card
            ══════════════════════════════════════════ */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { xs: 2, sm: 5 }, // px-4 on mobile for better breathing room, px-10 on sm+
                    py: { xs: 4, md: 5 },
                    boxSizing: 'border-box',
                    zIndex: 1,
                    overflowY: 'auto',
                    minHeight: '100dvh', // Use dvh for dynamic viewport heights on mobile
                    height: { xs: 'auto', md: '100dvh' },
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', sm: 440, md: 480, lg: 520 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Card */}
                    <Card
                        component={motion.div}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        elevation={0}
                        sx={{
                            position: 'relative',
                            overflow: 'visible',
                            width: '100%',
                            maxWidth: { xs: '100%', sm: 440, md: 480, lg: 520 },
                            borderRadius: '20px',
                            px: { xs: 3, sm: 3.5 },
                            pt: { xs: 3, sm: 3.5 },
                            pb: { xs: 3, sm: 3.5 },
                            boxShadow: isDark
                                ? '0 8px 24px -4px rgba(0,0,0,0.45), 0 2px 8px -2px rgba(0,0,0,0.25)'
                                : '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 6px -1px rgba(0,0,0,0.04)',
                            border: isDark
                                ? '1px solid rgba(255,255,255,0.08)'
                                : '1px solid rgba(0,106,106,0.1)',
                            backgroundColor: isDark
                                ? 'rgba(22,30,30,0.95)'
                                : '#FFFFFF',
                            backdropFilter: 'blur(24px)',
                        }}
                    >
                        {/* Logo row at the top-left of the card */}
                        <Box
                            component={RouterLink}
                            to="/"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 3,
                                textDecoration: 'none',
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.85,
                                }
                            }}
                        >
                            <AlShifaaLogo size={24} />
                            <Typography
                                sx={{
                                    fontFamily: "'Outfit', 'DM Sans', sans-serif",
                                    fontWeight: 600,
                                    fontSize: '14px',
                                    color: '#006A6A',
                                    lineHeight: 1,
                                }}
                            >
                                Al Shifaa HMS
                            </Typography>
                        </Box>

                        {/* Title / Subtitle — or custom headingSlot injected by the page */}
                        {headingSlot
                            ? headingSlot
                            : (title || subtitle) && (
                                <Box sx={{ mb: 3, textAlign: 'left', width: '100%' }}>
                                    {title && (
                                        <Typography
                                            component="h1"
                                            sx={{
                                                fontFamily: "'DM Sans', sans-serif",
                                                fontWeight: 600,
                                                fontSize: '24px',
                                                letterSpacing: '-0.5px',
                                                color: isDark ? '#E0F2F1' : '#161D1D',
                                                mt: 0,
                                                mb: 0.5,
                                                lineHeight: 1.25,
                                            }}
                                        >
                                            {title}
                                        </Typography>
                                    )}
                                    {subtitle && (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontFamily: "'DM Sans', sans-serif",
                                                color: isDark ? 'text.secondary' : '#6B7280',
                                                fontSize: '14px',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {subtitle}
                                        </Typography>
                                    )}
                                </Box>
                            )
                        }

                        {/* Form content */}
                        {children}

                        {/* Security Notification Banner inside the card */}
                        <Box
                            sx={{
                                width: '100%',
                                mt: 2.5,
                                p: 1.5, // p-3
                                borderRadius: '12px', // rounded-xl
                                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB', // bg-gray-50
                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F3F4F6', // border-gray-100
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1, // gap-2
                                boxSizing: 'border-box',
                            }}
                        >
                            <ShieldCheck size={14} color="#006A6A" style={{ flexShrink: 0 }} />
                            <Typography
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '12px', // text-xs
                                    color: isDark ? '#A3B3B3' : '#6B7280', // text-gray-500
                                    lineHeight: 1.3,
                                }}
                            >
                                Your data is secure and encrypted
                            </Typography>
                        </Box>

                        {/* Compact Footer inside the card */}
                        <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    color: isDark ? '#6B7280' : '#9CA3AF', // text-gray-400
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '11px',
                                    fontWeight: 400,
                                }}
                            >
                                © {new Date().getFullYear()} Al Shifaa Health Systems •{' '}
                                <Link
                                    component={RouterLink}
                                    to="/privacy"
                                    sx={{
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        '&:hover': { color: '#006A6A', textDecoration: 'underline' },
                                    }}
                                >
                                    Privacy Policy
                                </Link>{' '}
                                •{' '}
                                <Link
                                    component={RouterLink}
                                    to="/terms"
                                    sx={{
                                        color: 'inherit',
                                        textDecoration: 'none',
                                        '&:hover': { color: '#006A6A', textDecoration: 'underline' },
                                    }}
                                >
                                    Terms of Service
                                </Link>
                            </Typography>
                        </Box>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
