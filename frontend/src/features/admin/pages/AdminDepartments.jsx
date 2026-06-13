import { useState, useMemo, useEffect } from 'react';
import { 
    Box, Typography, Chip, Button, IconButton, useTheme, Avatar, Stack 
} from '@mui/material';
import { Plus, RefreshCw, Pencil, Trash2, Building2, Users, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { departmentApi } from '../../departments/services/departmentApi';
import { DepartmentFormDialog } from '../../departments/dialogs/DepartmentFormDialog';
import { DeleteDepartmentDialog } from '../../departments/dialogs/DeleteDepartmentDialog';
import { DepartmentDetailsDialog } from '../../departments/dialogs/DepartmentDetailsDialog';
import { 
    AdminPageHeader, StatCard, SectionCard, DataTable, ToastNotification, AsyncWrapper
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS, COLORS } from '../../../shared/theme.constants';

export const AdminDepartments = () => {
    const theme = useTheme();

    const {
        departments,
        setDepartments,
        loadingStates,
        refreshDepartments
    } = useAdmin();

    const loading = loadingStates.departments;

    // Filter, Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [staffFilter, setStaffFilter] = useState('ALL');

    // Hooks
    const pagination = usePagination(10);
    const tableSort = useTableSort('name', 'asc');
    const { toast, showToast, hideToast } = useToast();

    // Dialog States
    const detailsDialog = useDialogState();
    const formDialog = useDialogState();
    const deleteDialog = useDialogState();
    
    const [formMode, setFormMode] = useState('create');
    const [formName, setFormName] = useState('');
    const [formCode, setFormCode] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formLocation, setFormLocation] = useState('');
    const [formContactNumber, setFormContactNumber] = useState('');
    const [formIsActive, setFormIsActive] = useState(true);
    const [formErrors, setFormErrors] = useState({});
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    useEffect(() => {
        refreshDepartments();
    }, [refreshDepartments]);

    const totalStaff = useMemo(() => {
        return (departments || []).reduce((sum, d) => sum + (d.staff_count || 0), 0);
    }, [departments]);

    const processedDepartments = useMemo(() => {
        const filtered = (departments || []).filter((dept) => {
            const matchesSearch = 
                dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dept.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dept.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                dept.location?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = 
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && dept.is_active) ||
                (statusFilter === 'INACTIVE' && !dept.is_active);

            const hasStaff = (dept.staff_count || 0) > 0;
            const matchesStaff = 
                staffFilter === 'ALL' ||
                (staffFilter === 'HAS_STAFF' && hasStaff) ||
                (staffFilter === 'EMPTY' && !hasStaff);

            return matchesSearch && matchesStatus && matchesStaff;
        });

        return tableSort.sortData(filtered, ['name', 'staff_count']);
    }, [departments, searchQuery, statusFilter, staffFilter, tableSort]);

    const paginatedDepartments = useMemo(() => pagination.paginate(processedDepartments), [processedDepartments, pagination]);

    const openCreateDialog = () => {
        setFormName('');
        setFormCode('');
        setFormDescription('');
        setFormLocation('');
        setFormContactNumber('');
        setFormIsActive(true);
        setFormErrors({});
        setFormMode('create');
        formDialog.openDialog(null);
    };

    const openEditDialog = (dept) => {
        setFormName(dept.name || '');
        setFormCode(dept.code || '');
        setFormDescription(dept.description || '');
        setFormLocation(dept.location || '');
        setFormContactNumber(dept.contact_number || '');
        setFormIsActive(dept.is_active !== false);
        setFormErrors({});
        setFormMode('edit');
        formDialog.openDialog(dept);
    };

    const handleFormSubmit = async () => {
        const errors = {};
        if (!formName.trim()) errors.name = 'Department name is required.';
        if (formName.trim().length > 100) errors.name = 'Name must be 100 characters or less.';
        if (!formCode.trim()) errors.code = 'Department code is required.';
        if (formCode.trim().length > 10) errors.code = 'Code must be 10 characters or less.';
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }

        setFormSubmitting(true);
        setFormErrors({});

        try {
            const payload = { 
                name: formName.trim(), 
                code: formCode.trim().toUpperCase(),
                description: formDescription.trim() || '',
                location: formLocation.trim() || '',
                contact_number: formContactNumber.trim() || '',
                is_active: formIsActive
            };

            if (formMode === 'create') {
                const created = await departmentApi.createDepartment(payload);
                setDepartments(prev => [...prev, { ...created, staff_count: 0 }]);
                showToast(`Department "${created.name}" created successfully.`);
            } else {
                const updated = await departmentApi.updateDepartment(formDialog.data.id, payload);
                setDepartments(prev => prev.map(d =>
                    d.id === updated.id ? { ...d, ...updated } : d
                ));
                if (detailsDialog.data?.id === updated.id) {
                    detailsDialog.openDialog({ ...detailsDialog.data, ...updated });
                }
                showToast(`Department "${updated.name}" updated successfully.`);
            }
            formDialog.closeDialog();
        } catch (err) {
            const detail = err?.response?.data;
            if (detail?.name) {
                setFormErrors(prev => ({ ...prev, name: Array.isArray(detail.name) ? detail.name[0] : detail.name }));
            } else if (detail?.code) {
                setFormErrors(prev => ({ ...prev, code: Array.isArray(detail.code) ? detail.code[0] : detail.code }));
            } else {
                showToast(detail?.detail || 'Operation failed. Please try again.', 'error');
            }
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        const dept = deleteDialog.data;
        if (!dept) return;
        setDeleteSubmitting(true);
        try {
            await departmentApi.deleteDepartment(dept.id);
            setDepartments(prev => prev.filter(d => d.id !== dept.id));
            showToast(`Department "${dept.name}" deleted successfully.`);
            deleteDialog.closeDialog();
            if (detailsDialog.data?.id === dept.id) {
                detailsDialog.closeDialog();
            }
        } catch (err) {
            const detail = err?.response?.data?.detail;
            showToast(detail || 'Failed to delete department.', 'error');
        } finally {
            setDeleteSubmitting(false);
        }
    };

    const getDeptColor = (name) => {
        const colors = [
            '#006A6A', '#4A6363', '#895100', '#6B5778',
            '#3F6373', '#5E6135', '#7B4E3E', '#2B6355'
        ];
        let hash = 0;
        for (let i = 0; i < (name || '').length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const columns = [
        {
            id: 'avatar',
            label: '',
            width: 60,
            render: (dept) => {
                const color = getDeptColor(dept.name);
                return (
                    <Avatar sx={{ width: 34, height: 34, bgcolor: `${color}18`, color: color, fontSize: '13px', fontWeight: 700, fontFamily: FONTS.HEADING }}>
                        {dept.name?.charAt(0)?.toUpperCase() || 'D'}
                    </Avatar>
                );
            }
        },
        {
            id: 'name',
            label: 'Department Name',
            sortable: true,
            render: (dept) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: FONTS.BODY, color: 'text.primary', lineHeight: 1.3 }}>
                        {dept.name}
                    </Typography>
                    <Chip label={dept.code || 'NO CODE'} size="small" sx={{ fontSize: '9px', fontWeight: 700, height: '16px', bgcolor: 'action.selected', fontFamily: FONTS.HEADING, px: 0.5 }} />
                </Box>
            )
        },
        {
            id: 'location',
            label: 'Location',
            render: (dept) => (
                <Typography variant="body2" sx={{ color: dept.location ? 'text.secondary' : 'text.disabled', fontSize: '13px', fontFamily: FONTS.BODY, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: 300 }}>
                    {dept.location || '—'}
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'Status',
            align: 'center',
            render: (dept) => (
                <Chip label={dept.is_active ? 'Active' : 'Inactive'} size="small" color={dept.is_active ? 'success' : 'default'} variant={dept.is_active ? 'outlined' : 'filled'} sx={{ fontWeight: 600, fontSize: '10px', height: '20px' }} />
            )
        },
        {
            id: 'staff_count',
            label: 'Staff Count',
            sortable: true,
            align: 'center',
            render: (dept) => {
                const hasStaff = (dept.staff_count || 0) > 0;
                return <Chip label={dept.staff_count || 0} size="small" color={hasStaff ? 'primary' : 'default'} variant={hasStaff ? 'filled' : 'outlined'} sx={{ fontWeight: 700, fontSize: '12px', minWidth: 36, height: '24px' }} />;
            }
        },
        {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            render: (dept) => {
                const hasStaff = (dept.staff_count || 0) > 0;
                return (
                    <Stack direction="row" spacing={0.5} justifyContent="center" onClick={e => e.stopPropagation()}>
                        <IconButton size="small" onClick={() => openEditDialog(dept)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: theme.palette.mode === 'dark' ? 'rgba(156,241,240,0.08)' : 'rgba(0,106,106,0.06)' } }}>
                            <Pencil size={15} />
                        </IconButton>
                        <IconButton size="small" onClick={() => deleteDialog.openDialog(dept)} disabled={hasStaff} sx={{ color: hasStaff ? 'text.disabled' : 'error.main', '&:hover': { bgcolor: 'rgba(186,26,26,0.06)' }, '&.Mui-disabled': { color: 'text.disabled' } }}>
                            <Trash2 size={15} />
                        </IconButton>
                    </Stack>
                );
            }
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <AdminPageHeader
                title="Clinical Departments"
                subtitle="Manage hospital departments, codes, and physical locations. Inactive departments are hidden from signup selections."
                onRefresh={refreshDepartments}
                loading={loading}
                actionButton={
                    <Button variant="contained" size="small" startIcon={<Plus size={15} />} onClick={openCreateDialog} sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px', borderRadius: '100px', py: 0.75, boxShadow: 'none' }}>
                        Add Department
                    </Button>
                }
            />

            <AsyncWrapper loading={false} error={null}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                    <StatCard title="Active Departments" value={(departments || []).filter(d => d.is_active).length} icon={Building2} color={COLORS.PRIMARY} loading={loading} />
                    <StatCard title="Total Assigned Staff" value={totalStaff} icon={Users} color={COLORS.INFO} loading={loading} />
                    <StatCard title="Inactive Departments" value={(departments || []).filter(d => !d.is_active).length} icon={ShieldCheck} color={COLORS.WARNING} loading={loading} />
                </Box>

                <SectionCard title="Clinical Registry Console" loading={loading}>
                    <AdminFilterBar
                        searchQuery={searchQuery}
                        onSearchChange={(val) => { setSearchQuery(val); pagination.resetPage(); }}
                        searchPlaceholder="Search by name, code, location..."
                        filter1Label="Status"
                        filter1Value={statusFilter}
                        onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                        filter1Options={[
                            { value: 'ALL', label: 'All Statuses' },
                            { value: 'ACTIVE', label: 'Active Only' },
                            { value: 'INACTIVE', label: 'Inactive Only' }
                        ]}
                        filter2Label="Staff Allocation"
                        filter2Value={staffFilter}
                        onFilter2Change={(val) => { setStaffFilter(val); pagination.resetPage(); }}
                        filter2Options={[
                            { value: 'ALL', label: 'All Staff Wards' },
                            { value: 'HAS_STAFF', label: 'Has Assigned Staff' },
                            { value: 'EMPTY', label: 'Empty (No Staff)' }
                        ]}
                    />

                    <DataTable
                        columns={columns}
                        data={paginatedDepartments}
                        sortState={tableSort}
                        paginationState={{ ...pagination, count: processedDepartments.length }}
                        onRowClick={(dept) => detailsDialog.openDialog(dept)}
                        emptyMessage={searchQuery ? 'No departments match your search.' : 'No departments configured yet.'}
                    />
                </SectionCard>
            </AsyncWrapper>

            <DepartmentDetailsDialog
                open={detailsDialog.open}
                onClose={detailsDialog.closeDialog}
                department={detailsDialog.data}
                onEdit={(dept) => {
                    detailsDialog.closeDialog();
                    setTimeout(() => openEditDialog(dept), 200);
                }}
                onDelete={(dept) => {
                    detailsDialog.closeDialog();
                    setTimeout(() => deleteDialog.openDialog(dept), 200);
                }}
            />

            <DepartmentFormDialog
                open={formDialog.open}
                onClose={formDialog.closeDialog}
                mode={formMode}
                department={formDialog.data}
                formName={formName}
                formCode={formCode}
                formDescription={formDescription}
                formLocation={formLocation}
                formContactNumber={formContactNumber}
                formIsActive={formIsActive}
                onFormChange={(field, val) => {
                    if (field === 'name') { setFormName(val); setFormErrors(prev => ({ ...prev, name: null })); }
                    else if (field === 'code') { setFormCode(val); setFormErrors(prev => ({ ...prev, code: null })); }
                    else if (field === 'description') setFormDescription(val);
                    else if (field === 'location') setFormLocation(val);
                    else if (field === 'contact_number') setFormContactNumber(val);
                    else if (field === 'is_active') setFormIsActive(val);
                }}
                formErrors={formErrors}
                formSubmitting={formSubmitting}
                onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}
            />

            <DeleteDepartmentDialog
                open={deleteDialog.open}
                onClose={deleteDialog.closeDialog}
                department={deleteDialog.data}
                onConfirm={handleDeleteConfirm}
                deleteSubmitting={deleteSubmitting}
            />

            <ToastNotification toast={toast} onClose={hideToast} />
        </Box>
    );
};

export default AdminDepartments;
