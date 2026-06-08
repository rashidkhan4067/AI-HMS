import { useState, useEffect } from 'react';
import { Box, Typography, Card, Link } from '@mui/material';
import { Link as RouterLink, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CalendarCheck2, Brain, Star } from 'lucide-react';
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
        { icon: ShieldCheck, label: 'Secure Patient Records' },
        { icon: CalendarCheck2, label: 'Real-time Appointments' },
        { icon: Brain, label: 'AI-powered Insights' },
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
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const cardVariants = {
    hidden: { opacity: 0, scale: 0.98 },
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
    const { mode } = useThemeMode();
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
                minHeight: '100dvh',
                height: { md: '100dvh' },
                display: 'flex',
                backgroundColor: isDark ? '#0F1515' : '#F4FBFB',
                position: 'relative',
                overflowX: 'hidden',
                overflowY: { xs: 'auto', md: 'hidden' },
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



            {/* ══════════════════════════════════════════
                LEFT PANEL — Brand / Clinical Showcase
                Hidden on mobile (<768px), narrow on tablet
            ══════════════════════════════════════════ */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    width: { md: '38%', lg: '42%' },
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
                        maxWidth: 420,
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
                            maxWidth: 420,
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
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1, // gap-2
                                mb: 3, // mb-6 (24px)
                            }}
                        >
                            <AlShifaaLogo size={24} />
                            <Typography
                                sx={{
                                    fontFamily: "'Outfit', 'DM Sans', sans-serif",
                                    fontWeight: 600, // font-semibold
                                    fontSize: '14px', // text-sm
                                    color: '#006A6A', // text-[#006A6A]
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
