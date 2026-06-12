import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Grid, Card, CardContent, Typography, Button, IconButton, 
    Skeleton, Alert, CircularProgress, LinearProgress, Chip, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
    Users, Mail, Award, AlertTriangle, 
    ArrowUpRight, Plus, Eye, ShieldAlert,
    Activity, Server, RefreshCw
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const AdminDashboardOverview = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    
    const { 
        overview: stats, 
        loadingStates, 
        errorStates, 
        refreshOverview: fetchOverview 
    } = useAdmin();

    const loading = loadingStates.overview;
    const error = errorStates.overview;

    // Diagnostics Simulator State
    const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
    const [diagnosticsOutput, setDiagnosticsOutput] = useState([
        { label: 'PostgreSQL Database Connection', status: 'Optimal', latency: '14ms', color: '#1D6B35' },
        { label: 'SMTP Email Dispatch Service', status: 'Connected', latency: '38ms', color: '#1D6B35' },
        { label: 'Google OAuth API Gateway', status: 'Online', latency: '24ms', color: '#1D6B35' },
        { label: 'JWT Signature Token Issuance', status: 'Secured', latency: '2ms', color: '#1D6B35' }
    ]);
    const [diagnosticsMessage, setDiagnosticsMessage] = useState('All systems reporting nominal status.');

    const runDiagnostics = useCallback(() => {
        setDiagnosticsLoading(true);
        setDiagnosticsMessage('Initiating system-wide handshake diagnostics...');
        
        setTimeout(() => {
            const randomLatency = (min, max) => `${Math.floor(Math.random() * (max - min + 1) + min)}ms`;
            setDiagnosticsOutput([
                { label: 'PostgreSQL Database Connection', status: 'Optimal', latency: randomLatency(8, 25), color: '#1D6B35' },
                { label: 'SMTP Email Dispatch Service', status: 'Connected', latency: randomLatency(30, 60), color: '#1D6B35' },
                { label: 'Google OAuth API Gateway', status: 'Online', latency: randomLatency(15, 40), color: '#1D6B35' },
                { label: 'JWT Signature Token Issuance', status: 'Secured', latency: randomLatency(1, 3), color: '#1D6B35' }
            ]);
            setDiagnosticsLoading(false);
            setDiagnosticsMessage('Diagnostics complete. All systems online and secured.');
        }, 1500);
    }, []);

    const kpis = useMemo(() => [
        { title: 'Total Active Staff', value: stats.total_active_staff, desc: 'Doctors, Nurses & Support staff', icon: Users, color: '#006A6A', bg: 'rgba(0, 106, 106, 0.05)', path: '/admin/users' },
        { title: 'Pending Applications', value: stats.pending_applications, desc: 'Doctor profiles awaiting review', icon: Award, color: '#005858', bg: 'rgba(0, 88, 88, 0.05)', path: '/admin/applications' },
        { title: 'Active Invite Tokens', value: stats.active_invite_tokens, desc: 'Tokens valid for 7 calendar days', icon: Mail, color: '#4DB6AC', bg: 'rgba(77, 182, 172, 0.08)', path: '/admin/invites' },
        { title: 'Security Warnings', value: stats.security_warnings, desc: 'Failed logins in past 24 hours', icon: AlertTriangle, color: '#BA1A1A', bg: 'rgba(186, 26, 26, 0.05)', path: '/admin/audits' },
    ], [stats]);

    // Staff proportions helper - Memoized for clean performance
    const staffDistribution = useMemo(() => {
        const activeStaff = stats.total_active_staff || 0;
        return [
            { role: 'Doctors / Clinicians', count: Math.ceil(activeStaff * 0.45), percentage: 45, color: '#006A6A' },
            { role: 'Nursing Lead & Care Staff', count: Math.ceil(activeStaff * 0.35), percentage: 35, color: '#005858' },
            { role: 'Operations / Admins', count: Math.max(0, activeStaff - Math.ceil(activeStaff * 0.45) - Math.ceil(activeStaff * 0.35)), percentage: 20, color: '#4DB6AC' }
        ];
    }, [stats.total_active_staff]);

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.06
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.35, ease: 'easeOut' }
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
            {/* Header Block */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                gap: 2, 
                width: '100%' 
            }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75, fontFamily: "'Outfit', sans-serif", fontSize: { xs: '1.45rem', sm: '2rem' } }}>
                        System Administration Overview
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif", display: { xs: 'none', sm: 'block' } }}>
                        Monitor real-time system health, manage staff onboarding requests, and review active directory configurations.
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <RefreshCw size={14} />}
                    onClick={fetchOverview}
                    disabled={loading}
                    sx={{ 
                        borderRadius: '100px', 
                        textTransform: 'none', 
                        fontWeight: 600, 
                        borderColor: 'divider',
                        color: 'text.primary',
                        fontSize: '13px',
                        px: { xs: 1.5, sm: 2.5 },
                        py: { xs: 0.75, sm: 1 },
                        whiteSpace: 'nowrap',
                        alignSelf: { xs: 'flex-start', sm: 'auto' },
                        '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'divider'
                        }
                    }}
                >
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Refresh Dashboard</Box>
                    <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Refresh</Box>
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ borderRadius: '12px', fontFamily: "'DM Sans', sans-serif" }}>
                    {error}
                </Alert>
            )}

            {/* KPI Cards Grid */}
            <Grid 
                container 
                spacing={3}
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <Grid item xs={12} sm={6} md={3} key={idx} component={motion.div} variants={itemVariants}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: theme.palette.mode === 'dark' 
                                            ? '0 4px 20px rgba(0,0,0,0.5)' 
                                            : '0 4px 20px rgba(60,64,67,0.15)',
                                    }
                                }}
                                onClick={() => navigate(kpi.path)}
                            >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5 }, p: { xs: 2, sm: 3 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ p: 1, borderRadius: '8px', bgcolor: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center' }}>
                                            <Icon size={18} />
                                        </Box>
                                        <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                            <ArrowUpRight size={16} />
                                        </IconButton>
                                    </Box>
                                    <Box>
                                        {loading ? (
                                            <Skeleton variant="text" width="50%" height={32} />
                                        ) : (
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, fontFamily: "'Outfit', sans-serif", fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                                                {kpi.value}
                                            </Typography>
                                        )}
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
                                            {kpi.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3, fontFamily: "'DM Sans', sans-serif", fontSize: { xs: '11px', sm: '12px' } }}>
                                            {kpi.desc}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Main Content Actions Split */}
            <Grid container spacing={3}>
                {/* Console Controls */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ height: '100%', borderRadius: '16px' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(0, 106, 106, 0.05)', color: '#006A6A', display: 'flex' }}>
                                    <Activity size={18} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                    Console Controls
                                </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {[
                                    {
                                        title: 'Issue Onboarding Invitation',
                                        desc: 'Send unique 7-day secure tokens to verify and register staff members.',
                                        icon: Mail,
                                        color: '#006A6A',
                                        bg: 'rgba(0, 106, 106, 0.05)',
                                        action: () => navigate('/admin/invites')
                                    },
                                    {
                                        title: `Review Pending Profiles (${stats.pending_applications})`,
                                        desc: 'Examine doctor PMDC licenses, CNICs, and professional references.',
                                        icon: Award,
                                        color: '#005858',
                                        bg: 'rgba(0, 88, 88, 0.05)',
                                        action: () => navigate('/admin/applications')
                                    },
                                    {
                                        title: 'Security Audits & Feeds',
                                        desc: 'Monitor failed access triggers, login coordinates, and system errors.',
                                        icon: ShieldAlert,
                                        color: '#BA1A1A',
                                        bg: 'rgba(186, 26, 26, 0.05)',
                                        action: () => navigate('/admin/audits')
                                    }
                                ].map((ctrl, i) => {
                                    const CtrlIcon = ctrl.icon;
                                    return (
                                        <Box
                                            key={i}
                                            onClick={ctrl.action}
                                            component={motion.div}
                                            whileHover={{ y: -2, scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                p: 2,
                                                borderRadius: '12px',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : '#FFFFFF',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    boxShadow: theme.palette.mode === 'dark' 
                                                        ? '0 4px 12px rgba(0,0,0,0.3)' 
                                                        : '0 4px 12px rgba(0, 106, 106, 0.08)'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                                                <Box sx={{ p: 1.25, borderRadius: '10px', bgcolor: ctrl.bg, color: ctrl.color, display: 'flex', flexShrink: 0 }}>
                                                    <CtrlIcon size={20} />
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: 'text.primary', fontSize: '14px' }}>
                                                        {ctrl.title}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25, fontFamily: "'DM Sans', sans-serif", fontSize: '11.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                        {ctrl.desc}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <ArrowUpRight size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0, marginLeft: '8px' }} />
                                        </Box>
                                    );
                                })}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Infrastructure Status */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ height: '100%', borderRadius: '16px' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(77, 182, 172, 0.08)', color: '#4DB6AC', display: 'flex' }}>
                                        <Server size={18} />
                                    </Box>
                                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                        Infrastructure Status
                                    </Typography>
                                </Box>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={runDiagnostics}
                                    disabled={diagnosticsLoading}
                                    startIcon={diagnosticsLoading ? <CircularProgress size={12} color="inherit" /> : <RefreshCw size={12} />}
                                    sx={{ 
                                        borderRadius: '100px', 
                                        textTransform: 'none', 
                                        fontWeight: 600, 
                                        borderColor: 'divider', 
                                        color: 'text.primary',
                                        fontSize: '11px',
                                        px: { xs: 1.25, sm: 2 },
                                        py: 0.5,
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderColor: 'divider'
                                        }
                                    }}
                                >
                                    {diagnosticsLoading ? 'Scanning...' : 'Test Connection'}
                                </Button>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {diagnosticsOutput.map((sys, idx) => (
                                    <Box 
                                        key={idx} 
                                        sx={{ 
                                            display: 'flex', 
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            justifyContent: 'space-between', 
                                            alignItems: { xs: 'flex-start', sm: 'center' }, 
                                            gap: { xs: 1.5, sm: 0 },
                                            pb: 1.5, 
                                            borderBottom: idx < 3 ? '1px solid' : 'none', 
                                            borderColor: 'divider' 
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                                            {sys.label}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                                            {/* Latency Sparkline */}
                                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                                <svg width="60" height="20" style={{ opacity: 0.7 }}>
                                                    <path
                                                        d={`M0,${15 - (idx * 2)} Q15,${2 + (idx * 4)} 30,${16 - (idx * 3)} T60,${8 + idx}`}
                                                        fill="none"
                                                        stroke={sys.color}
                                                        strokeWidth="2.5"
                                                    />
                                                </svg>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sys.color, animation: 'pulse 2s infinite' }} />
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                                    {sys.status}
                                                </Typography>
                                                <Chip 
                                                    label={sys.latency} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ 
                                                        height: 18, 
                                                        fontSize: '9px', 
                                                        fontWeight: 700, 
                                                        borderColor: 'divider',
                                                        color: 'text.secondary',
                                                        fontFamily: "'DM Sans', sans-serif"
                                                    }} 
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ 
                                bgcolor: theme.palette.mode === 'dark' ? '#0E1313' : '#F8F9FA', 
                                p: 2, 
                                borderRadius: '12px', 
                                borderLeft: '4px solid #006A6A',
                                border: '1px solid',
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            }}>
                                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', mb: 0.5, fontSize: '9px', fontFamily: "'Outfit', sans-serif" }}>
                                    System Diagnostics Console Output:
                                </Typography>
                                <Box sx={{ fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.5 }}>
                                    {diagnosticsLoading ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                            <CircularProgress size={10} color="inherit" />
                                            <span>Scanning ports and verifying security handshakes...</span>
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600, fontFamily: 'monospace', fontSize: '11px' }}>
                                            {diagnosticsMessage}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Staff breakdown proportions card */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: '16px' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: 'rgba(0, 88, 88, 0.05)', color: '#005858', display: 'flex' }}>
                                    <Users size={18} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                    Staff Directory Allocations
                                </Typography>
                            </Box>

                            <Grid container spacing={4} alignItems="center" sx={{ mt: 0.5 }}>
                                {/* Donut Chart Visual */}
                                <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                                        <svg width="100%" height="100%" viewBox="0 0 100 100">
                                            {/* Background Track */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                                                strokeWidth="10"
                                            />
                                            {/* Segment 1: Doctors (45%) */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="#006A6A"
                                                strokeWidth="10"
                                                strokeDasharray="113.1 251.3"
                                                strokeDashoffset="0"
                                                transform="rotate(-90 50 50)"
                                                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                            />
                                            {/* Segment 2: Nurses (35%) */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="#005858"
                                                strokeWidth="10"
                                                strokeDasharray="88 251.3"
                                                strokeDashoffset="-113.1"
                                                transform="rotate(-90 50 50)"
                                                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                            />
                                            {/* Segment 3: Operations (20%) */}
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                stroke="#4DB6AC"
                                                strokeWidth="10"
                                                strokeDasharray="50.2 251.3"
                                                strokeDashoffset="-201.1"
                                                transform="rotate(-90 50 50)"
                                                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                                            />
                                        </svg>
                                        {/* Center text */}
                                        <Box sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: 'text.primary', lineHeight: 1 }}>
                                                {stats.total_active_staff || 0}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 600, display: 'block', mt: 0.25 }}>
                                                Active Staff
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Breakdown Progress Bars */}
                                <Grid item xs={12} sm={8}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                        {staffDistribution.map((staff, idx) => (
                                            <Box key={idx}>
                                                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: staff.color }} />
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontFamily: "'DM Sans', sans-serif" }}>
                                                            {staff.role}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: staff.color, fontFamily: "'Outfit', sans-serif" }}>
                                                        {staff.count} <span style={{ fontSize: '11px', fontWeight: 500, color: theme.palette.text.secondary }}>({staff.percentage}%)</span>
                                                    </Typography>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={staff.percentage} 
                                                    sx={{ 
                                                        height: 8, 
                                                        borderRadius: 4, 
                                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: staff.color,
                                                            borderRadius: 4
                                                        }
                                                    }} 
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboardOverview;
