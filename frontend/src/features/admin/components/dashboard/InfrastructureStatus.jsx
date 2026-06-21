import React from 'react';
import { Box, Typography, Chip, CircularProgress, useTheme } from '@mui/material';
import { Server, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { DashboardCard } from '../../../../shared/components/ui';
import { COLORS, FONTS } from '../../../../shared/theme.constants';

export const InfrastructureStatus = ({
    diagnosticsLoading,
    diagnosticsOutput = [],
    diagnosticsMessage,
    onRunDiagnostics
}) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const allOnline = diagnosticsOutput.every(s => s.status !== 'Offline' && s.color !== '#BA1A1A');

    return (
        <DashboardCard
            title="Infrastructure Status"
            icon={Server}
            iconColor={isDark ? '#9CA3AF' : '#374151'}
            iconBg={isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB'}
            action={
                <Chip
                    label={diagnosticsLoading ? 'Scanning…' : 'Test Connection'}
                    icon={diagnosticsLoading
                        ? <CircularProgress size={9} sx={{ color: 'inherit' }} />
                        : <RefreshCw size={9} />
                    }
                    onClick={diagnosticsLoading ? undefined : onRunDiagnostics}
                    variant="outlined"
                    size="small"
                    sx={{ cursor: diagnosticsLoading ? 'default' : 'pointer', height: 22, fontSize: '10px', fontWeight: 600 }}
                />
            }
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {diagnosticsOutput.map((sys, idx) => {
                    const isOffline = sys.status === 'Offline' || sys.color === '#BA1A1A' || sys.color === 'error.main';
                    const dotColor = isOffline ? COLORS.DANGER : COLORS.SUCCESS;
                    return (
                        <Box
                            key={idx}
                            sx={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                gap: 1, px: 1.25, py: 0.9, borderRadius: '8px',
                                border: '1px solid',
                                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                bgcolor: isOffline
                                    ? (isDark ? 'rgba(186,26,26,0.06)' : 'rgba(186,26,26,0.03)')
                                    : (isDark ? 'rgba(29,107,53,0.05)' : 'rgba(29,107,53,0.025)'),
                            }}
                        >
                            {/* Service name */}
                            <Typography sx={{
                                fontWeight: 600, fontFamily: FONTS.BODY, fontSize: '12px',
                                color: 'text.primary', flex: 1, minWidth: 0,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                                {sys.label}
                            </Typography>

                            {/* Status + latency */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                                {/* Pulsing dot */}
                                <Box sx={{
                                    width: 7, height: 7, borderRadius: '50%', bgcolor: dotColor,
                                    boxShadow: isOffline
                                        ? 'none'
                                        : `0 0 0 2px ${isDark ? 'rgba(29,107,53,0.25)' : 'rgba(29,107,53,0.15)'}`,
                                    animation: !isOffline ? 'pulse 2s infinite' : 'none',
                                }} />
                                <Typography sx={{
                                    color: isOffline ? 'error.main' : 'success.main',
                                    fontWeight: 700, fontSize: '11px', fontFamily: FONTS.BODY
                                }}>
                                    {sys.status}
                                </Typography>
                                <Chip
                                    label={sys.latency}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        height: 16, fontSize: '9px', fontWeight: 700, fontFamily: FONTS.BODY,
                                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                                    }}
                                />
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* Console output footer */}
            <Box sx={{
                mt: 1.5,
                bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#F3F4F6',
                p: 1.25, borderRadius: '8px',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#E5E7EB',
                display: 'flex', alignItems: 'flex-start', gap: 1,
            }}>
                {allOnline
                    ? <Wifi size={13} style={{ color: COLORS.SUCCESS, flexShrink: 0, marginTop: 1 }} />
                    : <WifiOff size={13} style={{ color: COLORS.DANGER, flexShrink: 0, marginTop: 1 }} />
                }
                <Box>
                    <Typography sx={{
                        color: isDark ? '#9CA3AF' : '#4B5563',
                        fontWeight: 700, textTransform: 'uppercase',
                        fontFamily: FONTS.BODY, fontSize: '9.5px', letterSpacing: '0.5px', display: 'block', mb: 0.25
                    }}>
                        Diagnostics Console
                    </Typography>
                    <Typography sx={{
                        fontFamily: 'monospace',
                        color: isDark ? '#D1D5DB' : '#374151',
                        fontSize: '10.5px', display: 'block', lineHeight: 1.4
                    }}>
                        {diagnosticsMessage}
                    </Typography>
                </Box>
            </Box>
        </DashboardCard>
    );
};

export default InfrastructureStatus;
