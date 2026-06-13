import React, { useState, useMemo } from 'react';
import { 
    Box, Typography, Button, IconButton, Chip, Tooltip, Stack 
} from '@mui/material';
import { 
    Clock, User, Plus, Edit2, Trash2, RefreshCw, MapPin 
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { adminApi } from '../services/adminApi';
import { formatDateTime } from '../../../shared/utils/dateUtils';
import { RosterShiftDialog } from '../dialogs/RosterShiftDialog';
import { ConfirmRosterDeleteDialog } from '../dialogs/ConfirmRosterDeleteDialog';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { 
    AdminPageHeader, SectionCard, DataTable, ToastNotification 
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS, COLORS } from '../../../shared/theme.constants';

export const AdminRoster = () => {
    const { 
        rosters = [], 
        users = [], 
        departments = [], 
        loadingStates, 
        refreshRosters,
        setRosters 
    } = useAdmin();

    const loading = loadingStates.rosters;

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('ALL');
    const [roleFilter, setRoleFilter] = useState('ALL');

    // Hooks
    const pagination = usePagination(10);
    const tableSort = useTableSort('shift_start', 'desc');
    const { toast, showToast, hideToast } = useToast();

    // Dialog state
    const formDialog = useDialogState();
    const deleteDialog = useDialogState();

    const [staffId, setStaffId] = useState('');
    const [deptId, setDeptId] = useState('');
    const [shiftStart, setShiftStart] = useState('');
    const [shiftEnd, setShiftEnd] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    // Active staff list
    const activeStaff = useMemo(() => {
        return users.filter(u => u.is_active && u.role !== 'PATIENT');
    }, [users]);

    const formatForInput = (isoString) => {
        if (!isoString) return '';
        return isoString.substring(0, 16);
    };

    const handleAddClick = () => {
        setStaffId('');
        setDeptId('');
        setShiftStart('');
        setShiftEnd('');
        setNotes('');
        setFormError('');
        formDialog.openDialog(null);
    };

    const handleEditClick = (roster) => {
        setStaffId(roster.staff_member);
        setDeptId(roster.department);
        setShiftStart(formatForInput(roster.shift_start));
        setShiftEnd(formatForInput(roster.shift_end));
        setNotes(roster.notes || '');
        setFormError('');
        formDialog.openDialog(roster);
    };

    const handleConfirmDeleteRoster = async () => {
        const roster = deleteDialog.data;
        if (!roster) return;
        setDeleteSubmitting(true);
        try {
            await adminApi.deleteRoster(roster.id);
            setRosters(prev => prev.filter(r => r.id !== roster.id));
            showToast('Duty shift deleted successfully.', 'success');
            deleteDialog.closeDialog();
        } catch (err) {
            showToast('Failed to delete duty roster shift.', 'error');
        } finally {
            setDeleteSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');

        if (new Date(shiftStart) >= new Date(shiftEnd)) {
            setFormError("Shift start time must be before end time.");
            setSubmitting(false);
            return;
        }

        const payload = {
            staff_member: staffId,
            department: deptId,
            shift_start: new Date(shiftStart).toISOString(),
            shift_end: new Date(shiftEnd).toISOString(),
            notes: notes || ''
        };

        try {
            const roster = formDialog.data;
            if (roster) {
                const data = await adminApi.updateRoster(roster.id, payload);
                setRosters(prev => prev.map(r => r.id === roster.id ? data : r));
                showToast('Shift assignment updated successfully.', 'success');
            } else {
                const data = await adminApi.createRoster(payload);
                setRosters(prev => [data, ...prev]);
                showToast('Shift assigned successfully.', 'success');
            }
            refreshRosters();
            formDialog.closeDialog();
        } catch (err) {
            const errData = err.response?.data;
            if (Array.isArray(errData?.non_field_errors)) {
                setFormError(errData.non_field_errors[0]);
            } else if (errData?.detail) {
                setFormError(errData.detail);
            } else {
                setFormError('Failed to save roster shift. Check for overlapping schedules.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const processedRosters = useMemo(() => {
        const filtered = rosters.filter(r => {
            const nameMatch = r.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              r.notes?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const deptMatch = deptFilter === 'ALL' || r.department === deptFilter;
            const roleMatch = roleFilter === 'ALL' || r.staff_role === roleFilter;

            return nameMatch && deptMatch && roleMatch;
        });

        return tableSort.sortData(filtered, ['staff_name', 'department', 'shift_start', 'shift_end']);
    }, [rosters, searchTerm, deptFilter, roleFilter, tableSort]);

    const paginatedRosters = useMemo(() => pagination.paginate(processedRosters), [processedRosters, pagination]);

    const roleLabels = {
        'ADMIN': 'Administrator',
        'DOCTOR': 'Doctor',
        'NURSE': 'Nurse',
        'RECEPTIONIST': 'Receptionist',
        'PHARMACIST': 'Pharmacist',
        'LAB_TECHNICIAN': 'Lab Tech',
        'RADIOLOGIST': 'Radiologist'
    };

    const columns = [
        {
            id: 'staff_name',
            label: 'Staff Member',
            sortable: true,
            render: (roster) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <User size={16} color={COLORS.TEXT_SECONDARY} />
                    <Box>
                        <Typography sx={{ fontWeight: 600, fontFamily: FONTS.BODY }}>{roster.staff_name}</Typography>
                        <Chip label={roleLabels[roster.staff_role] || roster.staff_role} size="small" variant="outlined" sx={{ height: 16, fontSize: '8px', fontWeight: 700 }} />
                    </Box>
                </Box>
            )
        },
        {
            id: 'department',
            label: 'Department',
            sortable: true,
            render: (roster) => {
                const deptName = departments.find(d => d.id === roster.department)?.name || 'General';
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MapPin size={14} style={{ opacity: 0.7 }} />
                        <Typography sx={{ fontWeight: 500, fontFamily: FONTS.BODY }}>{deptName}</Typography>
                    </Box>
                );
            }
        },
        {
            id: 'shift_start',
            label: 'Shift Start',
            sortable: true,
            render: (roster) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={14} style={{ opacity: 0.7 }} />
                    <Typography sx={{ fontFamily: FONTS.BODY }}>{formatDateTime(roster.shift_start)}</Typography>
                </Box>
            )
        },
        {
            id: 'shift_end',
            label: 'Shift End',
            sortable: true,
            render: (roster) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={14} style={{ opacity: 0.7 }} />
                    <Typography sx={{ fontFamily: FONTS.BODY }}>{formatDateTime(roster.shift_end)}</Typography>
                </Box>
            )
        },
        {
            id: 'notes',
            label: 'Shift Notes',
            render: (roster) => (
                <Typography sx={{ fontStyle: 'italic', fontSize: '13px', fontFamily: FONTS.BODY }}>
                    {roster.notes || 'None'}
                </Typography>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'right',
            render: (roster) => (
                <Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={e => e.stopPropagation()}>
                    <Tooltip title="Edit Shift">
                        <IconButton size="small" onClick={() => handleEditClick(roster)} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { color: 'primary.main', borderColor: 'primary.light' } }}>
                            <Edit2 size={14} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove Shift">
                        <IconButton size="small" color="error" onClick={() => deleteDialog.openDialog(roster)} sx={{ border: '1px solid', borderColor: 'divider', '&:hover': { color: 'error.main', borderColor: 'error.light' } }}>
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
                title="Workforce Shift Scheduling"
                subtitle="Plan clinical staff rosters, configure shifts, and prevent workforce schedule overlaps."
                onRefresh={refreshRosters}
                loading={loading}
                refreshLabel="Sync Roster"
                actionButton={
                    <Button variant="contained" startIcon={<Plus size={16} />} onClick={handleAddClick} sx={{ borderRadius: '100px', textTransform: 'none', fontWeight: 600 }}>
                        Schedule Shift
                    </Button>
                }
            />

            <SectionCard title="Duty Roster Schedule" loading={loading}>
                <AdminFilterBar
                    searchQuery={searchTerm}
                    onSearchChange={(val) => { setSearchTerm(val); pagination.resetPage(); }}
                    searchPlaceholder="Search staff name or notes..."
                    filter1Label="Department"
                    filter1Value={deptFilter}
                    onFilter1Change={(val) => { setDeptFilter(val); pagination.resetPage(); }}
                    filter1Options={[
                        { value: 'ALL', label: 'All Departments' },
                        ...departments.map(d => ({ value: d.id, label: d.name }))
                    ]}
                    filter2Label="Staff Role"
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

                <DataTable
                    columns={columns}
                    data={paginatedRosters}
                    sortState={tableSort}
                    paginationState={{ ...pagination, count: processedRosters.length }}
                    emptyMessage="No scheduled shifts found matching your filters."
                />
            </SectionCard>

            <RosterShiftDialog
                open={formDialog.open}
                onClose={formDialog.closeDialog}
                onSubmit={handleSubmit}
                selectedRoster={formDialog.data}
                staffId={staffId}
                setStaffId={setStaffId}
                deptId={deptId}
                setDeptId={setDeptId}
                shiftStart={shiftStart}
                setShiftStart={setShiftStart}
                shiftEnd={shiftEnd}
                setShiftEnd={setShiftEnd}
                notes={notes}
                setNotes={setNotes}
                activeStaff={activeStaff}
                departments={departments}
                roleLabels={roleLabels}
                submitting={submitting}
                successMessage=""
                formError={formError}
            />

            <ConfirmRosterDeleteDialog
                open={deleteDialog.open}
                onClose={deleteDialog.closeDialog}
                onConfirm={handleConfirmDeleteRoster}
                roster={deleteDialog.data}
                submitting={deleteSubmitting}
            />

            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default AdminRoster;
