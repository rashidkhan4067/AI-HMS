import { useState, useMemo } from 'react';
import { 
    Box, Card, CardContent, Typography, Chip, Tooltip, IconButton, Stack, Alert, useTheme, Button
} from '@mui/material';
import { 
    Calendar, XCircle, Lock, Eye, Trash2, CheckCircle, TrendingUp, Ban, ShieldAlert
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { AppointmentDetailsDialog } from '../dialogs/AppointmentDetailsDialog';
import { CancelAppointmentDialog } from '../dialogs/CancelAppointmentDialog';
import { DeleteAppointmentDialog } from '../dialogs/DeleteAppointmentDialog';
import { formatPKR as formatCurrency } from '../../../shared/utils/formatUtils';
import { 
    AdminPageHeader, DataTable, StatCard, AsyncWrapper, ToastNotification
} from '../../../shared/components/ui';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { COLORS, FONTS } from '../../../shared/theme.constants';

export const AdminAppointments = () => {
    const theme = useTheme();
    const { 
        appointments = [], 
        loadingStates, 
        errorStates,
        refreshAppointments 
    } = useAdmin();

    const loading = loadingStates.appointments;

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');

    // Hooks
    const pagination = usePagination();
    const tableSort = useTableSort('id', 'desc');
    const { toast, showToast, hideToast } = useToast();

    // Dialog states
    const detailsDialog = useDialogState();
    const cancelDialog = useDialogState();
    const deleteDialog = useDialogState();

    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');

    const handleCancelAppointment = async () => {
        const actionAppt = cancelDialog.data;
        if (!actionAppt) return;
        
        setSubmitting(true);
        setActionError('');
        try {
            await adminApi.updateAppointment(actionAppt.id, { status: 'CANCELLED' });
            setActionSuccess(`Appointment #${actionAppt.id} successfully cancelled.`);
            refreshAppointments();
            setTimeout(() => {
                cancelDialog.closeDialog();
                setActionSuccess('');
            }, 1000);
        } catch (err) {
            setActionError(err.response?.data?.detail || 'Failed to cancel the appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAppointment = async () => {
        const actionAppt = deleteDialog.data;
        if (!actionAppt) return;
        
        setSubmitting(true);
        setActionError('');
        try {
            await adminApi.deleteAppointment(actionAppt.id);
            setActionSuccess(`Appointment record successfully deleted.`);
            refreshAppointments();
            setTimeout(() => {
                deleteDialog.closeDialog();
                setActionSuccess('');
            }, 1000);
        } catch (err) {
            setActionError(err.response?.data?.detail || 'Failed to delete appointment record.');
        } finally {
            setSubmitting(false);
        }
    };

    const stats = useMemo(() => {
        const total = appointments.length;
        const completed = appointments.filter(a => a.status === 'COMPLETED').length;
        const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
        
        const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
        const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0';
        
        const projectedRevenue = appointments
            .filter(a => a.status === 'CONFIRMED' || a.status === 'COMPLETED')
            .reduce((sum, a) => sum + parseFloat(a.doctor_consultation_fee || 0), 0);

        return { total, completionRate, cancellationRate, projectedRevenue };
    }, [appointments]);

    const processedAppointments = useMemo(() => {
        const filtered = appointments.filter(appt => {
            const patientName = appt.patient_name || '';
            const patientMrn = appt.patient_mrn || '';
            const doctorName = appt.doctor_name || '';
            const specialty = appt.doctor_specialization || '';
            
            const matchesSearch = 
                patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                patientMrn.toLowerCase().includes(searchTerm.toLowerCase()) || 
                doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                specialty.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || appt.status === statusFilter;
            const matchesDate = !dateFilter || appt.date === dateFilter;

            return matchesSearch && matchesStatus && matchesDate;
        });

        return tableSort.sortData(filtered, ['id', 'date', 'doctor_consultation_fee']);
    }, [appointments, searchTerm, statusFilter, dateFilter, tableSort]);

    const paginatedAppointments = useMemo(() => pagination.paginate(processedAppointments), [processedAppointments, pagination]);

    const columns = [
        {
            id: 'id',
            label: 'Ref / ID',
            sortable: true,
            render: (appt) => <Typography sx={{ fontWeight: 700, fontFamily: FONTS.BODY }}>#{appt.id}</Typography>
        },
        {
            id: 'patient_name',
            label: 'Patient Identifier',
            sortable: true,
            render: (appt) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{appt.patient_name || 'Walk-In'}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>MRN: {appt.patient_mrn || 'N/A'}</Typography>
                </Box>
            )
        },
        {
            id: 'doctor_name',
            label: 'Attending Doctor',
            sortable: true,
            render: (appt) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Dr. {appt.doctor_name || 'Unassigned'}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', display: 'block', fontWeight: 600 }}>{appt.doctor_specialization || 'General Practice'}</Typography>
                </Box>
            )
        },
        {
            id: 'date',
            label: 'Schedule Slot',
            sortable: true,
            render: (appt) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{appt.date}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {appt.start_time?.substring(0, 5)} - {appt.end_time?.substring(0, 5)}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'doctor_consultation_fee',
            label: 'Fee',
            sortable: true,
            render: (appt) => <Typography sx={{ fontWeight: 600, fontFamily: FONTS.BODY }}>{formatCurrency(appt.doctor_consultation_fee || 0)}</Typography>
        },
        {
            id: 'status',
            label: 'Status',
            render: (appt) => {
                let statusColor = 'default';
                if (appt.status === 'COMPLETED') statusColor = 'success';
                else if (appt.status === 'CONFIRMED') statusColor = 'primary';
                else if (appt.status === 'CANCELLED') statusColor = 'error';
                else if (appt.status === 'PENDING') statusColor = 'warning';
                return <Chip label={appt.status} size="small" color={statusColor} variant="light" sx={{ fontWeight: 700, fontSize: '11px' }} />;
            }
        },
        {
            id: 'reason',
            label: 'Reason for Visit',
            render: (appt) => (
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, borderRadius: '4px', bgcolor: 'action.selected', border: '1px solid', borderColor: 'divider' }}>
                    <Lock size={12} style={{ color: theme.palette.text.secondary }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontFamily: 'monospace' }}>
                        {appt.reason || '[REDACTED]'}
                    </Typography>
                </Box>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            render: (appt) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end" onClick={e => e.stopPropagation()}>
                    <Tooltip title="View Administrative Details">
                        <IconButton size="small" onClick={() => detailsDialog.openDialog(appt)} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { color: 'primary.main', borderColor: 'primary.light' } }}>
                            <Eye size={14} />
                        </IconButton>
                    </Tooltip>
                    {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                        <Tooltip title="Cancel Booking">
                            <IconButton size="small" color="error" onClick={() => { setActionError(''); setActionSuccess(''); cancelDialog.openDialog(appt); }} sx={{ border: '1px solid', borderColor: 'error.light', '&:hover': { bgcolor: 'error.light', color: 'error.contrastText' } }}>
                                <XCircle size={14} />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title="Delete Record">
                        <IconButton size="small" color="error" onClick={() => { setActionError(''); setActionSuccess(''); deleteDialog.openDialog(appt); }} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'error.main', color: 'error.contrastText' } }}>
                            <Trash2 size={14} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <AdminPageHeader
                title="Appointment Overview Log"
                subtitle="Monitor scheduled appointments, track status flows, and review professional consulting revenues."
                onRefresh={refreshAppointments}
                loading={loading}
            />

            <Alert severity="info" icon={<ShieldAlert size={20} />} sx={{ borderRadius: '12px', border: '1px solid', borderColor: 'info.light', '& .MuiAlert-message': { width: '100%' } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING }}>Clinical Privacy Regulations Active (HIPAA Compliant)</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>Administrators are restricted from accessing clinical details. Patient symptoms, vitals data, and doctor diagnoses are redacted.</Typography>
                    </Box>
                    <Chip icon={<Lock size={12} />} label="Data Redacted" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, alignSelf: 'flex-start', mt: { xs: 1, sm: 0 } }} />
                </Box>
            </Alert>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                <StatCard title="Total Appointments" value={stats.total} description="All logs in database" icon={Calendar} color={COLORS.INFO} loading={loading} />
                <StatCard title="Completion Rate" value={`${stats.completionRate}%`} description="Completed visits" icon={CheckCircle} color={COLORS.SUCCESS} loading={loading} />
                <StatCard title="Cancellation Rate" value={`${stats.cancellationRate}%`} description="Cancelled appointments" icon={Ban} color={COLORS.DANGER} loading={loading} />
                <StatCard title="Projected Revenue" value={formatCurrency(stats.projectedRevenue)} description="Confirmed & Completed fees" icon={TrendingUp} color={COLORS.PRIMARY} loading={loading} />
            </Box>

            <Card sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <AdminFilterBar
                        searchQuery={searchTerm}
                        onSearchChange={(val) => { setSearchTerm(val); pagination.resetPage(); }}
                        searchPlaceholder="Search by patient, MRN, doctor, specialty..."
                        filter1Label="Status"
                        filter1Value={statusFilter}
                        onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                        filter1Options={[
                            { value: 'ALL', label: 'All Statuses' },
                            { value: 'PENDING', label: 'Pending' },
                            { value: 'CONFIRMED', label: 'Confirmed' },
                            { value: 'COMPLETED', label: 'Completed' },
                            { value: 'CANCELLED', label: 'Cancelled' }
                        ]}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => { setDateFilter(e.target.value); pagination.resetPage(); }}
                                style={{
                                    padding: '8px 12px', borderRadius: '100px', border: '1px solid #E5E7EB',
                                    outline: 'none', fontFamily: FONTS.BODY, fontSize: '14px', background: 'transparent'
                                }}
                            />
                            {dateFilter && (
                                <Button size="small" onClick={() => setDateFilter('')} sx={{ minWidth: 0, p: 1, borderRadius: '50%' }}>
                                    <XCircle size={16} />
                                </Button>
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
                </CardContent>
            </Card>

            <AppointmentDetailsDialog open={detailsDialog.open} onClose={detailsDialog.closeDialog} selectedAppt={detailsDialog.data} formatPKR={formatCurrency} />
            <CancelAppointmentDialog open={cancelDialog.open} onClose={cancelDialog.closeDialog} actionAppt={cancelDialog.data} onConfirm={handleCancelAppointment} submitting={submitting} actionSuccess={actionSuccess} actionError={actionError} />
            <DeleteAppointmentDialog open={deleteDialog.open} onClose={deleteDialog.closeDialog} actionAppt={deleteDialog.data} onConfirm={handleDeleteAppointment} submitting={submitting} actionSuccess={actionSuccess} actionError={actionError} />
            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default AdminAppointments;
