import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, useTheme, Chip } from '@mui/material';
import { Pill, FlaskConical, Activity } from 'lucide-react';
import { DashboardCard } from '../../../../shared/components/ui';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../../auth/hooks/useAuth';
import { COLORS, FONTS, cardHoverSx } from '../../../../shared/theme.constants';

export const DepartmentOperations = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Access real-time data from Admin Context
    const { overview } = useAdmin();
    const ops = overview?.department_operations || {};

    // Fallbacks if data is still loading or unavailable
    const pharmacy = ops.pharmacy || { sales_today: 0, prescriptions_filled: 0, pending_orders: 0 };
    const lab = ops.lab || { tests_completed: 0, pending_results: 0 };
    const radiology = ops.radiology || { scans_completed: 0, pending_scans: 0 };

    const fmt = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

    const departments = [
        {
            name: 'Pharmacy',
            icon: Pill,
            color: COLORS.AMBER || '#7D5700',
            bg: isDark ? 'rgba(125,87,0,0.12)' : 'rgba(125,87,0,0.06)',
            metrics: [
                { label: "Today's Revenue", value: fmt(pharmacy.sales_today) },
                { label: 'Scripts Filled', value: pharmacy.prescriptions_filled },
                { label: 'Pending Orders', value: pharmacy.pending_orders, isAlert: true }
            ]
        },
        {
            name: 'Laboratory',
            icon: FlaskConical,
            color: COLORS.LAB_TECH || '#0288D1',
            bg: isDark ? 'rgba(2,136,209,0.12)' : 'rgba(2,136,209,0.06)',
            metrics: [
                { label: 'Tests Completed', value: lab.tests_completed },
                { label: 'Pending Results', value: lab.pending_results, isAlert: true }
            ]
        },
        {
            name: 'Radiology',
            icon: Activity,
            color: COLORS.ADMIN_PURPLE || '#9C27B0',
            bg: isDark ? 'rgba(156,39,176,0.12)' : 'rgba(156,39,176,0.06)',
            metrics: [
                { label: 'Scans Completed', value: radiology.scans_completed },
                { label: 'Pending Scans', value: radiology.pending_scans, isAlert: true }
            ]
        }
    ];

    const handleDepartmentClick = (deptName) => {
        console.log("handleDepartmentClick triggered for:", deptName);
        console.log("User object in component:", user);
        const crossRoles = user?.cross_authorized_roles || [];
        console.log("User cross_authorized_roles list:", crossRoles);
        const isAuthorized = (role) => {
            const auth = user?.role === role || crossRoles.includes(role);
            console.log(`Checking authorization for role: ${role} => ${auth}`);
            return auth;
        };

        if (deptName === 'Pharmacy') {
            if (isAuthorized('PHARMACIST')) {
                console.log("Redirecting to operational view: /pharmacist/dashboard");
                navigate('/pharmacist/dashboard');
            } else {
                console.log("Redirecting to administrative log view: /admin/department-logs?tab=0");
                navigate('/admin/department-logs?tab=0');
            }
        } else if (deptName === 'Laboratory') {
            if (isAuthorized('LAB_TECHNICIAN')) {
                console.log("Redirecting to operational view: /lab/dashboard");
                navigate('/lab/dashboard');
            } else {
                console.log("Redirecting to administrative log view: /admin/department-logs?tab=1");
                navigate('/admin/department-logs?tab=1');
            }
        } else if (deptName === 'Radiology') {
            if (isAuthorized('RADIOLOGIST')) {
                console.log("Redirecting to operational view: /radiology/dashboard");
                navigate('/radiology/dashboard');
            } else {
                console.log("Redirecting to administrative log view: /admin/department-logs?tab=2");
                navigate('/admin/department-logs?tab=2');
            }
        }
    };

    return (
        <DashboardCard 
            title="Clinical Operations Snapshot" 
            subtitle="Real-time performance monitoring across key diagnostic and pharmacy channels. Click cards to view administrative logs."
            icon={Activity}
            iconColor={isDark ? '#9CA3AF' : '#374151'}
            iconBg={isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB'}
        >
            <Grid container spacing={2}>
                {departments.map((dept, dIdx) => {
                    const DeptIcon = dept.icon;
                    return (
                        <Grid item xs={12} md={4} key={dIdx}>
                            <Box 
                                onClick={() => handleDepartmentClick(dept.name)}
                                sx={{ 
                                    p: 1.75, 
                                    borderRadius: '8px', 
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.015)' : '#FBFBFB',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    cursor: 'pointer',
                                    ...cardHoverSx(isDark)
                                }}
                            >
                                {/* Department Header */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                    <Box sx={{
                                        width: 30, height: 30, borderRadius: '7px', flexShrink: 0,
                                        bgcolor: dept.bg,
                                        color: dept.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <DeptIcon size={15} />
                                    </Box>
                                    <Typography sx={{
                                        fontWeight: 700,
                                        fontFamily: FONTS.HEADING,
                                        fontSize: '13px',
                                        color: 'text.primary',
                                        lineHeight: 1.2
                                    }}>
                                        {dept.name}
                                    </Typography>
                                </Box>

                                {/* Metrics Stack */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, justifyContent: 'center' }}>
                                    {dept.metrics.map((m, mIdx) => (
                                        <Box key={mIdx} sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            px: 1.25,
                                            py: 0.9,
                                            borderRadius: '6px',
                                            bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)',
                                            border: '1px solid',
                                            borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                        }}>
                                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                                {m.label}
                                            </Typography>
                                            {m.isAlert && Number(m.value) > 0 ? (
                                                <Chip
                                                    label={`${m.value} Pending`}
                                                    size="small"
                                                    sx={{
                                                        height: 16,
                                                        fontSize: '9.5px',
                                                        fontWeight: 700,
                                                        fontFamily: FONTS.BODY,
                                                        bgcolor: isDark ? 'rgba(186, 26, 26, 0.15)' : 'rgba(186, 26, 26, 0.08)',
                                                        color: COLORS.DANGER,
                                                        border: '1px solid',
                                                        borderColor: isDark ? 'rgba(186, 26, 26, 0.25)' : 'rgba(186, 26, 26, 0.15)',
                                                        '& .MuiChip-label': { px: 1 }
                                                    }}
                                                />
                                            ) : (
                                                <Typography sx={{ fontSize: '12.5px', fontWeight: 700, color: 'text.primary', fontFamily: FONTS.HEADING }}>
                                                    {m.value}
                                                </Typography>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </DashboardCard>
    );
};
export default DepartmentOperations;
