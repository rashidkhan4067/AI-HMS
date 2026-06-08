import { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Heart, Activity, Calendar, Clock, Stethoscope, 
    ShieldCheck, CheckCircle, Server, Layers, Lock, Key, ShieldAlert 
} from 'lucide-react';

/* ── Animation presets ── */
const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
};

/* ────────────────────────────────────────────────────────
   1. Patient Mockup Widget
   ──────────────────────────────────────────────────────── */
const PatientWidget = ({ isRegister }) => {
    if (!isRegister) {
        // Patient Dashboard: Health Monitoring Vitals
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        My Health Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4DB6AC' }}>
                        <Activity size={12} className="animate-pulse" />
                        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            Live Sync
                        </Typography>
                    </Box>
                </Box>

                {/* Vitals Cards */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {/* BPM Card */}
                    <Box
                        component={motion.div}
                        variants={itemVariants}
                        sx={{
                            flex: 1,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px',
                            p: 1.5,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif", fontSize: '10px' }}>
                                Heart Rate
                            </Typography>
                            <Heart size={14} color="#FF5252" fill="#FF5252" />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700 }}>
                                72
                            </Typography>
                            <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>
                                BPM
                            </Typography>
                        </Box>
                        {/* Pulse animation */}
                        <Box sx={{ mt: 1, height: 16, opacity: 0.6 }}>
                            <svg viewBox="0 0 100 20" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                <motion.path
                                    d="M0 10 L20 10 L25 5 L30 15 L35 10 L50 10 L55 0 L60 20 L65 10 L100 10"
                                    fill="none"
                                    stroke="#4DB6AC"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                                />
                            </svg>
                        </Box>
                    </Box>

                    {/* SpO2 Card */}
                    <Box
                        component={motion.div}
                        variants={itemVariants}
                        sx={{
                            flex: 1,
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px',
                            p: 1.5,
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif", fontSize: '10px' }}>
                                Oxygen Level
                            </Typography>
                            <Activity size={14} color="#4DB6AC" />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700 }}>
                                98
                            </Typography>
                            <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>
                                %
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4DB6AC' }} />
                            <Typography sx={{ fontSize: '9px', color: '#4DB6AC', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                                Optimal Range
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Upcoming Appointment Alert */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        p: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ p: 1, borderRadius: '10px', backgroundColor: 'rgba(77, 182, 172, 0.15)', color: '#4DB6AC', display: 'flex' }}>
                        <Calendar size={18} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '11px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: '#FFFFFF' }}>
                            Dr. Tariq Khan
                        </Typography>
                        <Typography sx={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>
                            Cardiology · Today at 4:30 PM
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', color: '#4DB6AC' }}>
                        <CheckCircle size={14} />
                    </Box>
                </Box>
            </Box>
        );
    } else {
        // Patient Signup: Data Privacy / Trust Shield
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Data Privacy & Trust
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4DB6AC' }}>
                        <ShieldCheck size={12} />
                        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            HIPAA Compliant
                        </Typography>
                    </Box>
                </Box>

                {/* Privacy Lock Card */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'linear-gradient(135deg, rgba(77, 182, 172, 0.15) 0%, rgba(77, 182, 172, 0.05) 100%)',
                        border: '1px solid rgba(77, 182, 172, 0.25)',
                        borderRadius: '16px',
                        p: 2,
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Glowing lock badge */}
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(0, 106, 106, 0.3)',
                            border: '1px solid #4DB6AC',
                            boxShadow: '0 0 16px rgba(77, 182, 172, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1.5,
                            color: '#4DB6AC'
                        }}
                    >
                        <Lock size={22} />
                    </Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: '#FFFFFF', mb: 0.5 }}>
                        End-to-End Encryption
                    </Typography>
                    <Typography sx={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                        Your health profiles and medical history are encrypted at rest under zero-sharing policies.
                    </Typography>
                </Box>

                {/* HIPAA assurance badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <ShieldCheck size={14} color="#4DB6AC" />
                    <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif" }}>
                        AES-256 Medical Records Shield Active
                    </Typography>
                </Box>
            </Box>
        );
    }
};

/* ────────────────────────────────────────────────────────
   2. Doctor Mockup Widget
   ──────────────────────────────────────────────────────── */
const DoctorWidget = ({ isRegister }) => {
    if (!isRegister) {
        // Doctor Dashboard: Daily Schedule / Current Clinic Status
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Clinic Status
                    </Typography>
                    <Box sx={{ px: 1, py: 0.25, borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: '#9CF1F0' }}>
                            4/12 Patients Checked In
                        </Typography>
                    </Box>
                </Box>

                {/* Active Consultation Panel */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'linear-gradient(135deg, rgba(0, 106, 106, 0.25) 0%, rgba(0, 106, 106, 0.05) 100%)',
                        border: '1px solid rgba(77, 182, 172, 0.3)',
                        borderRadius: '12px',
                        p: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Stethoscope size={14} color="#9CF1F0" />
                            <Typography sx={{ fontSize: '10px', color: '#9CF1F0', fontWeight: 600, fontFamily: "'Outfit', sans-serif", letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                In Consultation
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4DB6AC', animation: 'pulse 1.5s infinite' }} />
                            <Typography sx={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif" }}>08:24 mins</Typography>
                        </Box>
                    </Box>

                    <Typography sx={{ fontSize: '14px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: '#FFFFFF', mb: 0.25 }}>
                        Sarah Ahmed
                    </Typography>
                    <Typography sx={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", mb: 1.5 }}>
                        Female, 28 · Cardiology Consultation
                    </Typography>

                    {/* Quick ERP Actions */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Box sx={{ flex: 1, height: 26, borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, cursor: 'pointer' }}>
                            <Activity size={10} color="rgba(255,255,255,0.7)" />
                            <Typography sx={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>History</Typography>
                        </Box>
                        <Box sx={{ flex: 1, height: 26, borderRadius: '6px', backgroundColor: '#006A6A', border: '1px solid rgba(77, 182, 172, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, cursor: 'pointer' }}>
                            <Layers size={10} color="#FFFFFF" />
                            <Typography sx={{ fontSize: '9px', color: '#FFFFFF', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>E-Prescribe</Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Queue status */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        p: 1.25,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock size={13} color="rgba(255,255,255,0.5)" />
                        <Typography sx={{ fontSize: '11px', fontWeight: 500, fontFamily: "'Outfit', sans-serif", color: 'rgba(255,255,255,0.85)' }}>
                            Bilal Khan
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '9.5px', color: '#9CF1F0', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
                        Next (11:00 AM)
                    </Typography>
                </Box>
            </Box>
        );
    } else {
        // Doctor Signup: Credentials & PMDC Verification
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Specialist Verification
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4DB6AC' }}>
                        <Stethoscope size={12} />
                        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            Credential Verification
                        </Typography>
                    </Box>
                </Box>

                {/* PMDC Validation badge card */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        p: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
                            Medical Registry Sync
                        </Typography>
                        <Box sx={{ px: 1, py: 0.2, backgroundColor: 'rgba(77,182,172,0.15)', border: '1px solid #4DB6AC', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CheckCircle size={8} color="#4DB6AC" />
                            <Typography sx={{ fontSize: '7.5px', color: '#4DB6AC', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>PMDC_VERIFIED</Typography>
                        </Box>
                    </Box>

                    <Typography sx={{ fontSize: '14px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: '#FFFFFF', mb: 0.5 }}>
                        License Credentials Check
                    </Typography>
                    <Typography sx={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                        Applications are verified live with the Pakistan Medical & Dental Council registry for active practicing status.
                    </Typography>
                </Box>

                {/* Audit protection note */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <ShieldCheck size={14} color="#4DB6AC" />
                    <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif" }}>
                        Secure Audit Node • Zero Spam Guard Active
                    </Typography>
                </Box>
            </Box>
        );
    }
};

/* ────────────────────────────────────────────────────────
   3. Staff Mockup Widget
   ──────────────────────────────────────────────────────── */
const StaffWidget = ({ isRegister }) => {
    if (!isRegister) {
        // Staff Dashboard: Inpatient bed occupancy and event console feed
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        HMS Operations Node
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4DB6AC' }} />
                        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", color: '#4DB6AC' }}>
                            Core Systems Online
                        </Typography>
                    </Box>
                </Box>

                {/* Bed Occupancy Card */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        p: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif" }}>
                            Inpatient Bed Occupancy
                        </Typography>
                        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#9CF1F0', fontFamily: "'Outfit', sans-serif" }}>
                            84% Filled
                        </Typography>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={84} 
                        sx={{ 
                            height: 6, 
                            borderRadius: '3px', 
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#4DB6AC',
                                borderRadius: '3px',
                            }
                        }} 
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography sx={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>168 Active Beds</Typography>
                        <Typography sx={{ fontSize: '8.5px', color: '#4DB6AC', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>32 Available</Typography>
                    </Box>
                </Box>

                {/* Operations Feed console */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        p: 1.25,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.6)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 0.75, mb: 0.75 }}>
                        <Server size={10} color="#9CF1F0" />
                        <Typography sx={{ fontSize: '9px', fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: '#9CF1F0' }}>HMS Operations Feed</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>[10:14] BED-ALLOC: Room 204</span>
                            <span style={{ color: '#4DB6AC' }}>OK</span>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>[10:12] LAB-SYNC: Sample #4092</span>
                            <span style={{ color: '#4DB6AC' }}>SYNC</span>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    } else {
        // Staff Onboarding: Invitation security / Role verification
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Invite Token Validation
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4DB6AC' }}>
                        <Key size={12} />
                        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            Secure Invite
                        </Typography>
                    </Box>
                </Box>

                {/* Token Validator Card */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        p: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
                            Admin Token Signature
                        </Typography>
                        <Box sx={{ px: 1, py: 0.2, backgroundColor: 'rgba(77,182,172,0.15)', border: '1px solid #4DB6AC', borderRadius: '4px' }}>
                            <Typography sx={{ fontSize: '8px', color: '#4DB6AC', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>TOKEN_VALID</Typography>
                        </Box>
                    </Box>

                    <Typography sx={{ fontSize: '14px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: '#FFFFFF', mb: 0.5 }}>
                        Access Rights Configured
                    </Typography>
                    <Typography sx={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                        Your registration links directly to your assigned role-based permissions prepared by the clinical administration team.
                    </Typography>
                </Box>

                {/* Access control details */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <ShieldCheck size={14} color="#4DB6AC" />
                    <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif" }}>
                        Role-Based Access Control Audit Logged
                    </Typography>
                </Box>
            </Box>
        );
    }
};

/* ────────────────────────────────────────────────────────
   4. General / Fallback Widget
   ──────────────────────────────────────────────────────── */
const GeneralWidget = ({ isRegister }) => {
    if (!isRegister) {
        // General Login: Clinical Enterprise Ecosystem Network
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Unified Care Platform
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#9CF1F0' }}>
                        <ShieldCheck size={12} />
                        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            HIPAA Secured
                        </Typography>
                    </Box>
                </Box>

                {/* Central Network Connection visualization */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        height: 130,
                        background: 'radial-gradient(circle at center, rgba(0, 106, 106, 0.15) 0%, transparent 70%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* SVG connection lines */}
                    <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                        <motion.line x1="18%" y1="50%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
                        <motion.line x1="82%" y1="50%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
                        <motion.line x1="50%" y1="20%" x2="50%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="3 3" />
                    </svg>

                    {/* Network Nodes */}
                    <Box sx={{ position: 'absolute', left: '12%', top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#4DB6AC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={24} strokeWidth={2} />
                    </Box>
                    <Box sx={{ position: 'absolute', right: '12%', top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#4DB6AC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={24} strokeWidth={2} />
                    </Box>
                    <Box sx={{ position: 'absolute', left: '50%', top: '12%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#4DB6AC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Stethoscope size={24} strokeWidth={2} />
                    </Box>

                    {/* Center Core Hub */}
                    <Box
                        component={motion.div}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2,
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #006A6A 0%, #004F4F 100%)',
                            border: '2px solid #9CF1F0',
                            boxShadow: '0 0 16px rgba(156, 241, 240, 0.4)',
                            filter: 'drop-shadow(0 0 8px rgba(0, 212, 212, 0.4))',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Server size={24} strokeWidth={2} />
                    </Box>
                </Box>

                {/* Network sync details */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '12px',
                        p: 1.25,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Layers size={13} color="rgba(255,255,255,0.6)" />
                        <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontFamily: "'DM Sans', sans-serif" }}>
                            End-to-End Encrypted Network
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '10px', color: '#4DB6AC', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                        99.9% SYNCED
                    </Typography>
                </Box>
            </Box>
        );
    } else {
        // General Signup: Enterprise System Security & Trust panel
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Enterprise Security
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4DB6AC' }}>
                        <ShieldCheck size={12} />
                        <Typography variant="caption" sx={{ fontSize: '10px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            ISO 27001 Audited
                        </Typography>
                    </Box>
                </Box>

                {/* System security overview card */}
                <Box
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        p: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}>
                            Zero-Trust Core Architecture
                        </Typography>
                        <Box sx={{ px: 1, py: 0.2, backgroundColor: 'rgba(77,182,172,0.15)', border: '1px solid #4DB6AC', borderRadius: '4px' }}>
                            <Typography sx={{ fontSize: '8px', color: '#4DB6AC', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>AUDIT_OK</Typography>
                        </Box>
                    </Box>

                    <Typography sx={{ fontSize: '14px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: '#FFFFFF', mb: 0.5 }}>
                        Secure Registry Services
                    </Typography>
                    <Typography sx={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>
                        Al Shifaa deploys zero-trust, audited system logs to verify all onboarding clinics, specialist doctors, and patient accounts.
                    </Typography>
                </Box>

                {/* HIPAA compliance and security locks info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <Lock size={14} color="#4DB6AC" />
                    <Typography sx={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', fontFamily: "'DM Sans', sans-serif" }}>
                        Compliance: HIPAA, GDPR, ISO 27001
                    </Typography>
                </Box>
            </Box>
        );
    }
};

/* ────────────────────────────────────────────────────────
   Main BrandIllustration Component
   ──────────────────────────────────────────────────────── */
export const BrandIllustration = ({ stats, showcaseMode, isRegister }) => {
    const activeStats = stats || [
        { value: "1,200+", label: "Patients Managed", color: "#9CF1F0" },
        { value: "99.9%", label: "System Uptime", color: "#9CF1F0" },
        { value: "50+", label: "Hospitals Onboarded", color: "#9CF1F0" }
    ];

    const renderWidget = () => {
        switch (showcaseMode) {
            case 'patient':
                return <PatientWidget isRegister={isRegister} />;
            case 'doctor':
                return <DoctorWidget isRegister={isRegister} />;
            case 'staff':
                return <StaffWidget isRegister={isRegister} />;
            case 'general':
            default:
                return <GeneralWidget isRegister={isRegister} />;
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                my: { md: 2, lg: 3 },
                width: '100%',
            }}
        >
            {/* ── Glassmorphic Illustration Card ── */}
            <Box
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="glass-illustration-card"
                sx={{
                    width: '100%',
                    maxWidth: 320,
                    minHeight: 210,
                    p: 2.25,
                    mb: 3.5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: 'rgba(255, 255, 255, 0.10) !important',
                    backdropFilter: 'blur(8px) !important',
                    WebkitBackdropFilter: 'blur(8px) !important',
                    border: '1px solid rgba(255, 255, 255, 0.20) !important',
                    borderRadius: '16px !important',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important',
                }}
            >
                {/* Backing decorative glow */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-20%',
                        width: '70%',
                        height: '70%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(156,241,240,0.15) 0%, transparent 60%)',
                        pointerEvents: 'none',
                        zIndex: 0,
                    }}
                />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${showcaseMode || 'default'}-${isRegister ? 'register' : 'login'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ width: '100%', zIndex: 1 }}
                    >
                        {renderWidget()}
                    </motion.div>
                </AnimatePresence>
            </Box>

            {/* ── 3 Floating Stat Cards ── */}
            <Box
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                sx={{
                    display: 'flex',
                    gap: 1.5,
                    width: '100%',
                    justifyContent: 'center',
                }}
            >
                {activeStats.map((item, idx) => (
                    <Box
                        key={idx}
                        component={motion.div}
                        variants={itemVariants}
                        whileHover={{ 
                            scale: 1.05, 
                            borderColor: 'rgba(255,255,255,0.4)',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                            backgroundColor: 'rgba(255, 255, 255, 0.12)' 
                        }}
                        transition={{ duration: 0.2 }}
                        sx={{
                            flex: 1,
                            maxWidth: 110,
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '12px',
                            px: 1,
                            py: 1.25,
                            textAlign: 'center',
                            color: '#FFFFFF',
                            cursor: 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            height: 64,
                        }}
                    >
                        <Typography sx={{ fontSize: '16px', fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: item.color || '#9CF1F0', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                            {item.value}
                        </Typography>
                        <Typography sx={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.65)', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, mt: 0.5, lineHeight: 1.25 }}>
                            {item.label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
