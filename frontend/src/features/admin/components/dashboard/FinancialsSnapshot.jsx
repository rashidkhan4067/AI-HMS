import React from 'react';
import { Box, Typography, Chip, LinearProgress, useTheme } from '@mui/material';
import { DollarSign, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import { DashboardCard, AsyncWrapper } from '../../../../shared/components/ui';
import { COLORS, FONTS } from '../../../../shared/theme.constants';

const fmt = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const FinancialsSnapshot = ({ oversight = {}, loadingStates = {}, errorStates = {}, onNavigate }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const aggregates = oversight?.aggregates || {};
    const totalCollected  = Number(aggregates.total_collected  || 0);
    const receivables     = Number(aggregates.patient_receivables || 0);
    const overdue         = Number(aggregates.total_overdue    || 0);
    const overdueCount    = Number(aggregates.overdue_count    || 0);

    // Collection rate: collected vs (collected + receivables)
    const totalBilled = totalCollected + receivables;
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    const rows = [
        {
            label: 'Total Collected',
            value: fmt(totalCollected),
            icon: TrendingUp,
            color: COLORS.SUCCESS,
            bg: isDark ? 'rgba(29,107,53,0.10)' : 'rgba(29,107,53,0.06)',
        },
        {
            label: 'Patient Receivables',
            value: fmt(receivables),
            icon: DollarSign,
            color: COLORS.INFO || '#0EA5E9',
            bg: isDark ? 'rgba(14,165,233,0.10)' : 'rgba(14,165,233,0.06)',
        },
        {
            label: 'Overdue Balance',
            value: fmt(overdue),
            icon: AlertCircle,
            color: overdue > 0 ? COLORS.DANGER : COLORS.SUCCESS,
            bg: overdue > 0
                ? (isDark ? 'rgba(186,26,26,0.10)' : 'rgba(186,26,26,0.06)')
                : (isDark ? 'rgba(29,107,53,0.10)' : 'rgba(29,107,53,0.06)'),
            badge: overdueCount > 0 ? `${overdueCount} alerts` : null,
        },
    ];

    return (
        <DashboardCard
            title="Financials Oversight"
            icon={DollarSign}
            iconColor={isDark ? '#9CA3AF' : '#374151'}
            iconBg={isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB'}
            action={
                <Chip
                    label="Full Report"
                    icon={<ArrowUpRight size={10} />}
                    onClick={() => onNavigate('/admin/revenue')}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'pointer', height: 22, fontSize: '10px', fontWeight: 600 }}
                />
            }
        >
            <AsyncWrapper loading={loadingStates.billingOversight} error={errorStates.billingOversight}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Collection rate progress */}
                    <Box sx={{
                        p: 1.25, borderRadius: '10px',
                        bgcolor: isDark ? 'rgba(0,106,106,0.08)' : 'rgba(0,106,106,0.04)',
                        border: '1px solid', borderColor: isDark ? 'rgba(0,106,106,0.2)' : 'rgba(0,106,106,0.1)',
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                Collection Rate
                            </Typography>
                            <Typography sx={{ fontSize: '13px', fontWeight: 800, color: 'primary.main', fontFamily: FONTS.HEADING }}>
                                {collectionRate}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={collectionRate}
                            sx={{
                                height: 6, borderRadius: 3, bgcolor: 'action.hover',
                                '& .MuiLinearProgress-bar': { bgcolor: COLORS.PRIMARY, borderRadius: 3 }
                            }}
                        />
                    </Box>

                    {/* 3 stat rows */}
                    {rows.map((row, idx) => {
                        const Icon = row.icon;
                        return (
                            <Box key={idx} sx={{
                                display: 'flex', alignItems: 'center', gap: 1.25,
                                p: 1, borderRadius: '8px',
                                bgcolor: row.bg,
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                            }}>
                                <Box sx={{
                                    width: 30, height: 30, borderRadius: '7px', flexShrink: 0,
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                                    color: row.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Icon size={15} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                            {row.label}
                                        </Typography>
                                        {row.badge && (
                                            <Chip label={row.badge} size="small" color="error"
                                                sx={{ height: 14, fontSize: '8.5px', fontWeight: 700 }} />
                                        )}
                                    </Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: row.color, fontFamily: FONTS.HEADING, lineHeight: 1.2 }}>
                                        {row.value}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </AsyncWrapper>
        </DashboardCard>
    );
};

export default FinancialsSnapshot;
