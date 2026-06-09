import { useState } from 'react';
import { Box, Typography, Grid, useTheme, useMediaQuery, Collapse } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, 
    Calendar, 
    CreditCard, 
    Pill, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    Activity
} from 'lucide-react';
import { useThemeMode } from '../../app/theme/ThemeModeContext';

// --- Interactive Dashboard Widgets ---

const EMRWidget = ({ isDark }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 2 }}>
            {/* Patient Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: isDark ? 'rgba(77, 182, 172, 0.15)' : 'rgba(0, 106, 106, 0.08)',
                        color: isDark ? '#4DB6AC' : '#006A6A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '14px'
                    }}>
                        SJ
                    </Box>
                    <Box>
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '14px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                            Sara Jenkins
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: isDark ? '#A2B8B8' : '#7A9292' }}>
                            28 Yrs • Female • ID: #PT-8940
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{
                    px: 1.2,
                    py: 0.3,
                    borderRadius: '20px',
                    backgroundColor: isDark ? 'rgba(77, 182, 172, 0.12)' : 'rgba(0, 106, 106, 0.05)',
                    color: isDark ? '#4DB6AC' : '#006A6A',
                    fontSize: '11px',
                    fontWeight: 600,
                }}>
                    Outpatient
                </Box>
            </Box>

            {/* Vitals monitoring panel */}
            <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,106,106,0.02)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.04)'}`,
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#A2B8B8' : '#7A9292' }}>
                                Heart Rate
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    backgroundColor: '#BA1A1A',
                                    animation: 'pulse 1.2s infinite'
                                }} />
                                <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#BA1A1A' }}>Live</Typography>
                            </Box>
                        </Box>
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                            78 <span style={{ fontSize: '11px', fontWeight: 400, opacity: 0.7 }}>BPM</span>
                        </Typography>
                        {/* Live animated ECG graph */}
                        <Box sx={{ position: 'relative', height: 20, width: '100%', mt: 0.5, overflow: 'hidden' }}>
                            <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none">
                                <path
                                    d="M 0 10 L 25 10 L 28 3 L 31 17 L 34 10 L 45 10 L 48 1 L 51 19 L 54 10 L 100 10"
                                    fill="none"
                                    stroke={isDark ? '#4DB6AC' : '#006A6A'}
                                    strokeWidth="1.5"
                                    strokeDasharray="400"
                                    strokeDashoffset="400"
                                    style={{
                                        animation: 'ecg-draw 4s linear infinite'
                                    }}
                                />
                            </svg>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,106,106,0.02)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.04)'}`,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#A2B8B8' : '#7A9292', mb: 0.2 }}>
                            Blood Pressure & Oxygen
                        </Typography>
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '16px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E', mb: 0.2 }}>
                            120/80 <span style={{ fontSize: '10px', fontWeight: 400, opacity: 0.7 }}>mmHg</span>
                        </Typography>
                        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '12.5px', fontWeight: 600, color: isDark ? '#4DB6AC' : '#006A6A' }}>
                            SpO2: 99% <span style={{ fontSize: '9px', fontWeight: 400, color: isDark ? '#A2B8B8' : '#7A9292' }}>(Normal)</span>
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Bottom alert row */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                p: 1.2,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(186, 26, 26, 0.15)' : 'rgba(186, 26, 26, 0.04)',
                borderLeft: '3px solid #BA1A1A',
            }}>
                <AlertCircle size={15} color="#BA1A1A" style={{ flexShrink: 0 }} />
                <Typography sx={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#FF8A8A' : '#BA1A1A', lineHeight: 1.3 }}>
                    <strong>Allergy Warning:</strong> Penicillin (Severe anaphylactic risk)
                </Typography>
            </Box>
        </Box>
    );
};

const SchedulingWidget = ({ isDark }) => {
    const appointments = [
        { doctor: 'Dr. Amelia Hart', dept: 'Cardiology', time: '09:30 AM', status: 'Completed' },
        { doctor: 'Dr. Liam Stone', dept: 'Pediatrics', time: '11:00 AM', status: 'Scheduled' },
        { doctor: 'Dr. Sarah Chen', dept: 'Neurology', time: '02:15 PM', status: 'Active' }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                    Shift Schedule — Today
                </Typography>
                <Typography sx={{ fontSize: '10px', color: isDark ? '#A2B8B8' : '#7A9292', fontWeight: 500 }}>
                    3 Slots Booked
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {appointments.map((appt, idx) => (
                    <Box key={idx} sx={{
                        p: 1.2,
                        borderRadius: '10px',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.05)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: isDark ? 'none' : '0 2px 6px rgba(0,106,106,0.01)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Clock size={14} style={{ color: isDark ? '#4DB6AC' : '#006A6A' }} />
                            <Box>
                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                                    {appt.doctor}
                                </Typography>
                                <Typography sx={{ fontSize: '10px', color: isDark ? '#A2B8B8' : '#7A9292' }}>
                                    {appt.dept} • {appt.time}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{
                            px: 1,
                            py: 0.2,
                            borderRadius: '8px',
                            fontSize: '9.5px',
                            fontWeight: 600,
                            backgroundColor: appt.status === 'Completed'
                                ? 'rgba(29, 107, 53, 0.12)'
                                : appt.status === 'Active'
                                ? 'rgba(0, 106, 106, 0.15)'
                                : 'rgba(74, 99, 99, 0.1)',
                            color: appt.status === 'Completed'
                                ? '#2E7D32'
                                : appt.status === 'Active'
                                ? (isDark ? '#4DB6AC' : '#006A6A')
                                : (isDark ? '#BEC9C8' : '#4A6363'),
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            {appt.status === 'Active' && (
                                <Box sx={{
                                    width: 5,
                                    height: 5,
                                    borderRadius: '50%',
                                    backgroundColor: isDark ? '#4DB6AC' : '#006A6A',
                                    animation: 'pulse 1.2s infinite'
                                }} />
                            )}
                            {appt.status}
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
                backgroundColor: isDark ? 'rgba(29, 107, 53, 0.15)' : 'rgba(29, 107, 53, 0.04)',
                borderLeft: '3px solid #1D6B35',
            }}>
                <CheckCircle2 size={15} color="#1D6B35" style={{ flexShrink: 0 }} />
                <Typography sx={{ fontSize: '10.5px', fontWeight: 500, color: isDark ? '#A5D6A7' : '#1D6B35', lineHeight: 1.3 }}>
                    <strong>Optimizer:</strong> Automatically resolved doctor shift overlap conflict.
                </Typography>
            </Box>
        </Box>
    );
};

const PharmacyWidget = ({ isDark }) => {
    const items = [
        { name: 'Amoxicillin 500mg', stock: '850 / 1000 units', value: 85, color: '#006A6A', darkColor: '#4DB6AC' },
        { name: 'Insulin Glargine', stock: '36 / 200 units', value: 18, color: '#BA1A1A', darkColor: '#FF8A8A', isLow: true },
        { name: 'Paracetamol 250mg', stock: '640 / 800 units', value: 80, color: '#006A6A', darkColor: '#4DB6AC' }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                    Real-Time Stock Monitor
                </Typography>
                <Typography sx={{ fontSize: '10px', color: isDark ? '#A2B8B8' : '#7A9292', fontWeight: 500 }}>
                    Active Dispensary
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {items.map((item, idx) => {
                    const activeColor = isDark ? item.darkColor : item.color;
                    return (
                        <Box key={idx}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                                    {item.name}
                                </Typography>
                                <Typography sx={{ fontSize: '10px', color: item.isLow ? activeColor : (isDark ? '#A2B8B8' : '#7A9292'), fontWeight: item.isLow ? 700 : 500 }}>
                                    {item.stock} {item.isLow && '• LOW STOCK'}
                                </Typography>
                            </Box>
                            <Box sx={{
                                width: '100%',
                                height: 5,
                                borderRadius: 3,
                                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,106,106,0.06)',
                                overflow: 'hidden'
                            }}>
                                <Box sx={{
                                    width: `${item.value}%`,
                                    height: '100%',
                                    backgroundColor: activeColor,
                                    borderRadius: 3,
                                }} />
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                p: 1.2,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(0, 106, 106, 0.15)' : 'rgba(0, 106, 106, 0.04)',
                borderLeft: `3px solid ${isDark ? '#4DB6AC' : '#006A6A'}`,
            }}>
                <Pill size={14} color={isDark ? '#4DB6AC' : '#006A6A'} style={{ flexShrink: 0 }} />
                <Typography sx={{ fontSize: '10.5px', fontWeight: 500, color: isDark ? '#B2C7C7' : '#006A6A', lineHeight: 1.3 }}>
                    <strong>Auto-Order:</strong> Approved PO #PH-982 for +200 units of Insulin Glargine.
                </Typography>
            </Box>
        </Box>
    );
};

const BillingWidget = ({ isDark }) => {
    const items = [
        { label: 'General Consultation', price: '$100.00' },
        { label: 'Laboratory Panel (CBC & Vitals)', price: '$180.00' },
        { label: 'Prescribed Medication', price: '$60.00' }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,106,106,0.05)'}`, pb: 0.8 }}>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '13px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                    Ledger Summary
                </Typography>
                <Typography sx={{ fontSize: '10px', color: isDark ? '#4DB6AC' : '#006A6A', fontWeight: 700 }}>
                    INV-2026-8942
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {items.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontSize: '11px', color: isDark ? '#A2B8B8' : '#5C7474' }}>
                            {item.label}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                            {item.price}
                        </Typography>
                    </Box>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,106,106,0.1)'}`, pt: 0.8, mt: 0.3 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                        Total Amount
                    </Typography>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: 700, color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                        $340.00
                    </Typography>
                </Box>
            </Box>

            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                p: 1.2,
                borderRadius: '8px',
                backgroundColor: isDark ? 'rgba(29, 107, 53, 0.15)' : 'rgba(29, 107, 53, 0.04)',
                borderLeft: '3px solid #1D6B35',
            }}>
                <CreditCard size={14} color="#1D6B35" style={{ flexShrink: 0 }} />
                <Box>
                    <Typography sx={{ fontSize: '10.5px', fontWeight: 600, color: isDark ? '#A5D6A7' : '#1D6B35', mb: 0.1 }}>
                        Insurance Approved: 80% co-pay
                    </Typography>
                    <Typography sx={{ fontSize: '9.5px', color: isDark ? '#A2B8B8' : '#5C7474' }}>
                        Patient Balance due: <strong>$68.00</strong>
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

// --- Main Section ---

export const FeaturesSection = () => {
    const { mode } = useThemeMode();
    const isDark = mode === 'dark';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [activeTab, setActiveTab] = useState(0);

    const features = [
        {
            icon: <FileText size={20} />,
            title: 'Clinical Records (EMR)',
            subtitle: 'Unified vital records and care charts.',
            description: 'Maintain patient profiles, track allergies, log real-time vitals, and view historic clinical metrics instantly at the point of care.',
        },
        {
            icon: <Calendar size={20} />,
            title: 'Smart Scheduling',
            subtitle: 'Calendar workflows and shift allocation.',
            description: 'Coordinate appointments across doctor shifts automatically. Prevent schedule overlaps and automate SMS reminder logs.',
        },
        {
            icon: <Pill size={20} />,
            title: 'Pharmacy & Stock Tracker',
            subtitle: 'Dispensary counts and automated orders.',
            description: 'Monitor pharmacy stock levels in real time. Low stock items trigger automated purchase requests to suppliers instantly.',
        },
        {
            icon: <CreditCard size={20} />,
            title: 'Integrated Billings',
            subtitle: 'Instant co-pays and insurance clearance.',
            description: 'Combine consultation, lab, and prescription charges into a unified invoice with automated insurance co-pay checks.',
        },
    ];

    const renderWidget = (index) => {
        switch (index) {
            case 0:
                return <EMRWidget isDark={isDark} />;
            case 1:
                return <SchedulingWidget isDark={isDark} />;
            case 2:
                return <PharmacyWidget isDark={isDark} />;
            case 3:
                return <BillingWidget isDark={isDark} />;
            default:
                return null;
        }
    };

    return (
        <Box
            id="features"
            sx={{
                scrollMarginTop: '80px',
                py: { xs: 6, sm: 10, md: 16 },
                px: { xs: 2.5, sm: 4, md: 6 },
                backgroundColor: isDark ? '#0F1515' : '#FAFDFD',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            {/* Decorative background gradients */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '-5%',
                    width: 350,
                    height: 350,
                    borderRadius: '50%',
                    background: isDark ? 'radial-gradient(circle, rgba(0, 106, 106, 0.1) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(77, 182, 172, 0.1) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '-5%',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: isDark ? 'radial-gradient(circle, rgba(77, 182, 172, 0.08) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0, 106, 106, 0.06) 0%, transparent 70%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ width: '100%', maxWidth: 1200, position: 'relative', zIndex: 1 }}>
                {/* Header text */}
                <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6 }}
                    sx={{ textAlign: 'center', mb: { xs: 4, md: 10 } }}
                >
                    <Typography
                        sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '1.5px',
                            color: '#006A6A',
                            textTransform: 'uppercase',
                            mb: 2,
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: '30px',
                            backgroundColor: isDark ? 'rgba(0, 106, 106, 0.15)' : 'rgba(0, 106, 106, 0.05)',
                        }}
                    >
                        Feature Suite
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: 700,
                            fontSize: { xs: '24px', sm: '34px', md: '44px' },
                            color: isDark ? '#E0F2F1' : '#1A2E2E',
                            mb: 2,
                            lineHeight: 1.2,
                        }}
                    >
                        Advanced Tools for Modern Clinical Care
                    </Typography>
                    <Typography
                        sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: { xs: '15px', md: '16.5px' },
                            color: isDark ? '#B2C7C7' : '#5C7474',
                            maxWidth: 680,
                            mx: 'auto',
                            lineHeight: 1.6,
                        }}
                    >
                        Al Shifaa consolidates patient files, calendars, inventory, and diagnostics into a unified, secure system designed for quick workflow decisions.
                    </Typography>
                </Box>

                {isMobile ? (
                    // --- Mobile Layout: Interactive Accordion Stack ---
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {features.map((feature, idx) => {
                            const isOpen = activeTab === idx;
                            return (
                                <Box
                                    key={idx}
                                    onClick={() => setActiveTab(isOpen ? -1 : idx)}
                                    sx={{
                                        p: { xs: 2.2, sm: 3 },
                                        borderRadius: '16px',
                                        backgroundColor: isOpen 
                                            ? (isDark ? 'rgba(22, 29, 29, 0.7)' : '#FFFFFF') 
                                            : (isDark ? 'rgba(22, 29, 29, 0.3)' : 'rgba(255, 255, 255, 0.4)'),
                                        border: isOpen
                                            ? `1px solid ${isDark ? '#4DB6AC' : '#006A6A'}`
                                            : `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.06)'}`,
                                        boxShadow: isOpen 
                                            ? (isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,106,106,0.04)') 
                                            : 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {/* Icon & Title row */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: '12px',
                                            backgroundColor: isOpen
                                                ? (isDark ? 'rgba(77, 182, 172, 0.18)' : 'rgba(0, 106, 106, 0.08)')
                                                : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,106,106,0.04)'),
                                            color: isOpen 
                                                ? (isDark ? '#4DB6AC' : '#006A6A') 
                                                : (isDark ? '#A2B8B8' : '#5C7474'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                        }}>
                                            {feature.icon}
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '16px', color: isDark ? '#E0F2F1' : '#1A2E2E' }}>
                                                {feature.title}
                                            </Typography>
                                            {!isOpen && (
                                                <Typography sx={{ fontSize: '12.5px', color: isDark ? '#A2B8B8' : '#7A9292' }}>
                                                    {feature.subtitle}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Collapsible content pane */}
                                    <Collapse in={isOpen} timeout={300}>
                                        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }} onClick={(e) => e.stopPropagation()}>
                                            <Typography sx={{ fontSize: '13.5px', color: isDark ? '#B2C7C7' : '#5C7474', lineHeight: 1.5 }}>
                                                {feature.description}
                                            </Typography>
                                            {/* Nested Simulated Widget preview */}
                                            <Box sx={{
                                                p: { xs: 1.8, sm: 2.5 },
                                                borderRadius: '14px',
                                                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 106, 106, 0.02)',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0, 106, 106, 0.05)'}`,
                                            }}>
                                                {renderWidget(idx)}
                                            </Box>
                                        </Box>
                                    </Collapse>
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    // --- Desktop Layout: Tab split view with side panel mockup ---
                    <Grid container spacing={5} alignItems="stretch">
                        {/* Left Column: Interactive tabs stack */}
                        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {features.map((feature, idx) => {
                                const isActive = activeTab === idx;
                                return (
                                    <Box
                                        key={idx}
                                        component={motion.div}
                                        onClick={() => setActiveTab(idx)}
                                        whileHover={{ x: 4 }}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: '16px',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            backgroundColor: isActive 
                                                ? (isDark ? 'rgba(22, 29, 29, 0.5)' : '#FFFFFF') 
                                                : 'transparent',
                                            border: isActive
                                                ? `1px solid ${isDark ? 'rgba(77, 182, 172, 0.15)' : 'rgba(0, 106, 106, 0.08)'}`
                                                : `1px solid transparent`,
                                            boxShadow: isActive 
                                                ? (isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,106,106,0.04)') 
                                                : 'none',
                                            transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s',
                                            '&::before': isActive ? {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: '25%',
                                                height: '50%',
                                                width: '4px',
                                                borderRadius: '0 4px 4px 0',
                                                backgroundColor: isDark ? '#4DB6AC' : '#006A6A'
                                            } : {}
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                            <Box sx={{
                                                mt: 0.3,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 38,
                                                height: 38,
                                                borderRadius: '10px',
                                                backgroundColor: isActive
                                                    ? (isDark ? 'rgba(77, 182, 172, 0.18)' : 'rgba(0, 106, 106, 0.08)')
                                                    : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,106,106,0.03)'),
                                                color: isActive 
                                                    ? (isDark ? '#4DB6AC' : '#006A6A') 
                                                    : (isDark ? '#A2B8B8' : '#7A9292'),
                                                transition: 'all 0.3s ease',
                                                flexShrink: 0
                                            }}>
                                                {feature.icon}
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '15.5px', color: isDark ? '#E0F2F1' : '#1A2E2E', mb: 0.5 }}>
                                                    {feature.title}
                                                </Typography>
                                                <Typography sx={{ fontSize: '12.5px', color: isDark ? '#A2B8B8' : '#7A9292', lineHeight: 1.4 }}>
                                                    {feature.subtitle}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Grid>

                        {/* Right Column: Premium Dashboard Preview Mockup */}
                        <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
                            <Box sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: '24px',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0, 106, 106, 0.08)'}`,
                                backgroundColor: isDark ? 'rgba(22, 29, 29, 0.3)' : '#FFFFFF',
                                boxShadow: isDark 
                                    ? '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                                    : '0 25px 60px rgba(0, 106, 106, 0.05)',
                                backdropFilter: 'blur(10px)',
                                overflow: 'hidden'
                            }}>
                                {/* Mockup window header bar */}
                                <Box sx={{
                                    px: 3,
                                    py: 1.8,
                                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 106, 106, 0.03)',
                                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 106, 106, 0.06)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    {/* OS traffic lights */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#BA1A1A', opacity: 0.7 }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#E0A900', opacity: 0.7 }} />
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#1D6B35', opacity: 0.7 }} />
                                    </Box>
                                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#A2B8B8' : '#7A9292', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.5px' }}>
                                        AL SHIFAA MANAGEMENT SYSTEM — SECURE PORTAL
                                    </Typography>
                                    <Box sx={{ width: 38 }} /> {/* spacer */}
                                </Box>

                                {/* Mockup window panel content area */}
                                <Box sx={{ p: 4.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -15 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                                        >
                                            <Box sx={{ mb: 3 }}>
                                                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '18px', color: isDark ? '#E0F2F1' : '#1A2E2E', mb: 1 }}>
                                                    {features[activeTab].title}
                                                </Typography>
                                                <Typography sx={{ fontSize: '13.5px', color: isDark ? '#B2C7C7' : '#5C7474', lineHeight: 1.5 }}>
                                                    {features[activeTab].description}
                                                </Typography>
                                            </Box>
                                            
                                            {/* The Interactive Preview Widget */}
                                            <Box sx={{
                                                p: 3,
                                                borderRadius: '16px',
                                                backgroundColor: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 106, 106, 0.01)',
                                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0, 106, 106, 0.04)'}`,
                                                boxShadow: isDark ? 'none' : 'inset 0 1px 3px rgba(0, 106, 106, 0.01)',
                                            }}>
                                                {renderWidget(activeTab)}
                                            </Box>
                                        </motion.div>
                                    </AnimatePresence>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

