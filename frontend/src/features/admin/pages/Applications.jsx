import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Box, Typography, Button, Chip, Stack, Card, Divider, useMediaQuery, useTheme
} from '@mui/material';
import { Check, X, Eye, RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { applicationApi } from '../../applications/services/applicationApi';
import { FilterBar } from '../components/FilterBar';
import { ApproveApplicationDialog } from '../../applications/dialogs/ApproveApplicationDialog';
import { RejectApplicationDialog } from '../../applications/dialogs/RejectApplicationDialog';
import { ApplicationDetailsDialog } from '../../applications/dialogs/ApplicationDetailsDialog';
import {
    PageHeader, DataTable, DashboardCard, StatGrid, StatCard, ToastNotification
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS, COLORS } from '../../../shared/theme.constants';
import { FileText, Clock, CheckCircle as CheckCircleIcon, XCircle } from 'lucide-react';

export const Applications = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

    const totalApps = applications.length;
    const pendingApps = useMemo(() => applications.filter(a => a.status === 'PENDING').length, [applications]);
    const approvedApps = useMemo(() => applications.filter(a => a.status === 'APPROVED').length, [applications]);
    const rejectedApps = useMemo(() => applications.filter(a => a.status === 'REJECTED').length, [applications]);

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

    const mobileCards = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedApps.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                    No onboarding applications matched search criteria.
                </Box>
            ) : (
                paginatedApps.map((app) => (
                    <Card 
                        key={app.id} 
                        onClick={() => detailsDialog.openDialog(app)}
                        sx={{ 
                            p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 1.5, cursor: 'pointer',
                            transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(60,64,67,0.08)' }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: FONTS.HEADING, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. {app.full_name}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>{app.specialization}</Typography>
                            </Box>
                            <Box onClick={e => e.stopPropagation()}>
                                <Stack direction="row" spacing={0.5}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => detailsDialog.openDialog(app)}
                                        sx={{ minWidth: 0, p: 0.5, borderRadius: '8px', borderColor: 'divider', color: 'text.primary' }}
                                    >
                                        <Eye size={16} />
                                    </Button>
                                    {app.status === 'PENDING' && (
                                        <>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => approveDialog.openDialog(app)}
                                                disabled={actionLoading}
                                                sx={{ minWidth: 0, p: 0.5, borderRadius: '8px', boxShadow: 'none' }}
                                            >
                                                <Check size={16} />
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="error"
                                                onClick={() => { setRejectReason(''); setRejectError(''); rejectDialog.openDialog(app); }}
                                                disabled={actionLoading}
                                                sx={{ minWidth: 0, p: 0.5, borderRadius: '8px' }}
                                            >
                                                <X size={16} />
                                            </Button>
                                        </>
                                    )}
                                </Stack>
                            </Box>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label={app.pmdc_number} size="small" variant="outlined" color="primary" sx={{ fontSize: '9px', fontWeight: 600, height: 20 }} />
                                <Chip label={app.status} size="small" color={getStatusColor(app.status)} sx={{ fontWeight: 600, fontSize: '9px', borderRadius: '4px', height: 20 }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', fontFamily: FONTS.BODY }}>
                                Exp: {app.experience_years} years
                            </Typography>
                        </Box>
                    </Card>
                ))
            )}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
            <PageHeader
                title="Doctor Onboarding Applications"
                subtitle="Review submitted doctor clinical credentials, licensing PMDC certificates, and identification details."
            />

            <StatGrid cols={4}>
                <StatCard
                    title="Total Applications"
                    value={totalApps}
                    supportingText="All submissions"
                    icon={FileText}
                    color={COLORS.PRIMARY}
                    loading={loading}
                />
                <StatCard
                    title="Pending Review"
                    value={pendingApps}
                    supportingText="Awaiting action"
                    icon={Clock}
                    color={COLORS.WARNING}
                    loading={loading}
                />
                <StatCard
                    title="Approved"
                    value={approvedApps}
                    supportingText="Boarded staff"
                    icon={CheckCircleIcon}
                    color={COLORS.SUCCESS}
                    loading={loading}
                />
                <StatCard
                    title="Rejected"
                    value={rejectedApps}
                    supportingText="Denied applications"
                    icon={XCircle}
                    color={COLORS.DANGER}
                    loading={loading}
                />
            </StatGrid>

            <DashboardCard
                title="Applications Feed"
                subtitle="Manage and filter onboarding requests"
                action={
                    <Button size="small" startIcon={<RefreshCw size={14} />} onClick={fetchApplications} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '100px', borderColor: 'divider', color: 'text.primary', fontSize: '12.5px', px: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                        Reload Feed
                    </Button>
                }
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FilterBar
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

                    {isMobile ? mobileCards : (
                        <DataTable
                            columns={columns}
                            data={paginatedApps}
                            sortState={tableSort}
                            paginationState={{ ...pagination, count: processedApps.length }}
                            onRowClick={(app) => detailsDialog.openDialog(app)}
                            emptyMessage="No onboarding applications matched search criteria."
                        />
                    )}
                </Box>
            </DashboardCard>

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

export default Applications;
