
import { Box, Grid, Card, CardContent, Typography, Button, IconButton } from '@mui/material';
import { 
    Users, Mail, Award, AlertTriangle, 
    ArrowUpRight, Plus, Eye, ShieldAlert 
} from 'lucide-react';

export const AdminDashboardOverview = () => {
    const kpis = [
        { title: 'Total Active Staff', value: '48', desc: 'Doctors, Nurses & Support', icon: Users, color: '#006A6A', bg: 'rgba(0, 106, 106, 0.08)' },
        { title: 'Pending Applications', value: '14', desc: 'Doctor profiles awaiting review', icon: Award, color: '#005858', bg: 'rgba(0, 88, 88, 0.08)' },
        { title: 'Active Invite Tokens', value: '6', desc: 'Tokens valid for 7 days', icon: Mail, color: '#4DB6AC', bg: 'rgba(77, 182, 172, 0.12)' },
        { title: 'Security Warnings', value: '3', desc: 'Failed login attempts (24h)', icon: AlertTriangle, color: '#BA1A1A', bg: 'rgba(186, 26, 26, 0.08)' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Header Block */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    System Administration Overview
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    Monitor system health, manage staff onboarding requests, and review platform security audits.
                </Typography>
            </Box>

            {/* KPI Cards Grid */}
            <Grid container spacing={3}>
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <Grid item xs={12} sm={6} md={3} key={idx}>
                            <Card sx={{ height: '100%', borderRadius: '16px' }}>
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center' }}>
                                            <Icon size={20} />
                                        </Box>
                                        <IconButton size="small">
                                            <ArrowUpRight size={16} />
                                        </IconButton>
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                                            {kpi.value}
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
                                            {kpi.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                {/* Quick Onboarding Actions */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: '16px', height: '100%' }}>
                        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                Quick Administrative Actions
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button 
                                    variant="contained" 
                                    startIcon={<Plus size={18} />}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    Issue Staff Invitation Token
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    startIcon={<Eye size={18} />}
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    Review Pending Doctor Profiles (14)
                                </Button>
                                <Button 
                                    variant="text" 
                                    startIcon={<ShieldAlert size={18} />}
                                    color="error"
                                    sx={{ justifyContent: 'flex-start', py: 1.5 }}
                                >
                                    View Failed Logins Audit Feed
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* System Status Summary */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: '16px', height: '100%' }}>
                        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                System Health & Integration
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                                {[
                                    { label: 'PostgreSQL Database Connection', status: 'Optimal', color: '#1D6B35' },
                                    { label: 'SMTP Email Dispatch Service', status: 'Connected', color: '#1D6B35' },
                                    { label: 'Google OAuth API Gateway', status: 'Online', color: '#1D6B35' },
                                    { label: 'JWT Signature Token Issuance', status: 'Secured', color: '#1D6B35' }
                                ].map((sys, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: idx < 3 ? '1px solid' : 'none', borderColor: 'divider' }}>
                                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                            {sys.label}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sys.color }} />
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                                {sys.status}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};
export default AdminDashboardOverview;
