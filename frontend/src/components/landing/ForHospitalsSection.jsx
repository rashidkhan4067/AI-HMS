import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    Clock, 
    ArrowRight, 
    Lock, 
    Check, 
    HeartPulse,
    LayoutDashboard
} from 'lucide-react';
import { useThemeMode } from '../../app/theme/ThemeModeContext';

export const ForHospitalsSection = () => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const [activeRole, setActiveRole] = useState('physician');

    const roles = {
        physician: {
            id: 'physician',
            label: 'Physician',
            userName: 'Dr. Rachel Carter',
            userRole: 'Chief of Cardiology',
            initials: 'RC',
            clearance: 'Level 3',
            statLabel: 'Pending Consults',
            statValue: '3 Charts',
            progressLabel: 'ICU Bed Occupancy',
            progressValue: 82,
            logs: [
                { time: '08:45 AM', text: 'Prescribed Amiodarone - Bed 4B' },
                { time: '08:30 AM', text: 'Signed off EMR: Patient #9021' }
            ]
        },
        nurse: {
            id: 'nurse',
            label: 'Nursing',
            userName: 'Marcus Vance',
            userRole: 'Triage Lead',
            initials: 'MV',
            clearance: 'Level 2',
            statLabel: 'Triage Queue',
            statValue: '2 Active',
            progressLabel: 'ER Capacity Load',
            progressValue: 58,
            logs: [
                { time: '09:02 AM', text: 'Logged vital signs (Room 204)' },
                { time: '08:50 AM', text: 'Admitted #8812 to Bed 3' }
            ]
        },
        admin: {
            id: 'admin',
            label: 'Operations',
            userName: 'Sophia Chen',
            userRole: 'Operations Director',
            initials: 'SC',
            clearance: 'Level 4',
            statLabel: 'Clean Claims Rate',
            statValue: '98.4%',
            progressLabel: 'HIPAA Guard Score',
            progressValue: 100,
            logs: [
                { time: '08:55 AM', text: 'Cleared Medicare Audit Log' },
                { time: '08:15 AM', text: '100% HIPAA Integrity OK' }
            ]
        }
    };

    const currentData = roles[activeRole];

    return (
        <Box
            id="hospitals"
            sx={{
                scrollMarginTop: '80px',
                py: { xs: 5, sm: 8, md: 12 },
                px: { xs: 2.5, sm: 4, md: 6 },
                backgroundColor: isDark ? '#111717' : '#FAFDFD',
                backgroundImage: isDark
                    ? 'radial-gradient(circle at 80% 20%, rgba(0, 106, 106, 0.08) 0%, transparent 50%)'
                    : 'radial-gradient(circle at 80% 20%, rgba(0, 106, 106, 0.03) 0%, transparent 50%)',
                display: 'flex',
                justifyContent: 'center',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.08)'}`,
                overflow: 'hidden'
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 1280,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
                    gap: { xs: 3, sm: 5, lg: 8 },
                    alignItems: 'center',
                }}
            >
                {/* Left Side: Context Info */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
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
                            mb: { xs: 1.2, md: 2 }
                        }}
                    >
                        <LayoutDashboard size={12} color={isDark ? '#4DB6AC' : '#006A6A'} />
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
                            Enterprise Platform
                        </Typography>
                    </Box>

                    <Typography
                        variant="h2"
                        sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: { xs: '24px', sm: '32px', md: '42px' },
                            fontWeight: 700,
                            lineHeight: 1.15,
                            color: isDark ? '#E0F2F1' : '#111717',
                            mb: { xs: 1.5, md: 2.5 },
                            letterSpacing: '-0.8px',
                        }}
                    >
                        Clinical Operations Command
                    </Typography>

                    <Typography
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: { xs: '14px', md: '16px' },
                            lineHeight: 1.6,
                            color: isDark ? '#B2C7C7' : '#4E5D5D',
                            mb: { xs: 3, md: 4 },
                            maxWidth: 580,
                        }}
                    >
                        Orchestrate multi-department patient flow, resource mapping, and role-based permissions
                        into a single real-time console designed for modern scale.
                    </Typography>

                    {/* Detailed Features – desktop only */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 2.5, mb: 4, width: '100%' }}>
                        {[
                            { title: "Smart Resource Optimization", desc: "Dynamically monitor bed load, clinic slots, and personnel capacity in real-time." },
                            { title: "HIPAA-Grade Security Shield", desc: "Role-based cryptographic access logs keeping patient EMR secure and fully audited." }
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
                        to="/register"
                        variant="contained"
                        sx={{
                            height: { xs: 38, sm: 46 },
                            px: { xs: 3, sm: 4 },
                            width: { xs: '100%', sm: 'auto' },
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 600,
                            fontSize: { xs: '13px', sm: '14.5px' },
                            background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                            color: '#FFFFFF',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            boxShadow: '0 4px 14px rgba(0, 106, 106, 0.25)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #005858 0%, #003D3D 100%)',
                                boxShadow: '0 6px 20px rgba(0, 106, 106, 0.35)',
                            },
                        }}
                    >
                        <span>Request Institutional Access</span>
                        <ArrowRight size={15} />
                    </Button>
                </Box>

                {/* Right Side: Command Station Interactive Mockup */}
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {/* Main Station Card */}
                    <Box
                        sx={{
                            width: '100%',
                            backgroundColor: isDark ? 'rgba(22, 29, 29, 0.7)' : '#FFFFFF',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 106, 106, 0.08)',
                            borderRadius: '18px',
                            p: { xs: 2.5, sm: 3 },
                            boxShadow: isDark
                                ? '0 15px 35px rgba(0,0,0,0.3), 0 0 30px rgba(0, 106, 106, 0.08)'
                                : '0 15px 35px rgba(0, 106, 106, 0.04), 0 0 15px rgba(0, 0, 0, 0.01)',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {/* Terminal Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#27C93F' }} />
                                </Box>
                                <Typography
                                    sx={{
                                        fontFamily: "'Outfit', sans-serif",
                                        fontWeight: 600,
                                        fontSize: '9px',
                                        color: isDark ? '#A2B8B8' : '#687878',
                                        letterSpacing: '0.8px',
                                        textTransform: 'uppercase',
                                        ml: 0.8
                                    }}
                                >
                                    Workstation Monitor
                                </Typography>
                            </Box>
                            
                            {/* Pulsing Live indicator */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                <Box 
                                    component={motion.span}
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    sx={{ 
                                        width: 5, 
                                        height: 5, 
                                        borderRadius: '50%', 
                                        backgroundColor: '#00D1B2',
                                        boxShadow: '0 0 5px #00D1B2'
                                    }} 
                                />
                                <Typography sx={{ fontSize: '9px', fontWeight: 600, color: '#00D1B2', letterSpacing: '0.5px' }}>
                                    LIVE
                                </Typography>
                            </Box>
                        </Box>

                        {/* Interactive Tab Switchers */}
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                gap: 0.5, 
                                p: 0.4, 
                                borderRadius: '8px', 
                                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : '#F0F6F6',
                                mb: { xs: 2, sm: 3 },
                                overflowX: { xs: 'auto', sm: 'visible' },
                                '&::-webkit-scrollbar': { display: 'none' },
                                scrollbarWidth: 'none',
                            }}
                        >
                            {Object.values(roles).map((role) => {
                                const isSelected = activeRole === role.id;
                                return (
                                    <Button
                                        key={role.id}
                                        onClick={() => setActiveRole(role.id)}
                                        sx={{
                                            flex: { xs: '1 0 auto', sm: 1 },
                                            py: { xs: 0.6, sm: 0.9 },
                                            px: { xs: 1.5, sm: 1.2 },
                                            borderRadius: '6px',
                                            textTransform: 'none',
                                            fontFamily: "'Outfit', sans-serif",
                                            fontWeight: 600,
                                            fontSize: { xs: '11px', sm: '11.5px' },
                                            color: isSelected 
                                                ? (isDark ? '#E0F2F1' : '#006A6A') 
                                                : (isDark ? '#7A9292' : '#687878'),
                                            backgroundColor: isSelected 
                                                ? (isDark ? 'rgba(0, 106, 106, 0.25)' : '#FFFFFF') 
                                                : 'transparent',
                                            border: isSelected && !isDark ? '1px solid rgba(0, 106, 106, 0.08)' : '1px solid transparent',
                                            boxShadow: isSelected && !isDark ? '0 2px 6px rgba(0, 106, 106, 0.05)' : 'none',
                                            minWidth: 0,
                                            '&:hover': {
                                                backgroundColor: isSelected 
                                                    ? (isDark ? 'rgba(0, 106, 106, 0.25)' : '#FFFFFF') 
                                                    : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,106,106,0.03)'),
                                            },
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {role.label}
                                    </Button>
                                );
                            })}
                        </Box>

                        {/* Animated Card Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeRole}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                            >
                                {/* User Role Identity Row */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar 
                                            sx={{ 
                                                width: { xs: 34, sm: 36 }, 
                                                height: { xs: 34, sm: 36 }, 
                                                fontSize: { xs: '11px', sm: '13px' }, 
                                                fontFamily: "'Outfit', sans-serif",
                                                fontWeight: 700,
                                                backgroundColor: isDark ? 'rgba(0, 106, 106, 0.2)' : 'rgba(0, 106, 106, 0.08)',
                                                color: isDark ? '#4DB6AC' : '#006A6A',
                                                border: `1px solid ${isDark ? 'rgba(0, 106, 106, 0.3)' : 'rgba(0, 106, 106, 0.15)'}`
                                            }}
                                        >
                                            {currentData.initials}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: { xs: '13px', sm: '13.5px' }, fontWeight: 600, color: isDark ? '#E0F2F1' : '#1A2E2E', lineHeight: 1.2 }}>
                                                {currentData.userName}
                                            </Typography>
                                            <Typography sx={{ fontSize: { xs: '10.5px', sm: '11px' }, color: isDark ? '#A2B8B8' : '#687878', fontWeight: 500 }}>
                                                {currentData.userRole}
                                            </Typography>
                                        </Box>
                                    </Box>
 
                                    {/* Clearance level indicator */}
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 0.5,
                                            px: { xs: 0.9, sm: 1 },
                                            py: { xs: 0.4, sm: 0.5 },
                                            borderRadius: '5px',
                                            backgroundColor: isDark ? 'rgba(46, 125, 50, 0.12)' : 'rgba(46, 125, 50, 0.08)',
                                            border: '1px solid rgba(46, 125, 50, 0.2)',
                                        }}
                                    >
                                        <ShieldCheck size={10} color="#2E7D32" />
                                        <Typography sx={{ fontSize: { xs: '10px', sm: '10.5px' }, fontWeight: 700, color: '#2E7D32', textTransform: 'uppercase', letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>
                                            {currentData.clearance}
                                        </Typography>
                                    </Box>
                                </Box>
 
                                {/* Compact stats row on mobile, grid on desktop */}
                                <Box 
                                    sx={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1.1fr' }, 
                                        gap: { xs: 2, sm: 2.5 }, 
                                        mb: { xs: 2.5, sm: 3 }
                                    }}
                                >
                                    {/* Left: Capacity / Metric load */}
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2 } }}>
                                        {/* Dynamic Progress Indicator */}
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                                                <Typography sx={{ fontSize: { xs: '12px', sm: '12.5px' }, fontWeight: 600, color: isDark ? '#B2C7C7' : '#4E5D5D' }}>
                                                    {currentData.progressLabel}
                                                </Typography>
                                                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: { xs: '12px', sm: '12.5px' }, fontWeight: 700, color: isDark ? '#E0F2F1' : '#111717' }}>
                                                    {currentData.progressValue}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#E5F0F0', overflow: 'hidden' }}>
                                                <Box 
                                                    component={motion.div}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${currentData.progressValue}%` }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                    sx={{ 
                                                        height: '100%', 
                                                        borderRadius: 3, 
                                                        background: 'linear-gradient(90deg, #006A6A 0%, #4DB6AC 100%)' 
                                                    }} 
                                                />
                                            </Box>
                                        </Box>
 
                                        {/* Metric Indicator */}
                                        <Box 
                                            sx={{ 
                                                p: { xs: 1.5, sm: 1.75 }, 
                                                borderRadius: '8px', 
                                                backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : '#F5FAFA',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.06)'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5
                                            }}
                                        >
                                            <Box 
                                                sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    width: { xs: 32, sm: 32 }, 
                                                    height: { xs: 32, sm: 32 }, 
                                                    borderRadius: '6px', 
                                                    backgroundColor: isDark ? 'rgba(77, 182, 172, 0.1)' : 'rgba(0, 106, 106, 0.06)',
                                                    color: isDark ? '#4DB6AC' : '#006A6A',
                                                    flexShrink: 0
                                                }}
                                            >
                                                <HeartPulse size={14} />
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: '11px', color: isDark ? '#A2B8B8' : '#687878', fontWeight: 500 }}>
                                                    {currentData.statLabel}
                                                </Typography>
                                                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: { xs: '13px', sm: '14px' }, fontWeight: 700, color: isDark ? '#E0F2F1' : '#111717' }}>
                                                    {currentData.statValue}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
 
                                    {/* Right: Live log ticker (Hidden on mobile) */}
                                    <Box 
                                        sx={{ 
                                            display: { xs: 'none', sm: 'flex' },
                                            p: { sm: 1.8 }, 
                                            borderRadius: '8px', 
                                            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.15)' : '#F5FAFA',
                                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.06)'}`,
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography sx={{ fontSize: '9px', fontWeight: 700, color: isDark ? '#A2B8B8' : '#687878', mb: 1, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                            Operations Feed
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                                            {currentData.logs.map((log, idx) => (
                                                <Box key={idx} sx={{ display: 'flex', gap: 0.8, alignItems: 'flex-start' }}>
                                                    <Clock size={9} color={isDark ? '#4DB6AC' : '#006A6A'} style={{ flexShrink: 0, marginTop: 2 }} />
                                                    <Box>
                                                        <Typography sx={{ fontSize: '11px', color: isDark ? '#E0F2F1' : '#1A2E2E', fontWeight: 500, lineHeight: 1.3 }}>
                                                            {log.text}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '9px', color: isDark ? '#7A9292' : '#8C9E9E', fontWeight: 500 }}>
                                                            {log.time}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            </motion.div>
                        </AnimatePresence>
 
                        {/* HIPAA Security Banner */}
                        <Box
                            sx={{
                                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.08)'}`,
                                pt: { xs: 1.5, sm: 1.8 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                <Lock size={12} color={isDark ? '#A2B8B8' : '#687878'} />
                                <Typography sx={{ fontSize: { xs: '10.5px', sm: '11.5px' }, color: isDark ? '#A2B8B8' : '#687878', fontWeight: 500 }}>
                                    End-to-End HIPAA Encrypted
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: { xs: '10.5px', sm: '11.5px' }, color: '#2E7D32', fontWeight: 700, letterSpacing: '0.5px' }}>
                                AES-256 SECURE
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
