import React, { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Award, Mail, AlertTriangle } from 'lucide-react';
import { StatCard, StatGrid } from '../../../shared/components/ui';
import { COLORS } from '../../../shared/theme.constants';

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } }
};

export const KPIs = ({ stats = {}, loading = false }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const kpis = useMemo(() => [
        { 
            title: 'Total Active Staff', 
            value: stats.total_active_staff, 
            desc: 'Doctors, Nurses & Staff', 
            icon: Users, 
            color: COLORS.PRIMARY, 
            iconBg: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
            iconColor: theme.palette.mode === 'dark' ? '#9CA3AF' : '#374151',
            path: '/admin/users?status=ACTIVE' 
        },
        { 
            title: 'Pending Applications', 
            value: stats.pending_applications, 
            desc: 'Awaiting review', 
            icon: Award, 
            color: COLORS.PRIMARY_DARK, 
            iconBg: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
            iconColor: theme.palette.mode === 'dark' ? '#9CA3AF' : '#374151',
            path: '/admin/applications?status=PENDING' 
        },
        { 
            title: 'Active Invite Tokens', 
            value: stats.active_invite_tokens, 
            desc: 'Valid 7 days', 
            icon: Mail, 
            color: COLORS.ACCENT, 
            iconBg: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
            iconColor: theme.palette.mode === 'dark' ? '#9CA3AF' : '#374151',
            path: '/admin/invites?status=PENDING' 
        },
        { 
            title: 'Security Warnings', 
            value: stats.security_warnings, 
            desc: 'Past 24 hours', 
            icon: AlertTriangle, 
            color: COLORS.DANGER, 
            iconBg: theme.palette.mode === 'dark' ? 'rgba(186, 26, 26, 0.15)' : '#FEF2F2',
            iconColor: theme.palette.mode === 'dark' ? '#FF8787' : '#DC2626',
            path: '/admin/audits?status=FAILURE' 
        },
    ], [stats, theme.palette.mode]);

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <StatGrid cols={4}>
                {kpis.map((kpi, idx) => (
                    <StatCard
                        key={idx}
                        title={kpi.title}
                        value={kpi.value}
                        description={kpi.desc}
                        icon={kpi.icon}
                        iconBg={kpi.iconBg}
                        iconColor={kpi.iconColor}
                        loading={loading}
                        onActionClick={() => navigate(kpi.path)}
                        actionText="View list"
                    />
                ))}
            </StatGrid>
        </motion.div>
    );
};

export default KPIs;
