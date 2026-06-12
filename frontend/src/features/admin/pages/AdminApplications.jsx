import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Box, Typography, Card, CardContent, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
    Chip, Button, Snackbar, Alert, Skeleton, TablePagination, TableSortLabel,
    Grid, useMediaQuery, useTheme, Divider
} from '@mui/material';
import { Check, X, Eye, RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { ApproveApplicationDialog } from '../dialogs/ApproveApplicationDialog';
import { RejectApplicationDialog } from '../dialogs/RejectApplicationDialog';
import { ApplicationDetailsDialog } from '../dialogs/ApplicationDetailsDialog';

export const AdminApplications = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const {
        applications,
        setApplications,
        users,
        loadingStates,
        refreshApplications: fetchApplications
    } = useAdmin();

    const [selectedApp, setSelectedApp] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const loading = loadingStates.applications;

    // Filter, Search, Sort & Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING'); // Default to pending to review
    const [experienceFilter, setExperienceFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('full_name');
    const [order, setOrder] = useState('asc');

    // Custom Approval Dialog State
    const [approveDialog, setApproveDialog] = useState({ open: false, app: null });

    // Custom Rejection Dialog State
    const [rejectDialog, setRejectDialog] = useState({ open: false, app: null, reason: '', error: '' });

    // Toast notifications
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const showToast = useCallback((message, severity = 'success') => {
        setToast({ open: true, message, severity });
    }, []);

    // Custom dialog handlers
    const openApproveConfirm = useCallback((app) => {
        setApproveDialog({ open: true, app });
    }, []);

    const closeApproveConfirm = useCallback(() => {
        setApproveDialog({ open: false, app: null });
    }, []);

    const handleApprove = async () => {
        const { app } = approveDialog;
        if (!app) return;

        setActionLoading(true);
        try {
            await adminApi.approveApplication(app.id);
            showToast(`Dr. ${app.full_name} has been approved. An onboarding invite has been sent.`, 'success');
            closeApproveConfirm();
            setSelectedApp(null);
            fetchApplications();
        } catch (err) {
            showToast(err.response?.data?.detail || 'Failed to approve application.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const openRejectConfirm = useCallback((app) => {
        setRejectDialog({ open: true, app, reason: '', error: '' });
    }, []);

    const closeRejectConfirm = useCallback(() => {
        setRejectDialog({ open: false, app: null, reason: '', error: '' });
    }, []);

    const handleReject = async () => {
        const { app, reason } = rejectDialog;
        if (!app) return;

        if (reason.trim().length < 10) {
            setRejectDialog(prev => ({ ...prev, error: 'Please specify a detailed rejection reason (minimum 10 characters).' }));
            return;
        }

        setActionLoading(true);
        try {
            await adminApi.rejectApplication(app.id, reason.trim());
            showToast(`Application for Dr. ${app.full_name} has been rejected.`, 'info');
            closeRejectConfirm();
            setSelectedApp(null);
            fetchApplications();
        } catch (err) {
            showToast('Failed to reject application.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePresetReason = useCallback((text) => {
        setRejectDialog(prev => ({ ...prev, reason: text, error: '' }));
    }, []);

    const getMediaUrl = (path) => {
        if (!path) return '#';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const base = axiosInstance.defaults.baseURL || 'http://localhost:8000/api/';
        const domain = base.replace(/\/api\/?.*$/, '');
        return `${domain}${path}`;
    };

    const getFilename = (url) => {
        if (!url) return 'document.pdf';
        return url.split('/').pop();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'REJECTED': return 'error';
            default: return 'warning';
        }
    };

    // Sorting columns logic
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Client-side search, filtering, and sorting memoized for performance
    const sortedApps = useMemo(() => {
        const filtered = applications.filter((app) => {
            // Search filter
            const matchesSearch = 
                app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.pmdc_number.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;

            // Experience filter
            let matchesExperience = true;
            if (experienceFilter === '5+') matchesExperience = app.experience_years >= 5;
            else if (experienceFilter === '10+') matchesExperience = app.experience_years >= 10;

            return matchesSearch && matchesStatus && matchesExperience;
        });

        return [...filtered].sort((a, b) => {
            let valA = a[orderBy] || '';
            let valB = b[orderBy] || '';

            if (orderBy === 'experience_years') {
                return order === 'asc' ? valA - valB : valB - valA;
            }

            if (typeof valA === 'string') {
                return order === 'asc' 
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            return 0;
        });
    }, [applications, searchQuery, statusFilter, experienceFilter, orderBy, order]);

    const paginatedApps = useMemo(() => {
        return sortedApps.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [sortedApps, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };



    // Mobile Adaptive Card Layout
    const mobileCards = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedApps.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    No onboarding applications matched search criteria.
                </Box>
            ) : (
                paginatedApps.map((app) => (
                    <Card 
                        key={app.id} 
                        sx={{ 
                            p: 2, 
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 1.5,
                            transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.palette.mode === 'dark' 
                                    ? '0 4px 12px rgba(0,0,0,0.3)' 
                                    : '0 4px 12px rgba(60,64,67,0.08)'
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: "'Outfit', sans-serif", fontSize: '14.5px' }}>
                                    Dr. {app.full_name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>
                                    {app.specialization} • Exp: {app.experience_years} yrs
                                </Typography>
                            </Box>
                            <Chip 
                                label={app.status} 
                                size="small" 
                                color={getStatusColor(app.status)} 
                                sx={{ fontWeight: 600, fontSize: '9px', borderRadius: '4px', height: 20 }}
                            />
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                                PMDC: {app.pmdc_number}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.75 }}>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={() => setSelectedApp(app)}
                                    sx={{ textTransform: 'none', borderRadius: '100px', fontWeight: 600, py: 0.5, px: 1.5, fontSize: '11px', borderColor: 'divider', color: 'text.primary' }}
                                >
                                    Inspect
                                </Button>
                                {app.status === 'PENDING' && (
                                    <>
                                        <Button 
                                            variant="contained" 
                                            size="small" 
                                            onClick={() => openApproveConfirm(app)}
                                            disabled={actionLoading}
                                            sx={{ textTransform: 'none', borderRadius: '100px', fontWeight: 600, py: 0.5, px: 1.5, fontSize: '11px', boxShadow: 'none' }}
                                        >
                                            Approve
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Card>
                ))
            )}
        </Box>
    );

    // Desktop High-Density Table Layout
    const desktopTable = (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 700 }}>
                <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                            <TableSortLabel
                                active={orderBy === 'full_name'}
                                direction={orderBy === 'full_name' ? order : 'asc'}
                                onClick={() => handleRequestSort('full_name')}
                            >
                                Full Name
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                            <TableSortLabel
                                active={orderBy === 'specialization'}
                                direction={orderBy === 'specialization' ? order : 'asc'}
                                onClick={() => handleRequestSort('specialization')}
                            >
                                Specialization
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>PMDC Code</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                            <TableSortLabel
                                active={orderBy === 'experience_years'}
                                direction={orderBy === 'experience_years' ? order : 'asc'}
                                onClick={() => handleRequestSort('experience_years')}
                            >
                                Experience
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }} align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedApps.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                                No onboarding applications matched search criteria.
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedApps.map((app) => (
                            <TableRow 
                                key={app.id} 
                                sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    transition: 'background-color 0.2s',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <TableCell sx={{ fontWeight: 700, py: 1.2, fontFamily: "'DM Sans', sans-serif" }}>Dr. {app.full_name}</TableCell>
                                <TableCell sx={{ fontFamily: "'DM Sans', sans-serif" }}>{app.specialization}</TableCell>
                                <TableCell sx={{ fontFamily: "'DM Sans', sans-serif" }}>{app.pmdc_number}</TableCell>
                                <TableCell sx={{ fontFamily: "'DM Sans', sans-serif" }}>{app.experience_years} years</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={app.status} 
                                        size="small" 
                                        color={getStatusColor(app.status)} 
                                        sx={{ fontWeight: 600, fontSize: '10px', borderRadius: '6px', height: 22 }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            startIcon={<Eye size={13} />}
                                            onClick={() => setSelectedApp(app)}
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
                                                    onClick={() => openApproveConfirm(app)}
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
                                                    onClick={() => openRejectConfirm(app)}
                                                    disabled={actionLoading}
                                                    sx={{ textTransform: 'none', borderRadius: '100px', fontWeight: 600, py: 0.5 }}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
            {/* Header */}
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75, fontFamily: "'Outfit', sans-serif", fontSize: { xs: '1.65rem', sm: '2rem' } }}>
                    Doctor Onboarding Applications
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    Review submitted doctor clinical credentials, licensing PMDC certificates, and identification details.
                </Typography>
            </Box>

            {/* Applications List */}
            <Card sx={{ borderRadius: '16px' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                            Applications Feed
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<RefreshCw size={14} />}
                            onClick={fetchApplications}
                            sx={{ 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                borderRadius: '100px',
                                borderColor: 'divider',
                                color: 'text.primary',
                                fontSize: '12.5px',
                                px: 2,
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                        >
                            Reload Feed
                        </Button>
                    </Box>

                    {/* Search & Filter controls */}
                    <AdminFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
                        searchPlaceholder="Search name, specialization, PMDC code..."
                        filter1Label="Status"
                        filter1Value={statusFilter}
                        onFilter1Change={(val) => { setStatusFilter(val); setPage(0); }}
                        filter1Options={[
                            { value: 'ALL', label: 'All Applications' },
                            { value: 'PENDING', label: 'Pending Review' },
                            { value: 'APPROVED', label: 'Approved' },
                            { value: 'REJECTED', label: 'Rejected' }
                        ]}
                        filter2Label="Experience"
                        filter2Value={experienceFilter}
                        onFilter2Change={(val) => { setExperienceFilter(val); setPage(0); }}
                        filter2Options={[
                            { value: 'ALL', label: 'All Experience' },
                            { value: '5+', label: '5+ Years' },
                            { value: '10+', label: '10+ Years' }
                        ]}
                    />
                    
                    {loading ? (
                        <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: '12px' }} />
                    ) : (
                        <>
                            {isMobile ? mobileCards : desktopTable}
                            
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={sortedApps.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ borderTop: 'none', mt: 1 }}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Document Inspection Dialog */}
            <ApplicationDetailsDialog
                open={!!selectedApp}
                onClose={() => setSelectedApp(null)}
                selectedApp={selectedApp}
                users={users}
                actionLoading={actionLoading}
                openApproveConfirm={openApproveConfirm}
                openRejectConfirm={openRejectConfirm}
            />

            {/* Custom Dialog Approval Confirmation */}
            <ApproveApplicationDialog
                open={approveDialog.open}
                onClose={closeApproveConfirm}
                app={approveDialog.app}
                onConfirm={handleApprove}
                actionLoading={actionLoading}
            />

            {/* Custom Dialog Rejection Form */}
            <RejectApplicationDialog
                open={rejectDialog.open}
                onClose={closeRejectConfirm}
                app={rejectDialog.app}
                reason={rejectDialog.reason}
                onReasonChange={(val) => setRejectDialog(prev => ({ ...prev, reason: val, error: '' }))}
                error={rejectDialog.error}
                onConfirm={handleReject}
                actionLoading={actionLoading}
            />

            {/* Notification Toast */}
            <Snackbar
                open={toast.open}
                autoHideDuration={5000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })} sx={{ borderRadius: '12px' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminApplications;
