import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { Mail, Award, ShieldAlert, ArrowUpRight, Activity } from 'lucide-react';
import { DashboardCard } from '../../../../shared/components/ui';
import { COLORS, FONTS } from '../../../../shared/theme.constants';

export const ConsoleControls = ({ stats = {}, onNavigate }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const controls = [
        {
            title: 'Issue Onboarding Invitation',
            desc: 'Send secure 7-day tokens to verify and register new staff members.',
            icon: Mail,
            color: COLORS.PRIMARY,
            bg: isDark ? 'rgba(0,106,106,0.12)' : 'rgba(0,106,106,0.07)',
            action: () => onNavigate('/admin/invites')
        },
        {
            title: `Review Pending Profiles`,
            badge: stats.pending_applications ?? 0,
            desc: 'Examine PMDC licenses, CNICs, and professional references.',
            icon: Award,
            color: COLORS.AMBER || '#B45309',
            bg: isDark ? 'rgba(180,83,9,0.12)' : 'rgba(180,83,9,0.07)',
            action: () => onNavigate('/admin/applications')
        },
        {
            title: 'Security Audits & Feeds',
            desc: 'Monitor failed access triggers, login coordinates, and errors.',
            icon: ShieldAlert,
            color: COLORS.DANGER,
            bg: isDark ? 'rgba(186,26,26,0.12)' : 'rgba(186,26,26,0.07)',
            action: () => onNavigate('/admin/audits')
        }
    ];

    return (
        <DashboardCard
            title="Console Controls"
            icon={Activity}
            iconColor={isDark ? '#9CA3AF' : '#374151'}
            iconBg={isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB'}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {controls.map((ctrl, i) => {
                    const CtrlIcon = ctrl.icon;
                    return (
                        <Box
                            key={i}
                            onClick={ctrl.action}
                            component={motion.div}
                            whileHover={{ x: 3 }}
                            whileTap={{ scale: 0.99 }}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                p: 1.25, borderRadius: '10px', cursor: 'pointer',
                                border: '1px solid', borderColor: 'divider',
                                bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)',
                                transition: 'all 0.18s ease',
                                '&:hover': {
                                    borderColor: ctrl.color,
                                    bgcolor: ctrl.bg,
                                    boxShadow: isDark
                                        ? `0 4px 16px rgba(0,0,0,0.25)`
                                        : `0 4px 16px rgba(0,0,0,0.06)`,
                                }
                            }}
                        >
                            {/* Coloured icon box */}
                            <Box sx={{
                                width: 38, height: 38, borderRadius: '9px', flexShrink: 0,
                                bgcolor: ctrl.bg,
                                color: ctrl.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.18s ease',
                            }}>
                                <CtrlIcon size={17} />
                            </Box>

                            {/* Title + desc */}
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.2 }}>
                                    <Typography sx={{
                                        fontWeight: 700, fontFamily: FONTS.HEADING,
                                        fontSize: '12.5px', color: 'text.primary', lineHeight: 1.2
                                    }}>
                                        {ctrl.title}
                                    </Typography>
                                    {ctrl.badge > 0 && (
                                        <Box sx={{
                                            px: 0.75, py: '1px', borderRadius: '10px',
                                            bgcolor: ctrl.color, color: '#fff',
                                            fontSize: '10px', fontWeight: 800,
                                            fontFamily: FONTS.HEADING, lineHeight: '16px',
                                            flexShrink: 0
                                        }}>
                                            {ctrl.badge}
                                        </Box>
                                    )}
                                </Box>
                                <Typography sx={{
                                    color: 'text.secondary', fontFamily: FONTS.BODY,
                                    fontSize: '10.5px', overflow: 'hidden',
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>
                                    {ctrl.desc}
                                </Typography>
                            </Box>

                            <ArrowUpRight size={15} style={{ color: theme.palette.text.disabled, flexShrink: 0 }} />
                        </Box>
                    );
                })}
            </Box>
        </DashboardCard>
    );
};

export default ConsoleControls;
