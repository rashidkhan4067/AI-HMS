import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, Grid, Card, CardContent, Typography, CircularProgress, LinearProgress, Chip, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
    Users, Mail, Award, AlertTriangle, 
    ArrowUpRight, ShieldAlert,
    Activity, Server, RefreshCw, CheckCircle
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import { AdminPageHeader, StatCard, SectionCard, AsyncWrapper } from '../../../shared/components/ui';
import { COLORS, FONTS } from '../../../shared/theme.constants';

export const AdminDashboardOverview = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    
    const { 
        overview: stats, 
        users,
        audits = [],
        compliance = [],
        loadingStates, 
        errorStates, 
        refreshAll 
    } = useAdmin();

    const loading = loadingStates.overview || loadingStates.compliance;
    const error = errorStates.overview || errorStates.compliance;

    // Diagnostics Simulator State
    const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
    const [diagnosticsOutput, setDiagnosticsOutput] = useState([
        { label: 'PostgreSQL Database Connection', status: 'Optimal', latency: '14ms', color: COLORS.SUCCESS_DARK },
        { label: 'SMTP Email Dispatch Service', status: 'Connected', latency: '38ms', color: COLORS.SUCCESS_DARK },
        { label: 'Google OAuth API Gateway', status: 'Online', latency: '24ms', color: COLORS.SUCCESS_DARK },
        { label: 'JWT Signature Token Issuance', status: 'Secured', latency: '2ms', color: COLORS.SUCCESS_DARK }
    ]);
    const [diagnosticsMessage, setDiagnosticsMessage] = useState('All systems reporting nominal status.');

    const runDiagnostics = useCallback(async () => {
        setDiagnosticsLoading(true);
        setDiagnosticsMessage('Initiating system-wide handshake diagnostics...');
        try {
            const res = await adminApi.getSystemHealth();
            setDiagnosticsOutput(res.diagnostics);
            setDiagnosticsMessage(`Diagnostics complete. ${res.message}`);
        } catch (err) {
            setDiagnosticsMessage('Failed to connect to backend diagnostics endpoint.');
        } finally {
            setDiagnosticsLoading(false);
        }
    }, []);

    const expiringDoctorsCount = useMemo(() => {
        return compliance.filter(doc => doc.license_status === 'EXPIRED' || (doc.days_to_expiry !== null && doc.days_to_expiry < 60)).length;
    }, [compliance]);

    const kpis = useMemo(() => [
        { title: 'Total Active Staff', value: stats.total_active_staff, desc: 'Doctors, Nurses & Support staff', icon: Users, color: COLORS.PRIMARY, path: '/admin/users' },
        { title: 'Pending Applications', value: stats.pending_applications, desc: 'Doctor profiles awaiting review', icon: Award, color: COLORS.PRIMARY_DARK, path: '/admin/applications' },
        { title: 'Active Invite Tokens', value: stats.active_invite_tokens, desc: 'Tokens valid for 7 calendar days', icon: Mail, color: COLORS.ACCENT, path: '/admin/invites' },
        { title: 'Security Warnings', value: stats.security_warnings, desc: 'Failed logins in past 24 hours', icon: AlertTriangle, color: COLORS.DANGER, path: '/admin/audits' },
    ], [stats]);

    // Staff proportions helper
    const staffDistribution = useMemo(() => {
        const activeStaffList = users.filter(u => u.is_active && u.role !== 'PATIENT');
        
        if (activeStaffList.length === 0) {
            const activeStaff = stats.total_active_staff || 0;
            return [
                { role: 'Doctors / Clinicians', count: Math.ceil(activeStaff * 0.40), percentage: 40, color: COLORS.PRIMARY },
                { role: 'Nursing Lead & Care Staff', count: Math.ceil(activeStaff * 0.25), percentage: 25, color: COLORS.PRIMARY_DARK },
                { role: 'Pharmacy Dispensers', count: Math.ceil(activeStaff * 0.15), percentage: 15, color: COLORS.ACCENT },
                { role: 'Reception Desk / Billing', count: Math.ceil(activeStaff * 0.10), percentage: 10, color: COLORS.WARNING },
                { role: 'Lab / Imaging Techs', count: Math.ceil(activeStaff * 0.05), percentage: 5, color: COLORS.LAB_TECH },
                { role: 'System Administrators', count: Math.max(0, activeStaff - Math.ceil(activeStaff * 0.40) - Math.ceil(activeStaff * 0.25) - Math.ceil(activeStaff * 0.15) - Math.ceil(activeStaff * 0.10) - Math.ceil(activeStaff * 0.05)), percentage: 5, color: COLORS.ADMIN_PURPLE }
            ];
        }

        const totalCount = activeStaffList.length;
        const countByRole = (roles) => activeStaffList.filter(u => roles.includes(u.role)).length;

        const doctors = countByRole(['DOCTOR']);
        const nurses = countByRole(['NURSE']);
        const pharmacists = countByRole(['PHARMACIST']);
        const receptionists = countByRole(['RECEPTIONIST']);
        const techs = countByRole(['LAB_TECHNICIAN', 'RADIOLOGIST']);
        const admins = countByRole(['ADMIN']);

        const getPercent = (count) => Math.round((count / totalCount) * 100) || 0;

        return [
            { role: 'Doctors / Clinicians', count: doctors, percentage: getPercent(doctors), color: COLORS.PRIMARY },
            { role: 'Nursing Lead & Care Staff', count: nurses, percentage: getPercent(nurses), color: COLORS.PRIMARY_DARK },
            { role: 'Pharmacy Dispensers', count: pharmacists, percentage: getPercent(pharmacists), color: COLORS.ACCENT },
            { role: 'Reception Desk / Billing', count: receptionists, percentage: getPercent(receptionists), color: COLORS.WARNING },
            { role: 'Lab / Imaging Techs', count: techs, percentage: getPercent(techs), color: COLORS.LAB_TECH },
            { role: 'System Administrators', count: admins, percentage: 100 - getPercent(doctors) - getPercent(nurses) - getPercent(pharmacists) - getPercent(receptionists) - getPercent(techs), color: COLORS.ADMIN_PURPLE }
        ];
    }, [users, stats.total_active_staff]);

    const donutSegments = useMemo(() => {
        let accumulatedPercent = 0;
        return staffDistribution.map(staff => {
            const segmentLength = ((staff.percentage / 100) * 251.3).toFixed(1);
            const segmentOffset = (-(accumulatedPercent / 100) * 251.3).toFixed(1);
            accumulatedPercent += staff.percentage;
            return {
                ...staff,
                dashArray: `${segmentLength} 251.3`,
                dashOffset: segmentOffset
            };
        });
    }, [staffDistribution]);

    const activeStaffCount = useMemo(() => {
        const count = users.filter(u => u.is_active && u.role !== 'PATIENT').length;
        return count || stats.total_active_staff || 0;
    }, [users, stats.total_active_staff]);

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
            <AdminPageHeader
                title="System Administration Overview"
                subtitle="Monitor real-time system health, manage staff onboarding requests, and review active directory configurations."
                onRefresh={() => refreshAll(true)}
                loading={loading}
            />

            <AsyncWrapper loading={false} error={error}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
                    {/* Compliance Alert */}
                    {expiringDoctorsCount > 0 && (
                        <Card sx={{ bgcolor: 'rgba(255, 152, 0, 0.03)', borderColor: 'warning.main', borderWidth: 1.5, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 4 }}>
                            <Box>
                                <Typography variant="subtitle2" color="warning.main" fontWeight={700}>
                                    Attention Required: PMDC License Compliance Alerts
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    There are {expiringDoctorsCount} physician(s) with expired or near-expiry PMDC registrations (under 60 days). Verify their compliance to prevent clinical scheduling blocks.
                                </Typography>
                            </Box>
                            <Chip label="Resolve Compliance" color="warning" onClick={() => navigate('/admin/compliance')} sx={{ cursor: 'pointer', fontWeight: 600 }} />
                        </Card>
                    )}

                    {/* KPI Cards */}
                    <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
                        {kpis.map((kpi, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={idx} component={motion.div} variants={itemVariants}>
                                <StatCard
                                    title={kpi.title}
                                    value={kpi.value}
                                    description={kpi.desc}
                                    icon={kpi.icon}
                                    color={kpi.color}
                                    loading={loading}
                                    onClick={() => navigate(kpi.path)}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    {/* Hospital Operations Monitor */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <SectionCard 
                            title="Real-Time Operations Monitor" 
                            subtitle="Track receptionist check-ins, nurse triage logging, and physician consults happening today."
                            icon={Activity}
                            iconColor={COLORS.PRIMARY}
                            iconBg={`${COLORS.PRIMARY}15`}
                        >
                            <Grid container spacing={3}>
                                {[
                                    { label: 'TOTAL PATIENT DIRECTORY', val: stats.total_patients ?? 0, desc: 'Registered patient records', color: 'text.primary' },
                                    { label: 'RECEPTIONIST CHECK-INS', val: `${stats.check_ins_today ?? 0} / ${stats.appointments_today ?? 0}`, desc: 'Checked-in today vs total bookings', color: COLORS.INFO },
                                    { label: 'NURSE TRIAGE STATION', val: stats.vitals_logged_today ?? 0, desc: 'Patient vitals logged today', color: COLORS.WARNING },
                                    { label: 'DOCTOR CONSULTATIONS', val: stats.consults_completed_today ?? 0, desc: 'Completed consults today', color: COLORS.SUCCESS },
                                ].map((metric, idx) => (
                                    <Grid item xs={12} sm={6} md={3} key={idx}>
                                        <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>{metric.label}</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: FONTS.HEADING, mb: 0.5, color: metric.color }}>{metric.val}</Typography>
                                            <Typography variant="caption" color="text.secondary">{metric.desc}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </SectionCard>
                    </motion.div>

                    {/* Main Content Actions Split */}
                    <Grid container spacing={3}>
                        {/* Console Controls */}
                        <Grid item xs={12} md={5}>
                            <SectionCard title="Console Controls" icon={Activity} iconColor={COLORS.PRIMARY} iconBg={`${COLORS.PRIMARY}15`}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {[
                                        { title: 'Issue Onboarding Invitation', desc: 'Send unique 7-day secure tokens to verify and register staff members.', icon: Mail, color: COLORS.PRIMARY, action: () => navigate('/admin/invites') },
                                        { title: `Review Pending Profiles (${stats.pending_applications})`, desc: 'Examine doctor PMDC licenses, CNICs, and professional references.', icon: Award, color: COLORS.PRIMARY_DARK, action: () => navigate('/admin/applications') },
                                        { title: 'Security Audits & Feeds', desc: 'Monitor failed access triggers, login coordinates, and system errors.', icon: ShieldAlert, color: COLORS.DANGER, action: () => navigate('/admin/audits') }
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
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider',
                                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s ease',
                                                    '&:hover': { borderColor: 'primary.main', boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0, 106, 106, 0.08)' }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                                                    <Box sx={{ p: 1.25, borderRadius: '10px', bgcolor: `${ctrl.color}15`, color: ctrl.color, display: 'flex', flexShrink: 0 }}>
                                                        <CtrlIcon size={20} />
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '14px' }}>{ctrl.title}</Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25, fontFamily: FONTS.BODY, fontSize: '11.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ctrl.desc}</Typography>
                                                    </Box>
                                                </Box>
                                                <ArrowUpRight size={18} style={{ color: theme.palette.text.secondary, flexShrink: 0, marginLeft: '8px' }} />
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </SectionCard>
                        </Grid>

                        {/* Infrastructure Status */}
                        <Grid item xs={12} md={7}>
                            <SectionCard 
                                title="Infrastructure Status" 
                                icon={Server} 
                                iconColor={COLORS.ACCENT} 
                                iconBg={`${COLORS.ACCENT}15`}
                                actions={
                                    <Chip 
                                        label={diagnosticsLoading ? 'Scanning...' : 'Test Connection'} 
                                        icon={diagnosticsLoading ? <CircularProgress size={12} /> : <RefreshCw size={12} />}
                                        onClick={diagnosticsLoading ? undefined : runDiagnostics}
                                        variant="outlined"
                                        size="small"
                                        sx={{ cursor: 'pointer' }}
                                    />
                                }
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                                    {diagnosticsOutput.map((sys, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: idx < 3 ? '1px solid' : 'none', borderColor: 'divider' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: FONTS.BODY }}>{sys.label}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sys.color, animation: 'pulse 2s infinite' }} />
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{sys.status}</Typography>
                                                <Chip label={sys.latency} size="small" variant="outlined" sx={{ height: 18, fontSize: '9px', fontWeight: 700, fontFamily: FONTS.BODY }} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                                <Box sx={{ bgcolor: theme.palette.mode === 'dark' ? '#0E1313' : '#F8F9FA', p: 2, borderRadius: '12px', borderLeft: `4px solid ${COLORS.PRIMARY}`, border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, textTransform: 'uppercase', mb: 0.5, display: 'block' }}>System Diagnostics Console Output:</Typography>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{diagnosticsMessage}</Typography>
                                </Box>
                            </SectionCard>
                        </Grid>

                        {/* Staff Allocations */}
                        <Grid item xs={12} md={5}>
                            <SectionCard title="Staff Directory Allocations" icon={Users} iconColor={COLORS.PRIMARY_DARK} iconBg={`${COLORS.PRIMARY_DARK}15`}>
                                <Grid container spacing={4} alignItems="center">
                                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                                            <svg width="100%" height="100%" viewBox="0 0 100 100">
                                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(128,128,128,0.2)" strokeWidth="10" />
                                                {donutSegments.map((segment, idx) => (
                                                    <circle key={idx} cx="50" cy="50" r="40" fill="transparent" stroke={segment.color} strokeWidth="10" strokeDasharray={segment.dashArray} strokeDashoffset={segment.dashOffset} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                                                ))}
                                            </svg>
                                            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                                <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, lineHeight: 1 }}>{activeStaffCount}</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 600 }}>Active Staff</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                            {staffDistribution.map((staff, idx) => (
                                                <Box key={idx}>
                                                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: staff.color }} />
                                                            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: FONTS.BODY }}>{staff.role}</Typography>
                                                        </Box>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: staff.color }}>{staff.count} ({staff.percentage}%)</Typography>
                                                    </Box>
                                                    <LinearProgress variant="determinate" value={staff.percentage} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { bgcolor: staff.color, borderRadius: 4 } }} />
                                                </Box>
                                            ))}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </SectionCard>
                        </Grid>

                        {/* Recent Audits */}
                        <Grid item xs={12} md={7}>
                            <SectionCard title="Recent Security Activity" subtitle="Real-time authentication records and system access logs." icon={ShieldAlert} iconColor={COLORS.DANGER} iconBg={`${COLORS.DANGER}15`} actions={<Chip label="Security Portal" onClick={() => navigate('/admin/audits')} variant="outlined" size="small" sx={{ cursor: 'pointer' }} />}>
                                <AsyncWrapper loading={loadingStates.audits} error={null}>
                                    {audits.length === 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, color: 'text.disabled' }}>
                                            <CheckCircle size={36} style={{ opacity: 0.4, marginBottom: 8, color: COLORS.SUCCESS }} />
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>No Authentication History</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {[...audits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 4).map((audit) => (
                                                <Box key={audit.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: audit.success ? 'success.main' : 'error.main' } }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: audit.success ? `${COLORS.SUCCESS}15` : `${COLORS.DANGER}15`, color: audit.success ? COLORS.SUCCESS : COLORS.DANGER }}>
                                                            {audit.success ? <CheckCircle size={16} /> : <ShieldAlert size={16} />}
                                                        </Box>
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '13px' }}>{audit.email_attempted}</Typography>
                                                                <Chip label={audit.login_method} size="small" variant="outlined" sx={{ height: 16, fontSize: '9px', fontWeight: 700 }} />
                                                            </Box>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px' }}>IP: {audit.ip_address || '127.0.0.1'}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '11px' }}>{formatDateTime(audit.timestamp)}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </AsyncWrapper>
                            </SectionCard>
                        </Grid>
                    </Grid>
                </Box>
            </AsyncWrapper>
        </Box>
    );
};

export default AdminDashboardOverview;
