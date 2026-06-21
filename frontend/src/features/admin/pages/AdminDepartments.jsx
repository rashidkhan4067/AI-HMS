import { useState, useMemo, useEffect } from 'react';
import {
    Box, Typography, Chip, Button, IconButton, Tooltip, useTheme, Stack, LinearProgress
} from '@mui/material';
import { Plus, Pencil, Trash2, Building2, Users, ShieldCheck, TrendingUp, MapPin, Phone } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminFilterBar } from '../components/AdminFilterBar';
import { departmentApi } from '../../departments/services/departmentApi';
import { DepartmentFormDialog } from '../../departments/dialogs/DepartmentFormDialog';
import { DeleteDepartmentDialog } from '../../departments/dialogs/DeleteDepartmentDialog';
import { DepartmentDetailsDialog } from '../../departments/dialogs/DepartmentDetailsDialog';
import {
    AdminPageHeader, StatGrid, StatCard, DashboardCard, DataTable,
    ToastNotification, AsyncWrapper
} from '../../../shared/components/ui';
import { usePagination } from '../../../hooks/usePagination';
import { useTableSort } from '../../../hooks/useTableSort';
import { useToast } from '../../../hooks/useToast';
import { useDialogState } from '../../../hooks/useDialogState';
import { FONTS, COLORS } from '../../../shared/theme.constants';

// Deterministic colour from department name
const getDeptColor = (name) => {
    const palette = ['#006A6A', '#4A6363', '#895100', '#6B5778', '#3F6373', '#5E6135', '#7B4E3E', '#2B6355'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
};

export const AdminDepartments = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const { departments, setDepartments, loadingStates, refreshDepartments } = useAdmin();
    const loading = loadingStates.departments;

    const [searchQuery, setSearchQuery]   = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [staffFilter, setStaffFilter]   = useState('ALL');

    const pagination = usePagination(10);
    const tableSort  = useTableSort('name', 'asc');
    const { toast, showToast, hideToast } = useToast();

    const detailsDialog = useDialogState();
    const formDialog    = useDialogState();
    const deleteDialog  = useDialogState();

    const [formMode, setFormMode]                   = useState('create');
    const [formName, setFormName]                   = useState('');
    const [formCode, setFormCode]                   = useState('');
    const [formDescription, setFormDescription]     = useState('');
    const [formLocation, setFormLocation]           = useState('');
    const [formContactNumber, setFormContactNumber] = useState('');
    const [formIsActive, setFormIsActive]           = useState(true);
    const [formErrors, setFormErrors]               = useState({});
    const [formSubmitting, setFormSubmitting]       = useState(false);
    const [deleteSubmitting, setDeleteSubmitting]   = useState(false);

    useEffect(() => { refreshDepartments(); }, [refreshDepartments]);

    // ── KPI Metrics ──────────────────────────────────────────────────────
    const depts      = departments || [];
    const totalStaff = useMemo(() => depts.reduce((s, d) => s + (d.staff_count || 0), 0), [depts]);
    const activeDepts   = useMemo(() => depts.filter(d => d.is_active), [depts]);
    const inactiveDepts = useMemo(() => depts.filter(d => !d.is_active), [depts]);

    // Top departments by headcount (for the bar chart card)
    const topDepts = useMemo(() =>
        [...depts].sort((a, b) => (b.staff_count || 0) - (a.staff_count || 0)).slice(0, 6),
    [depts]);

    // ── Filtered / sorted table ──────────────────────────────────────────
    const processedDepartments = useMemo(() => {
        const filtered = depts.filter(dept => {
            const q = searchQuery.toLowerCase();
            const nameMatch = (dept.name || '').toLowerCase().includes(q) ||
                              (dept.code || '').toLowerCase().includes(q) ||
                              (dept.location || '').toLowerCase().includes(q);
            const statusMatch = statusFilter === 'ALL' ||
                                (statusFilter === 'ACTIVE' && dept.is_active) ||
                                (statusFilter === 'INACTIVE' && !dept.is_active);
            const staffMatch  = staffFilter === 'ALL' ||
                                (staffFilter === 'HAS_STAFF' && (dept.staff_count || 0) > 0) ||
                                (staffFilter === 'EMPTY' && !(dept.staff_count || 0));
            return nameMatch && statusMatch && staffMatch;
        });
        return tableSort.sortData(filtered, ['name', 'staff_count']);
    }, [depts, searchQuery, statusFilter, staffFilter, tableSort]);

    const paginatedDepartments = useMemo(() => pagination.paginate(processedDepartments), [processedDepartments, pagination]);

    // ── Dialog helpers ───────────────────────────────────────────────────
    const openCreateDialog = () => {
        setFormName(''); setFormCode(''); setFormDescription('');
        setFormLocation(''); setFormContactNumber(''); setFormIsActive(true);
        setFormErrors({}); setFormMode('create'); formDialog.openDialog(null);
    };

    const openEditDialog = (dept) => {
        setFormName(dept.name || ''); setFormCode(dept.code || '');
        setFormDescription(dept.description || ''); setFormLocation(dept.location || '');
        setFormContactNumber(dept.contact_number || ''); setFormIsActive(dept.is_active !== false);
        setFormErrors({}); setFormMode('edit'); formDialog.openDialog(dept);
    };

    const handleFormSubmit = async () => {
        const errors = {};
        if (!formName.trim()) errors.name = 'Department name is required.';
        if (formName.trim().length > 100) errors.name = 'Name must be 100 characters or less.';
        if (!formCode.trim()) errors.code = 'Department code is required.';
        if (formCode.trim().length > 10) errors.code = 'Code must be 10 characters or less.';
        if (Object.keys(errors).length) { setFormErrors(errors); return; }
        setFormErrors({});

        const payload = {
            name: formName.trim(), code: formCode.trim().toUpperCase(),
            description: formDescription.trim() || '', location: formLocation.trim() || '',
            contact_number: formContactNumber.trim() || '', is_active: formIsActive
        };

        if (formMode === 'create') {
            setFormSubmitting(true);
            try {
                const created = await departmentApi.createDepartment(payload);
                setDepartments(prev => [...prev, { ...created, staff_count: 0 }]);
                showToast(`Department "${created.name}" created successfully.`);
                formDialog.closeDialog();
            } catch (err) {
                const d = err?.response?.data;
                if (d?.name) setFormErrors(p => ({ ...p, name: Array.isArray(d.name) ? d.name[0] : d.name }));
                else if (d?.code) setFormErrors(p => ({ ...p, code: Array.isArray(d.code) ? d.code[0] : d.code }));
                else showToast(d?.detail || 'Operation failed.', 'error');
            } finally { setFormSubmitting(false); }
        } else {
            const prev = departments;
            const optimistic = { ...formDialog.data, ...payload };
            setDepartments(p => p.map(d => d.id === formDialog.data.id ? optimistic : d));
            if (detailsDialog.data?.id === formDialog.data.id) detailsDialog.openDialog(optimistic);
            formDialog.closeDialog();
            try {
                const updated = await departmentApi.updateDepartment(formDialog.data.id, payload);
                setDepartments(p => p.map(d => d.id === updated.id ? { ...d, ...updated } : d));
                if (detailsDialog.data?.id === updated.id) detailsDialog.openDialog({ ...detailsDialog.data, ...updated });
                showToast(`Department "${updated.name}" updated successfully.`, 'success');
            } catch (err) {
                setDepartments(prev);
                if (detailsDialog.data?.id === formDialog.data.id) detailsDialog.openDialog(formDialog.data);
                showToast(err?.response?.data?.detail || 'Update failed. Rolled back.', 'error');
            }
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
            if (detailsDialog.data?.id === dept.id) detailsDialog.closeDialog();
        } catch (err) {
            showToast(err?.response?.data?.detail || 'Failed to delete department.', 'error');
        } finally { setDeleteSubmitting(false); }
    };

    // ── Table columns ────────────────────────────────────────────────────
    const neutralBg    = isDark ? 'rgba(255,255,255,0.05)' : '#F9FAFB';
    const neutralColor = isDark ? '#9CA3AF' : '#374151';

    const columns = [
        {
            id: 'name',
            label: 'Department',
            sortable: true,
            render: (dept) => {
                const color = getDeptColor(dept.name);
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                            bgcolor: `${color}18`, color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: 700, fontFamily: FONTS.HEADING,
                        }}>
                            {dept.name?.charAt(0)?.toUpperCase() || 'D'}
                        </Box>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '13px', fontFamily: FONTS.HEADING, color: 'text.primary' }}>
                                    {dept.name}
                                </Typography>
                                <Chip label={dept.code || 'NO CODE'} size="small"
                                    sx={{ fontSize: '9px', fontWeight: 700, height: 16, bgcolor: 'action.selected', fontFamily: FONTS.HEADING, px: 0.5 }}
                                />
                            </Box>
                            {dept.description && (
                                <Typography sx={{ fontSize: '11px', color: 'text.secondary', fontFamily: FONTS.BODY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>
                                    {dept.description}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );
            }
        },
        {
            id: 'location',
            label: 'Location',
            render: (dept) => dept.location ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <MapPin size={12} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '12.5px', color: 'text.secondary', fontFamily: FONTS.BODY }}>{dept.location}</Typography>
                </Box>
            ) : <Typography sx={{ color: 'text.disabled', fontSize: '12px' }}>—</Typography>
        },
        {
            id: 'contact',
            label: 'Contact',
            render: (dept) => dept.contact_number ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Phone size={12} style={{ color: theme.palette.text.secondary, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '12px', fontFamily: FONTS.BODY, color: 'text.secondary' }}>{dept.contact_number}</Typography>
                </Box>
            ) : <Typography sx={{ color: 'text.disabled', fontSize: '12px' }}>—</Typography>
        },
        {
            id: 'status',
            label: 'Status',
            align: 'center',
            render: (dept) => (
                <Chip
                    label={dept.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={dept.is_active ? 'success' : 'default'}
                    variant={dept.is_active ? 'outlined' : 'filled'}
                    sx={{ fontWeight: 700, fontSize: '10px', height: 20 }}
                />
            )
        },
        {
            id: 'staff_count',
            label: 'Staff',
            sortable: true,
            align: 'center',
            render: (dept) => {
                const n = dept.staff_count || 0;
                return (
                    <Chip
                        label={n}
                        size="small"
                        color={n > 0 ? 'primary' : 'default'}
                        variant={n > 0 ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700, fontSize: '12px', minWidth: 36, height: 24 }}
                    />
                );
            }
        },
        {
            id: 'actions',
            label: '',
            align: 'center',
            render: (dept) => {
                const hasStaff = (dept.staff_count || 0) > 0;
                return (
                    <Stack direction="row" spacing={0.5} justifyContent="center" onClick={e => e.stopPropagation()}>
                        <Tooltip title="Edit Department">
                            <IconButton size="small" onClick={() => openEditDialog(dept)}
                                sx={{
                                    border: '1px solid', borderColor: 'divider', borderRadius: '6px',
                                    '&:hover': { color: 'primary.main', borderColor: 'primary.light', bgcolor: isDark ? 'rgba(0,106,106,0.08)' : 'rgba(0,106,106,0.05)' }
                                }}>
                                <Pencil size={13} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={hasStaff ? 'Cannot delete — has assigned staff' : 'Delete Department'}>
                            <span>
                                <IconButton size="small" onClick={() => deleteDialog.openDialog(dept)} disabled={hasStaff}
                                    sx={{
                                        border: '1px solid', borderColor: hasStaff ? 'divider' : 'error.light', borderRadius: '6px',
                                        color: hasStaff ? 'text.disabled' : 'error.main',
                                        '&:hover': { bgcolor: 'rgba(186,26,26,0.06)' },
                                        '&.Mui-disabled': { color: 'text.disabled', borderColor: 'divider' }
                                    }}>
                                    <Trash2 size={13} />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                );
            }
        }
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AdminPageHeader
                title="Clinical Departments"
                subtitle="Manage hospital departments, codes, and physical locations. Inactive departments are hidden from signup selections."
                onRefresh={refreshDepartments}
                loading={loading}
                actionButton={
                    <Button variant="contained" size="small" startIcon={<Plus size={15} />} onClick={openCreateDialog}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px', borderRadius: '100px', py: 0.75, boxShadow: 'none' }}>
                        Add Department
                    </Button>
                }
            />

            <AsyncWrapper loading={false} error={null}>
                {/* ── KPI Strip ─────────────────────────────────────────── */}
                <StatGrid cols={3}>
                    <StatCard
                        title="Active Departments"
                        value={activeDepts.length}
                        description="Operational & accepting staff"
                        icon={Building2}
                        iconBg={isDark ? 'rgba(0,106,106,0.15)' : 'rgba(0,106,106,0.08)'}
                        iconColor={COLORS.PRIMARY}
                        loading={loading}
                    />
                    <StatCard
                        title="Total Assigned Staff"
                        value={totalStaff}
                        description="Across all departments"
                        icon={Users}
                        iconBg={isDark ? 'rgba(13,110,253,0.15)' : 'rgba(13,110,253,0.08)'}
                        iconColor={COLORS.INFO}
                        loading={loading}
                    />
                    <StatCard
                        title="Inactive Departments"
                        value={inactiveDepts.length}
                        description="Hidden from staff onboarding"
                        icon={ShieldCheck}
                        iconBg={isDark ? 'rgba(255,152,0,0.15)' : 'rgba(255,152,0,0.08)'}
                        iconColor={COLORS.WARNING}
                        loading={loading}
                        chipLabel={inactiveDepts.length > 0 ? 'Review' : 'Clear'}
                        chipColor={inactiveDepts.length > 0 ? 'warning' : 'default'}
                    />
                </StatGrid>

                {/* ── Insight row: Staff distribution + quick cards ───── */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                    width: '100%',
                    mt: 1,
                }}>
                    {/* Staff Distribution by Department */}
                    <DashboardCard
                        title="Staff Distribution"
                        subtitle="Headcount allocation across departments."
                        icon={TrendingUp}
                        iconColor={neutralColor}
                        iconBg={neutralBg}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {topDepts.length === 0 ? (
                                <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3, fontSize: '12px' }}>
                                    No departments with staff yet.
                                </Typography>
                            ) : topDepts.map((dept, idx) => {
                                const max = topDepts[0]?.staff_count || 1;
                                const pct = Math.round(((dept.staff_count || 0) / max) * 100);
                                const color = getDeptColor(dept.name);
                                return (
                                    <Box key={idx}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                                                <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: 'text.primary', fontFamily: FONTS.BODY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {dept.name}
                                                </Typography>
                                            </Box>
                                            <Typography sx={{ fontSize: '11px', fontWeight: 700, color, fontFamily: FONTS.HEADING, flexShrink: 0, ml: 1 }}>
                                                {dept.staff_count || 0} staff
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={pct}
                                            sx={{
                                                height: 5, borderRadius: 3, bgcolor: 'action.hover',
                                                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 }
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                    </DashboardCard>

                    {/* Department grid cards (visual cards for first 6 active depts) */}
                    <DashboardCard
                        title="Department Overview"
                        subtitle="Active units at a glance."
                        icon={Building2}
                        iconColor={neutralColor}
                        iconBg={neutralBg}
                        action={
                            <Chip
                                label={`${activeDepts.length} Active`}
                                size="small"
                                color="primary"
                                sx={{ height: 20, fontSize: '10px', fontWeight: 700 }}
                            />
                        }
                    >
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 1,
                        }}>
                            {activeDepts.slice(0, 6).map((dept, idx) => {
                                const color = getDeptColor(dept.name);
                                return (
                                    <Box
                                        key={idx}
                                        onClick={() => detailsDialog.openDialog(dept)}
                                        sx={{
                                            p: 1.25, borderRadius: '8px', cursor: 'pointer',
                                            border: '1px solid', borderColor: 'divider',
                                            bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.005)',
                                            transition: 'all 0.15s ease',
                                            '&:hover': {
                                                borderColor: color,
                                                bgcolor: `${color}08`,
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                                            <Box sx={{
                                                width: 24, height: 24, borderRadius: '6px',
                                                bgcolor: `${color}18`, color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '11px', fontWeight: 700,
                                            }}>
                                                {dept.name?.charAt(0)?.toUpperCase()}
                                            </Box>
                                            <Typography sx={{ fontSize: '10.5px', fontWeight: 700, fontFamily: FONTS.HEADING, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                {dept.name}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: '9.5px', color: 'text.secondary', fontFamily: FONTS.BODY }}>
                                                {dept.location || 'No location'}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', fontWeight: 700, color, fontFamily: FONTS.HEADING }}>
                                                {dept.staff_count || 0} staff
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                            {activeDepts.length === 0 && (
                                <Box sx={{ gridColumn: '1/-1', py: 3, textAlign: 'center' }}>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '12px' }}>No active departments yet.</Typography>
                                </Box>
                            )}
                        </Box>
                    </DashboardCard>
                </Box>

                {/* ── Department Registry Table ─────────────────────────── */}
                <Box sx={{ mt: 1 }}>
                    <DashboardCard
                        title="Department Registry"
                        subtitle="Full directory of all clinical departments with staff allocation and status."
                        icon={Building2}
                        iconColor={neutralColor}
                        iconBg={neutralBg}
                        action={
                            <Chip
                                label={`${processedDepartments.length} records`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 22, fontSize: '10px', fontWeight: 600 }}
                            />
                        }
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <AdminFilterBar
                                searchQuery={searchQuery}
                                onSearchChange={(val) => { setSearchQuery(val); pagination.resetPage(); }}
                                searchPlaceholder="Search by name, code, location…"
                                filter1Label="Status"
                                filter1Value={statusFilter}
                                onFilter1Change={(val) => { setStatusFilter(val); pagination.resetPage(); }}
                                filter1Options={[
                                    { value: 'ALL',      label: 'All Statuses' },
                                    { value: 'ACTIVE',   label: 'Active Only'  },
                                    { value: 'INACTIVE', label: 'Inactive Only' }
                                ]}
                                filter2Label="Staff"
                                filter2Value={staffFilter}
                                onFilter2Change={(val) => { setStaffFilter(val); pagination.resetPage(); }}
                                filter2Options={[
                                    { value: 'ALL',       label: 'All Wards'         },
                                    { value: 'HAS_STAFF', label: 'Has Assigned Staff' },
                                    { value: 'EMPTY',     label: 'Empty (No Staff)'  }
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
                        </Box>
                    </DashboardCard>
                </Box>
            </AsyncWrapper>

            {/* Dialogs */}
            <DepartmentDetailsDialog
                open={detailsDialog.open}
                onClose={detailsDialog.closeDialog}
                department={detailsDialog.data}
                onEdit={(dept) => { detailsDialog.closeDialog(); setTimeout(() => openEditDialog(dept), 200); }}
                onDelete={(dept) => { detailsDialog.closeDialog(); setTimeout(() => deleteDialog.openDialog(dept), 200); }}
            />
            <DepartmentFormDialog
                open={formDialog.open}
                onClose={formDialog.closeDialog}
                mode={formMode}
                department={formDialog.data}
                formName={formName} formCode={formCode}
                formDescription={formDescription} formLocation={formLocation}
                formContactNumber={formContactNumber} formIsActive={formIsActive}
                onFormChange={(field, val) => {
                    if (field === 'name')           { setFormName(val);           setFormErrors(p => ({ ...p, name: null })); }
                    else if (field === 'code')      { setFormCode(val);           setFormErrors(p => ({ ...p, code: null })); }
                    else if (field === 'description')    setFormDescription(val);
                    else if (field === 'location')       setFormLocation(val);
                    else if (field === 'contact_number') setFormContactNumber(val);
                    else if (field === 'is_active')      setFormIsActive(val);
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
