import React from 'react';
import { useTheme } from '@mui/material';
import { Activity, Users, UserCheck, CheckCircle } from 'lucide-react';
import { DashboardCard, StatCard, StatGrid } from '../../../../shared/components/ui';

export const OperationsMonitor = ({ stats = {}, onNavigate }) => {
    const theme = useTheme();

    const steps = [
        { 
            label: 'Registered Directory', 
            val: stats.total_patients ?? 0, 
            desc: 'Total registry size', 
            icon: Users 
        },
        { 
            label: 'Checked-In Today', 
            val: `${stats.check_ins_today ?? 0} / ${stats.appointments_today ?? 0}`, 
            desc: 'Queue vs bookings', 
            path: `/admin/appointments?status=CONFIRMED&date=${new Date().toLocaleDateString('en-CA')}`, 
            icon: UserCheck 
        },
        { 
            label: 'Triage Vitals', 
            val: stats.vitals_logged_today ?? 0, 
            desc: 'Logged vitals today', 
            icon: Activity 
        },
        { 
            label: 'Completed Consults', 
            val: stats.consults_completed_today ?? 0, 
            desc: 'Completed visits', 
            path: `/admin/appointments?status=COMPLETED&date=${new Date().toLocaleDateString('en-CA')}`, 
            icon: CheckCircle 
        },
    ];

    return (
        <DashboardCard 
            title="Real-Time Operations Monitor" 
            subtitle="Track patient check-ins, triage logging, and consultations dynamically through the clinic workflow pipeline."
            icon={Activity}
            iconColor={theme.palette.mode === 'dark' ? '#9CA3AF' : '#374151'}
            iconBg={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB'}
        >
            <StatGrid cols={4}>
                {steps.map((step, idx) => (
                    <StatCard
                        key={idx}
                        title={step.label}
                        value={step.val}
                        description={step.desc}
                        icon={step.icon}
                        onActionClick={step.path ? () => onNavigate(step.path) : undefined}
                        actionText="View"
                        sx={{ 
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : '#F9FAFB',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    />
                ))}
            </StatGrid>
        </DashboardCard>
    );
};

export default OperationsMonitor;
