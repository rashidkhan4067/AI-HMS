import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Box, Typography, Card, CardContent, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Switch,
    Snackbar, Alert, Skeleton, TablePagination, TableSortLabel,
    Button, Grid, Avatar, Divider, useMediaQuery, useTheme
} from '@mui/material';
import { RefreshCw } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { api as axiosInstance } from '../../../lib/api';
import { useAuth } from '../../auth/hooks/useAuth';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { ToggleAccessDialog } from '../dialogs/ToggleAccessDialog';
import { UserDetailsDialog } from '../dialogs/UserDetailsDialog';
import { EditUserDialog } from '../dialogs/EditUserDialog';
import { DeleteUserDialog } from '../dialogs/DeleteUserDialog';

export const AdminUsers = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user: currentUser } = useAuth();

    const { 
        users, 
        setUsers,
        invites,
        applications,
        loadingStates, 
        refreshUsers: fetchUsers 
    } = useAdmin();

    const loading = loadingStates.users;

    // Filter, Search, Sort & Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [orderBy, setOrderBy] = useState('full_name');
    const [order, setOrder] = useState('asc');

    // Toggle Confirm Dialog State
    const [toggleDialog, setToggleDialog] = useState({ open: false, user: null });

    // User details modal state
    const [selectedUser, setSelectedUser] = useState(null);

    // Edit User Dialog state
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', role: '', department: '', employee_id: '', phone: '' });
    const [editErrors, setEditErrors] = useState({});
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Delete User Dialog state
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    // Departments state
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    const fetchDepartments = useCallback(async () => {
        setLoadingDepartments(true);
        try {
            const deptsRes = await axiosInstance.get('auth/departments/');
            setDepartments(deptsRes.data || []);
        } catch (err) {
            console.error('Failed to load departments', err);
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // Handle Open Edit
    const handleOpenEdit = (user) => {
        setEditForm({
            full_name: user.full_name || '',
            role: user.role || '',
            department: user.department || '',
            employee_id: user.employee_id || '',
            phone: user.phone || ''
        });
        setEditErrors({});
        setEditOpen(true);
    };

    // Handle Edit Submit with Validation
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (!editForm.full_name.trim()) errors.full_name = 'Full Name is required.';
        if (!editForm.role) errors.role = 'Role is required.';
        if (!editForm.employee_id.trim()) errors.employee_id = 'Employee ID is required.';
        if (!editForm.phone.trim()) errors.phone = 'Phone number is required.';

        if (Object.keys(errors).length > 0) {
            setEditErrors(errors);
            return;
        }

        setEditSubmitting(true);
        try {
            const updatedUser = await adminApi.updateUser(selectedUser.id, {
                full_name: editForm.full_name.trim(),
                role: editForm.role,
                department: editForm.department || null,
                employee_id: editForm.employee_id.trim(),
                phone: editForm.phone.trim()
            });

            showToast('User profile updated successfully.', 'success');
            setEditOpen(false);
            
            // Update local state in context
            setUsers(prevUsers => 
                prevUsers.map(u => u.id === selectedUser.id ? { ...u, ...updatedUser } : u)
            );
            // Update selected user state to show new values in details modal
            setSelectedUser(prev => ({ ...prev, ...updatedUser }));
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to update user profile.';
            showToast(errorMsg, 'error');
        } finally {
            setEditSubmitting(false);
        }
    };

    // Handle Open Delete
    const handleOpenDelete = (user) => {
        setDeleteDialog({ open: true, user });
    };

    // Handle Delete Confirm
    const handleDeleteConfirm = async () => {
        const { user } = deleteDialog;
        if (!user) return;

        setDeleteSubmitting(true);
        try {
            await adminApi.deleteUser(user.id);
            showToast('User account has been permanently deleted.', 'info');
            setDeleteDialog({ open: false, user: null });
            setSelectedUser(null); // Close details modal if open
            // Update local state
            setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to delete user account.';
            showToast(errorMsg, 'error');
        } finally {
            setDeleteSubmitting(false);
        }
    };

    // Toast alerts
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

    const showToast = useCallback((message, severity = 'success') => {
        setToast({ open: true, message, severity });
    }, []);

    const handleSwitchChange = useCallback((user) => {
        setToggleDialog({ open: true, user });
    }, []);

    const closeToggleDialog = useCallback(() => {
        setToggleDialog({ open: false, user: null });
    }, []);

    const handleToggleActive = async () => {
        const { user } = toggleDialog;
        if (!user) return;

        try {
            const res = await adminApi.toggleUserActive(user.id);
            showToast(res.detail || 'User access status updated successfully.', 'success');
            
            // Update local state
            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === user.id ? { ...u, is_active: res.is_active } : u
                )
            );
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Failed to update user active status.';
            showToast(errorMsg, 'error');
        } finally {
            closeToggleDialog();
        }
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

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    // Sorting columns logic
    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Client-side filtering, searching, and sorting memoized for performance
    const sortedUsers = useMemo(() => {
        const filtered = users.filter((user) => {
            // Search filter
            const matchesSearch = 
                user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());

            // Status filter
            const matchesStatus = 
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && user.is_active) ||
                (statusFilter === 'INACTIVE' && !user.is_active);

            // Role filter
            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
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
    }, [users, searchQuery, statusFilter, roleFilter, orderBy, order]);

    const paginatedUsers = useMemo(() => {
        return sortedUsers.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [sortedUsers, page, rowsPerPage]);

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
            {paginatedUsers.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    No registered user accounts match your search query.
                </Box>
            ) : (
                paginatedUsers.map((user) => (
                    <Card 
                        key={user.id} 
                        onClick={() => setSelectedUser(user)}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38, fontSize: '14px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                {getInitials(user.full_name)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
                                    {user.full_name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', wordBreak: 'break-all' }}>
                                    {user.email}
                                </Typography>
                            </Box>
                            <Switch 
                                checked={user.is_active} 
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => {
                                    handleSwitchChange(user);
                                }}
                                color="primary"
                                size="small"
                            />
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label={user.role} size="small" variant="outlined" color="primary" sx={{ fontSize: '9px', fontWeight: 600, height: 20 }} />
                                <Chip 
                                    label={user.is_active ? 'Active' : 'Inactive'} 
                                    size="small" 
                                    color={user.is_active ? 'success' : 'default'} 
                                    sx={{ fontWeight: 600, fontSize: '9px', borderRadius: '4px', height: 20 }}
                                />
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>
                                Registered: {formatDate(user.created_at)}
                            </Typography>
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
                                Assigned Role
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>
                            <TableSortLabel
                                active={orderBy === 'created_at'}
                                direction={orderBy === 'created_at' ? order : 'asc'}
                                onClick={() => handleRequestSort('created_at')}
                            >
                                Date Registered
                            </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }}>Active Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, py: 1.5, fontFamily: "'Outfit', sans-serif" }} align="right">Approved Access</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {paginatedUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                                No registered user accounts match your search query.
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedUsers.map((user) => (
                            <TableRow 
                                key={user.id} 
                                hover
                                onClick={() => setSelectedUser(user)}
                                sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    transition: 'background-color 0.2s',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <TableCell sx={{ fontWeight: 700, py: 1.2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar sx={{ bgcolor: 'rgba(0,106,106,0.08)', color: 'primary.main', width: 28, height: 28, fontSize: '11px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                            {getInitials(user.full_name)}
                                        </Avatar>
                                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>{user.full_name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ fontFamily: "'DM Sans', sans-serif" }}>{user.email}</TableCell>
                                <TableCell>
                                    <Chip label={user.role} size="small" variant="outlined" color="primary" sx={{ fontSize: '9px', fontWeight: 600, height: 20 }} />
                                </TableCell>
                                <TableCell sx={{ fontFamily: "'DM Sans', sans-serif" }}>{formatDate(user.created_at)}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={user.is_active ? 'Active' : 'Inactive'} 
                                        size="small" 
                                        color={user.is_active ? 'success' : 'default'} 
                                        sx={{ fontWeight: 600, fontSize: '10px', borderRadius: '6px', height: 22 }}
                                    />
                                </TableCell>
                                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                    <Switch 
                                        checked={user.is_active} 
                                        onChange={() => {
                                            handleSwitchChange(user);
                                        }}
                                        color="primary"
                                        size="small"
                                    />
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
                    Active User Directories
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: "'DM Sans', sans-serif" }}>
                    View directories, toggle staff system access status, and manage security profiles globally.
                </Typography>
            </Box>

            {/* Users Table */}
            <Card sx={{ borderRadius: '16px' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: '18px' }}>
                            User Accounts Console
                        </Typography>
                        <Button
                            size="small"
                            startIcon={<RefreshCw size={14} />}
                            onClick={fetchUsers}
                            sx={{ 
                                textTransform: 'none', 
                                fontWeight: 600, 
                                borderRadius: '100px',
                                fontSize: '12.5px',
                                borderColor: 'divider',
                                color: 'text.primary',
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }}
                        >
                            Reload Directory
                        </Button>
                    </Box>

                    {/* Search & Filter Controls */}
                    <AdminFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={(val) => { setSearchQuery(val); setPage(0); }}
                        searchPlaceholder="Search by name, email..."
                        filter1Label="Status"
                        filter1Value={statusFilter}
                        onFilter1Change={(val) => { setStatusFilter(val); setPage(0); }}
                        filter1Options={[
                            { value: 'ALL', label: 'All Accounts' },
                            { value: 'ACTIVE', label: 'Active' },
                            { value: 'INACTIVE', label: 'Inactive' }
                        ]}
                        filter2Label="Role"
                        filter2Value={roleFilter}
                        onFilter2Change={(val) => { setRoleFilter(val); setPage(0); }}
                        filter2Options={[
                            { value: 'ALL', label: 'All Roles' },
                            { value: 'ADMIN', label: 'Administrator' },
                            { value: 'DOCTOR', label: 'Doctor' },
                            { value: 'NURSE', label: 'Nurse' },
                            { value: 'RECEPTIONIST', label: 'Receptionist' },
                            { value: 'PHARMACIST', label: 'Pharmacist' },
                            { value: 'LAB_TECHNICIAN', label: 'Lab Tech' },
                            { value: 'RADIOLOGIST', label: 'Radiologist' }
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
                                count={sortedUsers.length}
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

            {/* Custom confirmation dialog for status toggling */}
            <ToggleAccessDialog
                open={toggleDialog.open}
                onClose={closeToggleDialog}
                user={toggleDialog.user}
                applications={applications}
                onConfirm={handleToggleActive}
            />

            {/* Advanced User Profile & Onboarding History Dialog */}
            <UserDetailsDialog
                open={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                selectedUser={selectedUser}
                currentUser={currentUser}
                applications={applications}
                invites={invites}
                onOpenDelete={handleOpenDelete}
                onOpenEdit={handleOpenEdit}
            />

            {/* Edit User Account Dialog */}
            <EditUserDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                selectedUser={selectedUser}
                editForm={editForm}
                onFormChange={(field, val) => setEditForm(prev => ({ ...prev, [field]: val }))}
                editErrors={editErrors}
                editSubmitting={editSubmitting}
                onSubmit={handleEditSubmit}
                departments={departments}
                loadingDepartments={loadingDepartments}
            />

            {/* Delete Account Confirmation Dialog */}
            <DeleteUserDialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, user: null })}
                user={deleteDialog.user}
                onConfirm={handleDeleteConfirm}
                deleteSubmitting={deleteSubmitting}
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

export default AdminUsers;
