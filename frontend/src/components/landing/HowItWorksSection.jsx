import { useState } from 'react';
import { Box, Typography, Grid, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeMode } from '../../app/theme/ThemeModeContext';
import { 
    Check, 
    ClipboardList, 
    Database, 
    Users, 
    Rocket, 
    ShieldCheck, 
    CheckCircle2 
} from 'lucide-react';

// --- Illustrative Step Widgets ---

const ConsultationWidget = ({ isDark }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,106,106,0.08)'}`, pb: 1 }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                    Workflow Configurator
                </Typography>
                <Typography sx={{ fontSize: '10px', color: isDark ? '#4DB6AC' : '#006A6A', fontWeight: 600 }}>
                    Clinic Mode
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{
                    p: 1.2,
                    borderRadius: '8px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.08)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#BEC9C8' : '#4A6363' }}>
                        Morning Shift Block
                    </Typography>
                    <Typography sx={{ fontSize: '10px', color: isDark ? '#4DB6AC' : '#006A6A', fontWeight: 700 }}>
                        08:00 AM - 02:00 PM
                    </Typography>
                </Box>
                <Box sx={{
                    p: 1.2,
                    borderRadius: '8px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.08)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#BEC9C8' : '#4A6363' }}>
                        Outpatient Flow Routing
                    </Typography>
                    <Typography sx={{ fontSize: '9.5px', px: 1, py: 0.1, borderRadius: '5px', backgroundColor: 'rgba(29, 107, 53, 0.12)', color: '#2E7D32', fontWeight: 600 }}>
                        Auto-routing
                    </Typography>
                </Box>
            </Box>

            <Typography sx={{ fontSize: '10px', color: isDark ? '#A2B8B8' : '#7A9292', fontStyle: 'italic', textAlign: 'center' }}>
                *Customized to match outpatient clinic layouts.
            </Typography>
        </Box>
    );
};

const MigrationWidget = ({ isDark }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                    Data Porting Monitor
                </Typography>
                <Typography sx={{ fontSize: '10px', color: '#1D6B35', fontWeight: 700 }}>
                    100% Completed
                </Typography>
            </Box>

            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: isDark ? '#BEC9C8' : '#4A6363', mb: 0.5 }}>
                    <Typography>Syncing Patient Records</Typography>
                    <Typography sx={{ fontWeight: 600 }}>15,240 / 15,240</Typography>
                </Box>
                <Box sx={{
                    width: '100%',
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.12)',
                    overflow: 'hidden'
                }}>
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#1D6B35',
                        borderRadius: 3,
                    }} />
                </Box>
            </Box>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(29, 107, 53, 0.15)' : 'rgba(29, 107, 53, 0.08)',
                borderLeft: '3px solid #1D6B35',
            }}>
                <ShieldCheck size={14} color="#1D6B35" style={{ flexShrink: 0 }} />
                <Typography sx={{ fontSize: '10px', color: isDark ? '#A5D6A7' : '#1D6B35', fontWeight: 600 }}>
                    SSL 256-Bit Migration Safe & Verified
                </Typography>
            </Box>
        </Box>
    );
};

const OnboardingWidget = ({ isDark }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                    Staff Certification Tracker
                </Typography>
                <Typography sx={{ fontSize: '10px', color: isDark ? '#4DB6AC' : '#006A6A', fontWeight: 700 }}>
                    96% Ready
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '11px', color: isDark ? '#BEC9C8' : '#4A6363' }}>
                        Physicians & Nurses Trained
                    </Typography>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                        12 / 12 (100%)
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '11px', color: isDark ? '#BEC9C8' : '#4A6363' }}>
                        Pharmacy & Billing trained
                    </Typography>
                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                        9 / 10 (90%)
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{
                    px: 1.5,
                    py: 0.3,
                    borderRadius: '20px',
                    backgroundColor: isDark ? 'rgba(77, 182, 172, 0.12)' : 'rgba(0, 106, 106, 0.08)',
                    color: isDark ? '#4DB6AC' : '#006A6A',
                    fontSize: '9.5px',
                    fontWeight: 600,
                }}>
                    Role-Based Access Verified
                </Box>
            </Box>
        </Box>
    );
};

const LaunchWidget = ({ isDark }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                    Launch Controller
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#1D6B35',
                        animation: 'pulse 1.2s infinite'
                    }} />
                    <Typography sx={{ fontSize: '10px', color: '#1D6B35', fontWeight: 700 }}>
                        Active
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle2 size={13} color="#1D6B35" />
                    <Typography sx={{ fontSize: '11px', color: isDark ? '#BEC9C8' : '#4A6363' }}>
                        Automated cloud backups: Enabled
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle2 size={13} color="#1D6B35" />
                    <Typography sx={{ fontSize: '11px', color: isDark ? '#BEC9C8' : '#4A6363' }}>
                        24/7 Supervisor hot-standby active
                    </Typography>
                </Box>
            </Box>

            <Box sx={{
                p: 0.8,
                borderRadius: '6px',
                textAlign: 'center',
                backgroundColor: isDark ? 'rgba(77,182,172,0.06)' : 'rgba(0,106,106,0.08)',
                fontSize: '9.5px',
                color: isDark ? '#4DB6AC' : '#006A6A',
                fontWeight: 600
            }}>
                Next automated health ping in 12s
            </Box>
        </Box>
    );
};

// --- Main Section ---

export const HowItWorksSection = () => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            icon: <ClipboardList size={18} />,
            number: '01',
            title: 'Consultation & Demo',
            navLabel: 'Consultation',
            description: 'We audit your outpatient layout and doctor shifts to custom-configure matching system routings.',
        },
        {
            icon: <Database size={18} />,
            number: '02',
            title: 'Secure Migration',
            navLabel: 'Migration',
            description: 'Our technical squad maps and ports your legacy patients clinical charts and medical history safely.',
        },
        {
            icon: <Users size={18} />,
            number: '03',
            title: 'Staff Onboarding',
            navLabel: 'Onboarding',
            description: 'Interactive, role-specific certification training for doctors, nurses, receptionists, and pharmacy operators.',
        },
        {
            icon: <Rocket size={18} />,
            number: '04',
            title: 'Successful Go-Live',
            navLabel: 'Go-Live',
            description: 'Safe production launch backed by on-site supervision and 24/7 technical hot-standby coverage.',
        },
    ];

    const renderIllustration = (index) => {
        switch (index) {
            case 0:
                return <ConsultationWidget isDark={isDark} />;
            case 1:
                return <MigrationWidget isDark={isDark} />;
            case 2:
                return <OnboardingWidget isDark={isDark} />;
            case 3:
                return <LaunchWidget isDark={isDark} />;
            default:
                return null;
        }
    };

    return (
        <Box
            id="how-it-works"
            sx={{
                scrollMarginTop: '80px',
                py: { xs: 6, sm: 8, md: 16 },
                px: { xs: 2.5, sm: 4, md: 6 },
                backgroundColor: isDark ? '#121919' : '#FFFFFF',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-10%',
                    left: '5%',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: isDark ? 'radial-gradient(circle, rgba(0, 106, 106, 0.05) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0, 106, 106, 0.03) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ width: '100%', maxWidth: 1000, position: 'relative', zIndex: 1 }}>
                {/* Section Header */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}
                >
                    <Typography
                        sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '1.5px',
                            color: '#006A6A',
                            textTransform: 'uppercase',
                            mb: 1.5,
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: '30px',
                            backgroundColor: isDark ? 'rgba(0, 106, 106, 0.15)' : 'rgba(0, 106, 106, 0.05)',
                        }}
                    >
                        Onboarding Journey
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 700,
                            fontSize: { xs: '24px', sm: '34px', md: '44px' },
                            color: isDark ? '#E0F2F1' : '#1A2E2E',
                            mb: { xs: 1.5, md: 2 },
                            lineHeight: 1.2,
                        }}
                    >
                        Seamless Integration, Step by Step
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: { xs: '14px', md: '16.5px' },
                            color: isDark ? '#B2C7C7' : '#5C7474',
                            maxWidth: 680,
                            mx: 'auto',
                            lineHeight: 1.55,
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                            Our implementation teams guide your hospital through a structured setup process to ensure a secure, training-certified system launch.
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                            Our structured setup process ensures a secure, certified system launch.
                        </Box>
                    </Typography>
                </Box>

                {/* Stepper Pills navigation bar */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: { xs: 'flex-start', md: 'center' },
                    alignItems: 'center',
                    gap: 1.5,
                    mb: { xs: 3.5, md: 7 },
                    mx: { xs: -2.5, sm: 0 },
                    px: { xs: 2.5, sm: 0 },
                    overflowX: { xs: 'auto', md: 'visible' },
                    pb: { xs: 1.5, md: 0 },
                    width: { xs: 'calc(100% + 40px)', sm: '100%' },
                    '&::-webkit-scrollbar': { display: 'none' }, // hide visual scroll bars
                    scrollbarWidth: 'none',
                }}>
                    {steps.map((step, idx) => {
                        const isActive = activeStep === idx;
                        return (
                            <Box
                                key={idx}
                                onClick={() => setActiveStep(idx)}
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: { xs: 1.5, sm: 2 },
                                    py: { xs: 0.8, sm: 1.2 },
                                    borderRadius: '50px',
                                    border: isActive
                                        ? `1px solid ${isDark ? '#4DB6AC' : '#006A6A'}`
                                        : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,106,106,0.08)'}`,
                                    backgroundColor: isActive
                                        ? (isDark ? 'rgba(77, 182, 172, 0.12)' : 'rgba(0, 106, 106, 0.05)')
                                        : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                    flexShrink: 0,
                                    '&:hover': {
                                        backgroundColor: isActive ? undefined : 'rgba(0,106,106,0.03)'
                                    }
                                }}
                            >
                                <Box sx={{
                                    width: { xs: 20, sm: 24 },
                                    height: { xs: 20, sm: 24 },
                                    borderRadius: '50%',
                                    backgroundColor: isActive 
                                        ? (isDark ? '#4DB6AC' : '#006A6A') 
                                        : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.06)'),
                                    color: isActive ? '#FFFFFF' : (isDark ? '#A2B8B8' : '#5C7474'),
                                    fontSize: { xs: '10px', sm: '11.5px' },
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: "'Outfit', sans-serif",
                                    flexShrink: 0,
                                }}>
                                    {step.number}
                                </Box>
                                <Typography sx={{
                                    fontSize: { xs: '12.5px', sm: '13.5px' },
                                    fontWeight: isActive ? 600 : 500,
                                    fontFamily: "'Outfit', sans-serif",
                                    whiteSpace: 'nowrap',
                                    color: isActive 
                                        ? (isDark ? '#E0F2F1' : '#006A6A') 
                                        : (isDark ? '#BEC9C8' : '#4A6363'),
                                }}>
                                    {step.navLabel}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {/* Step Content Showcase Grid */}
                <Box sx={{
                    borderRadius: '20px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0, 106, 106, 0.08)'}`,
                    backgroundColor: isDark ? 'rgba(22, 29, 29, 0.4)' : '#FFFFFF',
                    boxShadow: isDark 
                        ? '0 20px 50px rgba(0, 0, 0, 0.35)'
                        : '0 20px 50px rgba(0, 106, 106, 0.03)',
                    backdropFilter: 'blur(10px)',
                    p: { xs: 2, sm: 3.5, md: 5 },
                }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -15 }}
                            transition={{ duration: 0.25 }}
                        >
                            <Grid container spacing={{ xs: 2.5, md: 5 }} alignItems="center">
                                {/* Left Column: Text description */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: { xs: 1.2, md: 2 }, px: 1.2, py: 0.3, borderRadius: '30px', backgroundColor: isDark ? 'rgba(77, 182, 172, 0.12)' : 'rgba(0,106,106,0.04)', color: isDark ? '#4DB6AC' : '#006A6A' }}>
                                        {steps[activeStep].icon}
                                        <Typography sx={{ fontSize: '10px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                            PHASE {steps[activeStep].number}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontFamily: "'Outfit', sans-serif",
                                            fontWeight: 700,
                                            fontSize: { xs: '18px', sm: '26px' },
                                            color: isDark ? '#E0F2F1' : '#1A2E2E',
                                            mb: { xs: 1, md: 2 },
                                        }}
                                    >
                                        {steps[activeStep].title}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            display: 'block',
                                            fontFamily: "'DM Sans', sans-serif",
                                            fontSize: { xs: '13.5px', sm: '14.5px' },
                                            lineHeight: 1.6,
                                            color: isDark ? '#A2B8B8' : '#5C7474',
                                            mb: { xs: 2.5, md: 0 },
                                        }}
                                    >
                                        {steps[activeStep].description}
                                    </Typography>
                                </Grid>

                                {/* Right Column: Custom Visual Widget */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{
                                        p: { xs: 2, sm: 3 },
                                        borderRadius: '16px',
                                        backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : '#F4FBFB',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.06)'}`,
                                        minHeight: { xs: 140, sm: 180 },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                    }}>
                                        {renderIllustration(activeStep)}
                                    </Box>
                                </Grid>
                            </Grid>
                        </motion.div>
                    </AnimatePresence>
                </Box>
            </Box>
        </Box>
    );
};
