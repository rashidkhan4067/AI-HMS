import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Chip, Tooltip, IconButton, Stack, useTheme, Button, LinearProgress
} from '@mui/material';
import {
    Calendar, XCircle, Lock, Eye, Trash2, CheckCircle, TrendingUp,
    Ban, ShieldAlert, Clock, UserCheck, DollarSign
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { AppointmentDetailsDialog } from '../dialogs/AppointmentDetailsDialog';
import { CancelAppointmentDialog } from '../dialogs/CancelAppointmentDialog';
import { DeleteAppointmentDialog } from '../dialogs/DeleteAppointmentDialog';
import { formatPKR as formatCurrency } from '../../../shared/utils/formatUtils';
import {
    AdminPageHeader, StatGrid, StatCard, DashboardCard, DataTable,
    AsyncWrapper, ToastNotification
} from '../../../shared/components/ui';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { COLORS, FONTS } from '../../../shared/theme.constants';

export const AdminAppointments = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [searchParams] = useSearchParams();

    const {
        appointments = [],
        setAppointments,
        loadingStates,
        errorStates,
        refreshAppointments
    } = useAdmin();

    const loading = loadingStates.appointments;

    const [searchTerm, setSearchTerm]   = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
    const [dateFilter, setDateFilter]   = useState(searchParams.get('date') || '');

    const pagination = usePagination();
    const tableSort  = useTableSort('id', 'desc');
    const { toast, showToast, hideToast } = useToast();

    const detailsDialog = useDialogState();
    const cancelDialog  = useDialogState();
    const deleteDialog  = useDialogState();

    const [submitting, setSubmitting]         = useState(false);
    const [actionError, setActionError]       = useState('');
    const [actionSuccess, setActionSuccess]   = useState('');

    // ── Actions ──────────────────────────────────────────────────────────
    const handleCancelAppointment = async () => {
        const appt = cancelDialog.data;
        if (!appt) return;
        const prev = appointments;
        setAppointments(p => p.map(a => a.id === appt.id ? { ...a, status: 'CANCELLED' } : a));
        setActionSuccess(`Appointment #${appt.id} successfully cancelled.`);
        setTimeout(() => { cancelDialog.closeDialog(); setActionSuccess(''); }, 800);
        try {
            await adminApi.updateAppointment(appt.id, { status: 'CANCELLED' });
            refreshAppointments();
        } catch (err) {
            setAppointments(prev);
            showToast(err.response?.data?.detail || 'Failed to cancel. Rolled back.', 'error');
        }
    };

    const handleDeleteAppointment = async () => {
        const appt = deleteDialog.data;
        if (!appt) return;
        setSubmitting(true);
        setActionError('');
        try {
            await adminApi.deleteAppointment(appt.id);
            setActionSuccess('Appointment record successfully deleted.');
            refreshAppointments();
            setTimeout(() => { deleteDialog.closeDialog(); setActionSuccess(''); }, 1000);
        } catch (err) {
            setActionError(err.response?.data?.detail || 'Failed to delete appointment record.');
        } finally { setSubmitting(false); }
    };

    // ── KPI metrics ──────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const total     = appointments.length;
        const completed = appointments.filter(a => a.status === 'COMPLETED').length;
        const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
        const pending   = appointments.filter(a => a.status === 'PENDING').length;
        const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
        const completionRate   = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
        const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0';
        const projectedRevenue = appointments
            .filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
            .reduce((s, a) => s + parseFloat(a.doctor_consultation_fee || 0), 0);
        return { total, completed, cancelled, pending, confirmed, completionRate, cancellationRate, projectedRevenue };
    }, [appointments]);

    // Status breakdown for the mini bar chart
    const statusBreakdown = useMemo(() => {
        const total = stats.total || 1;
        return [
            { label: 'Completed', count: stats.completed, color: COLORS.SUCCESS,  pct: Math.round((stats.completed / total) * 100) },
            { label: 'Confirmed', count: stats.confirmed, color: COLORS.PRIMARY,  pct: Math.round((stats.confirmed / total) * 100) },
            { label: 'Pending',   count: stats.pending,   color: COLORS.WARNING,  pct: Math.round((stats.pending   / total) * 100) },
            { label: 'Cancelled', count: stats.cancelled, color: COLORS.DANGER,   pct: Math.round((stats.cancelled / total) * 100) },
        ];
    }, [stats]);

    // Doctor leaderboard (top by appointments)
    const doctorLeaderboard = useMemo(() => {
        const map = {};
        appointments.forEach(a => {
            const name = a.doctor_name || 'Unassigned';
            if (!map[name]) map[name] = { name, count: 0, revenue: 0, specialty: a.doctor_specialization || '' };
            map[name].count++;
            map[name].revenue += parseFloat(a.doctor_consultation_fee || 0);
        });
        return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [appointments]);

    // ── Filtered / sorted table ──────────────────────────────────────────
    const processedAppointments = useMemo(() => {
        const filtered = appointments.filter(appt => {
            const q = searchTerm.toLowerCase();
            const nameMatch =
                (appt.patient_name || '').toLowerCase().includes(q) ||
                (appt.patient_mrn  || '').toLowerCase().includes(q) ||
                (appt.doctor_name  || '').toLowerCase().includes(q) ||
                (appt.doctor_specialization || '').toLowerCase().includes(q);
            const statusMatch = statusFilter === 'ALL' || appt.status === statusFilter;
            const dateMatch   = !dateFilter || appt.date === dateFilter;
            return nameMatch && statusMatch && dateMatch;
        });
        return tableSort.sortData(filtered, ['id', 'date', 'doctor_consultation_fee']);
    }, [appointments, searchTerm, statusFilter, dateFilter, tableSort]);

    const paginatedAppointments = useMemo(() => pagination.paginate(processedAppointments), [processedAppointments, pagination]);

    // ── Table columns ────────────────────────────────────────────────────
    const neutralBg    = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';
    const neutralColor = isDark ? '#9CA3AF' : '#374151';

    const getStatusColor = (s) => {
        if (s === 'COMPLETED') return 'success';
        if (s === 'CONFIRMED') return 'primary';
        if (s === 'CANCELLED') return 'error';
        if (s === 'PENDING')   return 'warning';
        return 'default';
    };

    const columns = [
        {
            id: 'id',
            label: 'Ref',
            sortable: true,
            render: (appt) => (
                <Typography sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '12px', color: 'primary.main' }}>
                    #{appt.id}
                </Typography>
            )
        },
        {
            id: 'patient_name',
            label: 'Patient',
            sortable: true,
            render: (appt) => {
                const initials = (appt.patient_name || 'WI').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{
                            width: 30, height: 30, borderRadius: '7px', flexShrink: 0,
                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            color: 'text.secondary',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '10px', fontWeight: 700, fontFamily: FONTS.HEADING,
                        }}>
                            {initials}
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '12.5px', fontFamily: FONTS.HEADING, color: 'text.primary' }}>
                                {appt.patient_name || 'Walk-In'}
                            </Typography>
                            <Typography sx={{ fontSize: '10.5px', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                MRN: {appt.patient_mrn || 'N/A'}
                            </Typography>
                        </Box>
                    </Box>
                );
            }
        },
        {
            id: 'doctor_name',
            label: 'Doctor',
            sortable: true,
            render: (appt) => (
                <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '12.5px', fontFamily: FONTS.HEADING, color: 'text.primary' }}>
                        Dr. {appt.doctor_name || 'Unassigned'}
                    </Typography>
                    <Typography sx={{ fontSize: '10.5px', color: 'primary.main', fontWeight: 600, fontFamily: FONTS.BODY }}>
                        {appt.doctor_specialization || 'General'}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'date',
            label: 'Schedule',
            sortable: true,
            render: (appt) => (
                <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '12.5px', fontFamily: FONTS.HEADING, color: 'text.primary' }}>
                        {appt.date}
                    </Typography>
                    <Typography sx={{ fontSize: '10.5px', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                        {appt.start_time?.substring(0, 5)} – {appt.end_time?.substring(0, 5)}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'doctor_consultation_fee',
            label: 'Fee',
            sortable: true,
            render: (appt) => (
                <Typography sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '12.5px', color: 'text.primary' }}>
                    {formatCurrency(appt.doctor_consultation_fee || 0)}
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'Status',
            render: (appt) => (
                <Chip
                    label={appt.status}
                    size="small"
                    color={getStatusColor(appt.status)}
                    sx={{ fontWeight: 700, fontSize: '10px', height: 20 }}
                />
            )
        },
        {
            id: 'reason',
            label: 'Visit Reason',
            render: (appt) => (
                <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    px: 1, py: 0.4, borderRadius: '4px',
                    bgcolor: 'action.selected', border: '1px solid', borderColor: 'divider'
                }}>
                    <Lock size={10} style={{ color: theme.palette.text.secondary }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '10.5px', color: 'text.secondary', fontFamily: 'monospace' }}>
                        {appt.reason || '[REDACTED]'}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'actions',
            label: '',
            align: 'right',
            render: (appt) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={e => e.stopPropagation()}>
                    <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => detailsDialog.openDialog(appt)}
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', '&:hover': { color: 'primary.main', borderColor: 'primary.light' } }}>
                            <Eye size={13} />
                        </IconButton>
                    </Tooltip>
                    {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                        <Tooltip title="Cancel Booking">
                            <IconButton size="small" color="error"
                                onClick={() => { setActionError(''); setActionSuccess(''); cancelDialog.openDialog(appt); }}
                                sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: '6px', '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' } }}>
                                <XCircle size={13} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Delete Record">
                        <IconButton size="small" color="error"
                            onClick={() => { setActionError(''); setActionSuccess(''); deleteDialog.openDialog(appt); }}
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px', '&:hover': { bgcolor: 'error.main', color: 'error.contrastText', borderColor: 'error.main' } }}>
                            <Trash2 size={13} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title="Appointment Overview Log"
                subtitle="Monitor scheduled appointments, track status flows, and review professional consulting revenues."
                onRefresh={refreshAppointments}
                loading={loading}
            />

            {/* ── Privacy Notice Banner ─────────────────────────────────── */}
            <Box sx={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                gap: 1.5, p: 1.5, borderRadius: '10px',
                bgcolor: isDark ? 'rgba(13,110,253,0.06)' : 'rgba(13,110,253,0.04)',
                border: '1px solid', borderColor: isDark ? 'rgba(13,110,253,0.2)' : 'rgba(13,110,253,0.12)',
                borderLeft: `4px solid ${COLORS.INFO}`,
            }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                    <Box sx={{ pt: 0.2, color: COLORS.INFO, flexShrink: 0 }}><ShieldAlert size={16} /></Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '12.5px', fontFamily: FONTS.HEADING, color: 'text.primary', mb: 0.25 }}>
                            Clinical Privacy Regulations Active (HIPAA Compliant)
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                            Administrators are restricted from accessing clinical details. Patient symptoms, vitals, and doctor diagnoses are redacted.
                        </Typography>
                    </Box>
                </Box>
                <Chip icon={<Lock size={10} />} label="Data Redacted" size="small" color="info" variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '10px', height: 20, flexShrink: 0 }} />
            </Box>

            {/* ── KPI Strip ────────────────────────────────────────────── */}
            <StatGrid cols={4}>
                <StatCard
                    title="Total Appointments"
                    value={stats.total}
                    description="All records in database"
                    icon={Calendar}
                    iconBg={isDark ? 'rgba(13,110,253,0.15)' : 'rgba(13,110,253,0.08)'}
                    iconColor={COLORS.INFO}
                    loading={loading}
                />
                <StatCard
                    title="Completion Rate"
                    value={`${stats.completionRate}%`}
                    description="Completed visits"
                    icon={CheckCircle}
                    iconBg={isDark ? 'rgba(22,163,74,0.15)' : 'rgba(22,163,74,0.08)'}
                    iconColor={COLORS.SUCCESS}
                    loading={loading}
                />
                <StatCard
                    title="Cancellation Rate"
                    value={`${stats.cancellationRate}%`}
                    description="Cancelled appointments"
                    icon={Ban}
                    iconBg={isDark ? 'rgba(186,26,26,0.15)' : 'rgba(186,26,26,0.08)'}
                    iconColor={COLORS.DANGER}
                    loading={loading}
                    chipLabel={parseFloat(stats.cancellationRate) > 20 ? 'High' : 'Normal'}
                    chipColor={parseFloat(stats.cancellationRate) > 20 ? 'error' : 'default'}
                />
                <StatCard
                    title="Projected Revenue"
                    value={formatCurrency(stats.projectedRevenue)}
                    description="Confirmed & Completed fees"
                    icon={TrendingUp}
                    iconBg={isDark ? 'rgba(0,106,106,0.15)' : 'rgba(0,106,106,0.08)'}
                    iconColor={COLORS.PRIMARY}
                    loading={loading}
                />
            </StatGrid>

            {/* ── Insight Row ───────────────────────────────────────────── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                width: '100%',
            }}>
                {/* Status Breakdown */}
                <DashboardCard
                    title="Appointment Status Breakdown"
                    subtitle="Volume distribution across all booking states."
                    icon={Calendar}
                    iconColor={neutralColor}
                    iconBg={neutralBg}
                    action={
                        <Chip label={`${stats.total} total`} size="small" variant="outlined"
                            sx={{ height: 20, fontSize: '10px', fontWeight: 600 }} />
                    }
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {statusBreakdown.map((s, idx) => (
                            <Box key={idx}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.primary', fontFamily: FONTS.BODY }}>
                                            {s.label}
                                        </Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '11.5px', fontWeight: 700, color: s.color, fontFamily: FONTS.HEADING }}>
                                        {s.count} <span style={{ fontWeight: 400, color: theme.palette.text.secondary, fontSize: '10px' }}>({s.pct}%)</span>
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={s.pct}
                                    sx={{
                                        height: 6, borderRadius: 3, bgcolor: 'action.hover',
                                        '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 3 }
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>
                </DashboardCard>

                {/* Doctor Leaderboard */}
                <DashboardCard
                    title="Top Attending Doctors"
                    subtitle="Physicians ranked by total appointment volume."
                    icon={UserCheck}
                    iconColor={neutralColor}
                    iconBg={neutralBg}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {doctorLeaderboard.length === 0 ? (
                            <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3, fontSize: '12px' }}>
                                No appointment data available.
                            </Typography>
                        ) : doctorLeaderboard.map((doc, idx) => {
                            const max = doctorLeaderboard[0]?.count || 1;
                            const pct = Math.round((doc.count / max) * 100);
                            return (
                                <Box key={idx} sx={{
                                    display: 'flex', alignItems: 'center', gap: 1.25,
                                    p: 1, borderRadius: '8px',
                                    bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                                    border: '1px solid', borderColor: 'divider',
                                }}>
                                    <Box sx={{
                                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                        bgcolor: idx === 0 ? 'rgba(180,83,9,0.12)' : 'action.hover',
                                        color: idx === 0 ? '#B45309' : 'text.secondary',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '10px', fontWeight: 800, fontFamily: FONTS.HEADING,
                                    }}>
                                        {idx + 1}
                                    </Box>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: '12px', fontFamily: FONTS.HEADING, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                Dr. {doc.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'primary.main', fontFamily: FONTS.HEADING, flexShrink: 0, ml: 1 }}>
                                                {doc.count} appts
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={pct}
                                            sx={{
                                                height: 4, borderRadius: 2, bgcolor: 'action.hover',
                                                '& .MuiLinearProgress-bar': { bgcolor: COLORS.PRIMARY, borderRadius: 2 }
                                            }}
                                        />
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </DashboardCard>
            </Box>

            {/* ── Main Table ───────────────────────────────────────────── */}
            <DashboardCard
                title="Appointment Registry"
                subtitle="Full administrative log — all bookings, status flows, and consultation fees."
                icon={Calendar}
                iconColor={neutralColor}
                iconBg={neutralBg}
                action={
                    <Chip
                        label={`${processedAppointments.length} records`}
                        size="small"
                        variant="outlined"
                        sx={{ height: 22, fontSize: '10px', fontWeight: 600 }}
                    />
                }
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <AdminFilterBar
                        searchQuery={searchTerm}
                        onSearchChange={(val) => { setSearchTerm(val); pagination.resetPage(); }}
                        searchPlaceholder="Search by patient, MRN, doctor, specialty…"
                        filter1Label="Status"
                        filter1Value={statusFilter}
                        onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                        filter1Options={[
                            { value: 'ALL',       label: 'All Statuses' },
                            { value: 'PENDING',   label: 'Pending'      },
                            { value: 'CONFIRMED', label: 'Confirmed'    },
                            { value: 'COMPLETED', label: 'Completed'    },
                            { value: 'CANCELLED', label: 'Cancelled'    },
                        ]}
                    >
                        {/* Date filter as inline child */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => { setDateFilter(e.target.value); pagination.resetPage(); }}
                                style={{
                                    padding: '6px 12px', borderRadius: '100px',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`,
                                    outline: 'none', fontFamily: FONTS.BODY, fontSize: '13px',
                                    background: 'transparent',
                                    color: isDark ? '#D1D5DB' : '#374151',
                                }}
                            />
                            {dateFilter && (
                                <IconButton size="small" onClick={() => setDateFilter('')}
                                    sx={{ width: 26, height: 26, border: '1px solid', borderColor: 'divider', borderRadius: '50%' }}>
                                    <XCircle size={13} />
                                </IconButton>
                            )}
                        </Box>
                    </AdminFilterBar>

                    <AsyncWrapper loading={loading} error={errorStates.appointments}>
                        <DataTable
                            columns={columns}
                            data={paginatedAppointments}
                            sortState={tableSort}
                            paginationState={{ ...pagination, count: processedAppointments.length }}
                            onRowClick={(appt) => detailsDialog.openDialog(appt)}
                            emptyMessage="No appointment records found matching your filters."
                        />
                    </AsyncWrapper>
                </Box>
            </DashboardCard>

            {/* Dialogs */}
            <AppointmentDetailsDialog open={detailsDialog.open} onClose={detailsDialog.closeDialog} selectedAppt={detailsDialog.data} formatPKR={formatCurrency} />
            <CancelAppointmentDialog open={cancelDialog.open} onClose={cancelDialog.closeDialog} actionAppt={cancelDialog.data} onConfirm={handleCancelAppointment} submitting={submitting} actionSuccess={actionSuccess} actionError={actionError} />
            <DeleteAppointmentDialog open={deleteDialog.open} onClose={deleteDialog.closeDialog} actionAppt={deleteDialog.data} onConfirm={handleDeleteAppointment} submitting={submitting} actionSuccess={actionSuccess} actionError={actionError} />
            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default AdminAppointments;
