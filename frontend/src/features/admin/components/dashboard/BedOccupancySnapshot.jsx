import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { Hotel, BedDouble, CheckCircle2, Wind } from 'lucide-react';
import { DashboardCard, AsyncWrapper } from '../../../../shared/components/ui';
import { COLORS, FONTS } from '../../../../shared/theme.constants';

export const BedOccupancySnapshot = ({ beds = [], loadingStates = {}, errorStates = {}, onNavigate }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const total = beds.length || 0;
    const occupied = beds.filter(b => b.status === 'OCCUPIED').length || 0;
    const available = beds.filter(b => b.status === 'AVAILABLE').length || 0;
    const cleaning = beds.filter(b => b.status === 'CLEANING' || b.status === 'MAINTENANCE').length || 0;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    const getBarColor = () => {
        if (occupancyRate >= 90) return COLORS.DANGER;
        if (occupancyRate >= 70) return COLORS.AMBER || '#B45309';
        return COLORS.PRIMARY;
    };

    const stats = [
        {
            label: 'Occupied',
            count: occupied,
            icon: BedDouble,
            color: COLORS.DANGER,
            bg: isDark ? 'rgba(186,26,26,0.12)' : 'rgba(186,26,26,0.07)',
        },
        {
            label: 'Available',
            count: available,
            icon: CheckCircle2,
            color: COLORS.SUCCESS,
            bg: isDark ? 'rgba(29,107,53,0.12)' : 'rgba(29,107,53,0.07)',
        },
        {
            label: 'Cleaning',
            count: cleaning,
            icon: Wind,
            color: COLORS.INFO || '#0EA5E9',
            bg: isDark ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.07)',
        },
    ];

    return (
        <DashboardCard
            title="Bed Occupancy Status"
            icon={Hotel}
            iconColor={isDark ? '#9CA3AF' : '#374151'}
            iconBg={isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB'}
            action={
                <Chip
                    label="IPD Bed Grid"
                    onClick={() => onNavigate('/admin/ipd')}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'pointer', height: 22, fontSize: '10px', fontWeight: 600 }}
                />
            }
        >
            <AsyncWrapper loading={loadingStates.beds} error={errorStates.beds}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Big rate + coloured bar */}
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1 }}>
                            <Box>
                                <Typography sx={{
                                    fontSize: '11px', fontWeight: 600, color: 'text.secondary',
                                    fontFamily: FONTS.BODY, textTransform: 'uppercase', letterSpacing: '0.5px'
                                }}>
                                    Occupancy Rate
                                </Typography>
                                <Typography sx={{
                                    fontSize: '32px', fontWeight: 800, lineHeight: 1,
                                    color: getBarColor(), fontFamily: FONTS.HEADING
                                }}>
                                    {occupancyRate}%
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontFamily: FONTS.BODY, pb: 0.5 }}>
                                {occupied} of {total} beds
                            </Typography>
                        </Box>
                        {/* Segmented bar */}
                        <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
                            <Box sx={{
                                height: '100%',
                                width: `${occupancyRate}%`,
                                bgcolor: getBarColor(),
                                borderRadius: 4,
                                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                            }} />
                        </Box>
                    </Box>

                    {/* Three stat chips */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {stats.map((s, idx) => {
                            const Icon = s.icon;
                            return (
                                <Box key={idx} sx={{
                                    flex: 1, p: 1, borderRadius: '8px',
                                    bgcolor: s.bg,
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5
                                }}>
                                    <Icon size={14} color={s.color} />
                                    <Typography sx={{ fontWeight: 800, fontSize: '16px', color: s.color, fontFamily: FONTS.HEADING, lineHeight: 1 }}>
                                        {s.count}
                                    </Typography>
                                    <Typography sx={{ fontSize: '9.5px', color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                        {s.label}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </AsyncWrapper>
        </DashboardCard>
    );
};

export default BedOccupancySnapshot;
