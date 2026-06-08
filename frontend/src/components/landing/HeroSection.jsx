import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Lock, 
    Shield, 
    Check, 
    ArrowRight, 
    Activity, 
    Calendar, 
    Users, 
    Clock, 
    AlertCircle, 
    BarChart3
} from 'lucide-react';
import { useThemeMode } from '../../app/theme/ThemeModeContext';

// --- Hero Sub-Tab Previews ---

const HeroVitalsTab = ({ isDark }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: isDark ? 'rgba(77, 182, 172, 0.15)' : 'rgba(0, 106, 106, 0.08)',
                        color: isDark ? '#4DB6AC' : '#006A6A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '12px'
                    }}>
                        SJ
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '12.5px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                            Sara Jenkins
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: isDark ? '#A2B8B8' : '#7A9292' }}>
                            Female • ID: #PT-8940
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: '20px',
                    backgroundColor: isDark ? 'rgba(77, 182, 172, 0.12)' : 'rgba(0, 106, 106, 0.05)',
                    color: isDark ? '#4DB6AC' : '#006A6A',
                    fontSize: '9.5px',
                    fontWeight: 600,
                }}>
                    Outpatient
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <Box sx={{
                    p: 1.2,
                    borderRadius: '10px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,106,106,0.02)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.04)'}`,
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.2 }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 500, color: isDark ? '#A2B8B8' : '#7A9292' }}>
                            Heart Rate
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                            <Box sx={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                backgroundColor: '#BA1A1A',
                                animation: 'pulse 1.2s infinite'
                            }} />
                            <Typography sx={{ fontSize: '9px', fontWeight: 600, color: '#BA1A1A' }}>Live</Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                        78 <span style={{ fontSize: '9.5px', fontWeight: 400, opacity: 0.7 }}>BPM</span>
                    </Typography>
                    <Box sx={{ position: 'relative', height: 16, width: '100%', mt: 0.5, overflow: 'hidden' }}>
                        <svg width="100%" height="16" viewBox="0 0 100 16" preserveAspectRatio="none">
                            <path
                                d="M 0 8 L 25 8 L 28 2 L 31 14 L 34 8 L 45 8 L 48 1 L 51 15 L 54 8 L 100 8"
                                fill="none"
                                stroke={isDark ? '#4DB6AC' : '#006A6A'}
                                strokeWidth="1.2"
                                strokeDasharray="400"
                                strokeDashoffset="400"
                                style={{
                                    animation: 'ecg-draw 4s linear infinite'
                                }}
                            />
                        </svg>
                    </Box>
                </Box>

                <Box sx={{
                    p: 1.2,
                    borderRadius: '10px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,106,106,0.02)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.04)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <Typography sx={{ fontSize: '10px', fontWeight: 500, color: isDark ? '#A2B8B8' : '#7A9292', mb: 0.2 }}>
                        Blood Pressure
                    </Typography>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E', mb: 0.2 }}>
                        120/80 <span style={{ fontSize: '9px', fontWeight: 400, opacity: 0.7 }}>mmHg</span>
                    </Typography>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#4DB6AC' : '#006A6A' }}>
                        SpO2: 99% <span style={{ fontSize: '8px', fontWeight: 400, color: isDark ? '#A2B8B8' : '#7A9292' }}>(Normal)</span>
                    </Typography>
                </Box>
            </Box>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(186, 26, 26, 0.15)' : 'rgba(186, 26, 26, 0.04)',
                borderLeft: '3px solid #BA1A1A',
            }}>
                <AlertCircle size={13} color="#BA1A1A" style={{ flexShrink: 0 }} />
                <Typography sx={{ fontSize: '10px', fontWeight: 500, color: isDark ? '#FF8A8A' : '#BA1A1A' }}>
                    <strong>Warning:</strong> Penicillin allergy flagged.
                </Typography>
            </Box>
        </Box>
    );
};

const HeroQueueTab = ({ isDark }) => {
    const doctors = [
        { name: 'Dr. Amelia Hart', dept: 'Cardiology', queue: '3 Patients waiting', status: 'Active' },
        { name: 'Dr. Liam Stone', dept: 'Pediatrics', queue: '1 Patient waiting', status: 'On Break' }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '12.5px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                    Live Outpatient Queue
                </Typography>
                <Typography sx={{ fontSize: '9px', color: isDark ? '#A2B8B8' : '#7A9292', fontWeight: 500 }}>
                    8 Checked In
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {doctors.map((doc, idx) => (
                    <Box key={idx} sx={{
                        p: 1,
                        borderRadius: '8px',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.05)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,106,106,0.01)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={13} style={{ color: isDark ? '#4DB6AC' : '#006A6A' }} />
                            <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                                    {doc.name}
                                </Typography>
                                <Typography sx={{ fontSize: '9.5px', color: isDark ? '#A2B8B8' : '#7A9292' }}>
                                    {doc.dept} • {doc.queue}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{
                            px: 1,
                            py: 0.1,
                            borderRadius: '6px',
                            fontSize: '9px',
                            fontWeight: 600,
                            backgroundColor: doc.status === 'Active' ? 'rgba(29, 107, 53, 0.12)' : 'rgba(74, 99, 99, 0.1)',
                            color: doc.status === 'Active' ? '#2E7D32' : (isDark ? '#BEC9C8' : '#4A6363'),
                        }}>
                            {doc.status}
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: '6px',
                backgroundColor: isDark ? 'rgba(0, 106, 106, 0.12)' : 'rgba(0, 106, 106, 0.04)',
                borderLeft: `3px solid ${isDark ? '#4DB6AC' : '#006A6A'}`,
            }}>
                <Users size={13} color={isDark ? '#4DB6AC' : '#006A6A'} style={{ flexShrink: 0 }} />
                <Typography sx={{ fontSize: '10px', color: isDark ? '#B2C7C7' : '#006A6A', fontWeight: 500 }}>
                    Average clinic wait time: <strong>12 minutes</strong>
                </Typography>
            </Box>
        </Box>
    );
};

const HeroAnalyticsTab = ({ isDark }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isDark ? '#4DB6AC' : '#006A6A' }}>
                <BarChart3 size={14} />
                <Typography sx={{ fontSize: '11px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Operational Analytics
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 2, alignItems: 'center' }}>
                {/* Bar chart */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 60, pt: 1, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB'}` }}>
                    {[40, 65, 30, 85, 55, 75, 90].map((h, i) => (
                        <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '9%', gap: 0.2 }}>
                            <Box
                                component={motion.div}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 0.8, delay: 0.1 * i }}
                                sx={{
                                    width: '100%',
                                    backgroundColor: i === 6 ? (isDark ? '#4DB6AC' : '#006A6A') : (isDark ? 'rgba(77,182,172,0.25)' : '#B2DFDB'),
                                    borderRadius: '2px 2px 0 0',
                                }}
                            />
                            <Typography sx={{ fontSize: '7px', color: isDark ? '#A2B8B8' : '#9CA3AF', fontWeight: 500 }}>
                                {['M','T','W','T','F','S','S'][i]}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* ICU gauge */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ position: 'relative', width: 44, height: 44 }}>
                        <svg width="44" height="44" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.06)'}
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke={isDark ? '#4DB6AC' : '#006A6A'}
                                strokeDasharray="70, 100"
                                strokeWidth="3"
                                strokeLinecap="round"
                            />
                        </svg>
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Typography sx={{ fontSize: '9.5px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                                70%
                            </Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ fontSize: '8px', color: isDark ? '#A2B8B8' : '#7A9292', fontWeight: 600, mt: 0.5, textAlign: 'center' }}>
                        ICU Bed Load
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: isDark ? '#A2B8B8' : '#7A9292' }}>
                <Typography>Bed Occupancy: <strong>82%</strong></Typography>
                <Typography>Lab Queue: <strong>4 logs</strong></Typography>
            </Box>
        </Box>
    );
};

// --- Main Hero Component ---

export const HeroSection = () => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';

    const [activeHeroTab, setActiveHeroTab] = useState('vitals');

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: { xs: 'auto', md: 'calc(100vh - 64px)' },
                display: 'flex',
                alignItems: 'center',
                pt: { xs: 10, md: 11 }, // Clears the fixed 64px navbar cleanly without excessive blank space
                pb: { xs: 6, md: 8 },
                px: { xs: 3, md: 6 },
                background: isDark
                    ? 'radial-gradient(circle at 80% 20%, rgba(0, 106, 106, 0.15) 0%, #161D1D 50%, #161D1D 100%)'
                    : 'radial-gradient(circle at 80% 20%, rgba(0, 106, 106, 0.05) 0%, #FFFFFF 50%, #FFFFFF 100%)',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 1280,
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '55fr 45fr' },
                    gap: { xs: 6, md: 8 },
                    alignItems: 'center',
                }}
            >
                {/* Left Column */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                    }}
                >
                    {/* Small Pill Badge */}
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: { xs: 1, sm: 1.5 },
                            backgroundColor: isDark ? 'rgba(0, 106, 106, 0.25)' : 'rgba(0, 106, 106, 0.08)',
                            border: `1px solid ${isDark ? 'rgba(0, 106, 106, 0.4)' : 'rgba(0, 106, 106, 0.15)'}`,
                            color: isDark ? '#4DB6AC' : '#006A6A',
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.5, sm: 0.75 },
                            borderRadius: '9999px',
                            mb: { xs: 2, md: 2.5 },
                            maxWidth: '100%',
                        }}
                    >
                        <Typography sx={{ fontSize: { xs: '10.5px', sm: '12px' }, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            🏥 Pakistan's #1 Hospital Management System
                        </Typography>
                        <Box
                            component={motion.div}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.4, 0.8] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                            sx={{
                                width: { xs: 5, sm: 7 },
                                height: { xs: 5, sm: 7 },
                                borderRadius: '50%',
                                backgroundColor: isDark ? '#4DB6AC' : '#006A6A',
                                flexShrink: 0
                            }}
                        />
                    </Box>

                    {/* Headline */}
                    <Typography
                        variant="h1"
                        sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: { xs: '38px', sm: '48px', md: '52px' },
                            fontWeight: 700,
                            lineHeight: 1.15,
                            color: isDark ? '#E0F2F1' : '#161D1D',
                            mb: { xs: 2, md: 2.5 },
                            letterSpacing: '-1px',
                        }}
                    >
                        Modern Healthcare Management.{' '}
                        <Box component="span" sx={{ color: '#006A6A', display: 'block' }}>
                            Simplified.
                        </Box>
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '18px',
                            lineHeight: 1.6,
                            color: isDark ? '#B2C7C7' : '#6B7280',
                            mb: { xs: 3, md: 3.5 },
                            maxWidth: 500,
                        }}
                    >
                        Al Shifaa HMS unifies patient records, appointments, billing, pharmacy, lab results, and AI-powered insights into one secure platform trusted by 50+ hospitals across Pakistan.
                    </Typography>

                    {/* CTA Buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            mb: { xs: 3.5, md: 4 },
                            width: '100%',
                        }}
                    >
                        <Button
                            component={RouterLink}
                            to="/register"
                            variant="contained"
                            sx={{
                                height: 48,
                                px: 4,
                                width: { xs: '100%', sm: 'auto' },
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                fontSize: '15px',
                                background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                                color: '#FFFFFF',
                                boxShadow: '0 4px 14px rgba(0, 106, 106, 0.25)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                                    boxShadow: '0 6px 20px rgba(0, 106, 106, 0.35)',
                                },
                            }}
                        >
                            <span>Request a Demo</span>
                            <ArrowRight size={18} />
                        </Button>
                        <Button
                            component={RouterLink}
                            to="/login?type=patient"
                            variant="outlined"
                            sx={{
                                height: 48,
                                px: 4,
                                width: { xs: '100%', sm: 'auto' },
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 600,
                                fontSize: '15px',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : '#D1D5DB',
                                color: isDark ? '#E0F2F1' : '#374151',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                '&:hover': {
                                    borderColor: '#006A6A',
                                    backgroundColor: 'rgba(0, 106, 106, 0.04)',
                                    color: '#006A6A',
                                },
                            }}
                        >
                            <span>Patient Portal</span>
                            <ArrowRight size={18} />
                        </Button>
                    </Box>

                    {/* Trust Row */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3.5, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isDark ? 'text.secondary' : '#9CA3AF' }}>
                            <Lock size={15} />
                            <Typography sx={{ fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>HIPAA Aligned</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isDark ? 'text.secondary' : '#9CA3AF' }}>
                            <Shield size={15} />
                            <Typography sx={{ fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>256-bit Encryption</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isDark ? 'text.secondary' : '#9CA3AF' }}>
                            <Check size={15} />
                            <Typography sx={{ fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>ISO 27001 Ready</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Right Column (Interactive Workstation Mockup) */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    sx={{
                        position: 'relative',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }}
                >
                    {/* Floating Live System Badge */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -12,
                            right: { xs: 8, md: -8 },
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 600,
                            fontFamily: "'DM Sans', sans-serif",
                            px: 3,
                            py: 0.75,
                            borderRadius: '9999px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                            zIndex: 10,
                        }}
                    >
                        Live System
                    </Box>

                    {/* Dashboard Mockup Card */}
                    <Box
                        sx={{
                            width: '100%',
                            aspectRatio: '1.45/1',
                            borderRadius: '20px',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E7EB',
                            boxShadow: isDark 
                                ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.05)' 
                                : '0 25px 50px -12px rgba(0, 106, 106, 0.06)',
                            backgroundColor: isDark ? 'rgba(22, 29, 29, 0.4)' : '#FFFFFF',
                            backdropFilter: 'blur(10px)',
                            overflow: 'hidden',
                            display: 'grid',
                            gridTemplateColumns: { xs: '44px 1fr', sm: '60px 1fr' },
                        }}
                    >
                        {/* Sidebar Mockup */}
                        <Box
                            sx={{
                                borderRight: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                                backgroundColor: isDark ? 'rgba(28, 36, 36, 0.4)' : '#F9FAFB',
                                py: { xs: 1.5, sm: 2 },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: { xs: 1.5, sm: 2.5 },
                            }}
                        >
                            <Box sx={{ width: { xs: 26, sm: 32 }, height: { xs: 26, sm: 32 }, borderRadius: '8px', backgroundColor: 'rgba(0, 106, 106, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 1.5, sm: 2 } }}>
                                <Activity size={15} color="#006A6A" />
                            </Box>
                            {['vitals', 'queue', 'analytics'].map((tabKey, i) => {
                                const isActive = activeHeroTab === tabKey;
                                return (
                                    <Box
                                        key={tabKey}
                                        onClick={() => setActiveHeroTab(tabKey)}
                                        sx={{
                                            width: { xs: 26, sm: 32 },
                                            height: { xs: 26, sm: 32 },
                                            borderRadius: '8px',
                                            backgroundColor: isActive ? 'rgba(0, 106, 106, 0.08)' : 'transparent',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: isActive ? `1px solid ${isDark ? 'rgba(77, 182, 172, 0.25)' : 'rgba(0, 106, 106, 0.15)'}` : '1px solid transparent',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 106, 106, 0.05)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ width: { xs: 11, sm: 14 }, height: { xs: 11, sm: 14 }, borderRadius: '3px', border: '2px solid', borderColor: isActive ? (isDark ? '#4DB6AC' : '#006A6A') : (isDark ? '#5A7575' : '#9CA3AF'), opacity: isActive ? 1 : 0.6 }} />
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Main Mockup Area */}
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {/* Header Mockup with Workstation Tab Controls */}
                            <Box
                                sx={{
                                    height: { xs: 44, sm: 52 },
                                    borderBottom: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                                    px: { xs: 1.5, sm: 2.5 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    {/* Sub-tab text triggers in window header */}
                                    {['vitals', 'queue', 'analytics'].map((tabKey) => {
                                        const isActive = activeHeroTab === tabKey;
                                        return (
                                            <Typography
                                                key={tabKey}
                                                onClick={() => setActiveHeroTab(tabKey)}
                                                sx={{
                                                    fontSize: { xs: '10px', sm: '12px' },
                                                    fontWeight: isActive ? 700 : 500,
                                                    fontFamily: "'Outfit', sans-serif",
                                                    color: isActive 
                                                        ? (isDark ? '#4DB6AC' : '#006A6A') 
                                                        : (isDark ? '#BEC9C8' : '#6B7280'),
                                                    cursor: 'pointer',
                                                    px: 1.2,
                                                    py: 0.4,
                                                    borderRadius: '6px',
                                                    backgroundColor: isActive 
                                                        ? (isDark ? 'rgba(77, 182, 172, 0.08)' : 'rgba(0, 106, 106, 0.04)') 
                                                        : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {tabKey}
                                            </Typography>
                                        );
                                    })}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 1.5s infinite' }} />
                                    <Box sx={{ width: 26, height: 26, borderRadius: '50%', backgroundColor: isDark ? 'rgba(77, 182, 172, 0.15)' : '#006A6A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography sx={{ color: isDark ? '#4DB6AC' : '#fff', fontSize: '9px', fontWeight: 600 }}>DR</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Content Mockup Area with Transitions */}
                            <Box sx={{ p: { xs: 2, sm: 3 }, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeHeroTab}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.25 }}
                                        style={{ height: '100%' }}
                                    >
                                        {activeHeroTab === 'vitals' && <HeroVitalsTab isDark={isDark} />}
                                        {activeHeroTab === 'queue' && <HeroQueueTab isDark={isDark} />}
                                        {activeHeroTab === 'analytics' && <HeroAnalyticsTab isDark={isDark} />}
                                    </motion.div>
                                </AnimatePresence>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

