import React, { useMemo } from 'react';
import { Grid, Box, Typography, LinearProgress, useTheme } from '@mui/material';
import { Users } from 'lucide-react';
import { DashboardCard } from '../../../../shared/components/ui';
import { COLORS, FONTS } from '../../../../shared/theme.constants';

export const StaffDirectoryAllocations = ({ users = [], stats = {} }) => {
    const theme = useTheme();

    const paletteColors = useMemo(() => {
        const isDark = theme.palette.mode === 'dark';
        return [
            theme.palette.primary.main,                        // Doctors (main accent color)
            theme.palette.primary.dark,                        // Nurses
            isDark ? '#5A7E7E' : '#3E5C5C',                    // Pharmacists (teal grey variation)
            theme.palette.secondary.main,                      // Receptionists
            isDark ? '#6F7979' : '#8A9999',                    // Techs
            isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' // Admins
        ];
    }, [theme]);

    const staffDistribution = useMemo(() => {
        const activeStaffList = users.filter(u => u.is_active && u.role !== 'PATIENT');
        
        if (activeStaffList.length === 0) {
            const activeStaff = stats.total_active_staff || 0;
            return [
                { role: 'Doctors / Clinicians', count: Math.ceil(activeStaff * 0.40), percentage: 40, color: paletteColors[0] },
                { role: 'Nursing Lead & Care Staff', count: Math.ceil(activeStaff * 0.25), percentage: 25, color: paletteColors[1] },
                { role: 'Pharmacy Dispensers', count: Math.ceil(activeStaff * 0.15), percentage: 15, color: paletteColors[2] },
                { role: 'Reception Desk / Billing', count: Math.ceil(activeStaff * 0.10), percentage: 10, color: paletteColors[3] },
                { role: 'Lab / Imaging Techs', count: Math.ceil(activeStaff * 0.05), percentage: 5, color: paletteColors[4] },
                { role: 'System Administrators', count: Math.max(0, activeStaff - Math.ceil(activeStaff * 0.40) - Math.ceil(activeStaff * 0.25) - Math.ceil(activeStaff * 0.15) - Math.ceil(activeStaff * 0.10) - Math.ceil(activeStaff * 0.05)), percentage: 5, color: paletteColors[5] }
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
            { role: 'Doctors / Clinicians', count: doctors, percentage: getPercent(doctors), color: paletteColors[0] },
            { role: 'Nursing Lead & Care Staff', count: nurses, percentage: getPercent(nurses), color: paletteColors[1] },
            { role: 'Pharmacy Dispensers', count: pharmacists, percentage: getPercent(pharmacists), color: paletteColors[2] },
            { role: 'Reception Desk / Billing', count: receptionists, percentage: getPercent(receptionists), color: paletteColors[3] },
            { role: 'Lab / Imaging Techs', count: techs, percentage: getPercent(techs), color: paletteColors[4] },
            { role: 'System Administrators', count: admins, percentage: 100 - getPercent(doctors) - getPercent(nurses) - getPercent(pharmacists) - getPercent(receptionists) - getPercent(techs), color: paletteColors[5] }
        ];
    }, [users, stats.total_active_staff, paletteColors]);

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

    return (
        <DashboardCard 
            title="Staff Directory Allocations" 
            icon={Users} 
            iconColor={COLORS.PRIMARY_DARK} 
            iconBg={`${COLORS.PRIMARY_DARK}15`}
        >
            <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ position: 'relative', width: 120, height: 120 }}>
                        <svg width="100%" height="100%" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(128,128,128,0.2)" strokeWidth="10" />
                            {donutSegments.map((segment, idx) => (
                                <circle key={idx} cx="50" cy="50" r="40" fill="transparent" stroke={segment.color} strokeWidth="10" strokeDasharray={segment.dashArray} strokeDashoffset={segment.dashOffset} transform="rotate(-90 50 50)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                            ))}
                        </svg>
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <Typography sx={{ fontWeight: 800, fontFamily: FONTS.HEADING, lineHeight: 1, fontSize: '24px', color: 'text.primary' }}>{activeStaffCount}</Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: '10px', fontWeight: 600, fontFamily: FONTS.BODY, textTransform: 'uppercase', mt: 0.25 }}>Active Staff</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {staffDistribution.map((staff, idx) => (
                            <Box key={idx}>
                                <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: staff.color }} />
                                        <Typography sx={{ fontWeight: 600, fontFamily: FONTS.BODY, fontSize: '13px', color: 'text.primary' }}>{staff.role}</Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight: 700, color: staff.color, fontFamily: FONTS.BODY, fontSize: '13px' }}>{staff.count} ({staff.percentage}%)</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={staff.percentage} sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: staff.color, borderRadius: 3 } }} />
                            </Box>
                        ))}
                    </Box>
                </Grid>
            </Grid>
        </DashboardCard>
    );
};

export default StaffDirectoryAllocations;
