import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
    Box, Card, CardContent, Typography, Chip, Switch, Avatar, Divider, 
    useMediaQuery, useTheme
} from '@mui/material';
import { Users as UsersIcon, UserCheck, UserX, Shield } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { departmentApi } from '../../departments/services/departmentApi';
import { formatDate as formatDateShared } from '../../../shared/utils/dateUtils';
import { useAuth } from '../../auth/hooks/useAuth';
import { FilterBar } from '../components/FilterBar';
import { ToggleAccessDialog } from '../dialogs/ToggleAccessDialog';
import { UserDetailsDialog } from '../dialogs/UserDetailsDialog';
import { EditUserDialog } from '../dialogs/EditUserDialog';
import { DeleteUserDialog } from '../dialogs/DeleteUserDialog';
import { 
    PageHeader, DataTable, DashboardCard, StatGrid, StatCard, AsyncWrapper, ToastNotification 
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS, COLORS } from '../../../shared/theme.constants';

export const Users = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user: currentUser } = useAuth();
    const [searchParams] = useSearchParams();

    const { 
        users, 
        setUsers,
        invites,
        applications,
        loadingStates, 
        errorStates,
        refreshUsers: fetchUsers 
    } = useAdmin();

    const loading = loadingStates.users;

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
    const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'ALL');

    // Hooks
    const pagination = usePagination();
    const tableSort = useTableSort('full_name');
    const { toast, showToast, hideToast } = useToast();

    // Dialogs
    const detailsDialog = useDialogState();
    const toggleDialog = useDialogState();
    const deleteDialog = useDialogState();
    const [editOpen, setEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({ full_name: '', role: '', department: '', employee_id: '', phone: '' });
    const [editErrors, setEditErrors] = useState({});
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    // Departments
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(true);

    const fetchDepartments = useCallback(async () => {
        try {
            const deptsData = await departmentApi.getPublicList();
            setDepartments(deptsData || []);
        } catch (err) {
            // Silent failure
        } finally {
            setLoadingDepartments(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

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
            const updatedUser = await adminApi.updateUser(detailsDialog.data.id, {
                full_name: editForm.full_name.trim(),
                role: editForm.role,
                department: editForm.department || null,
                employee_id: editForm.employee_id.trim(),
                phone: editForm.phone.trim()
            });

            showToast('User profile updated successfully.', 'success');
            setEditOpen(false);
            setUsers(prev => prev.map(u => u.id === detailsDialog.data.id ? { ...u, ...updatedUser } : u));
            detailsDialog.openDialog({ ...detailsDialog.data, ...updatedUser });
        } catch (err) {
            showToast(err.response?.data?.detail || 'Failed to update user profile.', 'error');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        const user = deleteDialog.data;
        if (!user) return;

        setDeleteSubmitting(true);
        try {
            await adminApi.deleteUser(user.id);
            showToast('User account has been permanently deleted.', 'info');
            deleteDialog.closeDialog();
            detailsDialog.closeDialog();
            setUsers(prev => prev.filter(u => u.id !== user.id));
        } catch (err) {
            showToast(err.response?.data?.detail || 'Failed to delete user account.', 'error');
        } finally {
            setDeleteSubmitting(false);
        }
    };

    const handleToggleActive = async () => {
        const user = toggleDialog.data;
        if (!user) return;

        const previousUsers = users;
        const targetActive = !user.is_active;

        // Optimistically update UI
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: targetActive } : u));
        
        // Close dialog immediately for smooth UX
        toggleDialog.closeDialog();

        try {
            const res = await adminApi.toggleUserActive(user.id);
            showToast(res.detail || 'User access status updated successfully.', 'success');
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: res.is_active } : u));
        } catch (err) {
            // Rollback to previous state
            setUsers(previousUsers);
            showToast(err.response?.data?.detail || 'Failed to update user active status. Rolled back.', 'error');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name[0].toUpperCase();
    };

    // Client-side filtering and sorting
    const processedUsers = useMemo(() => {
        const filtered = users.filter((user) => {
            const matchesSearch = 
                user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = 
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && user.is_active) ||
                (statusFilter === 'INACTIVE' && !user.is_active);
            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
        });

        return tableSort.sortData(filtered, ['created_at']);
    }, [users, searchQuery, statusFilter, roleFilter, tableSort]);

    const paginatedUsers = useMemo(() => pagination.paginate(processedUsers), [processedUsers, pagination]);

    const activeUsersCount = useMemo(() => users.filter(u => u.is_active).length, [users]);
    const inactiveUsersCount = useMemo(() => users.filter(u => !u.is_active).length, [users]);
    const adminCount = useMemo(() => users.filter(u => u.role === 'ADMIN').length, [users]);

    const columns = [
        {
            id: 'full_name',
            label: 'Full Name',
            sortable: true,
            render: (user) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: 'rgba(0,106,106,0.08)', color: 'primary.main', width: 28, height: 28, fontSize: '11px', fontWeight: 700, fontFamily: FONTS.HEADING }}>
                        {getInitials(user.full_name)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: FONTS.BODY }}>{user.full_name}</Typography>
                </Box>
            )
        },
        { id: 'email', label: 'Email Address', sortable: true },
        {
            id: 'role',
            label: 'Assigned Role',
            sortable: true,
            render: (user) => <Chip label={user.role} size="small" variant="outlined" color="primary" sx={{ fontSize: '9px', fontWeight: 600, height: 20 }} />
        },
        {
            id: 'created_at',
            label: 'Date Registered',
            sortable: true,
            render: (user) => formatDateShared(user.created_at)
        },
        {
            id: 'status',
            label: 'Active Status',
            render: (user) => (
                <Chip 
                    label={user.is_active ? 'Active' : 'Inactive'} 
                    size="small" 
                    color={user.is_active ? 'success' : 'default'} 
                    sx={{ fontWeight: 600, fontSize: '10px', borderRadius: '6px', height: 22 }}
                />
            )
        },
        {
            id: 'actions',
            label: 'Approved Access',
            align: 'right',
            render: (user) => (
                <Box onClick={(e) => e.stopPropagation()}>
                    <Switch checked={user.is_active} onChange={() => toggleDialog.openDialog(user)} color="primary" size="small" />
                </Box>
            )
        }
    ];

    const mobileCards = (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {paginatedUsers.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                    No registered user accounts match your search query.
                </Box>
            ) : (
                paginatedUsers.map((user) => (
                    <Card 
                        key={user.id} 
                        onClick={() => detailsDialog.openDialog(user)}
                        sx={{ 
                            p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: 1.5, cursor: 'pointer',
                            transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(60,64,67,0.08)' }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38, fontSize: '14px', fontWeight: 700, fontFamily: FONTS.HEADING }}>
                                {getInitials(user.full_name)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontFamily: FONTS.HEADING, fontSize: '14px' }}>{user.full_name}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', wordBreak: 'break-all' }}>{user.email}</Typography>
                            </Box>
                            <Switch checked={user.is_active} onClick={(e) => e.stopPropagation()} onChange={() => toggleDialog.openDialog(user)} color="primary" size="small" />
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label={user.role} size="small" variant="outlined" color="primary" sx={{ fontSize: '9px', fontWeight: 600, height: 20 }} />
                                <Chip label={user.is_active ? 'Active' : 'Inactive'} size="small" color={user.is_active ? 'success' : 'default'} sx={{ fontWeight: 600, fontSize: '9px', borderRadius: '4px', height: 20 }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '11px', fontFamily: FONTS.BODY }}>
                                Registered: {formatDateShared(user.created_at)}
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
                title="Active User Directories"
                subtitle="View directories, toggle staff system access status, and manage security profiles globally."
                onRefresh={fetchUsers}
                loading={loading}
            />

            <StatGrid cols={4}>
                <StatCard 
                    title="Total Accounts" 
                    value={users.length} 
                    supportingText="All registered profiles" 
                    icon={UsersIcon}
                    color={COLORS.PRIMARY} 
                    loading={loading}
                />
                <StatCard 
                    title="Active Staff" 
                    value={activeUsersCount} 
                    supportingText="Current system access" 
                    icon={UserCheck} 
                    color={COLORS.SUCCESS} 
                    loading={loading}
                />
                <StatCard 
                    title="Inactive Profiles" 
                    value={inactiveUsersCount} 
                    supportingText="Suspended access" 
                    icon={UserX} 
                    color={COLORS.WARNING} 
                    loading={loading}
                />
                <StatCard 
                    title="System Admins" 
                    value={adminCount} 
                    supportingText="Full privileges" 
                    icon={Shield} 
                    color={COLORS.INFO || '#0288d1'} 
                    loading={loading}
                />
            </StatGrid>

            <DashboardCard title="User Accounts Console" subtitle="Manage registered profiles and filter accounts by status and role">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FilterBar
                        searchQuery={searchQuery}
                        onSearchChange={(val) => { setSearchQuery(val); pagination.resetPage(); }}
                        searchPlaceholder="Search by name, email..."
                        filter1Label="Status"
                        filter1Value={statusFilter}
                        onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                        filter1Options={[
                            { value: 'ALL', label: 'All Accounts' },
                            { value: 'ACTIVE', label: 'Active' },
                            { value: 'INACTIVE', label: 'Inactive' }
                        ]}
                        filter2Label="Role"
                        filter2Value={roleFilter}
                        onFilter2Change={(val) => { setRoleFilter(val); pagination.resetPage(); }}
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
                    
                    <AsyncWrapper loading={loading} error={errorStates.users}>
                        {isMobile ? mobileCards : (
                            <DataTable 
                                columns={columns}
                                data={paginatedUsers}
                                sortState={tableSort}
                                paginationState={{ ...pagination, count: processedUsers.length }} // DataTable pagination receives count from props in a way we need to handle or pass down to TablePagination
                                onRowClick={(user) => detailsDialog.openDialog(user)}
                                emptyMessage="No registered user accounts match your search query."
                            />
                        )}
                        {/* If using DataTable with built-in pagination, ensure we pass count. Wait, DataTable has pagination logic but the count prop needs to be controlled if paginate is true. Wait, our DataTable uses data.length. It actually expects the whole array if using built-in pagination? No, it expects sliced data. It expects paginationState to contain all needed handlers. */}
                    </AsyncWrapper>
                </Box>
            </DashboardCard>

            {/* Dialogs */}
            <ToggleAccessDialog
                open={toggleDialog.open}
                onClose={toggleDialog.closeDialog}
                user={toggleDialog.data}
                applications={applications}
                onConfirm={handleToggleActive}
            />

            <UserDetailsDialog
                open={detailsDialog.open}
                onClose={detailsDialog.closeDialog}
                selectedUser={detailsDialog.data}
                currentUser={currentUser}
                applications={applications}
                invites={invites}
                onOpenDelete={(user) => deleteDialog.openDialog(user)}
                onOpenEdit={handleOpenEdit}
                onUserUpdate={async (updatedFields) => {
                    detailsDialog.openDialog({ ...detailsDialog.data, ...updatedFields });
                    await fetchUsers();
                }}
            />

            <EditUserDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                selectedUser={detailsDialog.data}
                editForm={editForm}
                onFormChange={(field, val) => setEditForm(prev => ({ ...prev, [field]: val }))}
                editErrors={editErrors}
                editSubmitting={editSubmitting}
                onSubmit={handleEditSubmit}
                departments={departments}
                loadingDepartments={loadingDepartments}
            />

            <DeleteUserDialog
                open={deleteDialog.open}
                onClose={deleteDialog.closeDialog}
                user={deleteDialog.data}
                onConfirm={handleDeleteConfirm}
                deleteSubmitting={deleteSubmitting}
            />

            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default Users;
