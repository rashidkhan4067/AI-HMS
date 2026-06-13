import React, { useState, useMemo } from 'react';
import { 
    Box, Typography, Button, IconButton, Chip, Tooltip, Stack
} from '@mui/material';
import { 
    Award, ShieldAlert, CheckCircle2, Clock, Edit2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { UpdateDoctorComplianceDialog } from '../dialogs/UpdateDoctorComplianceDialog';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { 
    AdminPageHeader, StatCard, SectionCard, DataTable, ToastNotification, AsyncWrapper
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS, COLORS } from '../../../shared/theme.constants';

export const AdminCompliance = () => {
    const { 
        compliance = [], 
        loadingStates, 
        errorStates, 
        refreshCompliance 
    } = useAdmin();

    const loading = loadingStates.compliance;
    const error = errorStates.compliance;

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Hooks
    const pagination = usePagination(10);
    const tableSort = useTableSort('doctor_name', 'asc');
    const { toast, showToast, hideToast } = useToast();

    // Dialog state
    const editDialog = useDialogState();
    const [expiryDate, setExpiryDate] = useState('');
    const [licenseStatus, setLicenseStatus] = useState('ACTIVE');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Handle Edit Click
    const handleEditClick = (doctor) => {
        setExpiryDate(doctor.pmdc_expiry_date || '');
        setLicenseStatus(doctor.license_status || 'ACTIVE');
        setFormError('');
        editDialog.openDialog(doctor);
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        const doctor = editDialog.data;
        if (!doctor) return;
        setSubmitting(true);
        setFormError('');
        try {
            await adminApi.updateDoctorProfile(doctor.id, {
                pmdc_expiry_date: expiryDate || null,
                license_status: licenseStatus
            });
            showToast('Physician PMDC license updated successfully.', 'success');
            refreshCompliance();
            editDialog.closeDialog();
        } catch (err) {
            setFormError(err.response?.data?.detail || 'Failed to update compliance details.');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate metrics
    const stats = useMemo(() => {
        const total = compliance.length;
        const active = compliance.filter(d => d.license_status === 'ACTIVE').length;
        const pending = compliance.filter(d => d.license_status === 'PENDING_RENEWAL').length;
        const expired = compliance.filter(d => d.license_status === 'EXPIRED' || (d.days_to_expiry !== null && d.days_to_expiry < 0)).length;
        const expiringSoon = compliance.filter(d => d.license_status === 'ACTIVE' && d.days_to_expiry !== null && d.days_to_expiry >= 0 && d.days_to_expiry < 60).length;

        return { total, active, pending, expired, expiringSoon };
    }, [compliance]);

    // Filtered data
    const processedDoctors = useMemo(() => {
        const filtered = compliance.filter(doc => {
            const nameMatch = doc.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
            
            const statusMatch = statusFilter === 'ALL' || 
                                (statusFilter === 'EXPIRING_SOON' && doc.days_to_expiry !== null && doc.days_to_expiry >= 0 && doc.days_to_expiry < 60 && doc.license_status === 'ACTIVE') ||
                                doc.license_status === statusFilter;

            return nameMatch && statusMatch;
        });

        return tableSort.sortData(filtered, ['doctor_name', 'specialization', 'pmdc_expiry_date', 'days_to_expiry']);
    }, [compliance, searchTerm, statusFilter, tableSort]);

    const paginatedDoctors = useMemo(() => pagination.paginate(processedDoctors), [processedDoctors, pagination]);

    const columns = [
        {
            id: 'doctor_name',
            label: 'Physician Name',
            sortable: true,
            render: (doc) => (
                <Box>
                    <Typography sx={{ fontWeight: 600, fontFamily: FONTS.BODY }}>Dr. {doc.doctor_name}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontFamily: FONTS.BODY }}>{doc.doctor_email}</Typography>
                </Box>
            )
        },
        {
            id: 'specialization',
            label: 'Specialization',
            sortable: true,
            render: (doc) => <Typography sx={{ fontFamily: FONTS.BODY }}>{doc.specialization}</Typography>
        },
        {
            id: 'pmdc_expiry_date',
            label: 'PMDC Expiry Date',
            sortable: true,
            render: (doc) => <Typography sx={{ fontFamily: FONTS.BODY }}>{doc.pmdc_expiry_date || 'Not Provided'}</Typography>
        },
        {
            id: 'license_status',
            label: 'License Status',
            render: (doc) => {
                const isExpired = doc.license_status === 'EXPIRED' || (doc.days_to_expiry !== null && doc.days_to_expiry < 0);
                const isExpiringSoon = doc.license_status === 'ACTIVE' && doc.days_to_expiry !== null && doc.days_to_expiry >= 0 && doc.days_to_expiry < 60;
                const isPending = doc.license_status === 'PENDING_RENEWAL';

                let chipColor = 'success';
                let statusText = 'Active';
                if (isExpired) {
                    chipColor = 'error';
                    statusText = 'Expired';
                } else if (isExpiringSoon) {
                    chipColor = 'warning';
                    statusText = 'Expiring Soon';
                } else if (isPending) {
                    chipColor = 'info';
                    statusText = 'Pending Renewal';
                }

                return <Chip label={statusText} size="small" color={chipColor} sx={{ fontWeight: 600 }} />;
            }
        },
        {
            id: 'days_to_expiry',
            label: 'Days to Expiry',
            sortable: true,
            render: (doc) => {
                const isExpired = doc.license_status === 'EXPIRED' || (doc.days_to_expiry !== null && doc.days_to_expiry < 0);
                const isExpiringSoon = doc.license_status === 'ACTIVE' && doc.days_to_expiry !== null && doc.days_to_expiry >= 0 && doc.days_to_expiry < 60;

                if (doc.days_to_expiry !== null) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isExpired && <AlertTriangle size={14} style={{ color: COLORS.DANGER }} />}
                            {isExpiringSoon && <Clock size={14} style={{ color: COLORS.WARNING }} />}
                            <Typography variant="body2" sx={{ fontWeight: (isExpired || isExpiringSoon) ? 700 : 500, color: isExpired ? 'error.main' : isExpiringSoon ? 'warning.main' : 'text.primary', fontFamily: FONTS.BODY }}>
                                {doc.days_to_expiry < 0 ? `Expired ${Math.abs(doc.days_to_expiry)}d ago` : `${doc.days_to_expiry} days remaining`}
                            </Typography>
                        </Box>
                    );
                }
                return <Typography variant="body2" color="text.disabled">N/A</Typography>;
            }
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            render: (doc) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={e => e.stopPropagation()}>
                    <Tooltip title="Update License Details">
                        <IconButton size="small" onClick={() => handleEditClick(doc)} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { color: 'primary.main', borderColor: 'primary.light' } }}>
                            <Edit2 size={14} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <AdminPageHeader
                title="PMDC License Compliance Monitor"
                subtitle="Track and audit physician certifications, Pakistan Medical & Dental Council (PMDC) expiries, and licensing status."
                onRefresh={refreshCompliance}
                loading={loading}
                refreshLabel="Sync Registry"
            />

            <AsyncWrapper loading={false} error={error}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                    <StatCard title="Total Physicians" value={stats.total} description="Registered doctors" icon={Award} color={COLORS.PRIMARY} loading={loading} />
                    <StatCard title="Active Licenses" value={stats.active} description="Fully compliant" icon={CheckCircle2} color={COLORS.SUCCESS} loading={loading} />
                    <StatCard title="Expiring Soon (<60d)" value={stats.expiringSoon} description="Renewal warning threshold" icon={Clock} color={COLORS.WARNING} loading={loading} />
                    <StatCard title="Expired / Delinquent" value={stats.expired} description="Action required immediately" icon={ShieldAlert} color={COLORS.DANGER} loading={loading} />
                </Box>

                <SectionCard title="Compliance Registry" loading={loading}>
                    <AdminFilterBar
                        searchQuery={searchTerm}
                        onSearchChange={(val) => { setSearchTerm(val); pagination.resetPage(); }}
                        searchPlaceholder="Search by physician name or specialization..."
                        filter1Label="License Status"
                        filter1Value={statusFilter}
                        onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                        filter1Options={[
                            { value: 'ALL', label: 'All Statuses' },
                            { value: 'ACTIVE', label: 'Active' },
                            { value: 'EXPIRING_SOON', label: 'Expiring Soon' },
                            { value: 'PENDING_RENEWAL', label: 'Pending Renewal' },
                            { value: 'EXPIRED', label: 'Expired' }
                        ]}
                    />

                    <DataTable
                        columns={columns}
                        data={paginatedDoctors}
                        sortState={tableSort}
                        paginationState={{ ...pagination, count: processedDoctors.length }}
                        emptyMessage="No physician compliance records found matching your filters."
                    />
                </SectionCard>
            </AsyncWrapper>

            <UpdateDoctorComplianceDialog
                open={editDialog.open}
                onClose={editDialog.closeDialog}
                doctor={editDialog.data}
                expiryDate={expiryDate}
                setExpiryDate={setExpiryDate}
                licenseStatus={licenseStatus}
                setLicenseStatus={setLicenseStatus}
                submitting={submitting}
                successMessage=""
                formError={formError}
                onSubmit={handleSubmit}
            />

            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default AdminCompliance;
