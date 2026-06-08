import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowRight, 
    Heart, 
    FileText, 
    ShieldCheck, 
    HeartPulse, 
    Check,
    Pill,
    Smartphone,
    Activity
} from 'lucide-react';
import { useThemeMode } from '../../app/theme/ThemeModeContext';

export const ForPatientsSection = () => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const [activeTab, setActiveTab] = useState('vitals');
    const [refillSent, setRefillSent] = useState(false);

    const handleRefillClick = () => {
        setRefillSent(true);
        setTimeout(() => setRefillSent(false), 2500);
    };

    return (
        <Box
            id="patients"
            sx={{
                py: { xs: 6, sm: 8, md: 12 },
                px: { xs: 2.5, sm: 4, md: 6 },
                backgroundColor: isDark ? 'rgba(0, 106, 106, 0.03)' : 'rgba(0, 106, 106, 0.01)',
                display: 'flex',
                justifyContent: 'center',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0, 106, 106, 0.08)'}`,
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 1280,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' },
                    gap: { xs: 4, lg: 8 },
                    alignItems: 'center',
                }}
            >
                {/* Left Side: Phone Mockup */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        order: { xs: 2, lg: 1 },
                        position: 'relative',
                    }}
                >
                    {/* Outer Phone Frame */}
                    <Box
                        sx={{
                            width: { xs: 230, sm: 250, md: 260 },
                            height: { xs: 410, sm: 440, md: 470 },
                            borderRadius: '32px',
                            border: '8px solid #1e292b',
                            backgroundColor: isDark ? '#141A1A' : '#FFFFFF',
                            boxShadow: isDark 
                                ? '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 106, 106, 0.1)' 
                                : '0 20px 40px rgba(0, 0, 0, 0.06), 0 0 15px rgba(0, 106, 106, 0.02)',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {/* Speaker/Camera Notch */}
                        <Box
                            sx={{
                                width: 90,
                                height: 16,
                                backgroundColor: '#1e292b',
                                borderBottomLeftRadius: '10px',
                                borderBottomRightRadius: '10px',
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 12,
                            }}
                        />

                        {/* Mobile Status Bar */}
                        <Box sx={{ height: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, pt: 1, zIndex: 10 }}>
                            <Typography sx={{ fontSize: '9px', fontWeight: 600, color: isDark ? '#7A9292' : '#687878', fontFamily: 'sans-serif' }}>9:41</Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isDark ? '#7A9292' : '#687878', opacity: 0.8 }} />
                                <Box sx={{ width: 12, height: 7, borderRadius: '1.5px', border: '1px solid', borderColor: isDark ? '#7A9292' : '#687878', opacity: 0.8 }} />
                            </Box>
                        </Box>

                        {/* App Header (Welcome) */}
                        <Box sx={{ px: 2, pb: 1.5, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.08)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography sx={{ fontSize: '10px', color: isDark ? '#A2B8B8' : '#8C9E9E', fontWeight: 500 }}>My Portal</Typography>
                                <Typography sx={{ fontSize: '12.5px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: isDark ? '#E0F2F1' : '#1A2E2E' }}>Hello, Sarah</Typography>
                            </Box>
                            <Avatar 
                                sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    fontSize: '9px', 
                                    fontWeight: 700,
                                    backgroundColor: 'rgba(0, 106, 106, 0.1)', 
                                    color: '#006A6A',
                                    border: '1px solid rgba(0, 106, 106, 0.2)'
                                }}
                            >
                                SK
                            </Avatar>
                        </Box>

                        {/* App Navigation Tabs */}
                        <Box sx={{ display: 'flex', p: 0.8, gap: 0.5, backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : '#F0F6F6' }}>
                            {[
                                { id: 'vitals', label: 'Vitals', icon: <Heart size={10} /> },
                                { id: 'records', label: 'Records', icon: <FileText size={10} /> },
                                { id: 'meds', label: 'Meds', icon: <Pill size={10} /> }
                            ].map((tab) => {
                                const isSelected = activeTab === tab.id;
                                return (
                                    <Button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        sx={{
                                            flex: 1,
                                            py: 0.6,
                                            borderRadius: '6px',
                                            textTransform: 'none',
                                            fontFamily: "'Outfit', sans-serif",
                                            fontWeight: 600,
                                            fontSize: '10px',
                                            minWidth: 0,
                                            gap: 0.5,
                                            color: isSelected 
                                                ? (isDark ? '#E0F2F1' : '#006A6A') 
                                                : (isDark ? '#7A9292' : '#687878'),
                                            backgroundColor: isSelected 
                                                ? (isDark ? 'rgba(0, 106, 106, 0.25)' : '#FFFFFF') 
                                                : 'transparent',
                                            border: isSelected && !isDark ? '1px solid rgba(0, 106, 106, 0.08)' : '1px solid transparent',
                                            '&:hover': {
                                                backgroundColor: isSelected 
                                                    ? (isDark ? 'rgba(0, 106, 106, 0.25)' : '#FFFFFF') 
                                                    : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,106,106,0.03)'),
                                            },
                                        }}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </Button>
                                );
                            })}
                        </Box>

                        {/* App Screen Content Box */}
                        <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, scale: 0.96, y: 5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: -5 }}
                                    transition={{ duration: 0.18 }}
                                    style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
                                >
                                    {activeTab === 'vitals' && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8, width: '100%' }}>
                                            {/* Pulse Rate Monitor */}
                                            <Box sx={{ p: 1.2, borderRadius: '10px', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F5FAFA', border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.06)'}` }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                                                    <Typography sx={{ fontSize: '10px', color: isDark ? '#A2B8B8' : '#687878', fontWeight: 500 }}>Heart Rate</Typography>
                                                    <HeartPulse size={12} color="#D32F2F" />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#111717' }}>72</Typography>
                                                    <Typography sx={{ fontSize: '9px', color: 'text.secondary', fontWeight: 600 }}>BPM</Typography>
                                                </Box>
                                            </Box>

                                            {/* Blood Pressure Monitor */}
                                            <Box sx={{ p: 1.2, borderRadius: '10px', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F5FAFA', border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.06)'}` }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                                                    <Typography sx={{ fontSize: '10px', color: isDark ? '#A2B8B8' : '#687878', fontWeight: 500 }}>Blood Pressure</Typography>
                                                    <Activity size={12} color="#006A6A" />
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#111717' }}>118/76</Typography>
                                                    <Typography sx={{ fontSize: '9px', color: 'text.secondary', fontWeight: 600 }}>mmHg</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}

                                    {activeTab === 'records' && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                                            {/* Lab Report Card */}
                                            <Box sx={{ p: 1.2, borderRadius: '10px', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F5FAFA', border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.06)'}` }}>
                                                <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: isDark ? '#E0F2F1' : '#1A2E2E', mb: 0.3 }}>Lipid Profile Test</Typography>
                                                <Typography sx={{ fontSize: '9px', color: isDark ? '#A2B8B8' : '#687878', mb: 1 }}>Published Yesterday</Typography>
                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.8, py: 0.3, borderRadius: '4px', backgroundColor: 'rgba(46, 125, 50, 0.1)', color: '#2E7D32' }}>
                                                    <Check size={9} strokeWidth={3} />
                                                    <Typography sx={{ fontSize: '8.5px', fontWeight: 700 }}>ALL NORMAL</Typography>
                                                </Box>
                                            </Box>

                                            {/* Summary Card */}
                                            <Box sx={{ p: 1.2, borderRadius: '10px', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F5FAFA', border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.06)'}` }}>
                                                <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: isDark ? '#E0F2F1' : '#1A2E2E', mb: 0.3 }}>Clinical Summary</Typography>
                                                <Typography sx={{ fontSize: '9px', color: isDark ? '#A2B8B8' : '#687878' }}>Dr. Rachel Carter • Cardiology</Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {activeTab === 'meds' && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', width: '100%', flex: 1 }}>
                                            <Box sx={{ p: 1.2, borderRadius: '10px', backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F5FAFA', border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.06)'}` }}>
                                                <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: isDark ? '#E0F2F1' : '#1A2E2E', mb: 0.3 }}>Lisinopril 10mg</Typography>
                                                <Typography sx={{ fontSize: '9px', color: isDark ? '#A2B8B8' : '#687878', mb: 1 }}>1 Tablet Daily • 12 Refills Left</Typography>
                                                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 0.8, py: 0.3, borderRadius: '4px', backgroundColor: 'rgba(0, 106, 106, 0.1)', color: '#006A6A' }}>
                                                    <Typography sx={{ fontSize: '8.5px', fontWeight: 700 }}>REFILL READY</Typography>
                                                </Box>
                                            </Box>

                                            {/* Interactive Request Refill Button */}
                                            <Box 
                                                component={motion.div}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleRefillClick}
                                                sx={{
                                                    mt: 'auto',
                                                    p: 1.1,
                                                    borderRadius: '8px',
                                                    background: refillSent 
                                                        ? 'linear-gradient(135deg, #2D7D46 0%, #1B5E20 100%)'
                                                        : 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                                                    color: '#FFFFFF',
                                                    fontSize: '10px',
                                                    fontWeight: 600,
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 0.5,
                                                    boxShadow: '0 2px 6px rgba(0, 106, 106, 0.15)',
                                                    transition: 'background 0.3s ease'
                                                }}
                                            >
                                                {refillSent ? (
                                                    <>
                                                        <Check size={10} strokeWidth={3} />
                                                        <span>Refill Requested ✓</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>Quick Refill Request</span>
                                                        <ArrowRight size={10} />
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </Box>

                        {/* HIPAA Footer */}
                        <Box
                            sx={{
                                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.08)'}`,
                                py: 1.2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.1)' : '#F5FAFA',
                            }}
                        >
                            <ShieldCheck size={11} color="#2E7D32" />
                            <Typography sx={{ fontSize: '9px', color: isDark ? '#A2B8B8' : '#687878', fontWeight: 600 }}>
                                HIPAA Guard Secured
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Right Side: Text Content */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', order: { xs: 1, lg: 2 } }}>
                    <Box 
                        sx={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 1, 
                            px: 1.2, 
                            py: 0.5, 
                            borderRadius: '20px', 
                            backgroundColor: isDark ? 'rgba(0,106,106,0.15)' : 'rgba(0,106,106,0.06)',
                            border: `1px solid ${isDark ? 'rgba(0,106,106,0.3)' : 'rgba(0,106,106,0.15)'}`,
                            mb: { xs: 1.5, md: 2 }
                        }}
                    >
                        <Smartphone size={12} color={isDark ? '#4DB6AC' : '#006A6A'} />
                        <Typography
                            sx={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '1px',
                                color: isDark ? '#4DB6AC' : '#006A6A',
                                textTransform: 'uppercase',
                            }}
                        >
                            Patient Experience
                        </Typography>
                    </Box>

                    <Typography
                        variant="h2"
                        sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: { xs: '26px', sm: '34px', md: '42px' },
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: isDark ? '#E0F2F1' : '#111717',
                            mb: { xs: 1.5, md: 2.5 },
                            letterSpacing: '-0.8px',
                        }}
                    >
                        Your Health Records, Always With You
                    </Typography>

                    <Typography
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: { xs: '14px', md: '16px' },
                            lineHeight: 1.55,
                            color: isDark ? '#B2C7C7' : '#4E5D5D',
                            mb: { xs: 2.5, md: 4 },
                            maxWidth: 580,
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                            Access electronic health records, diagnostic lab results, active prescriptions, and appointments on any device securely.
                        </Box>
                        <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                            Al Shifaa Patient Portal gives you secure, direct access to your electronic health records, lab reports, billing invoices, and seamless doctor scheduling from any device.
                        </Box>
                    </Typography>

                    {/* Detailed Features (Hidden on mobile to save vertical space) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2.5, mb: 4, width: '100%' }}>
                        {[
                            { title: "Consolidated Health Timeline", desc: "View clinical summaries, consultation notes, and immunizations chronologically." },
                            { title: "Direct Lab Reports Access", desc: "Receive automated notifications once diagnostic results are processed and cleared." }
                        ].map((feat, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        width: 22, 
                                        height: 22, 
                                        borderRadius: '50%', 
                                        backgroundColor: isDark ? 'rgba(77, 182, 172, 0.1)' : 'rgba(0, 106, 106, 0.08)',
                                        color: isDark ? '#4DB6AC' : '#006A6A',
                                        flexShrink: 0,
                                        mt: 0.2
                                    }}
                                >
                                    <Check size={12} strokeWidth={3} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '15px', color: isDark ? '#E0F2F1' : '#1A2E2E', mb: 0.2 }}>
                                        {feat.title}
                                    </Typography>
                                    <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', color: isDark ? '#A2B8B8' : '#687878', lineHeight: 1.35 }}>
                                        {feat.desc}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    <Button
                        component={RouterLink}
                        to="/login?type=patient"
                        variant="outlined"
                        sx={{
                            height: { xs: 42, sm: 46 },
                            px: 4,
                            width: { xs: '100%', sm: 'auto' },
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: { xs: '13.5px', sm: '14.5px' },
                            borderColor: '#006A6A',
                            color: '#006A6A',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            '&:hover': {
                                borderColor: '#005858',
                                backgroundColor: 'rgba(0, 106, 106, 0.04)',
                            },
                        }}
                    >
                        <span>Try Patient Portal</span>
                        <ArrowRight size={16} />
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};
