import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Box, Typography, Card, CardContent, Grid, 
    TextField, MenuItem, Button, Chip, IconButton, Stack, CircularProgress
} from '@mui/material';
import { Plus, RefreshCw, Trash2, Copy, Check } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { invitationApi } from '../../invitations/services/invitationApi';
import { departmentApi } from '../../departments/services/departmentApi';
import { StatusChip, AdminPageHeader, DataTable, SectionCard, AsyncWrapper, ToastNotification } from '../../../shared/components/ui';
import { formatDate } from '../../../shared/utils/dateUtils';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { RevokeInviteDialog } from '../../invitations/dialogs/RevokeInviteDialog';
import { InviteDetailsDialog } from '../../invitations/dialogs/InviteDetailsDialog';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS } from '../../../shared/theme.constants';

export const AdminInvitations = () => {
    const {
        invites,
        users,
        applications,
        loadingStates,
        errorStates,
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

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // Hooks
    const pagination = usePagination(10);
    const tableSort = useTableSort('created_at', 'desc');
    const { toast, showToast, hideToast } = useToast();
    
    const revokeDialog = useDialogState();
    const detailsDialog = useDialogState();

    const [copiedId, setCopiedId] = useState(null);

    const fetchDepartments = useCallback(async () => {
        setLoadingDepartments(true);
        try {
            const deptsData = await departmentApi.getPublicList();
            setDepartments(deptsData || []);
            if (deptsData && deptsData.length > 0) {
                setDepartmentId(deptsData[0].id);
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
            await invitationApi.createInvite(inviteData);
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

    const handleRevokeInvite = async () => {
        const invite = revokeDialog.data;
        if (!invite) return;

        try {
            await invitationApi.revokeInvite(invite.id);
            showToast('Invitation token successfully revoked.', 'success');
            revokeDialog.closeDialog();
            fetchInvites();
        } catch (err) {
            showToast('Failed to revoke invitation.', 'error');
        }
    };

    const handleResendInvite = async (id) => {
        try {
            await invitationApi.resendInvite(id);
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

    const processedInvites = useMemo(() => {
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

        return tableSort.sortData(filtered, ['email', 'role', 'created_at']);
    }, [invites, searchQuery, roleFilter, statusFilter, tableSort]);

    const paginatedInvites = useMemo(() => pagination.paginate(processedInvites), [processedInvites, pagination]);

    const columns = [
        {
            id: 'email',
            label: 'Email Address',
            sortable: true,
            render: (invite) => <Typography sx={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700, fontFamily: FONTS.HEADING }}>{invite.email}</Typography>
        },
        {
            id: 'role',
            label: 'Role',
            sortable: true,
            render: (invite) => <Chip label={invite.role} size="small" variant="outlined" color="primary" sx={{ fontSize: '9px', fontWeight: 600, height: 20 }} />
        },
        {
            id: 'department_name',
            label: 'Department',
            render: (invite) => invite.department_name || 'General'
        },
        {
            id: 'created_at',
            label: 'Issued At',
            sortable: true,
            render: (invite) => formatDate(invite.created_at)
        },
        {
            id: 'status',
            label: 'Status',
            render: (invite) => <StatusChip invite={invite} type="invitation" uppercase={true} sx={{ fontSize: '9px', borderRadius: '6px', height: 20 }} />
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            render: (invite) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={e => e.stopPropagation()}>
                    {!invite.is_used && (
                        <>
                            <IconButton size="small" color="primary" onClick={() => handleCopyLink(invite)} title="Copy Signup Link">
                                {copiedId === invite.id ? <Check size={14} style={{ color: '#2E7D32' }} /> : <Copy size={14} />}
                            </IconButton>
                            <IconButton size="small" color="secondary" onClick={() => handleResendInvite(invite.id)} title="Resend Invitation Email">
                                <RefreshCw size={14} />
                            </IconButton>
                        </>
                    )}
                    <IconButton size="small" color="error" onClick={() => revokeDialog.openDialog(invite)} title="Revoke Token">
                        <Trash2 size={14} />
                    </IconButton>
                </Stack>
            )
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
            <AdminPageHeader
                title="Staff Onboarding Invitations"
                subtitle="Issue authorization tokens to onboarding medical staff. Invited users must match the assigned email and role."
            />

            <Grid container spacing={3}>
                {/* Generation Form */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ position: { md: 'sticky' }, top: 24, borderRadius: '16px' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: FONTS.HEADING, fontSize: '18px' }}>
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
                                    slotProps={{ input: { sx: { borderRadius: '12px' } } }}
                                />
                                <TextField 
                                    select 
                                    label="Role Assignment" 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    fullWidth
                                    slotProps={{ select: { sx: { borderRadius: '12px' } } }}
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
                                    slotProps={{ select: { sx: { borderRadius: '12px' } } }}
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
                    <SectionCard 
                        title="Active Onboarding Tokens" 
                        loading={loading}
                        actionButton={
                            <Button size="small" startIcon={<RefreshCw size={14} />} onClick={fetchInvites} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '100px', borderColor: 'divider', color: 'text.primary', fontSize: '12.5px', px: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                                Reload Invites
                            </Button>
                        }
                    >
                        <AdminFilterBar
                            searchQuery={searchQuery}
                            onSearchChange={(val) => { setSearchQuery(val); pagination.resetPage(); }}
                            searchPlaceholder="Search email, department..."
                            filter1Label="Status"
                            filter1Value={statusFilter}
                            onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                            filter1Options={[
                                { value: 'ALL', label: 'All Statuses' },
                                { value: 'PENDING', label: 'Pending' },
                                { value: 'REGISTERED', label: 'Registered' },
                                { value: 'EXPIRED', label: 'Expired' }
                            ]}
                            filter2Label="Role"
                            filter2Value={roleFilter}
                            onFilter2Change={(val) => { setRoleFilter(val); pagination.resetPage(); }}
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
                        
                        <AsyncWrapper loading={loading} error={errorStates.invites}>
                            <DataTable
                                columns={columns}
                                data={paginatedInvites}
                                sortState={tableSort}
                                paginationState={{ ...pagination, count: processedInvites.length }}
                                onRowClick={(invite) => detailsDialog.openDialog(invite)}
                                emptyMessage="No matching onboarding records found."
                            />
                        </AsyncWrapper>
                    </SectionCard>
                </Grid>
            </Grid>

            <RevokeInviteDialog
                open={revokeDialog.open}
                onClose={revokeDialog.closeDialog}
                email={revokeDialog.data?.email || ''}
                onConfirm={handleRevokeInvite}
            />

            <InviteDetailsDialog
                open={detailsDialog.open}
                onClose={detailsDialog.closeDialog}
                selectedInvite={detailsDialog.data}
                users={users}
                applications={applications}
            />

            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default AdminInvitations;
