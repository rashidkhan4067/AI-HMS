import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Box, Typography, Card, CardContent, Grid, 
    TextField, MenuItem, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
    Snackbar, Alert, CircularProgress, Skeleton, TablePagination,
    IconButton, TableSortLabel, useMediaQuery, useTheme, Divider
} from '@mui/material';
import { Plus, RefreshCw, Trash2, Search, Copy, Check } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { api as axiosInstance } from '../../../lib/api';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { RevokeInviteDialog } from '../dialogs/RevokeInviteDialog';
import { InviteDetailsDialog } from '../dialogs/InviteDetailsDialog';

export const AdminInvitations = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const {
        invites,
        setInvites,
        users,
        applications,
        loadingStates,
        refreshInvites: fetchInvites
    } = useAdmin();

    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);
    const [formSubmitting, setFormSubmitting] = useState(false);
    
    const loading = loadingStates.invites;

    // Form State
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('DOCTOR');
    const [departmentId, setDepartmentId] = useState('');

    // Table search, filter, sort, and pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('created_at');
    const [order, setOrder] = useState('desc');

    // Revocation Modal State
    const [revokeDialog, setRevokeDialog] = useState({ open: false, inviteId: null, email: '' });

    // Details Modal State
    const [selectedInvite, setSelectedInvite] = useState(null);

    // Notification Toast State
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    
    // Track copied state for buttons dynamically
    const [copiedId, setCopiedId] = useState(null);

    const showToast = useCallback((message, severity = 'success') => {
        setToast({ open: true, message, severity });
    }, []);

    const fetchDepartments = useCallback(async () => {
        setLoadingDepartments(true);
        try {
            const deptsRes = await axiosInstance.get('auth/departments/');
            setDepartments(deptsRes.data || []);
            if (deptsRes.data && deptsRes.data.length > 0) {
                setDepartmentId(deptsRes.data[0].id);
            }
        } catch (err) {
            showToast('Failed to load department options.', 'error');
        } finally {
            setLoadingDepartments(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const handleCreateInvite = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            showToast('Please specify a valid email address.', 'warning');
            return;
        }

        setFormSubmitting(true);
        try {
            const inviteData = {
                email: email.trim().toLowerCase(),
                role,
                department: departmentId || null,
            };
            await adminApi.createInvite(inviteData);
            showToast('Invitation token generated and sent to staff member.', 'success');
            setEmail('');
            fetchInvites();
        } catch (err) {
            const errorMsg = err.response?.data?.email?.[0] || err.response?.data?.detail || 'Failed to issue invitation token.';
            showToast(errorMsg, 'error');
        } finally {
            setFormSubmitting(false);
        }
    };

    const openRevokeConfirm = useCallback((id, email) => {
        setRevokeDialog({ open: true, inviteId: id, email });
    }, []);

    const closeRevokeConfirm = useCallback(() => {
        setRevokeDialog({ open: false, inviteId: null, email: '' });
    }, []);

    const handleRevokeInvite = async () => {
        const { inviteId } = revokeDialog;
        if (!inviteId) return;

        try {
            await adminApi.revokeInvite(inviteId);
            showToast('Invitation token successfully revoked.', 'success');
            closeRevokeConfirm();
            fetchInvites();
        } catch (err) {
            showToast('Failed to revoke invitation.', 'error');
        }
    };

    const handleResendInvite = async (id) => {
        try {
            await adminApi.resendInvite(id);
            showToast('Invitation email successfully resent and token extended.', 'success');
            fetchInvites();
        } catch (err) {
            showToast('Failed to resend invitation email.', 'error');
        }
    };

    const handleCopyLink = (invite) => {
        const registerUrl = `${window.location.origin}/register?token=${invite.token || invite.id}`;
        navigator.clipboard.writeText(registerUrl)
            .then(() => {
                setCopiedId(invite.id);
                showToast('Invitation signup link copied to clipboard.', 'success');
                setTimeout(() => setCopiedId(null), 2000);
            })
            .catch(() => {
                showToast('Failed to copy link to clipboard.', 'error');
            });
    };

    const getStatusChip = (invite) => {
        if (invite.is_used) {
            return <Chip label="REGISTERED" size="small" color="success" sx={{ fontWeight: 600, fontSize: '9px', borderRadius: '6px', height: 20 }} />;
        }
        if (invite.is_expired) {
            return <Chip label="EXPIRED" size="small" color="default" sx={{ fontWeight: 600, fontSize: '9px', borderRadius: '6px', height: 20 }} />;
        }
        return <Chip label="PENDING" size="small" color="warning" sx={{ fontWeight: 600, fontSize: '9px', borderRadius: '6px', height: 20 }} />;
    };

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

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Client-side search, filtering, and sorting memoized for performance
    const sortedInvites = useMemo(() => {
        const filtered = invites.filter((invite) => {
            const matchesSearch = 
                invite.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (invite.department_name && invite.department_name.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesRole = roleFilter === 'ALL' || invite.role === roleFilter;

            let matchesStatus = true;
            if (statusFilter === 'REGISTERED') matchesStatus = invite.is_used;
            else if (statusFilter === 'EXPIRED') matchesStatus = !invite.is_used && invite.is_expired;
            else if (statusFilter === 'PENDING') matchesStatus = !invite.is_used && !invite.is_expired;

            return matchesSearch && matchesRole && matchesStatus;
        });

        return [...filtered].sort((a, b) => {
            let valA = a[orderBy] || '';
            let valB = b[orderBy] || '';

            if (orderBy === 'created_at') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
            }

            if (typeof valA === 'string') {
                return order === 'asc' 
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else {
                return order === 'asc'
                    ? valA - valB
                    : valB - valA;
            }
        });
    }, [invites, searchQuery, roleFilter, statusFilter, orderBy, order]);

    const paginatedInvites = useMemo(() => {
        return sortedInvites.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [sortedInvites, page, rowsPerPage]);

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
            {paginatedInvites.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    No matching onboarding records found.
                </Box>
            ) : (
                paginatedInvites.map((invite) => (
                    <Card 
                        key={invite.id} 
                        onClick={() => setSelectedInvite(invite)}
                        sx={{ 
                            p: 2, 
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 1.5,
                            cursor: 'pointer',
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
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: "'Outfit', sans-serif", fontSize: '14px', wordBreak: 'break-all' }}>
                                    {invite.email}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>
                                    Dept: {invite.department_name || 'General'} • Issued: {formatDate(invite.created_at)}
                                </Typography>
                            </Box>
                            <Box sx={{ ml: 1 }}>
                                {getStatusChip(invite)}
                            </Box>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip label={invite.role} size="small" variant="outlined" color="primary" sx={{ fontSize: '9px', fontWeight: 600, height: 20 }} />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                {!invite.is_used && (
                                    <>
                                        <IconButton 
                                            size="small" 
                                            color="primary"
                                            onClick={(e) => { e.stopPropagation(); handleCopyLink(invite); }}
                                            sx={{ border: '1px solid', borderColor: 'divider', p: 0.75, borderRadius: '8px' }}
                                            title="Copy Signup Link"
                                        >
                                            {copiedId === invite.id ? <Check size={13} style={{ color: '#2E7D32' }} /> : <Copy size={13} />}
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            color="secondary"
                                            onClick={(e) => { e.stopPropagation(); handleResendInvite(invite.id); }}
                                            sx={{ border: '1px solid', borderColor: 'divider', p: 0.75, borderRadius: '8px' }}
                                            title="Resend Invitation Email"
                                        >
                                            <RefreshCw size={13} />
                                        </IconButton>
                                    </>
                                )}
                                <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={(e) => { e.stopPropagation(); openRevokeConfirm(invite.id, invite.email); }}
                                    sx={{ border: '1px solid', borderColor: 'divider', p: 0.75, borderRadius: '8px' }}
                                    title="Revoke Token"
                                >
                                    <Trash2 size={13} />
                                </IconButton>
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
            <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                            <TableSortLabel
                                active={orderBy === 'email'}
                                direction={orderBy === 'email' ? order : 'asc'}
                                onClick={() => handleRequestSort('email')}
                            >
                                Email Address
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                            <TableSortLabel
                                active={orderBy === 'role'}
                                direction={orderBy === 'role' ? order : 'asc'}
                                onClick={() => handleRequestSort('role')}
                            >
                                Role
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                            <TableSortLabel
                                active={orderBy === 'created_at'}
                                direction={orderBy === 'created_at' ? order : 'asc'}
                                onClick={() => handleRequestSort('created_at')}
                            >
                                Issued At
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }} align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedInvites.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                                No matching onboarding records found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedInvites.map((invite) => (
                            <TableRow 
                                key={invite.id} 
                                hover
                                onClick={() => setSelectedInvite(invite)}
                                sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <TableCell sx={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700, py: 1.2 }}>
                                    {invite.email}
                                </TableCell>
                                <TableCell>
                                    <Chip label={invite.role} size="small" variant="outlined" color="primary" sx={{ fontSize: '9px', fontWeight: 600, height: 20 }} />
                                </TableCell>
                                <TableCell sx={{ fontFamily: "'DM Sans', sans-serif" }}>{invite.department_name || 'General'}</TableCell>
                                <TableCell sx={{ fontFamily: "'DM Sans', sans-serif" }}>{formatDate(invite.created_at)}</TableCell>
                                <TableCell>
                                    {getStatusChip(invite)}
                                </TableCell>
                                <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                        {!invite.is_used && (
                                            <>
                                                <IconButton 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={(e) => { e.stopPropagation(); handleCopyLink(invite); }}
                                                    title="Copy Signup Link"
                                                >
                                                    {copiedId === invite.id ? <Check size={14} style={{ color: '#2E7D32' }} /> : <Copy size={14} />}
                                                </IconButton>
                                                <IconButton 
                                                    size="small" 
                                                    color="secondary"
                                                    onClick={(e) => { e.stopPropagation(); handleResendInvite(invite.id); }}
                                                    title="Resend Invitation Email"
                                                >
                                                    <RefreshCw size={14} />
                                                </IconButton>
                                            </>
                                        )}
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={(e) => { e.stopPropagation(); openRevokeConfirm(invite.id, invite.email); }}
                                            title="Revoke Token"
                                        >
                                            <Trash2 size={14} />
                                        </IconButton>
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
                    Staff Onboarding Invitations
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    Issue authorization tokens to onboarding medical staff. Invited users must match the assigned email and role.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Generation Form */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ position: { md: 'sticky' }, top: 24, borderRadius: '16px' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                Generate Invite Token
                            </Typography>
                            <Box component="form" onSubmit={handleCreateInvite} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField 
                                    label="Email Address" 
                                    placeholder="staff@alshifaa.com" 
                                    type="email"
                                    fullWidth
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    slotProps={{
                                        input: {
                                            sx: { borderRadius: '12px' }
                                        }
                                    }}
                                />
                                <TextField 
                                    select 
                                    label="Role Assignment" 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    fullWidth
                                    slotProps={{
                                        select: {
                                            sx: { borderRadius: '12px' }
                                        }
                                    }}
                                >
                                    <MenuItem value="DOCTOR">Doctor / Clinician</MenuItem>
                                    <MenuItem value="NURSE">Clinical Nurse</MenuItem>
                                    <MenuItem value="RECEPTIONIST">Receptionist</MenuItem>
                                    <MenuItem value="PHARMACIST">Pharmacist</MenuItem>
                                    <MenuItem value="LAB_TECHNICIAN">Lab Technician</MenuItem>
                                    <MenuItem value="RADIOLOGIST">Radiologist</MenuItem>
                                </TextField>
                                <TextField 
                                    select 
                                    label="Department" 
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    fullWidth
                                    disabled={loadingDepartments || departments.length === 0}
                                    slotProps={{
                                        select: {
                                            sx: { borderRadius: '12px' }
                                        }
                                    }}
                                >
                                    {loadingDepartments ? (
                                        <MenuItem value="" disabled>Loading departments...</MenuItem>
                                    ) : (
                                        departments.map((dept) => (
                                            <MenuItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                                <Button 
                                    type="submit"
                                    variant="contained" 
                                    startIcon={formSubmitting ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
                                    sx={{ py: 1.25, borderRadius: '100px', fontWeight: 600, textTransform: 'none', boxShadow: 'none' }}
                                    disabled={formSubmitting}
                                >
                                    {formSubmitting ? 'Generating...' : 'Generate Invite'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Listing Table */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: '100%', borderRadius: '16px' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                                    Active Onboarding Tokens
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<RefreshCw size={14} />}
                                    onClick={fetchInvites}
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
                                    Reload Invites
                                </Button>
                            </Box>

                            {/* Search & Filter Workspace */}
                            <AdminFilterBar
                                searchQuery={searchQuery}
                                onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
                                searchPlaceholder="Search email, department..."
                                filter1Label="Status"
                                filter1Value={statusFilter}
                                onFilter1Change={(val) => { setStatusFilter(val); setPage(0); }}
                                filter1Options={[
                                    { value: 'ALL', label: 'All Statuses' },
                                    { value: 'PENDING', label: 'Pending' },
                                    { value: 'REGISTERED', label: 'Registered' },
                                    { value: 'EXPIRED', label: 'Expired' }
                                ]}
                                filter2Label="Role"
                                filter2Value={roleFilter}
                                onFilter2Change={(val) => { setRoleFilter(val); setPage(0); }}
                                filter2Options={[
                                    { value: 'ALL', label: 'All Roles' },
                                    { value: 'DOCTOR', label: 'Doctor' },
                                    { value: 'NURSE', label: 'Nurse' },
                                    { value: 'RECEPTIONIST', label: 'Receptionist' },
                                    { value: 'PHARMACIST', label: 'Pharmacist' },
                                    { value: 'LAB_TECHNICIAN', label: 'Lab Tech' },
                                    { value: 'RADIOLOGIST', label: 'Radiologist' }
                                ]}
                            />
                            
                            {loading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: '12px' }} />
                                </Box>
                            ) : (
                                <>
                                    {isMobile ? mobileCards : desktopTable}
                                    
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        component="div"
                                        count={sortedInvites.length}
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
                </Grid>
            </Grid>

            {/* Custom Revocation Confirmation Modal */}
            <RevokeInviteDialog
                open={revokeDialog.open}
                onClose={closeRevokeConfirm}
                email={revokeDialog.email}
                onConfirm={handleRevokeInvite}
            />

            {/* Custom Invitation Details Dialog */}
            <InviteDetailsDialog
                open={!!selectedInvite}
                onClose={() => setSelectedInvite(null)}
                selectedInvite={selectedInvite}
                users={users}
                applications={applications}
            />

            {/* Toast Alerts */}
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

export default AdminInvitations;
