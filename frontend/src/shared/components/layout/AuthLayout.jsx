import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Card, Link } from '@mui/material';
import { Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CalendarCheck2, Brain, Star, Lock } from 'lucide-react';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../../../app/theme/ThemeModeContext';
import { BrandIllustration } from '../../../components/auth/BrandIllustration';

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
   Animated ECG / Heartbeat SVG
───────────────────────────────────────────── */
const EcgLine = () => (
    <Box sx={{ width: '100%', height: 48, opacity: 0.4, mb: 2.5 }}>
        <svg viewBox="0 0 400 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <motion.path
                d="M0 24 L60 24 L80 4 L95 44 L110 10 L125 38 L140 24 L200 24 L220 24 L240 4 L255 44 L270 10 L285 38 L300 24 L400 24"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
            />
        </svg>
    </Box>
);

/* ─────────────────────────────────────────────
   Rotating Feature Pills
   ───────────────────────────────────────────── */
const FeaturePills = ({ pills = [] }) => {
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        if (pills.length <= 1) return;
        const timer = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % pills.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [pills]);

    const activePills = pills.length > 0 ? pills : [
        { icon: ShieldCheck,    label: 'Secure Patient Records' },
        { icon: CalendarCheck2, label: 'Real-time Appointments' },
        { icon: Brain,          label: 'AI-powered Insights' },
    ];

    return (
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 3, flexWrap: 'wrap', mb: 3 }}>
            {activePills.map((pill, idx) => {
                const Icon = pill.icon;
                const isActive = idx === activeIdx;

                return (
                    <Box
                        key={pill.label}
                        component={motion.div}
                        whileHover={{ scale: 1.04 }}
                        transition={{ duration: 0.2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 0.75,
                            borderRadius: '9999px',
                            border: '1px solid',
                            borderColor: isActive ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)',
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                            color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.9)',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s, border-color 0.3s, color 0.3s',
                        }}
                    >
                        <Icon size={16} color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'} />
                        <Typography
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 500,
                                fontSize: '13px',
                                lineHeight: 1.2,
                            }}
                        >
                            {pill.label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
};

/* ─────────────────────────────────────────────
   Stars Rating
───────────────────────────────────────────── */
const FiveStars = () => (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
        {Array(5).fill(null).map((_, i) => (
            <Star key={i} size={16} fill="#FACC15" color="#FACC15" />
        ))}
    </Box>
);

/* ─────────────────────────────────────────────
   Main AuthLayout — Split Panel
───────────────────────────────────────────── */

const pageVariants = {
    hidden:  { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const cardVariants = {
    hidden:  { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut', delay: 0.05 } },
};

const SHOWCASE_DATA = {
    patient: {
        tagline: <>Your Health, Connected.<br />Care At Your Fingertips.</>,
        description: "Al Shifaa Patient Portal gives you secure, direct access to your electronic health records, lab reports, and seamless doctor scheduling.",
        pills: [
            { icon: ShieldCheck, label: "Encrypted Health Data" },
            { icon: CalendarCheck2, label: "24/7 Appointment Booking" },
            { icon: Brain, label: "Instant Lab Reports" }
        ],
        trustText: "Access your medical records securely from anywhere in Pakistan.",
        stats: [
            { value: "100%", label: "Secure & Encrypted", color: "#4DB6AC" },
            { value: "24/7", label: "Instant Portal Access", color: "#4DB6AC" },
            { value: "15 min", label: "Average Response", color: "#4DB6AC" }
        ]
    },
    doctor: {
        tagline: <>Empowering Doctors.<br />Elevating Patient Care.</>,
        description: "Join Pakistan's leading digital health network. Streamline your clinic workflow, write digital prescriptions, and connect with patients easily.",
        pills: [
            { icon: ShieldCheck, label: "Smart Practice ERP" },
            { icon: CalendarCheck2, label: "Telehealth & Clinic Slots" },
            { icon: Brain, label: "E-Prescriptions & History" }
        ],
        trustText: "Empowering 500+ premium clinicians nationwide.",
        stats: [
            { value: "500+", label: "Verified Specialists", color: "#4DB6AC" },
            { value: "90%", label: "Reduced Admin Overhead", color: "#4DB6AC" },
            { value: "PMDC", label: "Verified Registration", color: "#4DB6AC" }
        ]
    },
    staff: {
        tagline: <>Secure Hospital Operations.<br />Unified Coordination.</>,
        description: "Complete your onboarding registration to access Al Shifaa's unified Hospital Management System (HMS) and coordinate daily patient workflows.",
        pills: [
            { icon: ShieldCheck, label: "Zero-Trust Data Protection" },
            { icon: CalendarCheck2, label: "Real-time Bed & Room Tracker" },
            { icon: Brain, label: "Integrated Lab & Pharmacy" }
        ],
        trustText: "Audited & secured in compliance with ISO & Zero-Trust standards.",
        stats: [
            { value: "HMS", label: "Unified ERP Sync", color: "#4DB6AC" },
            { value: "Role-Based", label: "Granular Access Security", color: "#4DB6AC" },
            { value: "Zero-Trust", label: "Audited System Logs", color: "#4DB6AC" }
        ]
    },
    general: {
        tagline: <>Trusted Healthcare.<br />Seamless Management.</>,
        description: "Enterprise-grade hospital operations platform built for Pakistan's leading clinical institutions.",
        pills: [
            { icon: ShieldCheck, label: "Secure Patient Records" },
            { icon: CalendarCheck2, label: "Real-time Appointments" },
            { icon: Brain, label: "AI-powered Insights" }
        ],
        trustText: <>Trusted by <Box component="span" sx={{ color: '#FFFFFF', fontWeight: 600 }}>50+ hospitals</Box> across Pakistan</>,
        stats: [
            { value: "1,200+", label: "Patients Managed", color: "#9CF1F0" },
            { value: "99.9%", label: "System Uptime", color: "#9CF1F0" },
            { value: "50+", label: "Hospitals Onboarded", color: "#9CF1F0" }
        ]
    }
};

export const AuthLayout = ({ children, title, subtitle, headingSlot, showcaseMode: propShowcaseMode }) => {
    const { mode, toggleThemeMode } = useThemeMode();
    const isDark = mode === 'dark';
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Determine showcaseMode automatically if not explicitly provided as a prop
    let showcaseMode = propShowcaseMode;
    if (!showcaseMode) {
        const typeParam = searchParams.get('type');
        const applyParam = searchParams.get('apply');
        const inviteParam = searchParams.get('invite');

        if (typeParam === 'patient') {
            showcaseMode = 'patient';
        } else if (applyParam === 'doctor') {
            showcaseMode = 'doctor';
        } else if (inviteParam) {
            showcaseMode = 'staff';
        } else {
            showcaseMode = 'general';
        }
    }

    const currentShowcase = SHOWCASE_DATA[showcaseMode] || SHOWCASE_DATA['general'];

    return (
        <Box
            component={motion.div}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                backgroundColor: isDark ? '#0F1515' : '#F4FBFB',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
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

            {/* ── HTTPS Lock Badge (top-right) ── */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 16,
                    right: 16,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '9999px',
                    backgroundColor: isDark ? 'rgba(0,106,106,0.15)' : 'rgba(0,106,106,0.08)',
                    border: '1px solid rgba(0,106,106,0.2)',
                }}
            >
                <Lock size={11} color="#006A6A" />
                <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, color: '#006A6A', fontFamily: "'DM Sans', sans-serif" }}>
                    HTTPS Secure
                </Typography>
                {/* Theme toggle */}
                <IconButton
                    onClick={toggleThemeMode}
                    size="small"
                    sx={{ p: 0.25, ml: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    aria-label="Toggle theme"
                >
                    {isDark ? <LightModeIcon sx={{ fontSize: 14 }} /> : <DarkModeIcon sx={{ fontSize: 14 }} />}
                </IconButton>
            </Box>

            {/* ══════════════════════════════════════════
                LEFT PANEL — Brand / Clinical Showcase
                Hidden on mobile (<768px), narrow on tablet
            ══════════════════════════════════════════ */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    width:   { md: '38%', lg: '42%' },
                    flexShrink: 0,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    p: { md: 5, lg: 6, xl: 8 },
                    background: 'linear-gradient(145deg, #006A6A 0%, #004F4F 55%, #003838 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    zIndex: 1,
                }}
            >
                {/* Radial glow accents */}
                <Box sx={{
                    position: 'absolute', top: -80, right: -80,
                    width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(156,241,240,0.12) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -60, left: -60,
                    width: 250, height: 250, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(156,241,240,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* ── Logo + Wordmark ── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <AlShifaaLogo size={44} white />
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontWeight: 700,
                                    fontSize: '20px',
                                    color: '#FFFFFF',
                                    letterSpacing: '-0.3px',
                                    lineHeight: 1.1,
                                }}
                            >
                                Al Shifaa
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: '10px',
                                    fontWeight: 500,
                                    color: 'rgba(156,241,240,0.8)',
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Health Management System
                            </Typography>
                        </Box>
                    </Box>
                </motion.div>

                {/* ── Center Content ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                >
                    <BrandIllustration 
                        stats={currentShowcase.stats} 
                        showcaseMode={showcaseMode} 
                        isRegister={location.pathname.includes('/register')}
                    />

                    {/* Tagline */}
                    <Typography
                        variant="h3"
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: { md: '24px', lg: '28px', xl: '32px' },
                            color: '#FFFFFF',
                            lineHeight: 1.3,
                            mb: 1.5,
                            mt: 3,
                            letterSpacing: '-0.5px',
                        }}
                    >
                        {currentShowcase.tagline}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: 'rgba(255,255,255,0.65)',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            mb: 1,
                        }}
                    >
                        {currentShowcase.description}
                    </Typography>

                    {/* ECG animation */}
                    <EcgLine />

                    {/* Feature pills */}
                    <FeaturePills pills={currentShowcase.pills} />
                </motion.div>

                {/* ── Trust Badge — Bottom ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    {/* Subtle horizontal divider */}
                    <Box
                        component="hr"
                        sx={{
                            border: 'none',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            width: '100%',
                            my: 3, // my-6 (24px)
                        }}
                    />

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            pb: 3, // pb-6 (24px)
                        }}
                    >
                        <FiveStars />
                        <Typography
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: 'rgba(255, 255, 255, 0.7)', // text-white/70
                                fontSize: '14px', // text-sm
                            }}
                        >
                            {currentShowcase.trustText}
                        </Typography>
                    </Box>
                </motion.div>
            </Box>

            {/* ══════════════════════════════════════════
                RIGHT PANEL — Auth Card
            ══════════════════════════════════════════ */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 4,
                    px: { xs: 3, sm: 4 },
                    boxSizing: 'border-box',
                    zIndex: 1,
                    overflowY: 'auto',
                    minHeight: '100vh',
                }}
            >
                {/* Mobile logo header */}
                <Box
                    sx={{
                        display: { xs: 'flex', md: 'none' },
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4,
                        textAlign: 'center',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <AlShifaaLogo size={32} />
                        <Typography
                            variant="h6"
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 700,
                                color: '#006A6A',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            Al Shifaa HMS
                        </Typography>
                    </Box>
                </Box>

                {/* Card */}
                <Card
                    component={motion.div}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: 440,
                        borderRadius: { xs: '20px', sm: '24px' },
                        p: 4, // py-8 px-8 internally
                        boxShadow: isDark
                            ? '0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.3)'
                            : '0 12px 32px -4px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
                        border: isDark
                            ? '1px solid rgba(255,255,255,0.08)'
                            : '1px solid rgba(0,106,106,0.08)',
                        backgroundColor: isDark
                            ? 'rgba(24,31,31,0.92)'
                            : 'rgba(255,255,255,0.98)',
                        backdropFilter: 'blur(24px)',
                    }}
                >
                    {/* Logo mark in card (desktop) */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            gap: 1,
                            mb: 2.5, // mb-5
                        }}
                    >
                        <AlShifaaLogo size={28} />
                        <Typography
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                fontSize: '14px',
                                color: '#006A6A',
                                letterSpacing: '-0.2px',
                            }}
                        >
                            Al Shifaa HMS
                        </Typography>
                    </Box>

                    {/* Title / Subtitle — or custom headingSlot injected by the page */}
                    {headingSlot
                        ? headingSlot
                        : (title || subtitle) && (
                            <Box sx={{ mb: 0 }}>
                                {title && (
                                    <Typography
                                        component="h1"
                                        sx={{
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontWeight: 600,
                                            fontSize: '26px',
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
                                            mb: 3,
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

                    {/* Footer */}
                    <Box sx={{ mt: 4, pt: 2.5, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: "'DM Sans', sans-serif", fontSize: '11px' }}>
                            © 2025 Al Shifaa Health Systems •{' '}
                            <Link component={RouterLink} to="/privacy" sx={{ color: 'text.disabled', textDecoration: 'underline', '&:hover': { color: '#006A6A' } }}>
                                Privacy
                            </Link>
                            {' '}•{' '}
                            <Link component={RouterLink} to="/terms" sx={{ color: 'text.disabled', textDecoration: 'underline', '&:hover': { color: '#006A6A' } }}>
                                Terms
                            </Link>
                        </Typography>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
};
