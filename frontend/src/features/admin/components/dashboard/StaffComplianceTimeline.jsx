import React, { useMemo } from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { DashboardCard, AsyncWrapper } from '../../../../shared/components/ui';
import { FONTS } from '../../../../shared/theme.constants';

export const StaffComplianceTimeline = ({ compliance = [], loadingStates = {}, errorStates = {}, onNavigate }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const sortedCompliance = useMemo(() => {
        return [...compliance]
            .filter(doc => doc.days_to_expiry !== null)
            .sort((a, b) => a.days_to_expiry - b.days_to_expiry)
            .slice(0, 4);
    }, [compliance]);

    const getUrgency = (days) => {
        if (days <= 0)  return { color: 'error.main',   bg: isDark ? 'rgba(186,26,26,0.12)' : 'rgba(186,26,26,0.06)',   border: isDark ? 'rgba(186,26,26,0.3)' : 'rgba(186,26,26,0.18)', label: 'Expired',          chip: 'error'   };
        if (days <= 14) return { color: 'error.main',   bg: isDark ? 'rgba(186,26,26,0.09)' : 'rgba(186,26,26,0.04)',   border: isDark ? 'rgba(186,26,26,0.25)' : 'rgba(186,26,26,0.14)', label: `${days}d left`,    chip: 'error'   };
        if (days <= 60) return { color: 'warning.main', bg: isDark ? 'rgba(253,183,0,0.09)'  : 'rgba(253,183,0,0.04)',   border: isDark ? 'rgba(253,183,0,0.25)'  : 'rgba(253,183,0,0.14)',  label: `${days}d left`,    chip: 'warning' };
        return           { color: 'success.main', bg: 'transparent',                                                      border: 'divider',                                                  label: `${days}d left`,    chip: 'success' };
    };

    return (
        <DashboardCard
            title="PMDC Compliance"
            subtitle="Upcoming licence expirations."
            icon={Clock}
            iconColor={isDark ? '#9CA3AF' : '#374151'}
            iconBg={isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB'}
            action={
                <Chip
                    label="Portal"
                    onClick={() => onNavigate('/admin/compliance')}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: 'pointer', height: 22, fontSize: '10px', fontWeight: 600 }}
                />
            }
        >
            <AsyncWrapper loading={loadingStates.compliance} error={errorStates.compliance}>
                {sortedCompliance.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 1 }}>
                        <Box sx={{ p: 1.25, borderRadius: '50%', bgcolor: 'rgba(29,107,53,0.08)', color: 'success.main' }}>
                            <CheckCircle size={20} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '12px', color: 'text.primary', fontFamily: FONTS.HEADING }}>All Compliant</Typography>
                        <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontFamily: FONTS.BODY }}>No expiring licences found.</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {sortedCompliance.map((doc, idx) => {
                            const u = getUrgency(doc.days_to_expiry);
                            const name = doc.user?.full_name || 'Unknown';
                            const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                            return (
                                <Box key={doc.id || idx} sx={{
                                    display: 'flex', alignItems: 'center', gap: 1.25,
                                    p: 1, borderRadius: '8px',
                                    border: '1px solid', borderColor: u.border,
                                    bgcolor: u.bg,
                                    transition: 'background 0.15s ease',
                                }}>
                                    {/* Avatar */}
                                    <Box sx={{
                                        width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                                        bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                        color: 'text.secondary',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '11px', fontWeight: 700, fontFamily: FONTS.HEADING
                                    }}>
                                        {initials}
                                    </Box>

                                    {/* Name + date */}
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography sx={{
                                            fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '12px',
                                            color: 'text.primary', overflow: 'hidden',
                                            textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                        }}>
                                            Dr. {name}
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary', fontFamily: FONTS.BODY, fontSize: '10px' }}>
                                            Expires {doc.pmdc_expiry_date}
                                        </Typography>
                                    </Box>

                                    {/* Days chip */}
                                    <Chip
                                        label={u.label}
                                        size="small"
                                        color={u.chip}
                                        sx={{ height: 18, fontSize: '9.5px', fontWeight: 700, flexShrink: 0 }}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </AsyncWrapper>
        </DashboardCard>
    );
};

export default StaffComplianceTimeline;
