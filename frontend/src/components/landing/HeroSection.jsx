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
            {/* Patient Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: isDark ? 'rgba(77, 182, 172, 0.15)' : 'rgba(0, 106, 106, 0.08)',
                        color: isDark ? '#4DB6AC' : '#006A6A',
                        border: `1px solid ${isDark ? 'rgba(77, 182, 172, 0.3)' : 'rgba(0, 106, 106, 0.15)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '13px',
                        boxShadow: isDark ? '0 0 10px rgba(77, 182, 172, 0.1)' : 'none'
                    }}>
                        SJ
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                            Sara Jenkins
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: isDark ? '#A2B8B8' : '#7A9292', fontWeight: 500 }}>
                            Female • ID: #PT-8940
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{
                        px: 1.2,
                        py: 0.3,
                        borderRadius: '20px',
                        backgroundColor: isDark ? 'rgba(77, 182, 172, 0.12)' : 'rgba(0, 106, 106, 0.05)',
                        color: isDark ? '#4DB6AC' : '#006A6A',
                        fontSize: '9.5px',
                        fontWeight: 600,
                        border: `1px solid ${isDark ? 'rgba(77, 182, 172, 0.2)' : 'rgba(0, 106, 106, 0.1)'}`,
                    }}>
                        Outpatient
                    </Box>
                    <Box sx={{
                        px: 1.2,
                        py: 0.3,
                        borderRadius: '20px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        color: '#10B981',
                        fontSize: '9.5px',
                        fontWeight: 600,
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}>
                        Stable
                    </Box>
                </Box>
            </Box>

            {/* Vitals Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {/* Heart Rate Card */}
                <Box sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#FAFDFD',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,106,106,0.06)'}`,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#8A9F9F' : '#687878', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Heart Rate
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, backgroundColor: 'rgba(186, 26, 26, 0.08)', px: 0.8, py: 0.2, borderRadius: '4px' }}>
                            <Box sx={{
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                backgroundColor: '#BA1A1A',
                                animation: 'pulse 1.2s infinite'
                            }} />
                            <Typography sx={{ fontSize: '8.5px', fontWeight: 700, color: '#BA1A1A', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Live</Typography>
                        </Box>
                    </Box>
                    
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#004D40', display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        78 <span style={{ fontSize: '10px', fontWeight: 500, color: isDark ? '#8A9F9F' : '#687878' }}>BPM</span>
                    </Typography>

                    {/* ECG Graph Line Animation */}
                    <Box sx={{ position: 'relative', height: 24, width: '100%', mt: 1, overflow: 'hidden' }}>
                        <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none">
                            <path
                                d="M 0 12 L 20 12 L 25 12 L 28 3 L 31 21 L 34 12 L 45 12 L 48 2 L 51 22 L 54 12 L 75 12 L 100 12"
                                fill="none"
                                stroke={isDark ? '#4DB6AC' : '#006A6A'}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeDasharray="400"
                                strokeDashoffset="400"
                                style={{
                                    animation: 'ecg-draw 4s linear infinite',
                                    filter: isDark ? 'drop-shadow(0 0 4px rgba(77, 182, 172, 0.6))' : 'drop-shadow(0 0 3px rgba(0, 106, 106, 0.4))'
                                }}
                            />
                        </svg>
                    </Box>
                </Box>

                {/* Blood Pressure & SpO2 Card */}
                <Box sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#FAFDFD',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,106,106,0.06)'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.5
                }}>
                    <Box>
                        <Typography sx={{ fontSize: '10px', fontWeight: 600, color: isDark ? '#8A9F9F' : '#687878', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
                            Blood Pressure
                        </Typography>
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#004D40' }}>
                            120/80 <span style={{ fontSize: '9.5px', fontWeight: 500, color: isDark ? '#8A9F9F' : '#687878' }}>mmHg</span>
                        </Typography>
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography sx={{ fontSize: '9.5px', fontWeight: 600, color: isDark ? '#4DB6AC' : '#006A6A' }}>
                                SpO2: 99% <span style={{ fontSize: '8px', fontWeight: 500, color: isDark ? '#8A9F9F' : '#687878' }}>(Normal)</span>
                            </Typography>
                        </Box>
                        {/* SpO2 Level Indicator */}
                        <Box sx={{ width: '100%', height: 4, borderRadius: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.08)', overflow: 'hidden' }}>
                            <Box sx={{ width: '99%', height: '100%', backgroundColor: '#10B981', borderRadius: 2 }} />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* EHR Allergy Banner */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                p: 1.2,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(186, 26, 26, 0.12)' : 'rgba(186, 26, 26, 0.04)',
                border: '1px solid rgba(186, 26, 26, 0.2)',
                borderLeft: '4px solid #BA1A1A',
            }}>
                <AlertCircle size={15} color="#BA1A1A" style={{ flexShrink: 0 }} />
                <Typography sx={{ fontSize: '10.5px', fontWeight: 500, color: isDark ? '#FF8A8A' : '#BA1A1A', lineHeight: 1.4 }}>
                    <strong>Clinical Warning:</strong> Patient has a documented <strong>Penicillin allergy</strong>. Verify before orders.
                </Typography>
            </Box>
        </Box>
    );
};

const HeroQueueTab = ({ isDark }) => {
    const doctors = [
        { name: 'Dr. Amelia Hart', dept: 'Cardiology', queue: '3 Patients waiting', status: 'Active', initials: 'AH' },
        { name: 'Dr. Liam Stone', dept: 'Pediatrics', queue: '1 Patient waiting', status: 'On Break', initials: 'LS' }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,106,106,0.08)'}`, pb: 1 }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '12.5px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                    Live Outpatient Queue Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, backgroundColor: 'rgba(16, 185, 129, 0.1)', px: 0.8, py: 0.2, borderRadius: '4px' }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 1.5s infinite' }} />
                    <Typography sx={{ fontSize: '8.5px', color: '#10B981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        8 Online
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {doctors.map((doc, idx) => (
                    <Box key={idx} sx={{
                        p: 1.2,
                        borderRadius: '10px',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,106,106,0.06)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,106,106,0.01)',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: isDark ? 'rgba(77, 182, 172, 0.3)' : 'rgba(0, 106, 106, 0.15)',
                            transform: 'translateY(-1px)'
                        }
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                backgroundColor: doc.status === 'Active' 
                                    ? (isDark ? 'rgba(77, 182, 172, 0.15)' : 'rgba(0, 106, 106, 0.08)')
                                    : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)'),
                                color: doc.status === 'Active' 
                                    ? (isDark ? '#4DB6AC' : '#006A6A')
                                    : (isDark ? '#BEC9C8' : '#687878'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                border: `1px solid ${doc.status === 'Active' ? (isDark ? 'rgba(77, 182, 172, 0.2)' : 'rgba(0, 106, 106, 0.1)') : 'transparent'}`
                            }}>
                                {doc.initials}
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                                    {doc.name}
                                </Typography>
                                <Typography sx={{ fontSize: '9.5px', color: isDark ? '#A2B8B8' : '#7A9292' }}>
                                    {doc.dept} • <strong style={{ color: doc.status === 'Active' ? (isDark ? '#4DB6AC' : '#006A6A') : 'inherit' }}>{doc.queue}</strong>
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{
                            px: 1.2,
                            py: 0.3,
                            borderRadius: '6px',
                            fontSize: '9px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            backgroundColor: doc.status === 'Active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: doc.status === 'Active' ? '#10B981' : '#F59E0B',
                            border: `1px solid ${doc.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                        }}>
                            {doc.status}
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                p: 1.2,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(0, 106, 106, 0.12)' : 'rgba(0, 106, 106, 0.04)',
                border: `1px solid ${isDark ? 'rgba(0, 106, 106, 0.2)' : 'rgba(0, 106, 106, 0.08)'}`,
                borderLeft: `4px solid ${isDark ? '#4DB6AC' : '#006A6A'}`,
            }}>
                <Clock size={15} color={isDark ? '#4DB6AC' : '#006A6A'} style={{ flexShrink: 0 }} />
                <Typography sx={{ fontSize: '10.5px', color: isDark ? '#B2C7C7' : '#006A6A', fontWeight: 500, lineHeight: 1.4 }}>
                    Live Wait Time Metric: Avg clinic consultation delay is currently stable at <strong>12 minutes</strong>.
                </Typography>
            </Box>
        </Box>
    );
};

const HeroAnalyticsTab = ({ isDark }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,106,106,0.08)'}`, pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: isDark ? '#4DB6AC' : '#006A6A' }}>
                    <BarChart3 size={15} />
                    <Typography sx={{ fontSize: '11.5px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Hospital Resource Analytics
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: '8.5px', color: isDark ? '#8A9F9F' : '#687878', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Real-time
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 0.8fr' }, gap: 2.5, alignItems: 'center' }}>
                {/* Bar chart with Gridlines */}
                <Box sx={{ 
                    position: 'relative',
                    height: 70, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'flex-end',
                    pt: 1 
                }}>
                    {/* Background grid lines */}
                    <Box sx={{ position: 'absolute', top: 10, left: 0, right: 0, borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.04)' : '#E5E7EB'}` }} />
                    <Box sx={{ position: 'absolute', top: 35, left: 0, right: 0, borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.04)' : '#E5E7EB'}` }} />
                    
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%', zIndex: 1, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB'}` }}>
                        {[40, 65, 30, 85, 55, 75, 95].map((h, i) => (
                            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '9%', gap: 0.2 }}>
                                <Box
                                    component={motion.div}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 0.8, delay: 0.05 * i }}
                                    sx={{
                                        width: '100%',
                                        background: i === 6 
                                            ? (isDark ? 'linear-gradient(180deg, #4DB6AC 0%, rgba(77,182,172,0.3) 100%)' : 'linear-gradient(180deg, #006A6A 0%, rgba(0,106,106,0.3) 100%)')
                                            : (isDark ? 'linear-gradient(180deg, rgba(77,182,172,0.3) 0%, rgba(77,182,172,0.05) 100%)' : 'linear-gradient(180deg, #B2DFDB 0%, rgba(178,223,219,0.2) 100%)'),
                                        borderRadius: '3px 3px 0 0',
                                        border: `1px solid ${i === 6 ? (isDark ? '#4DB6AC' : '#006A6A') : 'transparent'}`
                                    }}
                                />
                                <Typography sx={{ fontSize: '7px', color: isDark ? '#8A9F9F' : '#9CA3AF', fontWeight: 600, mt: 0.2 }}>
                                    {['M','T','W','T','F','S','S'][i]}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* ICU gauge */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ position: 'relative', width: 48, height: 48 }}>
                        <svg width="48" height="48" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                            <circle
                                cx="18"
                                cy="18"
                                r="15.915"
                                fill="none"
                                stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,106,106,0.05)'}
                                strokeWidth="3"
                            />
                            <circle
                                cx="18"
                                cy="18"
                                r="15.915"
                                fill="none"
                                stroke={isDark ? '#4DB6AC' : '#006A6A'}
                                strokeWidth="3"
                                strokeDasharray="70, 100"
                                strokeLinecap="round"
                                style={{
                                    filter: isDark ? 'drop-shadow(0 0 3px rgba(77, 182, 172, 0.5))' : 'none'
                                }}
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
                            <Typography sx={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E', fontFamily: "'Outfit', sans-serif" }}>
                                70%
                            </Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ fontSize: '8.5px', color: isDark ? '#B2C7C7' : '#5C7474', fontWeight: 700, mt: 0.5, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        ICU Bed Load
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: isDark ? '#A2B8B8' : '#5C7474', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,106,106,0.05)'}`, pt: 1 }}>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isDark ? '#4DB6AC' : '#006A6A' }} />
                    Bed Occupancy: <strong>82%</strong>
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
                    Active Lab Runs: <strong>4 logs</strong>
                </Typography>
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
                pt: { xs: 13, md: 15 }, // Clears the fixed 64px navbar cleanly and prevents overlaps
                pb: { xs: 6, md: 8 },
                px: { xs: 2.5, sm: 4, md: 6 },
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
                    gap: { xs: 4, sm: 6, md: 8 },
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
                            px: { xs: 1.2, sm: 2 },
                            py: { xs: 0.4, sm: 0.75 },
                            borderRadius: '9999px',
                            mb: { xs: 2, md: 2.5 },
                            maxWidth: '100%',
                        }}
                    >
                        <Typography sx={{ fontSize: { xs: '10px', sm: '12px' }, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
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
                            fontSize: { xs: '30px', sm: '44px', md: '52px' },
                            fontWeight: 700,
                            lineHeight: { xs: 1.2, md: 1.15 },
                            color: isDark ? '#E0F2F1' : '#161D1D',
                            mb: { xs: 1.5, md: 2.5 },
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
                            fontSize: { xs: '14.5px', sm: '16px', md: '18px' },
                            lineHeight: 1.6,
                            color: isDark ? '#B2C7C7' : '#6B7280',
                            mb: { xs: 2.5, md: 3.5 },
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
                            gap: { xs: 1.5, sm: 2 },
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
                            aspectRatio: { xs: 'auto', sm: '1.45/1' },
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
                            gridTemplateColumns: { xs: '1fr', sm: '60px 1fr' },
                            minHeight: { xs: 260, sm: 'auto' },
                        }}
                    >
                        {/* Sidebar Mockup */}
                        <Box
                            sx={{
                                borderRight: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                                backgroundColor: isDark ? 'rgba(28, 36, 36, 0.4)' : '#F9FAFB',
                                py: { xs: 1.5, sm: 2 },
                                display: { xs: 'none', sm: 'flex' },
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
                                            backgroundColor: isActive ? (isDark ? 'rgba(77, 182, 172, 0.15)' : 'rgba(0, 106, 106, 0.08)') : 'transparent',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: isActive ? `1px solid ${isDark ? 'rgba(77, 182, 172, 0.3)' : 'rgba(0, 106, 106, 0.15)'}` : '1px solid transparent',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 106, 106, 0.05)'
                                            }
                                        }}
                                    >
                                        {tabKey === 'vitals' && <Activity size={16} color={isActive ? (isDark ? '#4DB6AC' : '#006A6A') : (isDark ? '#8A9F9F' : '#6B7280')} />}
                                        {tabKey === 'queue' && <Users size={16} color={isActive ? (isDark ? '#4DB6AC' : '#006A6A') : (isDark ? '#8A9F9F' : '#6B7280')} />}
                                        {tabKey === 'analytics' && <BarChart3 size={16} color={isActive ? (isDark ? '#4DB6AC' : '#006A6A') : (isDark ? '#8A9F9F' : '#6B7280')} />}
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

