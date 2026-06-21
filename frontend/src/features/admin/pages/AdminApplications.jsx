import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Box, Typography, Button, Chip, Stack
} from '@mui/material';
import { Check, X, Eye, RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { applicationApi } from '../../applications/services/applicationApi';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { ApproveApplicationDialog } from '../../applications/dialogs/ApproveApplicationDialog';
import { RejectApplicationDialog } from '../../applications/dialogs/RejectApplicationDialog';
import { ApplicationDetailsDialog } from '../../applications/dialogs/ApplicationDetailsDialog';
import { 
    AdminPageHeader, DataTable, SectionCard, ToastNotification 
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS } from '../../../shared/theme.constants';

export const AdminApplications = () => {
    const [searchParams] = useSearchParams();
    const {
        applications,
        users,
        loadingStates,
        refreshApplications: fetchApplications
    } = useAdmin();

    const [actionLoading, setActionLoading] = useState(false);
    const loading = loadingStates.applications;

    // Filter, Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'PENDING');
    const [experienceFilter, setExperienceFilter] = useState('ALL');

    // Hooks
    const pagination = usePagination(10);
    const tableSort = useTableSort('full_name', 'asc');
    const { toast, showToast, hideToast } = useToast();

    // Dialogs
    const detailsDialog = useDialogState();
    const approveDialog = useDialogState();
    const rejectDialog = useDialogState();
    const [rejectReason, setRejectReason] = useState('');
    const [rejectError, setRejectError] = useState('');

    const handleApprove = async () => {
        const app = approveDialog.data;
        if (!app) return;

        setActionLoading(true);
        try {
            await applicationApi.approveApplication(app.id);
            showToast(`Dr. ${app.full_name} has been approved. An onboarding invite has been sent.`, 'success');
            approveDialog.closeDialog();
            detailsDialog.closeDialog();
            fetchApplications();
        } catch (err) {
            showToast(err.response?.data?.detail || 'Failed to approve application.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        const app = rejectDialog.data;
        if (!app) return;

        if (rejectReason.trim().length < 10) {
            setRejectError('Please specify a detailed rejection reason (minimum 10 characters).');
            return;
        }

        setActionLoading(true);
        try {
            await applicationApi.rejectApplication(app.id, rejectReason.trim());
            showToast(`Application for Dr. ${app.full_name} has been rejected.`, 'info');
            rejectDialog.closeDialog();
            detailsDialog.closeDialog();
            fetchApplications();
        } catch (err) {
            showToast('Failed to reject application.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'warning';
        }
    };

    const processedApps = useMemo(() => {
        const filtered = applications.filter((app) => {
            const matchesSearch = 
                (app.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (app.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (app.pmdc_number || '').toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

            let matchesExperience = true;
            if (experienceFilter === '5+') matchesExperience = app.experience_years >= 5;
            else if (experienceFilter === '10+') matchesExperience = app.experience_years >= 10;

            return matchesSearch && matchesStatus && matchesExperience;
        });

        return tableSort.sortData(filtered, ['full_name', 'specialization', 'experience_years']);
    }, [applications, searchQuery, statusFilter, experienceFilter, tableSort]);

    const paginatedApps = useMemo(() => pagination.paginate(processedApps), [processedApps, pagination]);

    const columns = [
        {
            id: 'full_name',
            label: 'Full Name',
            sortable: true,
            render: (app) => <Typography sx={{ fontWeight: 700, fontFamily: FONTS.BODY }}>Dr. {app.full_name}</Typography>
        },
        {
            id: 'specialization',
            label: 'Specialization',
            sortable: true,
            render: (app) => <Typography sx={{ fontFamily: FONTS.BODY }}>{app.specialization}</Typography>
        },
        {
            id: 'pmdc_number',
            label: 'PMDC Code',
            render: (app) => <Typography sx={{ fontFamily: FONTS.BODY }}>{app.pmdc_number}</Typography>
        },
        {
            id: 'experience_years',
            label: 'Experience',
            sortable: true,
            render: (app) => <Typography sx={{ fontFamily: FONTS.BODY }}>{app.experience_years} years</Typography>
        },
        {
            id: 'status',
            label: 'Status',
            render: (app) => (
                <Chip 
                    label={app.status} 
                    size="small" 
                    color={getStatusColor(app.status)} 
                    sx={{ fontWeight: 600, fontSize: '10px', borderRadius: '6px', height: 22 }}
                />
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            render: (app) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={e => e.stopPropagation()}>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<Eye size={13} />}
                        onClick={() => detailsDialog.openDialog(app)}
                        sx={{ textTransform: 'none', borderRadius: '100px', fontWeight: 600, py: 0.5, borderColor: 'divider', color: 'text.primary' }}
                    >
                        Inspect
                    </Button>
                    {app.status === 'PENDING' && (
                        <>
                            <Button 
                                variant="contained" 
                                size="small" 
                                startIcon={<Check size={13} />}
                                onClick={() => approveDialog.openDialog(app)}
                                disabled={actionLoading}
                                sx={{ textTransform: 'none', borderRadius: '100px', fontWeight: 600, py: 0.5, boxShadow: 'none' }}
                            >
                                Approve
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={<X size={13} />} 
                                color="error"
                                onClick={() => { setRejectReason(''); setRejectError(''); rejectDialog.openDialog(app); }}
                                disabled={actionLoading}
                                sx={{ textTransform: 'none', borderRadius: '100px', fontWeight: 600, py: 0.5 }}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </Stack>
            )
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
            <AdminPageHeader
                title="Doctor Onboarding Applications"
                subtitle="Review submitted doctor clinical credentials, licensing PMDC certificates, and identification details."
            />

            <SectionCard 
                title="Applications Feed" 
                loading={loading}
                actionButton={
                    <Button size="small" startIcon={<RefreshCw size={14} />} onClick={fetchApplications} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '100px', borderColor: 'divider', color: 'text.primary', fontSize: '12.5px', px: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                        Reload Feed
                    </Button>
                }
            >
                <AdminFilterBar
                    searchQuery={searchQuery}
                    onSearchChange={(val) => { setSearchQuery(val); pagination.resetPage(); }}
                    searchPlaceholder="Search name, specialization, PMDC code..."
                    filter1Label="Status"
                    filter1Value={statusFilter}
                    onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                    filter1Options={[
                        { value: 'ALL', label: 'All Applications' },
                        { value: 'PENDING', label: 'Pending Review' },
                        { value: 'APPROVED', label: 'Approved' },
                        { value: 'REJECTED', label: 'Rejected' }
                    ]}
                    filter2Label="Experience"
                    filter2Value={experienceFilter}
                    onFilter2Change={(val) => { setExperienceFilter(val); pagination.resetPage(); }}
                    filter2Options={[
                        { value: 'ALL', label: 'All Experience' },
                        { value: '5+', label: '5+ Years' },
                        { value: '10+', label: '10+ Years' }
                    ]}
                />
                
                <DataTable
                    columns={columns}
                    data={paginatedApps}
                    sortState={tableSort}
                    paginationState={{ ...pagination, count: processedApps.length }}
                    onRowClick={(app) => detailsDialog.openDialog(app)}
                    emptyMessage="No onboarding applications matched search criteria."
                />
            </SectionCard>

            <ApplicationDetailsDialog
                open={detailsDialog.open}
                onClose={detailsDialog.closeDialog}
                selectedApp={detailsDialog.data}
                users={users}
                actionLoading={actionLoading}
                openApproveConfirm={approveDialog.openDialog}
                openRejectConfirm={(app) => { setRejectReason(''); setRejectError(''); rejectDialog.openDialog(app); }}
            />

            <ApproveApplicationDialog
                open={approveDialog.open}
                onClose={approveDialog.closeDialog}
                app={approveDialog.data}
                onConfirm={handleApprove}
                actionLoading={actionLoading}
            />

            <RejectApplicationDialog
                open={rejectDialog.open}
                onClose={rejectDialog.closeDialog}
                app={rejectDialog.data}
                reason={rejectReason}
                onReasonChange={(val) => { setRejectReason(val); setRejectError(''); }}
                error={rejectError}
                onConfirm={handleReject}
                actionLoading={actionLoading}
            />

            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default AdminApplications;
