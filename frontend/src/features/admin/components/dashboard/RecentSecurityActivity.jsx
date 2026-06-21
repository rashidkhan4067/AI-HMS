import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { DashboardCard, AsyncWrapper } from '../../../../shared/components/ui';
import { formatDateTime } from '../../../../shared/utils/dateUtils';
import { COLORS, FONTS } from '../../../../shared/theme.constants';

export const RecentSecurityActivity = ({ audits = [], loadingStates = {}, onNavigate }) => {
    const theme = useTheme();

    return (
        <DashboardCard 
            title="Recent Security Activity" 
            subtitle="Real-time authentication records and system access logs." 
            icon={ShieldAlert} 
            iconColor={COLORS.DANGER} 
            iconBg={`${COLORS.DANGER}15`} 
            action={
                <Chip 
                    label="Security Portal" 
                    onClick={() => onNavigate('/admin/audits')} 
                    variant="outlined" 
                    size="small" 
                    sx={{ cursor: 'pointer', height: 22, fontSize: '10px', fontWeight: 600 }} 
                />
            }
        >
            <AsyncWrapper loading={loadingStates.audits} error={null}>
                {audits.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, color: 'text.disabled' }}>
                        <CheckCircle size={32} style={{ opacity: 0.4, marginBottom: 8, color: theme.palette.text.secondary }} />
                        <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '13px', fontFamily: FONTS.BODY }}>No Authentication History</Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                        gap: 1.5
                    }}>
                        {[...audits].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 9).map((audit) => (
                            <Box key={audit.id} sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0,
                                p: 1.25, borderRadius: '8px', border: '1px solid', borderColor: 'divider',
                                bgcolor: audit.success
                                    ? 'transparent'
                                    : (theme.palette.mode === 'dark' ? 'rgba(186,26,26,0.04)' : 'rgba(186,26,26,0.012)'),
                            }}>
                                <Box sx={{ 
                                    width: 30, height: 30, borderRadius: '6px', flexShrink: 0,
                                    bgcolor: audit.success 
                                        ? 'action.hover' 
                                        : (theme.palette.mode === 'dark' ? 'rgba(186,26,26,0.15)' : '#FEF2F2'), 
                                    color: audit.success ? 'text.secondary' : 'error.main',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {audit.success ? <CheckCircle size={15} /> : <ShieldAlert size={15} />}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.2 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: '12px', fontFamily: FONTS.BODY, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'text.primary' }}>
                                            {audit.email_attempted}
                                        </Typography>
                                        <Chip label={audit.login_method} size="small" variant="outlined" sx={{ height: 15, fontSize: '9px', fontWeight: 700, flexShrink: 0 }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '10px', fontFamily: FONTS.BODY }}>IP: {audit.ip_address || '127.0.0.1'}</Typography>
                                        <Typography sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '10px', fontFamily: FONTS.BODY }}>{formatDateTime(audit.timestamp)}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </AsyncWrapper>
        </DashboardCard>
    );
};

export default RecentSecurityActivity;
